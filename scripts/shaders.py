import bpy
import bmesh
import math
from mathutils import Vector, Euler, Matrix

def get_context_override():
    window = bpy.context.window_manager.windows[0]
    screen = window.screen
    for area in screen.areas:
        if area.type == 'VIEW_3D':
            for region in area.regions:
                if region.type == 'WINDOW':
                    return bpy.context.temp_override(window=window, area=area, region=region)
    return None

def look_at(obj, target):
    direction = target - obj.location
    rot_quat = direction.to_track_quat('-Z', 'Y')
    obj.rotation_euler = rot_quat.to_euler()

def create_wood_material(name="Polished_Oak_Wood"):
    mat = bpy.data.materials.new(name)
    mat.use_nodes = True
    nodes = mat.node_tree.nodes
    links = mat.node_tree.links
    nodes.clear()

    out = nodes.new("ShaderNodeOutputMaterial")
    bsdf = nodes.new("ShaderNodeBsdfPrincipled")

    # Procedural wood grain
    tex_coord = nodes.new("ShaderNodeTexCoord")
    mapping = nodes.new("ShaderNodeMapping")
    mapping.inputs["Scale"].default_value = (1.0, 8.0, 1.0)
    links.new(tex_coord.outputs["Object"], mapping.inputs["Vector"])

    wave = nodes.new("ShaderNodeTexWave")
    wave.wave_type = "BANDS"
    wave.bands_direction = "Y"
    wave.inputs["Scale"].default_value = 2.5
    wave.inputs["Distortion"].default_value = 3.5
    wave.inputs["Detail"].default_value = 4.0
    wave.inputs["Detail Scale"].default_value = 2.0
    links.new(mapping.outputs["Vector"], wave.inputs["Vector"])

    ramp = nodes.new("ShaderNodeValToRGB")
    ramp.color_ramp.elements[0].position = 0.0
    ramp.color_ramp.elements[0].color = (0.16, 0.08, 0.035, 1.0) # Deep walnut
    ramp.color_ramp.elements[1].position = 0.55
    ramp.color_ramp.elements[1].color = (0.34, 0.18, 0.09, 1.0) # Warm oak
    el2 = ramp.color_ramp.elements.new(0.85)
    el2.color = (0.45, 0.26, 0.13, 1.0) # Honey amber
    links.new(wave.outputs["Color"], ramp.inputs["Fac"])

    links.new(ramp.outputs["Color"], bsdf.inputs["Base Color"])
    bsdf.inputs["Roughness"].default_value = 0.22 # Satin polished wood finish
    bsdf.inputs["Specular IOR Level"].default_value = 0.55

    # Subtle wood grain bump
    bump = nodes.new("ShaderNodeBump")
    bump.inputs["Strength"].default_value = 0.04
    links.new(wave.outputs["Fac"], bump.inputs["Height"])
    links.new(bump.outputs["Normal"], bsdf.inputs["Normal"])

    links.new(bsdf.outputs["BSDF"], out.inputs["Surface"])
    return mat

def create_russian_blue_fur_material(name="RussianBlue_Coat"):
    mat = bpy.data.materials.new(name)
    mat.use_nodes = True
    nodes = mat.node_tree.nodes
    links = mat.node_tree.links
    nodes.clear()

    out = nodes.new("ShaderNodeOutputMaterial")
    bsdf = nodes.new("ShaderNodeBsdfPrincipled")

    # Authentic Russian Blue slate-blue grey
    bsdf.inputs["Base Color"].default_value = (0.075, 0.092, 0.120, 1.0)
    bsdf.inputs["Roughness"].default_value = 0.50

    # Signature silver tipping sheen
    bsdf.inputs["Sheen Weight"].default_value = 1.0
    bsdf.inputs["Sheen Tint"].default_value = (0.75, 0.85, 0.98, 1.0) # Silvery luster
    bsdf.inputs["Subsurface Weight"].default_value = 0.05
    bsdf.inputs["Subsurface Radius"].default_value = (0.10, 0.08, 0.08)

    # Micro fur noise bump
    tex_coord = nodes.new("ShaderNodeTexCoord")
    noise = nodes.new("ShaderNodeTexNoise")
    noise.inputs["Scale"].default_value = 160.0
    noise.inputs["Detail"].default_value = 3.0
    noise.inputs["Roughness"].default_value = 0.7
    links.new(tex_coord.outputs["Object"], noise.inputs["Vector"])

    bump = nodes.new("ShaderNodeBump")
    bump.inputs["Strength"].default_value = 0.05
    links.new(noise.outputs["Fac"], bump.inputs["Height"])
    links.new(bump.outputs["Normal"], bsdf.inputs["Normal"])

    links.new(bsdf.outputs["BSDF"], out.inputs["Surface"])
    return mat

