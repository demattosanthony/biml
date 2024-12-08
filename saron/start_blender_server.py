import subprocess
import os
import platform

def find_blender_executable():
    """Locate the Blender executable based on the OS."""
    if platform.system() == "Windows":
        return "C:\\Program Files\\Blender Foundation\\Blender\\blender.exe"  # Update this path as necessary
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

    # Run Blender in the foreground
    subprocess.run([blender_exec, "--python", server_script])

if __name__ == "__main__":
    try:
        start_blender_with_server()
        print("Blender started with the socket server.")
    except Exception as e:
        print(f"Error: {str(e)}")
