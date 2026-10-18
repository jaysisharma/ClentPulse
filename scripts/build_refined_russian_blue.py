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

def create_wood_material():
    mat = bpy.data.materials.new("Polished_Oak_Wood")
    mat.use_nodes = True
    nodes = mat.node_tree.nodes
    links = mat.node_tree.links
    nodes.clear()

    out = nodes.new("ShaderNodeOutputMaterial")
    bsdf = nodes.new("ShaderNodeBsdfPrincipled")

    tex_coord = nodes.new("ShaderNodeTexCoord")
    mapping = nodes.new("ShaderNodeMapping")
    mapping.inputs["Scale"].default_value = (1.2, 4.0, 1.0)
    links.new(tex_coord.outputs["Object"], mapping.inputs["Vector"])

    wave = nodes.new("ShaderNodeTexWave")
    wave.wave_type = "BANDS"
    wave.bands_direction = "X" # Grain runs along table length!
    wave.inputs["Scale"].default_value = 1.2
    wave.inputs["Distortion"].default_value = 2.2
    wave.inputs["Detail"].default_value = 3.5
    wave.inputs["Detail Scale"].default_value = 1.5
    links.new(mapping.outputs["Vector"], wave.inputs["Vector"])

    ramp = nodes.new("ShaderNodeValToRGB")
    ramp.color_ramp.elements[0].position = 0.0
    ramp.color_ramp.elements[0].color = (0.15, 0.08, 0.035, 1.0) # Deep walnut
    ramp.color_ramp.elements[1].position = 0.55
    ramp.color_ramp.elements[1].color = (0.32, 0.17, 0.085, 1.0) # Warm oak
    el2 = ramp.color_ramp.elements.new(0.85)
    el2.color = (0.42, 0.24, 0.12, 1.0) # Honey amber
    links.new(wave.outputs["Color"], ramp.inputs["Fac"])

    links.new(ramp.outputs["Color"], bsdf.inputs["Base Color"])
    bsdf.inputs["Roughness"].default_value = 0.24 # Glossy polished table lacquer
    bsdf.inputs["Specular IOR Level"].default_value = 0.55

    bump = nodes.new("ShaderNodeBump")
    bump.inputs["Strength"].default_value = 0.025
    links.new(wave.outputs["Fac"], bump.inputs["Height"])
    links.new(bump.outputs["Normal"], bsdf.inputs["Normal"])

    links.new(bsdf.outputs["BSDF"], out.inputs["Surface"])
    return mat

def create_russian_blue_fur():
    mat = bpy.data.materials.new("RussianBlue_Fur")
    mat.use_nodes = True
    nodes = mat.node_tree.nodes
    links = mat.node_tree.links
    nodes.clear()

    out = nodes.new("ShaderNodeOutputMaterial")
    bsdf = nodes.new("ShaderNodeBsdfPrincipled")

    # True Russian Blue Slate-Grey Color (as in reference photo!)
    bsdf.inputs["Base Color"].default_value = (0.042, 0.052, 0.068, 1.0)
    bsdf.inputs["Roughness"].default_value = 0.54

    # Signature silver guard hair sheen
    bsdf.inputs["Sheen Weight"].default_value = 1.0
    bsdf.inputs["Sheen Tint"].default_value = (0.75, 0.85, 0.98, 1.0)
    bsdf.inputs["Subsurface Weight"].default_value = 0.04
    bsdf.inputs["Subsurface Radius"].default_value = (0.08, 0.06, 0.06)

    # Micro fur texture bump
    tex_coord = nodes.new("ShaderNodeTexCoord")
    noise = nodes.new("ShaderNodeTexNoise")
    noise.inputs["Scale"].default_value = 180.0
    noise.inputs["Detail"].default_value = 3.0
    noise.inputs["Roughness"].default_value = 0.65
    links.new(tex_coord.outputs["Object"], noise.inputs["Vector"])

    bump = nodes.new("ShaderNodeBump")
    bump.inputs["Strength"].default_value = 0.035
    links.new(noise.outputs["Fac"], bump.inputs["Height"])
    links.new(bump.outputs["Normal"], bsdf.inputs["Normal"])

    links.new(bsdf.outputs["BSDF"], out.inputs["Surface"])
    return mat

def create_emerald_eye():
    mat = bpy.data.materials.new("RussianBlue_EmeraldEye")
    mat.use_nodes = True
    nodes = mat.node_tree.nodes
    links = mat.node_tree.links
    nodes.clear()

    out = nodes.new("ShaderNodeOutputMaterial")
    bsdf = nodes.new("ShaderNodeBsdfPrincipled")

    tex = nodes.new("ShaderNodeTexCoord")
    mapping = nodes.new("ShaderNodeMapping")
    mapping.inputs["Location"].default_value = (-0.5, -0.5, -0.5)
    links.new(tex.outputs["Generated"], mapping.inputs["Vector"])

    sep = nodes.new("ShaderNodeSeparateXYZ")
    links.new(mapping.outputs["Vector"], sep.inputs["Vector"])

    math_x2 = nodes.new("ShaderNodeMath")
    math_x2.operation = "MULTIPLY"
    links.new(sep.outputs["X"], math_x2.inputs[0])
    links.new(sep.outputs["X"], math_x2.inputs[1])

    # Feline vertical slit pupil
    math_slit = nodes.new("ShaderNodeMath")
    math_slit.operation = "MULTIPLY"
    math_slit.inputs[1].default_value = 7.5
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

    math_scale = nodes.new("ShaderNodeMath")
    math_scale.operation = "MULTIPLY"
    math_scale.inputs[1].default_value = 2.0
    links.new(math_dist.outputs["Value"], math_scale.inputs[0])

    # Color Ramp for Vivid Emerald Green Eye
    ramp = nodes.new("ShaderNodeValToRGB")
    ramp.color_ramp.interpolation = "LINEAR"
    ramp.color_ramp.elements[0].position = 0.0
    ramp.color_ramp.elements[0].color = (0.002, 0.002, 0.002, 1.0) # Pupil
    ramp.color_ramp.elements[1].position = 0.20
    ramp.color_ramp.elements[1].color = (0.002, 0.002, 0.002, 1.0) # Pupil

    el_em1 = ramp.color_ramp.elements.new(0.26)
    el_em1.color = (0.02, 0.85, 0.22, 1.0) # Vivid Emerald Green

    el_em2 = ramp.color_ramp.elements.new(0.58)
    el_em2.color = (0.16, 0.95, 0.32, 1.0) # Luminous Golden-Green

    el_limb = ramp.color_ramp.elements.new(0.85)
    el_limb.color = (0.01, 0.16, 0.04, 1.0) # Deep Limbal Ring

    links.new(math_scale.outputs["Value"], ramp.inputs["Fac"])
    links.new(ramp.outputs["Color"], bsdf.inputs["Base Color"])
    links.new(ramp.outputs["Color"], bsdf.inputs["Emission Color"])
    bsdf.inputs["Emission Strength"].default_value = 0.32
    bsdf.inputs["Roughness"].default_value = 0.03 # Wet glass reflection
    bsdf.inputs["Specular IOR Level"].default_value = 0.80

    links.new(bsdf.outputs["BSDF"], out.inputs["Surface"])
    return mat