def create_emerald_eye_material(name="RussianBlue_EmeraldEye"):
    mat = bpy.data.materials.new(name)
    mat.use_nodes = True
    nodes = mat.node_tree.nodes
    links = mat.node_tree.links
    nodes.clear()

    out = nodes.new("ShaderNodeOutputMaterial")
    bsdf = nodes.new("ShaderNodeBsdfPrincipled")

    tex_coord = nodes.new("ShaderNodeTexCoord")
    mapping = nodes.new("ShaderNodeMapping")
    # Project eye from front: X and Z form concentric iris
    links.new(tex_coord.outputs["Object"], mapping.inputs["Vector"])

    # Separate XYZ to create elliptical/slit pupil and concentric iris
    sep = nodes.new("ShaderNodeSeparateXYZ")
    links.new(mapping.outputs["Vector"], sep.inputs["Vector"])

    # Distance math for iris radial gradient
    math_x2 = nodes.new("ShaderNodeMath")
    math_x2.operation = "MULTIPLY"
    links.new(sep.outputs["X"], math_x2.inputs[0])
    links.new(sep.outputs["X"], math_x2.inputs[1])

    # Narrow slit along X (scale X by 3.0)
    math_slit = nodes.new("ShaderNodeMath")
    math_slit.operation = "MULTIPLY"
    math_slit.inputs[1].default_value = 7.0
    links.new(math_x2.outputs["Value"], math_slit.inputs[0])

    math_z2 = nodes.new("ShaderNodeMath")
    math_z2.operation = "MULTIPLY"
    links.new(sep.outputs["Z"], math_z2.inputs[0])
    links.new(sep.outputs["Z"], math_z2.inputs[1])

    math_sum = nodes.new("ShaderNodeMath")
    math_sum.operation = "ADD"
    links.new(math_slit.outputs["Value"], math_sum.inputs[0])
    links.new(math_z2.outputs["Value"], math_sum.inputs[1])

    math_dist = nodes.new("ShaderNodeMath")
    math_dist.operation = "SQRT"
    links.new(math_sum.outputs["Value"], math_dist.inputs[0])

    # Color Ramp: Center = Jet Black Pupil, Middle = Radiant Emerald Green, Edge = Dark Limbal Ring
    ramp = nodes.new("ShaderNodeValToRGB")
    ramp.color_ramp.interpolation = "LINEAR"
    # 0.0 - 0.20: Pure black pupil
    ramp.color_ramp.elements[0].position = 0.0
    ramp.color_ramp.elements[0].color = (0.005, 0.005, 0.005, 1.0)
    ramp.color_ramp.elements[1].position = 0.22
    ramp.color_ramp.elements[1].color = (0.005, 0.005, 0.005, 1.0)
    # 0.25 - 0.70: Vibrant glowing Emerald Green
    el_em1 = ramp.color_ramp.elements.new(0.26)
    el_em1.color = (0.03, 0.78, 0.22, 1.0) # Brilliant emerald green!
    el_em2 = ramp.color_ramp.elements.new(0.55)
    el_em2.color = (0.12, 0.88, 0.30, 1.0) # Golden-green iris ring
    el_limb = ramp.color_ramp.elements.new(0.85)
    el_limb.color = (0.015, 0.18, 0.05, 1.0) # Dark limbal ring
    links.new(math_dist.outputs["Value"], ramp.inputs["Fac"])

    links.new(ramp.outputs["Color"], bsdf.inputs["Base Color"])
    bsdf.inputs["Roughness"].default_value = 0.03 # Ultra wet glossy corneal reflection
    bsdf.inputs["Specular IOR Level"].default_value = 0.75

    # Gentle emission for emerald glow
    links.new(ramp.outputs["Color"], bsdf.inputs["Emission Color"])
    bsdf.inputs["Emission Strength"].default_value = 0.25

    links.new(bsdf.outputs["BSDF"], out.inputs["Surface"])
    return mat
