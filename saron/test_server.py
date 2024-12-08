import socket

def send_command(command):
    HOST = '127.0.0.1'
    PORT = 65432
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as client:
        client.connect((HOST, PORT))
        client.sendall(command.encode('utf-8'))
        response = client.recv(1024)
        print(f"Response: {response.decode('utf-8')}")

# Example usage
send_command('bpy.ops.wm.open_mainfile(filepath="/Users/anthonydemattos/test2.blend")')

