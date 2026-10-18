import socket
import json

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

render_test_code = """
import bpy

scene = bpy.context.scene
scene.render.engine = 'BLENDER_EEVEE'
scene.render.resolution_x = 960
scene.render.resolution_y = 720
scene.render.resolution_percentage = 100
scene.render.image_settings.file_format = 'PNG'

# EEVEE settings for fast high quality
if hasattr(scene, 'eevee'):
    eevee = scene.eevee
    if hasattr(eevee, 'taa_render_samples'):
        eevee.taa_render_samples = 32
    if hasattr(eevee, 'use_gtao'):
        eevee.use_gtao = True
    if hasattr(eevee, 'use_ssr'):
        eevee.use_ssr = True

scene.frame_set(1)
out_path = '/Users/jaysisharma/Desktop/clientpulse/public/images/russian_blue_test.png'
scene.render.filepath = out_path
bpy.ops.render.render(write_still=True)

result = {
    'status': 'rendered',
    'filepath': out_path,
    'camera': scene.camera.name if scene.camera else None
}
"""

if __name__ == '__main__':
    print("Rendering test frame 1...")
    res = run_blender_code(render_test_code, timeout=60)
    print("Render result:", res)
