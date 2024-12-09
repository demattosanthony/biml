# client.py
import socket
import time

def send_command(command, retries=3, retry_delay=1):
    """
    Send a command to the Blender server with retry functionality.
    
    Args:
        command (str): The command to send to Blender
        retries (int): Number of connection attempts
        retry_delay (float): Delay between retries in seconds
    """
    HOST = '127.0.0.1'
    PORT = 65432

    for attempt in range(retries):
        try:
            with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as client:
                client.connect((HOST, PORT))
                client.sendall(command.encode('utf-8'))
                response = client.recv(1024)
                print(f"Response: {response.decode('utf-8')}")
                return True
        except ConnectionRefusedError:
            if attempt < retries - 1:
                print(f"Connection failed. Retrying in {retry_delay} seconds...")
                time.sleep(retry_delay)
            else:
                print("Error: Could not connect to Blender server. Make sure it's running.")
                return False
        except Exception as e:
            print(f"Error: {str(e)}")
            return False

if __name__ == "__main__":
    # Example usage
    test_command = 'bpy.ops.mesh.primitive_cube_add()'
    send_command(test_command)