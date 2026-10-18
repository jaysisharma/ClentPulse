import socket
import json
import os
import subprocess
import shutil

def run_blender_code(code_str, timeout=300):
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

render_all_frames_code = """
import bpy
import os

frames_dir = '/Users/jaysisharma/Desktop/clientpulse/public/images/russian_blue_walk_frames'
os.makedirs(frames_dir, exist_ok=True)

scene = bpy.context.scene
scene.render.engine = 'BLENDER_EEVEE'
scene.render.resolution_x = 960
scene.render.resolution_y = 720
scene.render.resolution_percentage = 100
scene.render.image_settings.file_format = 'PNG'

# Render 32 frames of the walk cycle
rendered_count = 0
for f in range(1, 33):
    scene.frame_set(f)
    frame_path = os.path.join(frames_dir, f'frame_{f:04d}.png')
    scene.render.filepath = frame_path
    bpy.ops.render.render(write_still=True)
    rendered_count += 1

result = {
    'status': 'success',
    'frames_rendered': rendered_count,
    'output_dir': frames_dir
}
"""

if __name__ == '__main__':
    print("Starting rendering of 32 animation frames in Blender...")
    res = run_blender_code(render_all_frames_code, timeout=300)
    print("Blender render result:", res)

    frames_dir = '/Users/jaysisharma/Desktop/clientpulse/public/images/russian_blue_walk_frames'
    gif_out = '/Users/jaysisharma/Desktop/clientpulse/public/images/russian_blue_cat_walk.gif'
    mp4_out = '/Users/jaysisharma/Desktop/clientpulse/public/images/russian_blue_cat_walk.mp4'
    artifact_dir = '/Users/jaysisharma/.gemini/antigravity/brain/78ab0717-716d-4f4b-b651-ba197745bfdc'

    # Compile MP4 (24 fps, H.264)
    print("Assembling MP4 video...")
    cmd_mp4 = [
        'ffmpeg', '-y', '-framerate', '24',
        '-i', f'{frames_dir}/frame_%04d.png',
        '-c:v', 'libx264', '-pix_fmt', 'yuv420p',
        '-vf', 'scale=960:720',
        mp4_out
    ]
    subprocess.run(cmd_mp4, check=True)
    print(f"Saved MP4: {mp4_out}")

    # Compile looping GIF (18 fps for smooth playback and compact size)
    print("Assembling GIF...")
    cmd_gif = [
        'ffmpeg', '-y', '-framerate', '20',
        '-i', f'{frames_dir}/frame_%04d.png',
        '-vf', 'fps=20,scale=720:-1:flags=lanczos,split[s0][s1];[s0]palettegen=max_colors=128[p];[s1][p]paletteuse=dither=bayer',
        gif_out
    ]
    subprocess.run(cmd_gif, check=True)
    print(f"Saved GIF: {gif_out}")

    # Copy to artifacts directory
    shutil.copy2(gif_out, os.path.join(artifact_dir, 'russian_blue_cat_walk.gif'))
    shutil.copy2(mp4_out, os.path.join(artifact_dir, 'russian_blue_cat_walk.mp4'))
    print("Copied files to artifact directory!")
