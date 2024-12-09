# start_blender.py
import subprocess
import os
import platform
import time


def find_blender_executable():
    """Locate the Blender executable based on the OS."""
    if platform.system() == "Windows":
        return "C:\\Program Files\\Blender Foundation\\Blender\\blender.exe"
    elif platform.system() == "Darwin":  # macOS
        return "/Applications/Blender.app/Contents/MacOS/Blender"
    elif platform.system() == "Linux":
        return "/usr/bin/blender"
    else:
        raise OSError("Unsupported operating system")


def start_blender_with_server():
    blender_exec = find_blender_executable()
    server_script = os.path.abspath("blender_server.py")

    if not os.path.exists(server_script):
        raise FileNotFoundError(f"Server script not found at {server_script}")

    print("Starting Blender with socket server...")
    process = subprocess.Popen([blender_exec, "--python", server_script])

    # Give Blender time to start and initialize the server
    time.sleep(5)
    return process


if __name__ == "__main__":
    try:
        blender_process = start_blender_with_server()
        print("Blender started with the socket server. Press Ctrl+C to quit.")
        blender_process.wait()
    except Exception as e:
        print(f"Error: {str(e)}")
