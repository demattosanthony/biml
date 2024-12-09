# blender_server.py
import socket
import bpy
import threading
import signal
import sys
from queue import Queue
import traceback
from io import StringIO
import contextlib
import json

command_queue = Queue()

class OutputCapture:
    def __init__(self):
        self.value = StringIO()

    def write(self, txt):
        self.value.write(txt)
        sys.__stdout__.write(txt)  # Also write to the real stdout

    def flush(self):
        self.value.flush()

def capture_output(func):
    """Decorator to capture stdout and return value"""
    def wrapper(*args, **kwargs):
        temp_out = OutputCapture()
        sys.stdout = temp_out
        try:
            result = func(*args, **kwargs)
            output = temp_out.value.getvalue()
            return {
                'output': output,
                'result': str(result) if result is not None else None,
                'error': None
            }
        except Exception as e:
            return {
                'output': temp_out.value.getvalue(),
                'result': None,
                'error': str(e) + '\n' + traceback.format_exc()
            }
        finally:
            sys.stdout = sys.__stdout__
    return wrapper

@capture_output
def execute_command(cmd):
    globals_dict = {
        "bpy": bpy,
        "print": print,
        "__builtins__": __builtins__
    }
    return eval(cmd, globals_dict)

def signal_handler(sig, frame):
    print("\nShutting down server and Blender...")
    bpy.ops.wm.quit_blender()
    sys.exit(0)

class ModalTimerOperator(bpy.types.Operator):
    bl_idname = "wm.modal_timer_operator"
    bl_label = "Modal Timer Operator"
    _timer = None

    def modal(self, context, event):
        if event.type == 'TIMER':
            while not command_queue.empty():
                cmd, conn = command_queue.get()
                try:
                    print(f"Executing command: {cmd}")
                    result = execute_command(cmd)
                    conn.send(json.dumps(result).encode('utf-8'))
                except Exception as e:
                    error_msg = {
                        'output': '',
                        'result': None,
                        'error': str(e) + '\n' + traceback.format_exc()
                    }
                    conn.send(json.dumps(error_msg).encode('utf-8'))
                finally:
                    conn.close()
            return {'RUNNING_MODAL'}
        return {'PASS_THROUGH'}

    def execute(self, context):
        wm = context.window_manager
        self._timer = wm.event_timer_add(0.1, window=context.window)
        wm.modal_handler_add(self)
        return {'RUNNING_MODAL'}

    def cancel(self, context):
        wm = context.window_manager
        wm.event_timer_remove(self._timer)

def register():
    bpy.utils.register_class(ModalTimerOperator)

def unregister():
    bpy.utils.unregister_class(ModalTimerOperator)

def run_server():
    host = '127.0.0.1'
    port = 65432
    server = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    server.bind((host, port))
    server.listen(1)
    server.settimeout(1.0)
    print(f"Server listening on {host}:{port}...")
    
    while True:
        try:
            conn, addr = server.accept()
            print(f"Connection from {addr}")
            data = conn.recv(1024).decode('utf-8')
            if data:
                print(f"Received command: {data}")
                command_queue.put((data, conn))
        except socket.timeout:
            continue
        except Exception as e:
            print(f"Server error: {e}")
            print(traceback.format_exc())
            break

if __name__ == "__main__":
    signal.signal(signal.SIGINT, signal_handler)
    register()
    
    server_thread = threading.Thread(target=run_server)
    server_thread.daemon = True
    server_thread.start()
    
    bpy.ops.wm.modal_timer_operator()
    
    try:
        bpy.app.timers.register(lambda: None, persistent=True)
    except:
        pass