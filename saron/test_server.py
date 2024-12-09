# client.py
import socket
import time
import json


def send_command(command, retries=3, retry_delay=1):
    """
    Send a command to the Blender server with retry functionality.

    Args:
        command (str): The command to send to Blender
        retries (int): Number of connection attempts
        retry_delay (float): Delay between retries in seconds

    Returns:
        dict: Contains 'output' (stdout), 'result' (return value), and 'error' (if any)
    """
    HOST = "127.0.0.1"
    PORT = 65432

    for attempt in range(retries):
        try:
            with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as client:
                client.connect((HOST, PORT))
                client.sendall(command.encode("utf-8"))

                # Receive and parse the response
                response = client.recv(4096)  # Increased buffer size
                response_data = json.loads(response.decode("utf-8"))

                # Print the output and any errors
                if response_data["output"]:
                    print("Command output:")
                    print(response_data["output"])
                if response_data["result"] is not None:
                    print("\nReturn value:")
                    print(response_data["result"])
                if response_data["error"]:
                    print("\nError:")
                    print(response_data["error"])

                return response_data

        except ConnectionRefusedError:
            if attempt < retries - 1:
                print(f"Connection failed. Retrying in {retry_delay} seconds...")
                time.sleep(retry_delay)
            else:
                print("Error: Could not connect to Blender server. Make sure it's running.")
                return None
        except Exception as e:
            print(f"Error: {str(e)}")
            return None


if __name__ == "__main__":
    script = """print("Hello from Blender!")
2 + 2
import bpy
bpy.ops.object.select_all(action='DESELECT')
bpy.ops.object.select_all(action='SELECT')
bpy.ops.object.delete()"""
    # Test commands
    commands = script.split("\n")
    print("Testing various commands...")
    for cmd in commands:
        print(f"\nExecuting: {cmd}")
        print("-" * 40)
        send_command(cmd)
        time.sleep(1)  # Wait a bit between commands