def build_scene():
    # 1. Clean scene
    for obj in list(bpy.data.objects):
        bpy.data.objects.remove(obj, do_unlink=True)
    for mesh in list(bpy.data.meshes):
        bpy.data.meshes.remove(mesh, do_unlink=True)
    for mat in list(bpy.data.materials):
        bpy.data.materials.remove(mat, do_unlink=True)
    for arm in list(bpy.data.armatures):
        bpy.data.armatures.remove(arm, do_unlink=True)
    for curve in list(bpy.data.curves):
        bpy.data.curves.remove(curve, do_unlink=True)

    cat_col = bpy.data.collections.new("Russian_Blue_Cat")
    env_col = bpy.data.collections.new("House_Environment")
    bpy.context.scene.collection.children.link(cat_col)
    bpy.context.scene.collection.children.link(env_col)

    # 2. Materials
    mat_fur = create_russian_blue_fur()
    mat_table = create_wood_material()
    mat_eye = create_emerald_eye()

    # Slate charcoal nose & mouth
    mat_nose = bpy.data.materials.new("Nose_SlateCharcoal")
    mat_nose.use_nodes = True
    n_bsdf = mat_nose.node_tree.nodes.get("Principled BSDF")
    n_bsdf.inputs["Base Color"].default_value = (0.035, 0.042, 0.048, 1.0)
    n_bsdf.inputs["Roughness"].default_value = 0.36

    # Delicate inner ear skin
    mat_inner_ear = bpy.data.materials.new("InnerEar_Skin")
    mat_inner_ear.use_nodes = True
    ie_bsdf = mat_inner_ear.node_tree.nodes.get("Principled BSDF")
    ie_bsdf.inputs["Base Color"].default_value = (0.24, 0.20, 0.22, 1.0) # Soft muted slate-mauve
    ie_bsdf.inputs["Roughness"].default_value = 0.50

    # Whiskers
    mat_whisker = bpy.data.materials.new("Whisker_Silver")
    mat_whisker.use_nodes = True
    wh_bsdf = mat_whisker.node_tree.nodes.get("Principled BSDF")
    wh_bsdf.inputs["Base Color"].default_value = (0.95, 0.96, 0.98, 1.0)
    wh_bsdf.inputs["Roughness"].default_value = 0.18

    # Ceramic stoneware mug
    mat_mug = bpy.data.materials.new("Ceramic_Mug")
    mat_mug.use_nodes = True
    m_bsdf = mat_mug.node_tree.nodes.get("Principled BSDF")
    m_bsdf.inputs["Base Color"].default_value = (0.88, 0.86, 0.82, 1.0)
    m_bsdf.inputs["Roughness"].default_value = 0.15

    # Coffee liquid
    mat_coffee = bpy.data.materials.new("Liquid_Coffee")
    mat_coffee.use_nodes = True
    cof_bsdf = mat_coffee.node_tree.nodes.get("Principled BSDF")
    cof_bsdf.inputs["Base Color"].default_value = (0.05, 0.02, 0.01, 1.0)
    cof_bsdf.inputs["Roughness"].default_value = 0.05

    # Succulent plant
    mat_plant = bpy.data.materials.new("Succulent_Green")
    mat_plant.use_nodes = True
    p_bsdf = mat_plant.node_tree.nodes.get("Principled BSDF")
    p_bsdf.inputs["Base Color"].default_value = (0.08, 0.38, 0.16, 1.0)
    p_bsdf.inputs["Roughness"].default_value = 0.32
    p_bsdf.inputs["Subsurface Weight"].default_value = 0.25

    # House wall (warm greige)
    mat_wall = bpy.data.materials.new("House_Wall")
    mat_wall.use_nodes = True
    w_bsdf = mat_wall.node_tree.nodes.get("Principled BSDF")
    w_bsdf.inputs["Base Color"].default_value = (0.84, 0.82, 0.78, 1.0)
    w_bsdf.inputs["Roughness"].default_value = 0.85

    # House floor
    mat_floor = bpy.data.materials.new("House_Floor")
    mat_floor.use_nodes = True
    fl_bsdf = mat_floor.node_tree.nodes.get("Principled BSDF")
    fl_bsdf.inputs["Base Color"].default_value = (0.14, 0.08, 0.045, 1.0)
    fl_bsdf.inputs["Roughness"].default_value = 0.35

    # Framed wall art
    mat_art = bpy.data.materials.new("Wall_Art_Canvas")
    mat_art.use_nodes = True
    art_bsdf = mat_art.node_tree.nodes.get("Principled BSDF")
    art_bsdf.inputs["Base Color"].default_value = (0.35, 0.42, 0.45, 1.0)
    art_bsdf.inputs["Roughness"].default_value = 0.40

    mat_frame = bpy.data.materials.new("Art_Frame_Wood")
    mat_frame.use_nodes = True
    fr_bsdf = mat_frame.node_tree.nodes.get("Principled BSDF")
    fr_bsdf.inputs["Base Color"].default_value = (0.06, 0.04, 0.02, 1.0) # Dark walnut frame

    # 3. Build Russian Blue Anatomy (Sleek, Athletic, Modified Wedge Head)
    body_parts = []

    def make_sphere(name, radius, scale, loc, rot=(0,0,0)):
        mesh = bpy.data.meshes.new(name)
        bm = bmesh.new()
        bmesh.ops.create_uvsphere(bm, u_segments=16, v_segments=12, radius=radius)
        bmesh.ops.scale(bm, vec=Vector(scale), verts=bm.verts)
        bm.to_mesh(mesh)
        bm.free()
        obj = bpy.data.objects.new(name, mesh)
        obj.location = Vector(loc)
        obj.rotation_euler = Euler(rot)
        cat_col.objects.link(obj)
        body_parts.append(obj)
        return obj

    def make_capsule(name, p1, p2, radius=0.08):
        v1, v2 = Vector(p1), Vector(p2)
        diff = v2 - v1
        dist = diff.length
        mid = (v1 + v2) * 0.5
        mesh = bpy.data.meshes.new(name)
        bm = bmesh.new()
        bmesh.ops.create_cone(bm, segments=16, radius1=radius, radius2=radius, depth=dist)
        rot = Vector((0, 0, 1)).rotation_difference(diff).to_euler()
        rot_mat = Matrix.Rotation(rot.z, 3, 'Z') @ Matrix.Rotation(rot.y, 3, 'Y') @ Matrix.Rotation(rot.x, 3, 'X')
        bmesh.ops.rotate(bm, cent=Vector((0, 0, 0)), matrix=rot_mat, verts=bm.verts)
        bmesh.ops.create_uvsphere(bm, u_segments=16, v_segments=10, radius=radius)
        bmesh.ops.translate(bm, vec=-diff * 0.5, verts=bm.verts[-16*10:])
        bmesh.ops.create_uvsphere(bm, u_segments=16, v_segments=10, radius=radius)
        bmesh.ops.translate(bm, vec=diff * 0.5, verts=bm.verts[-16*10:])
        bm.to_mesh(mesh)
        bm.free()
        obj = bpy.data.objects.new(name, mesh)
        obj.location = mid
        cat_col.objects.link(obj)
        body_parts.append(obj)
        return obj

    # 3.1 Smooth, Sleek, Continuous Torso (NO MULTI-HUMP BULGES)
    # Main muscular torso capsule along spine (from hips to shoulders)
    make_capsule("RB_MainTorso", (0, -0.40, 0.55), (0, 0.16, 0.56), radius=0.17)
    # Tucked athletic waistline / abdomen
    make_sphere("RB_BellyTuck", 0.16, (0.85, 1.25, 0.88), (0, -0.14, 0.53))
    # Lean pelvis
    make_sphere("RB_Pelvis", 0.18, (0.90, 1.15, 0.95), (0, -0.40, 0.55), (math.radians(-3), 0, 0))
    # Elegant, long neck (Signature Russian Blue posture)
    make_capsule("RB_Neck", (0, 0.18, 0.56), (0, 0.38, 0.68), radius=0.105)

    # 3.2 Modified Wedge Head (Flat skull, sleek wedge tapering to muzzle)
    # Flat skull cranium
    make_sphere("RB_Cranium", 0.135, (1.05, 1.25, 0.88), (0, 0.48, 0.76), (math.radians(6), 0, 0))
    # High cheekbones
    make_sphere("RB_Cheek_L", 0.075, (1.1, 1.0, 0.85), (-0.095, 0.51, 0.73))
    make_sphere("RB_Cheek_R", 0.075, (1.1, 1.0, 0.85), (0.095, 0.51, 0.73))

    # 3.3 AUTHENTIC RUSSIAN BLUE MUZZLE & MOUTH SCULPT
    # Subtle, elegant mystacial whisker pads (forming gentle smile)
    make_sphere("RB_WhiskerPad_L", 0.052, (1.1, 1.0, 0.85), (-0.055, 0.63, 0.695))
    make_sphere("RB_WhiskerPad_R", 0.052, (1.1, 1.0, 0.85), (0.055, 0.63, 0.695))
    # Upper lip curves
    make_sphere("RB_UpperLip_L", 0.038, (1.1, 0.9, 0.75), (-0.032, 0.645, 0.675))
    make_sphere("RB_UpperLip_R", 0.038, (1.1, 0.9, 0.75), (0.032, 0.645, 0.675))
    # Vertical philtrum groove between pads
    make_sphere("RB_Philtrum", 0.024, (0.6, 0.8, 1.1), (0, 0.655, 0.695))
    # Neat, firm lower chin (directly below nose)
    make_sphere("RB_LowerChin", 0.045, (0.85, 0.90, 0.75), (0, 0.615, 0.650))

    # 3.4 Large Pointed Russian Blue Ears (Alert, wide at base, firmly anchored into skull)
    for sign, s_name in [(-1, "L"), (1, "R")]:
        x = sign * 0.115
        mesh_ear = bpy.data.meshes.new(f"RB_Ear_{s_name}")
        bm_ear = bmesh.new()
        bmesh.ops.create_cone(bm_ear, segments=16, radius1=0.075, radius2=0.010, depth=0.22)
        bmesh.ops.scale(bm_ear, vec=Vector((1.0, 0.32, 1.0)), verts=bm_ear.verts)
        bm_ear.to_mesh(mesh_ear)
        bm_ear.free()
        ear_obj = bpy.data.objects.new(f"RB_Ear_{s_name}", mesh_ear)
        # Firmly anchored into skull cranium
        ear_obj.location = Vector((x, 0.47, 0.92))
        ear_obj.rotation_euler = Euler((math.radians(8), math.radians(16 * sign), math.radians(-14 * sign)))
        cat_col.objects.link(ear_obj)
        body_parts.append(ear_obj)

    # 3.5 Long, Slender, Elegant Legs & Neat Small Paws
    # Front Legs
    for sign, s_name in [(-1, "L"), (1, "R")]:
        x = sign * 0.115
        p_shoulder = (x, 0.16, 0.56)
        p_elbow = (x, 0.16, 0.36)
        p_wrist = (x, 0.17, 0.16)
        p_paw = (x, 0.18, 0.038)

        make_sphere(f"RB_FrontShoulder_{s_name}", 0.095, (0.9, 1.1, 1.1), p_shoulder)
        make_capsule(f"RB_FrontUpper_{s_name}", p_shoulder, p_elbow, radius=0.050)
        make_capsule(f"RB_FrontLower_{s_name}", p_elbow, p_wrist, radius=0.042)
        make_capsule(f"RB_FrontWrist_{s_name}", p_wrist, p_paw, radius=0.038)
        make_sphere(f"RB_FrontPawFoot_{s_name}", 0.058, (1.05, 1.35, 0.55), p_paw)

    # Hind Legs
    for sign, s_name in [(-1, "L"), (1, "R")]:
        x = sign * 0.125
        p_hip = (x, -0.40, 0.55)
        p_knee = (x, -0.28, 0.36)
        p_hock = (x, -0.40, 0.19)
        p_hindpaw = (x, -0.36, 0.038)

        make_sphere(f"RB_HindThigh_{s_name}", 0.14, (0.9, 1.2, 1.05), p_hip)
        make_capsule(f"RB_HindThighToKnee_{s_name}", p_hip, p_knee, radius=0.060)
        make_capsule(f"RB_HindKneeToHock_{s_name}", p_knee, p_hock, radius=0.046)
        make_capsule(f"RB_HindHockToPaw_{s_name}", p_hock, p_hindpaw, radius=0.038)
        make_sphere(f"RB_HindPawFoot_{s_name}", 0.058, (1.05, 1.35, 0.55), p_hindpaw)

    # 3.6 Long Slender Tail (Gracefully tapering)
    tail_pts = [
        Vector((0, -0.48, 0.55)),
        Vector((0, -0.66, 0.60)),
        Vector((0, -0.84, 0.66)),
        Vector((0, -1.02, 0.74)),
        Vector((0, -1.18, 0.84)),
    ]
    for t_i in range(len(tail_pts) - 1):
        r_t = 0.038 - t_i * 0.005
        make_capsule(f"RB_TailSeg_{t_i}", tail_pts[t_i], tail_pts[t_i+1], radius=r_t)

    # Voxel Remesh & Smooth into seamless, muscular feline form
    override = get_context_override()
    cat_mesh_obj = body_parts[0]
    cat_mesh_obj.name = "RussianBlue_Cat_Body"

    if override:
        with override:
            bpy.ops.object.select_all(action='DESELECT')
            for p in body_parts:
                p.select_set(True)
            bpy.context.view_layer.objects.active = cat_mesh_obj
            bpy.ops.object.join()

            remesh = cat_mesh_obj.modifiers.new("VoxelRemesh", "REMESH")
            remesh.mode = "VOXEL"
            remesh.voxel_size = 0.020 # Smooth manifold remesh
            bpy.ops.object.modifier_apply(modifier="VoxelRemesh")

            smooth = cat_mesh_obj.modifiers.new("SmoothSurface", "SMOOTH")
            smooth.factor = 0.55
            smooth.iterations = 4
            bpy.ops.object.modifier_apply(modifier="SmoothSurface")

            sub = cat_mesh_obj.modifiers.new("Subsurf", "SUBSURF")
            sub.levels = 1

            for f in cat_mesh_obj.data.polygons:
                f.use_smooth = True

    cat_mesh_obj.data.materials.append(mat_fur)

    # 4. Facial Details: Emerald Eyes, Nose Leather, Mouth Seam, Whiskers, Inner Ears
    head_decorations = []

    # 4.1 Inner Ears (Soft peach/slate skin nestled inside ear shell)
    for sign, s_name in [(-1, "L"), (1, "R")]:
        x = sign * 0.115
        in_mesh = bpy.data.meshes.new(f"InnerEar_{s_name}")
        bm_in = bmesh.new()
        bmesh.ops.create_cone(bm_in, segments=12, radius1=0.052, radius2=0.008, depth=0.17)
        bmesh.ops.scale(bm_in, vec=Vector((1.0, 0.22, 1.0)), verts=bm_in.verts)
        bm_in.to_mesh(in_mesh)
        bm_in.free()
        in_obj = bpy.data.objects.new(f"InnerEar_{s_name}", in_mesh)
        in_obj.location = Vector((x, 0.48, 0.93))
        in_obj.rotation_euler = Euler((math.radians(10), math.radians(16 * sign), math.radians(-14 * sign)))
        cat_col.objects.link(in_obj)
        in_obj.data.materials.append(mat_inner_ear)
        for f in in_mesh.polygons: f.use_smooth = True
        head_decorations.append(in_obj)

    # 4.2 Large Luminous Emerald Green Russian Blue Eyes (Nestled naturally in sockets)
    for sign, s_name in [(-1, "L"), (1, "R")]:
        x = sign * 0.088
        y = 0.585
        z = 0.765

        eye_mesh = bpy.data.meshes.new(f"Eye_{s_name}")
        bm_e = bmesh.new()
        bmesh.ops.create_uvsphere(bm_e, u_segments=24, v_segments=16, radius=0.040)
        # Almond / oval shape
        bmesh.ops.scale(bm_e, vec=Vector((0.92, 1.15, 0.88)), verts=bm_e.verts)
        bm_e.to_mesh(eye_mesh)
        bm_e.free()
        eye_obj = bpy.data.objects.new(f"Eye_{s_name}", eye_mesh)
        eye_obj.location = Vector((x, y, z))
        eye_obj.rotation_euler = Euler((math.radians(90), 0, math.radians(-12 * sign)))
        cat_col.objects.link(eye_obj)
        eye_obj.data.materials.append(mat_eye)
        for f in eye_mesh.polygons: f.use_smooth = True
        head_decorations.append(eye_obj)

    # 4.3 Slate Charcoal Nose Leather
    n_mesh = bpy.data.meshes.new("RussianBlue_Nose")
    bm_n = bmesh.new()
    bmesh.ops.create_uvsphere(bm_n, u_segments=16, v_segments=12, radius=0.024)
    bmesh.ops.scale(bm_n, vec=Vector((1.05, 0.60, 0.70)), verts=bm_n.verts)
    bm_n.to_mesh(n_mesh)
    bm_n.free()
    nose_obj = bpy.data.objects.new("RussianBlue_Nose", n_mesh)
    nose_obj.location = Vector((0, 0.675, 0.730))
    nose_obj.rotation_euler = Euler((math.radians(16), 0, 0))
    cat_col.objects.link(nose_obj)
    nose_obj.data.materials.append(mat_nose)
    for f in n_mesh.polygons: f.use_smooth = True
    head_decorations.append(nose_obj)

    # 4.4 Explicit Mouth Seam & Philtrum Cleft (Inverted 'Y' feline smile)
    mouth_curves = [
        # Philtrum vertical groove running down from nose
        [Vector((0, 0.678, 0.715)), Vector((0, 0.670, 0.690)), Vector((0, 0.660, 0.665))],
        # Left upper lip curve
        [Vector((0, 0.660, 0.665)), Vector((-0.030, 0.648, 0.658)), Vector((-0.058, 0.620, 0.656))],
        # Right upper lip curve
        [Vector((0, 0.660, 0.665)), Vector((0.030, 0.648, 0.658)), Vector((0.058, 0.620, 0.656))],
    ]
    for m_i, pts in enumerate(mouth_curves):
        m_curve = bpy.data.curves.new(f"Mouth_Seam_{m_i}", type="CURVE")
        m_curve.dimensions = "3D"
        m_curve.bevel_depth = 0.003
        spline = m_curve.splines.new("BEZIER")
        spline.bezier_points.add(len(pts) - 1)
        for p_idx, pt in enumerate(pts):
            spline.bezier_points[p_idx].co = pt
            spline.bezier_points[p_idx].handle_left_type = "AUTO"
            spline.bezier_points[p_idx].handle_right_type = "AUTO"
        m_obj = bpy.data.objects.new(f"Mouth_Seam_{m_i}", m_curve)
        cat_col.objects.link(m_obj)
        m_obj.data.materials.append(mat_nose)
        head_decorations.append(m_obj)

    # 4.5 Sweeping Silver-White Whiskers
    for s_sign, side in [(-1, "L"), (1, "R")]:
        origins = [
            (s_sign * 0.065, 0.65, 0.71),
            (s_sign * 0.080, 0.63, 0.69),
            (s_sign * 0.065, 0.64, 0.67),
            (s_sign * 0.085, 0.62, 0.72),
            (s_sign * 0.090, 0.61, 0.68),
        ]
        angles = [
            (s_sign * 0.88, 0.22, 0.06),
            (s_sign * 0.92, 0.18, -0.05),
            (s_sign * 0.84, 0.26, -0.16),
            (s_sign * 0.80, 0.35, 0.10),
            (s_sign * 0.90, 0.30, -0.10),
        ]
        for w_i in range(5):
            w_curve = bpy.data.curves.new(f"RB_Whisker_{side}_{w_i}", type="CURVE")
            w_curve.dimensions = "3D"
            w_curve.bevel_depth = 0.002
            spline = w_curve.splines.new("BEZIER")
            spline.bezier_points.add(2)
            p0 = Vector(origins[w_i])
            dir_vec = Vector(angles[w_i])
            length = 0.35
            droop = 0.045
            p1 = p0 + dir_vec * (length * 0.5) - Vector((0, 0, droop * 0.3))
            p2 = p0 + dir_vec * length - Vector((0, 0, droop))
            spline.bezier_points[0].co = p0
            spline.bezier_points[0].radius = 1.0
            spline.bezier_points[1].co = p1
            spline.bezier_points[1].radius = 0.65
            spline.bezier_points[2].co = p2
            spline.bezier_points[2].radius = 0.2
            for bp in spline.bezier_points:
                bp.handle_left_type = "AUTO"
                bp.handle_right_type = "AUTO"
            w_obj = bpy.data.objects.new(f"RB_Whisker_{side}_{w_i}", w_curve)
            cat_col.objects.link(w_obj)
            w_obj.data.materials.append(mat_whisker)
            head_decorations.append(w_obj)

    # 5. Armature & IK Rigging
    arm_data = bpy.data.armatures.new("RussianBlue_Skeleton")
    arm_obj = bpy.data.objects.new("RussianBlue_Armature", arm_data)
    cat_col.objects.link(arm_obj)

    if override:
        with override:
            bpy.context.view_layer.objects.active = arm_obj
            bpy.ops.object.mode_set(mode='EDIT')

            root = arm_data.edit_bones.new("Root")
            root.head = (0, 0, 0)
            root.tail = (0, 0.2, 0)

            pelvis = arm_data.edit_bones.new("Pelvis")
            pelvis.head = (0, -0.40, 0.55)
            pelvis.tail = (0, -0.15, 0.55)
            pelvis.parent = root

            chest = arm_data.edit_bones.new("Chest")
            chest.head = (0, -0.15, 0.55)
            chest.tail = (0, 0.20, 0.56)
            chest.parent = pelvis

            neck = arm_data.edit_bones.new("Neck")
            neck.head = (0, 0.20, 0.56)
            neck.tail = (0, 0.40, 0.70)
            neck.parent = chest

            head_b = arm_data.edit_bones.new("Head")
            head_b.head = (0, 0.40, 0.70)
            head_b.tail = (0, 0.65, 0.76)
            head_b.parent = neck

            t1 = arm_data.edit_bones.new("Tail_01")
            t1.head = (0, -0.40, 0.55)
            t1.tail = (0, -0.66, 0.60)
            t1.parent = pelvis

            t2 = arm_data.edit_bones.new("Tail_02")
            t2.head = (0, -0.66, 0.60)
            t2.tail = (0, -0.92, 0.68)
            t2.parent = t1

            t3 = arm_data.edit_bones.new("Tail_03")
            t3.head = (0, -0.92, 0.68)
            t3.tail = (0, -1.18, 0.84)
            t3.parent = t2

            for sign, s_name in [(-1, "L"), (1, "R")]:
                x = sign * 0.115
                f_up = arm_data.edit_bones.new(f"Front_Upper_{s_name}")
                f_up.head = (x, 0.16, 0.56)
                f_up.tail = (x, 0.16, 0.36)
                f_up.parent = chest

                f_low = arm_data.edit_bones.new(f"Front_Lower_{s_name}")
                f_low.head = (x, 0.16, 0.36)
                f_low.tail = (x, 0.17, 0.16)
                f_low.parent = f_up

                f_paw = arm_data.edit_bones.new(f"Front_Paw_{s_name}")
                f_paw.head = (x, 0.17, 0.16)
                f_paw.tail = (x, 0.18, 0.038)
                f_paw.parent = f_low

                f_ik = arm_data.edit_bones.new(f"IK_FrontPaw_{s_name}")
                f_ik.head = (x, 0.18, 0.038)
                f_ik.tail = (x, 0.24, 0.038)
                f_ik.parent = root

            for sign, s_name in [(-1, "L"), (1, "R")]:
                x = sign * 0.125
                h_thigh = arm_data.edit_bones.new(f"Hind_Thigh_{s_name}")
                h_thigh.head = (x, -0.40, 0.55)
                h_thigh.tail = (x, -0.28, 0.36)
                h_thigh.parent = pelvis

                h_shin = arm_data.edit_bones.new(f"Hind_Shin_{s_name}")
                h_shin.head = (x, -0.28, 0.36)
                h_shin.tail = (x, -0.40, 0.19)
                h_shin.parent = h_thigh

                h_paw = arm_data.edit_bones.new(f"Hind_Paw_{s_name}")
                h_paw.head = (x, -0.40, 0.19)
                h_paw.tail = (x, -0.36, 0.038)
                h_paw.parent = h_shin

                h_ik = arm_data.edit_bones.new(f"IK_HindPaw_{s_name}")
                h_ik.head = (x, -0.36, 0.038)
                h_ik.tail = (x, -0.30, 0.038)
                h_ik.parent = root

            bpy.ops.object.mode_set(mode='POSE')
            for sign, s_name in [(-1, "L"), (1, "R")]:
                pb_flow = arm_obj.pose.bones[f"Front_Lower_{s_name}"]
                ik_f = pb_flow.constraints.new('IK')
                ik_f.target = arm_obj
                ik_f.subtarget = f"IK_FrontPaw_{s_name}"
                ik_f.chain_count = 2

                pb_hshin = arm_obj.pose.bones[f"Hind_Shin_{s_name}"]
                ik_h = pb_hshin.constraints.new('IK')
                ik_h.target = arm_obj
                ik_h.subtarget = f"IK_HindPaw_{s_name}"
                ik_h.chain_count = 2

            bpy.ops.object.mode_set(mode='OBJECT')

            bpy.ops.object.select_all(action='DESELECT')
            cat_mesh_obj.select_set(True)
            arm_obj.select_set(True)
            bpy.context.view_layer.objects.active = arm_obj
            bpy.ops.object.parent_set(type='ARMATURE_AUTO')

            for el in head_decorations:
                mat_orig = el.matrix_world.copy()
                el.parent = arm_obj
                el.parent_type = 'BONE'
                el.parent_bone = 'Head'
                el.matrix_world = mat_orig

    # 6. Environment: Dining Table, Coffee Mug, Succulent, Floor, Wall & Art
    # 6.1 Polished Wooden Table (Surface at Z = 0.0)
    mesh_tabletop = bpy.data.meshes.new("Dining_Table_Top")
    bm_t = bmesh.new()
    bmesh.ops.create_cube(bm_t, size=1.0)
    bmesh.ops.scale(bm_t, vec=Vector((1.6, 2.8, 0.05)), verts=bm_t.verts)
    bmesh.ops.translate(bm_t, vec=Vector((0, 0, -0.025)), verts=bm_t.verts)
    bm_t.to_mesh(mesh_tabletop)
    bm_t.free()
    tabletop_obj = bpy.data.objects.new("Dining_Table_Top", mesh_tabletop)
    tabletop_obj.location = Vector((0, 0, 0))
    env_col.objects.link(tabletop_obj)
    tabletop_obj.data.materials.append(mat_table)

    tb_bev = tabletop_obj.modifiers.new("TableBevel", "BEVEL")
    tb_bev.width = 0.008
    tb_bev.segments = 3

    # Table Legs
    for l_i, (lx, ly) in enumerate([(-0.70, -1.25), (0.70, -1.25), (-0.70, 1.25), (0.70, 1.25)]):
        mesh_leg = bpy.data.meshes.new(f"Table_Leg_{l_i}")
        bm_leg = bmesh.new()
        bmesh.ops.create_cube(bm_leg, size=1.0)
        bmesh.ops.scale(bm_leg, vec=Vector((0.08, 0.08, 0.70)), verts=bm_leg.verts)
        bmesh.ops.translate(bm_leg, vec=Vector((lx, ly, -0.40)), verts=bm_leg.verts)
        bm_leg.to_mesh(mesh_leg)
        bm_leg.free()
        leg_obj = bpy.data.objects.new(f"Table_Leg_{l_i}", mesh_leg)
        env_col.objects.link(leg_obj)
        leg_obj.data.materials.append(mat_table)

    # 6.2 Ceramic Coffee Mug (Standard 9.5cm height, placed naturally beside cat's path)
    mesh_mug = bpy.data.meshes.new("Coffee_Mug")
    bm_m = bmesh.new()
    bmesh.ops.create_cone(bm_m, segments=24, radius1=0.046, radius2=0.042, depth=0.095)
    bmesh.ops.translate(bm_m, vec=Vector((0, 0, 0.0475)), verts=bm_m.verts)
    bm_m.to_mesh(mesh_mug)
    bm_m.free()
    mug_obj = bpy.data.objects.new("Coffee_Mug", mesh_mug)
    mug_obj.location = Vector((0.36, 0.35, 0.0))
    env_col.objects.link(mug_obj)
    mug_obj.data.materials.append(mat_mug)

    # Coffee liquid surface
    mesh_cof = bpy.data.meshes.new("Coffee_Liquid")
    bm_c = bmesh.new()
    bmesh.ops.create_cone(bm_c, segments=20, radius1=0.040, radius2=0.040, depth=0.005, cap_ends=True)
    bm_c.to_mesh(mesh_cof)
    bm_c.free()
    cof_obj = bpy.data.objects.new("Coffee_Liquid", mesh_cof)
    cof_obj.location = Vector((0.36, 0.35, 0.088))
    env_col.objects.link(cof_obj)
    cof_obj.data.materials.append(mat_coffee)

    # Mug Handle
    h_curve = bpy.data.curves.new("Mug_Handle", type="CURVE")
    h_curve.dimensions = "3D"
    h_curve.bevel_depth = 0.007
    spl = h_curve.splines.new("BEZIER")
    spl.bezier_points.add(2)
    spl.bezier_points[0].co = Vector((0.405, 0.35, 0.078))
    spl.bezier_points[1].co = Vector((0.465, 0.35, 0.052))
    spl.bezier_points[2].co = Vector((0.405, 0.35, 0.024))
    for bp in spl.bezier_points:
        bp.handle_left_type = "AUTO"
        bp.handle_right_type = "AUTO"
    h_obj = bpy.data.objects.new("Mug_Handle", h_curve)
    env_col.objects.link(h_obj)
    h_obj.data.materials.append(mat_mug)

    # 6.3 Potted Succulent Plant (White ceramic pot with green rosette)
    mesh_pot = bpy.data.meshes.new("Succulent_Pot")
    bm_pot = bmesh.new()
    bmesh.ops.create_cone(bm_pot, segments=20, radius1=0.065, radius2=0.050, depth=0.085)
    bmesh.ops.translate(bm_pot, vec=Vector((0, 0, 0.0425)), verts=bm_pot.verts)
    bm_pot.to_mesh(mesh_pot)
    bm_pot.free()
    pot_obj = bpy.data.objects.new("Succulent_Pot", mesh_pot)
    pot_obj.location = Vector((-0.44, 0.18, 0.0))
    env_col.objects.link(pot_obj)
    pot_obj.data.materials.append(mat_mug)

    mesh_leaves = bpy.data.meshes.new("Succulent_Leaves")
    bm_lf = bmesh.new()
    for petal_i in range(8):
        ang = petal_i * (math.pi * 2 / 8)
        bmesh.ops.create_uvsphere(bm_lf, u_segments=10, v_segments=8, radius=0.024)
        last_v = bm_lf.verts[-10*8:]
        bmesh.ops.scale(bm_lf, vec=Vector((0.6, 1.4, 0.4)), verts=last_v)
        rot_m = Matrix.Rotation(ang, 3, 'Z') @ Matrix.Rotation(math.radians(-25), 3, 'X')
        bmesh.ops.rotate(bm_lf, cent=Vector((0, 0, 0)), matrix=rot_m, verts=last_v)
        bmesh.ops.translate(bm_lf, vec=Vector((math.sin(ang)*0.035, math.cos(ang)*0.035, 0.088)), verts=last_v)
    bm_lf.to_mesh(mesh_leaves)
    bm_lf.free()
    leaves_obj = bpy.data.objects.new("Succulent_Leaves", mesh_leaves)
    leaves_obj.location = Vector((-0.44, 0.18, 0.0))
    env_col.objects.link(leaves_obj)
    leaves_obj.data.materials.append(mat_plant)

    # 6.4 House Floor & Walls
    mesh_hfloor = bpy.data.meshes.new("House_Floor_Plane")
    bm_hf = bmesh.new()
    bmesh.ops.create_cube(bm_hf, size=1.0)
    bmesh.ops.scale(bm_hf, vec=Vector((10.0, 10.0, 0.02)), verts=bm_hf.verts)
    bmesh.ops.translate(bm_hf, vec=Vector((0, 0, -0.76)), verts=bm_hf.verts)
    bm_hf.to_mesh(mesh_hfloor)
    bm_hf.free()
    hfloor_obj = bpy.data.objects.new("House_Floor_Plane", mesh_hfloor)
    env_col.objects.link(hfloor_obj)
    hfloor_obj.data.materials.append(mat_floor)

    mesh_wall = bpy.data.meshes.new("House_Back_Wall")
    bm_w = bmesh.new()
    bmesh.ops.create_cube(bm_w, size=1.0)
    bmesh.ops.scale(bm_w, vec=Vector((10.0, 0.1, 4.0)), verts=bm_w.verts)
    bmesh.ops.translate(bm_w, vec=Vector((0, -2.4, 1.25)), verts=bm_w.verts)
    bm_w.to_mesh(mesh_wall)
    bm_w.free()
    wall_obj = bpy.data.objects.new("House_Back_Wall", mesh_wall)
    env_col.objects.link(wall_obj)
    wall_obj.data.materials.append(mat_wall)

    # Baseboard
    mesh_base = bpy.data.meshes.new("House_Baseboard")
    bm_bb = bmesh.new()
    bmesh.ops.create_cube(bm_bb, size=1.0)
    bmesh.ops.scale(bm_bb, vec=Vector((10.0, 0.04, 0.16)), verts=bm_bb.verts)
    bmesh.ops.translate(bm_bb, vec=Vector((0, -2.33, -0.67)), verts=bm_bb.verts)
    bm_bb.to_mesh(mesh_base)
    bm_bb.free()
    base_obj = bpy.data.objects.new("House_Baseboard", mesh_base)
    env_col.objects.link(base_obj)
    base_obj.data.materials.append(mat_mug)

    # Wall Art Frame (Cozy gallery wall aesthetic)
    mesh_fr = bpy.data.meshes.new("House_Wall_Art_Frame")
    bm_fr = bmesh.new()
    bmesh.ops.create_cube(bm_fr, size=1.0)
    bmesh.ops.scale(bm_fr, vec=Vector((1.2, 0.04, 0.9)), verts=bm_fr.verts)
    bmesh.ops.translate(bm_fr, vec=Vector((-0.3, -2.32, 1.35)), verts=bm_fr.verts)
    bm_fr.to_mesh(mesh_fr)
    bm_fr.free()
    art_frame_obj = bpy.data.objects.new("House_Wall_Art_Frame", mesh_fr)
    env_col.objects.link(art_frame_obj)
    art_frame_obj.data.materials.append(mat_frame)

    mesh_canvas = bpy.data.meshes.new("House_Wall_Art_Canvas")
    bm_cv = bmesh.new()
    bmesh.ops.create_cube(bm_cv, size=1.0)
    bmesh.ops.scale(bm_cv, vec=Vector((1.1, 0.02, 0.8)), verts=bm_cv.verts)
    bmesh.ops.translate(bm_cv, vec=Vector((-0.3, -2.30, 1.35)), verts=bm_cv.verts)
    bm_cv.to_mesh(mesh_canvas)
    bm_cv.free()
    canvas_obj = bpy.data.objects.new("House_Wall_Art_Canvas", mesh_canvas)
    env_col.objects.link(canvas_obj)
    canvas_obj.data.materials.append(mat_art)

    # 7. Grounded Walk Cycle on Tabletop (Z = 0.0)
    scene = bpy.context.scene
    scene.frame_start = 1
    scene.frame_end = 32
    scene.render.fps = 24

    pose_bones = arm_obj.pose.bones

    def get_ground_step(phase, stride_len=0.25, lift_height=0.11):
        norm_phase = (phase % (2 * math.pi)) / (2 * math.pi)
        if norm_phase < 0.60:
            p_frac = norm_phase / 0.60
            y_offset = (0.5 - p_frac) * stride_len
            z_offset = 0.0 # GLUED TO TABLETOP
        else:
            p_frac = (norm_phase - 0.60) / 0.40
            y_offset = (-0.5 + p_frac) * stride_len
            z_offset = math.sin(p_frac * math.pi) * lift_height
        return y_offset, z_offset

    for f in range(1, 33):
        t = (f - 1) / 32.0 * math.pi * 2

        pb_pelvis = pose_bones.get("Pelvis")
        if pb_pelvis:
            pb_pelvis.location.z = math.sin(t * 2) * 0.015
            pb_pelvis.rotation_euler.z = math.sin(t) * 0.040
            pb_pelvis.rotation_euler.x = math.cos(t * 2) * 0.020
            pb_pelvis.keyframe_insert(data_path="location", frame=f)
            pb_pelvis.keyframe_insert(data_path="rotation_euler", frame=f)

        pb_chest = pose_bones.get("Chest")
        if pb_chest:
            pb_chest.rotation_euler.z = -math.sin(t) * 0.032
            pb_chest.keyframe_insert(data_path="rotation_euler", frame=f)

        pb_head = pose_bones.get("Head")
        if pb_head:
            pb_head.rotation_euler.x = math.sin(t * 2) * 0.016
            pb_head.keyframe_insert(data_path="rotation_euler", frame=f)

        for t_name, lag, amp in [("Tail_01", 0.4, 0.14), ("Tail_02", 0.8, 0.22), ("Tail_03", 1.2, 0.30)]:
            tb = pose_bones.get(t_name)
            if tb:
                tb.rotation_euler.z = -math.sin(t - lag) * amp
                tb.rotation_euler.x = math.cos(t * 2) * 0.04
                tb.keyframe_insert(data_path="rotation_euler", frame=f)

        # Grounded feet
        y_lh, z_lh = get_ground_step(t, stride_len=0.25, lift_height=0.11)
        ik_hl = pose_bones.get("IK_HindPaw_L")
        if ik_hl:
            ik_hl.location.y = y_lh
            ik_hl.location.z = z_lh
            ik_hl.keyframe_insert(data_path="location", frame=f)

        y_lf, z_lf = get_ground_step(t + math.pi * 0.5, stride_len=0.24, lift_height=0.10)
        ik_fl = pose_bones.get("IK_FrontPaw_L")
        if ik_fl:
            ik_fl.location.y = y_lf
            ik_fl.location.z = z_lf
            ik_fl.keyframe_insert(data_path="location", frame=f)

        y_rh, z_rh = get_ground_step(t + math.pi, stride_len=0.25, lift_height=0.11)
        ik_hr = pose_bones.get("IK_HindPaw_R")
        if ik_hr:
            ik_hr.location.y = y_rh
            ik_hr.location.z = z_rh
            ik_hr.keyframe_insert(data_path="location", frame=f)

        y_rf, z_rf = get_ground_step(t + math.pi * 1.5, stride_len=0.24, lift_height=0.10)
        ik_fr = pose_bones.get("IK_FrontPaw_R")
        if ik_fr:
            ik_fr.location.y = y_rf
            ik_fr.location.z = z_rf
            ik_fr.keyframe_insert(data_path="location", frame=f)

    # 8. Balanced Lighting & Camera
    # Key Light (Warm sunlight streaming through window)
    light_win = bpy.data.lights.new("Window_Sunlight", type='AREA')
    light_win.energy = 140.0
    light_win.color = (1.0, 0.94, 0.88)
    light_win.size = 2.4
    obj_win = bpy.data.objects.new("Window_Sunlight", light_win)
    obj_win.location = Vector((2.6, 2.0, 2.2))
    look_at(obj_win, Vector((0, 0.1, 0.3)))
    env_col.objects.link(obj_win)

    # Fill Light (Cool ambient room fill)
    light_fill = bpy.data.lights.new("Room_Ambient_Fill", type='AREA')
    light_fill.energy = 55.0
    light_fill.color = (0.85, 0.90, 1.0)
    light_fill.size = 3.0
    obj_fill = bpy.data.objects.new("Room_Ambient_Fill", light_fill)
    obj_fill.location = Vector((-2.2, 1.8, 1.6))
    look_at(obj_fill, Vector((0, 0.1, 0.3)))
    env_col.objects.link(obj_fill)

    # Rim Light (Cat silver spine highlight)
    light_rim = bpy.data.lights.new("Coat_Silver_Rim", type='SPOT')
    light_rim.energy = 130.0
    light_rim.color = (0.90, 0.95, 1.0)
    light_rim.spot_size = math.radians(45)
    light_rim.spot_blend = 0.5
    obj_rim = bpy.data.objects.new("Coat_Silver_Rim", light_rim)
    obj_rim.location = Vector((-1.2, -1.8, 2.0))
    look_at(obj_rim, Vector((0, -0.1, 0.5)))
    env_col.objects.link(obj_rim)

    # Camera framing
    cam_data = bpy.data.cameras.new("House_Table_Camera")
    cam_data.lens = 56.0
    cam_data.dof.use_dof = True
    cam_data.dof.focus_distance = 3.1
    cam_data.dof.aperture_fstop = 3.2
    cam_obj = bpy.data.objects.new("House_Table_Camera", cam_data)
    cam_obj.location = Vector((1.85, 2.45, 0.92))
    look_at(cam_obj, Vector((0, 0.12, 0.46)))
    env_col.objects.link(cam_obj)
    bpy.context.scene.camera = cam_obj

    # World
    world = bpy.context.scene.world
    if not world:
        world = bpy.data.worlds.new("House_World")
        bpy.context.scene.world = world
    world.use_nodes = True
    w_nodes = world.node_tree.nodes
    w_nodes.clear()
    w_out = w_nodes.new("ShaderNodeOutputWorld")
    w_bg = w_nodes.new("ShaderNodeBackground")
    w_bg.inputs["Color"].default_value = (0.02, 0.02, 0.025, 1.0)
    w_bg.inputs["Strength"].default_value = 0.4
    world.node_tree.links.new(w_bg.outputs["Background"], w_out.inputs["Surface"])

    return {
        "status": "success",
        "breed": "Russian Blue (Sleek Athletic)",
        "mouth": "Modeled philtrum, upper lip curves & chin",
        "eyes": "Vivid Emerald Green",
        "environment": "House interior with polished wooden table, mug, succulent, floor, wall & art",
        "rig_name": arm_obj.name,
        "frames_animated": 32,
    }
