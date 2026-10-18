import socket
import json
import os
import sys

def run_blender_code(code_str, timeout=120):
    s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    s.settimeout(timeout)
    s.connect(('127.0.0.1', 9876))

    payload = json.dumps({
        'type': 'execute',
        'code': code_str,
        'strict_json': True
    }).encode('utf-8') + b'\0'

    s.sendall(payload)

    buf = b''
    while True:
        chunk = s.recv(8192)
        if not chunk:
            break
        buf += chunk
        if b'\0' in buf:
            break
    s.close()
    res_str = buf.decode('utf-8').strip('\0')
    return json.loads(res_str)

if __name__ == '__main__':
    with open('/Users/jaysisharma/Desktop/clientpulse/scripts/build_refined_russian_blue.py', 'r') as f:
        script_code = f.read()

    combined_code = script_code + "\nresult = build_scene()\n"
    print("Building refined Russian Blue scene in Blender...")
    res = run_blender_code(combined_code, timeout=90)
    print("Blender build response:", json.dumps(res, indent=2))
