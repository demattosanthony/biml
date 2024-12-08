import socket
import bpy
import threading
import signal
import sys
from queue import Queue
import traceback

command_queue = Queue()

def signal_handler(sig, frame):
    print("\nShutting down server and Blender...")
    # Quit Blender
    bpy.ops.wm.quit_blender()
    sys.exit(0)

class ModalTimerOperator(bpy.types.Operator):
    bl_idname = "wm.modal_timer_operator"
    bl_label = "Modal Timer Operator"
    _timer = None

    def modal(self, context, event):
        if event.type == 'TIMER':
            # Process the queue
            while not command_queue.empty():
                cmd = command_queue.get()
                try:
                    print(f"Executing command: {cmd}")
                    # Execute the command in Blender's context
                    exec(cmd, {"bpy": bpy})
                    print(f"Command executed successfully: {cmd}")
                except Exception as e:
                    print(f"Error executing command: {cmd}")
                    print(f"Error details: {str(e)}")
                    print(traceback.format_exc())
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
    print(f"Listening on {host}:{port}...")
    
    while True:
        try:
            conn, addr = server.accept()
            print(f"Connection from {addr}")
            data = conn.recv(1024).decode('utf-8')
            if data:
                print(f"Received command: {data}")
                command_queue.put(data)
                conn.send(b"Command queued for execution")
            conn.close()
        except socket.timeout:
            continue
        except Exception as e:
            print(f"Server error: {e}")
            print(traceback.format_exc())
            break

if __name__ == "__main__":
    # Register signal handler for Ctrl+C
    signal.signal(signal.SIGINT, signal_handler)

    # Register the operator
    register()

    # Start the server in a separate thread
    server_thread = threading.Thread(target=run_server)
    server_thread.daemon = True
    server_thread.start()

    # Start the modal timer
    bpy.ops.wm.modal_timer_operator()

    # Keep Blender running
    try:
        bpy.app.timers.register(lambda: None, persistent=True)
    except:
        pass