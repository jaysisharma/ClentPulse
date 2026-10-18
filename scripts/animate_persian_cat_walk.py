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

def build_persian_walking_cat():
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

    persian_col = bpy.data.collections.new("Persian_Cat_Rig")
    bpy.context.scene.collection.children.link(persian_col)

    # -------------------------------------------------------------
    # 2. MATERIALS: LUXURIOUS FLUFFY PERSIAN COAT
    # -------------------------------------------------------------
    # Persian Coat: White / Silver Chinchilla with warm subsurface glow & plush velvet sheen
    mat_fur = bpy.data.materials.new("Persian_Fur_White")
    mat_fur.use_nodes = True
    f_nodes = mat_fur.node_tree.nodes
    f_links = mat_fur.node_tree.links
    f_nodes.clear()
    f_out = f_nodes.new("ShaderNodeOutputMaterial")
    f_bsdf = f_nodes.new("ShaderNodeBsdfPrincipled")
    # Soft pearl white with faint warm cream undertone
    f_bsdf.inputs["Base Color"].default_value = (0.92, 0.91, 0.90, 1.0)
    f_bsdf.inputs["Roughness"].default_value = 0.68
    f_bsdf.inputs["Sheen Weight"].default_value = 1.0 # Plush velvet fur sheen
    f_bsdf.inputs["Sheen Tint"].default_value = (1.0, 0.95, 0.92, 1.0)
    f_bsdf.inputs["Subsurface Weight"].default_value = 0.22 # Warm skin translucency through fluff
    f_bsdf.inputs["Subsurface Radius"].default_value = (0.4, 0.25, 0.2)
    f_links.new(f_bsdf.outputs["BSDF"], f_out.inputs["Surface"])

    # Nose & Inner Ears (Soft Coral Pink)
    mat_pink = bpy.data.materials.new("Persian_Nose_Pink")
    mat_pink.use_nodes = True
    p_nodes = mat_pink.node_tree.nodes
    p_links = mat_pink.node_tree.links
    p_nodes.clear()
    p_out = p_nodes.new("ShaderNodeOutputMaterial")
    p_bsdf = p_nodes.new("ShaderNodeBsdfPrincipled")
    p_bsdf.inputs["Base Color"].default_value = (0.94, 0.48, 0.52, 1.0)
    p_bsdf.inputs["Roughness"].default_value = 0.35
    p_bsdf.inputs["Subsurface Weight"].default_value = 0.5
    p_bsdf.inputs["Subsurface Radius"].default_value = (0.5, 0.25, 0.15)
    p_links.new(p_bsdf.outputs["BSDF"], p_out.inputs["Surface"])

    # Cornea (Refractive Glass with clear specular catchlights)
    mat_cornea = bpy.data.materials.new("Persian_Eye_Cornea")
    mat_cornea.use_nodes = True
    c_nodes = mat_cornea.node_tree.nodes
    c_links = mat_cornea.node_tree.links
    c_nodes.clear()
    c_out = c_nodes.new("ShaderNodeOutputMaterial")
    c_bsdf = c_nodes.new("ShaderNodeBsdfPrincipled")
    c_bsdf.inputs["Base Color"].default_value = (0.98, 1.0, 0.99, 1.0)
    c_bsdf.inputs["Roughness"].default_value = 0.015
    c_bsdf.inputs["Transmission Weight"].default_value = 0.96
    c_bsdf.inputs["IOR"].default_value = 1.34
    c_links.new(c_bsdf.outputs["BSDF"], c_out.inputs["Surface"])

    # Persian Eyes: Soulful Glowing Copper/Amber (Signature Persian Eye Color)
    mat_iris = bpy.data.materials.new("Persian_Eye_Amber")
    mat_iris.use_nodes = True
    i_nodes = mat_iris.node_tree.nodes
    i_links = mat_iris.node_tree.links
    i_nodes.clear()
    i_out = i_nodes.new("ShaderNodeOutputMaterial")
    i_bsdf = i_nodes.new("ShaderNodeBsdfPrincipled")
    i_bsdf.inputs["Base Color"].default_value = (0.95, 0.55, 0.08, 1.0) # Deep luminous copper-amber
    i_bsdf.inputs["Roughness"].default_value = 0.1
    i_bsdf.inputs["Emission Color"].default_value = (0.45, 0.22, 0.02, 1.0)
    i_bsdf.inputs["Emission Strength"].default_value = 0.35
    i_links.new(i_bsdf.outputs["BSDF"], i_out.inputs["Surface"])

    # Pupil (Deep vertical slit with soft rounded aperture)
    mat_pupil = bpy.data.materials.new("Persian_Pupil")
    mat_pupil.use_nodes = True
    pu_nodes = mat_pupil.node_tree.nodes
    pu_links = mat_pupil.node_tree.links
    pu_nodes.clear()
    pu_out = pu_nodes.new("ShaderNodeOutputMaterial")
    pu_bsdf = pu_nodes.new("ShaderNodeBsdfPrincipled")
    pu_bsdf.inputs["Base Color"].default_value = (0.005, 0.005, 0.005, 1.0)
    pu_bsdf.inputs["Roughness"].default_value = 0.05
    pu_links.new(pu_bsdf.outputs["BSDF"], pu_out.inputs["Surface"])

    # Whiskers (Fine translucent white keratin)
    mat_whisker = bpy.data.materials.new("Persian_Whisker")
    mat_whisker.use_nodes = True
    w_nodes = mat_whisker.node_tree.nodes
    w_links = mat_whisker.node_tree.links
    w_nodes.clear()
    w_out = w_nodes.new("ShaderNodeOutputMaterial")
    w_bsdf = w_nodes.new("ShaderNodeBsdfPrincipled")
    w_bsdf.inputs["Base Color"].default_value = (0.98, 0.98, 0.98, 1.0)
    w_bsdf.inputs["Roughness"].default_value = 0.2
    w_bsdf.inputs["Transmission Weight"].default_value = 0.4
    w_links.new(w_bsdf.outputs["BSDF"], w_out.inputs["Surface"])

    # -------------------------------------------------------------
    # 3. ANATOMICAL PERSIAN "COBBY" BODY MODELING
    # -------------------------------------------------------------
    body_parts = []

    def make_sphere(name, radius, scale, loc, rot=(0,0,0)):
        mesh = bpy.data.meshes.new(name)
        bm = bmesh.new()
        bmesh.ops.create_uvsphere(bm, u_segments=22, v_segments=16, radius=radius)
        bmesh.ops.scale(bm, vec=Vector(scale), verts=bm.verts)
        bm.to_mesh(mesh)
        bm.free()
        obj = bpy.data.objects.new(name, mesh)
        obj.location = Vector(loc)
        obj.rotation_euler = Euler(rot)
        persian_col.objects.link(obj)
        body_parts.append(obj)
        return obj

    def make_capsule(name, p1, p2, radius):
        v1 = Vector(p1)
        v2 = Vector(p2)
        diff = v2 - v1
        dist = diff.length
        mid = (v1 + v2) * 0.5
        
        mesh = bpy.data.meshes.new(name)
        bm = bmesh.new()
        bmesh.ops.create_cone(bm, segments=16, radius1=radius, radius2=radius, depth=dist)
        rot = Vector((0, 0, 1)).rotation_difference(diff).to_euler()
        rot_mat = Matrix.Rotation(rot.z, 3, 'Z') @ Matrix.Rotation(rot.y, 3, 'Y') @ Matrix.Rotation(rot.x, 3, 'X')
        bmesh.ops.rotate(bm, cent=Vector((0, 0, 0)), matrix=rot_mat, verts=bm.verts)
        # Joint spheres
        bmesh.ops.create_uvsphere(bm, u_segments=16, v_segments=10, radius=radius)
        bmesh.ops.translate(bm, vec=-diff * 0.5, verts=bm.verts[-16*10:])
        bmesh.ops.create_uvsphere(bm, u_segments=16, v_segments=10, radius=radius)
        bmesh.ops.translate(bm, vec=diff * 0.5, verts=bm.verts[-16*10:])
        
        bm.to_mesh(mesh)
        bm.free()
        obj = bpy.data.objects.new(name, mesh)
        obj.location = mid
        persian_col.objects.link(obj)
        body_parts.append(obj)
        return obj

    # 3.1 Cobby, Compact Persian Body with Fluffy Volume
    # Broad, heavy-boned pelvis with plush breeches
    make_sphere("B_Pelvis", 0.32, (1.1, 1.25, 1.05), (0, -0.38, 0.60), (math.radians(-6), 0, 0))
    # Fluffy belly apron / flank
    make_sphere("B_Belly", 0.30, (1.05, 1.25, 0.98), (0, -0.12, 0.58), (0, 0, 0))
    # Massive chest & Lion's Mane / Ruff around neck and shoulders (Signature Persian fluff!)
    make_sphere("B_Chest", 0.36, (1.15, 1.25, 1.15), (0, 0.16, 0.62), (math.radians(10), 0, 0))
    make_sphere("B_Ruff_LionsMane", 0.34, (1.2, 1.1, 1.2), (0, 0.36, 0.68), (math.radians(25), 0, 0))

    # 3.2 Distinct Flat Persian Face (Brachycephalic Doll-Face)
    # Round, broad cranium (flattened front-to-back)
    make_sphere("B_Head", 0.24, (1.18, 0.85, 0.95), (0, 0.50, 0.76), (0, 0, 0))
    # Chubby full cheeks (jowls)
    make_sphere("B_Cheek_L", 0.14, (1.1, 0.95, 1.0), (-0.15, 0.52, 0.74))
    make_sphere("B_Cheek_R", 0.14, (1.1, 0.95, 1.0), (0.15, 0.52, 0.74))
    # Flat whisker pads (mystacial pads)
    make_sphere("B_WhiskerPad_L", 0.095, (1.1, 0.85, 0.9), (-0.08, 0.69, 0.72))
    make_sphere("B_WhiskerPad_R", 0.095, (1.1, 0.85, 0.9), (0.08, 0.69, 0.72))
    # Snub chin directly below the flat nose
    make_sphere("B_Chin", 0.08, (1.0, 0.85, 0.8), (0, 0.67, 0.66))

    # 3.3 Small, Rounded, Low-Set Persian Ears
    for sign, s_name in [(-1, "L"), (1, "R")]:
        x = sign * 0.17
        mesh_ear = bpy.data.meshes.new(f"B_Ear_{s_name}")
        bm_ear = bmesh.new()
        bmesh.ops.create_cone(bm_ear, segments=16, radius1=0.10, radius2=0.03, depth=0.22)
        bmesh.ops.scale(bm_ear, vec=Vector((1.0, 0.45, 1.0)), verts=bm_ear.verts)
        bm_ear.to_mesh(mesh_ear)
        bm_ear.free()
        ear_obj = bpy.data.objects.new(f"B_Ear_{s_name}", mesh_ear)
        # Positioned firmly on top-sides of skull, tilted forward
        ear_obj.location = Vector((x, 0.48, 1.03))
        ear_obj.rotation_euler = Euler((math.radians(16), math.radians(22 * sign), math.radians(-24 * sign)))
        persian_col.objects.link(ear_obj)
        body_parts.append(ear_obj)

    # 3.4 Short, Sturdy, Thick Persian Legs & Large Round Paws
    for sign, s_name in [(-1, "L"), (1, "R")]:
        x = sign * 0.15
        p_shoulder = (x, 0.20, 0.60)
        p_elbow = (x, 0.20, 0.38)
        p_wrist = (x, 0.21, 0.18)
        p_paw = (x, 0.24, 0.055)

        make_sphere(f"B_FrontShoulder_{s_name}", 0.16, (1.0, 1.1, 1.2), p_shoulder)
        make_capsule(f"B_FrontUpper_{s_name}", p_shoulder, p_elbow, radius=0.10)
        make_capsule(f"B_FrontLower_{s_name}", p_elbow, p_wrist, radius=0.09)
        make_capsule(f"B_FrontWrist_{s_name}", p_wrist, p_paw, radius=0.085)
        # Large, round tufted front paw
        make_sphere(f"B_FrontPawFoot_{s_name}", 0.11, (1.25, 1.35, 0.65), p_paw)

    # Sturdy Hind Legs with Fluffy Breeches
    for sign, s_name in [(-1, "L"), (1, "R")]:
        x = sign * 0.17
        p_hip = (x, -0.38, 0.60)
        p_knee = (x, -0.26, 0.38)
        p_hock = (x, -0.40, 0.20)
        p_hindpaw = (x, -0.36, 0.055)

        make_sphere(f"B_HindThigh_{s_name}", 0.25, (1.05, 1.25, 1.05), p_hip)
        make_capsule(f"B_HindThighToKnee_{s_name}", p_hip, p_knee, radius=0.11)
        make_capsule(f"B_HindKneeToHock_{s_name}", p_knee, p_hock, radius=0.095)
        make_capsule(f"B_HindHockToPaw_{s_name}", p_hock, p_hindpaw, radius=0.085)
        # Large round hind paw
        make_sphere(f"B_HindPawFoot_{s_name}", 0.11, (1.2, 1.35, 0.65), p_hindpaw)

    # 3.5 Thick, Luxurious "Bottle-Brush" Plume Tail (Short/Medium, extremely plush)
    tail_pts = [
        Vector((0, -0.48, 0.60)),
        Vector((0, -0.64, 0.63)),
        Vector((0, -0.80, 0.67)),
        Vector((0, -0.96, 0.72)),
        Vector((0, -1.10, 0.78)),
    ]
    for t_i in range(len(tail_pts) - 1):
        # Voluminous plume tail radius
        r_t = 0.085 - t_i * 0.008
        make_capsule(f"B_TailSeg_{t_i}", tail_pts[t_i], tail_pts[t_i+1], radius=r_t)

    # Voxel Remesh & Smooth into seamless, voluptuous Persian feline form
    override = get_context_override()
    cat_mesh_obj = body_parts[0]
    cat_mesh_obj.name = "Persian_Cat_Body"

    if override:
        with override:
            bpy.ops.object.select_all(action='DESELECT')
            for p in body_parts:
                p.select_set(True)
            bpy.context.view_layer.objects.active = cat_mesh_obj
            bpy.ops.object.join()

            remesh = cat_mesh_obj.modifiers.new("VoxelRemesh", "REMESH")
            remesh.mode = "VOXEL"
            remesh.voxel_size = 0.022
            bpy.ops.object.modifier_apply(modifier="VoxelRemesh")

            smooth = cat_mesh_obj.modifiers.new("SmoothSurface", "SMOOTH")
            smooth.factor = 0.50
            smooth.iterations = 3
            bpy.ops.object.modifier_apply(modifier="SmoothSurface")

            sub = cat_mesh_obj.modifiers.new("Subsurf", "SUBSURF")
            sub.levels = 1

            for f in cat_mesh_obj.data.polygons:
                f.use_smooth = True

    cat_mesh_obj.data.materials.append(mat_fur)

    # -------------------------------------------------------------
    # 4. SIGNATURE PERSIAN FACIAL DETAILS
    # -------------------------------------------------------------
    head_decorations = []

    # Small Pink Inner Ear Cavity with fluffy ear tufts
    for sign, s_name in [(-1, "L"), (1, "R")]:
        x = sign * 0.17
        in_mesh = bpy.data.meshes.new(f"InnerEar_{s_name}")
        bm_in = bmesh.new()
        bmesh.ops.create_cone(bm_in, segments=12, radius1=0.07, radius2=0.02, depth=0.16)
        bmesh.ops.scale(bm_in, vec=Vector((1.0, 0.35, 1.0)), verts=bm_in.verts)
        bm_in.to_mesh(in_mesh)
        bm_in.free()
        in_obj = bpy.data.objects.new(f"InnerEar_{s_name}", in_mesh)
        in_obj.location = Vector((x, 0.49, 1.04))
        in_obj.rotation_euler = Euler((math.radians(18), math.radians(22 * sign), math.radians(-24 * sign)))
        persian_col.objects.link(in_obj)
        in_obj.data.materials.append(mat_pink)
        for f in in_mesh.polygons: f.use_smooth = True
        head_decorations.append(in_obj)

    # Large Round Soulful Persian Amber Eyes (Set wide apart on flat face)
    for sign, s_name in [(-1, "L"), (1, "R")]:
        x = sign * 0.125
        y = 0.725
        z = 0.81

        # Cornea (Glass)
        c_mesh = bpy.data.meshes.new(f"Eye_{s_name}_Cornea")
        bm = bmesh.new()
        bmesh.ops.create_uvsphere(bm, u_segments=18, v_segments=14, radius=0.065)
        bm.to_mesh(c_mesh)
        bm.free()
        c_obj = bpy.data.objects.new(f"Eye_{s_name}_Cornea", c_mesh)
        c_obj.location = Vector((x, y, z))
        persian_col.objects.link(c_obj)
        c_obj.data.materials.append(mat_cornea)
        for f in c_mesh.polygons: f.use_smooth = True
        head_decorations.append(c_obj)

        # Glowing Amber Iris
        i_mesh = bpy.data.meshes.new(f"Eye_{s_name}_Iris")
        bm = bmesh.new()
        bmesh.ops.create_uvsphere(bm, u_segments=18, v_segments=14, radius=0.061)
        bm.to_mesh(i_mesh)
        bm.free()
        i_obj = bpy.data.objects.new(f"Eye_{s_name}_Iris", i_mesh)
        i_obj.location = Vector((x, y - 0.003, z))
        persian_col.objects.link(i_obj)
        i_obj.data.materials.append(mat_iris)
        for f in i_mesh.polygons: f.use_smooth = True
        head_decorations.append(i_obj)

        # Pupil (Slightly dilated vertical slit)
        p_mesh = bpy.data.meshes.new(f"Eye_{s_name}_Pupil")
        bm = bmesh.new()
        bmesh.ops.create_uvsphere(bm, u_segments=14, v_segments=10, radius=0.062)
        bmesh.ops.scale(bm, vec=Vector((0.30, 1.15, 0.90)), verts=bm.verts)
        bm.to_mesh(p_mesh)
        bm.free()
        p_obj = bpy.data.objects.new(f"Eye_{s_name}_Pupil", p_mesh)
        p_obj.location = Vector((x, y + 0.002, z))
        persian_col.objects.link(p_obj)
        p_obj.data.materials.append(mat_pupil)
        for f in p_mesh.polygons: f.use_smooth = True
        head_decorations.append(p_obj)

    # Snub Button Nose (Centered directly between the eyes on the flat muzzle break)
    n_mesh = bpy.data.meshes.new("Persian_Button_Nose")
    bm = bmesh.new()
    bmesh.ops.create_uvsphere(bm, u_segments=16, v_segments=12, radius=0.038)
    # Upturned, flat button nose shape
    bmesh.ops.scale(bm, vec=Vector((1.1, 0.6, 0.8)), verts=bm.verts)
    bm.to_mesh(n_mesh)
    bm.free()
    nose_obj = bpy.data.objects.new("Persian_Button_Nose", n_mesh)
    nose_obj.location = Vector((0, 0.75, 0.78))
    nose_obj.rotation_euler = Euler((math.radians(28), 0, 0))
    persian_col.objects.link(nose_obj)
    nose_obj.data.materials.append(mat_pink)
    for f in n_mesh.polygons: f.use_smooth = True
    head_decorations.append(nose_obj)

    # Whiskers (Long, sweeping white whiskers)
    for s_sign, side in [(-1, "L"), (1, "R")]:
        origins = [
            (s_sign * 0.12, 0.73, 0.75),
            (s_sign * 0.14, 0.71, 0.73),
            (s_sign * 0.12, 0.72, 0.70),
            (s_sign * 0.15, 0.70, 0.76),
            (s_sign * 0.16, 0.69, 0.72),
        ]
        angles = [
            (s_sign * 0.85, 0.25, 0.08),
            (s_sign * 0.90, 0.20, -0.06),
            (s_sign * 0.80, 0.30, -0.18),
            (s_sign * 0.75, 0.40, 0.12),
            (s_sign * 0.85, 0.35, -0.12),
        ]
        for w_i in range(5):
            w_curve = bpy.data.curves.new(f"W_{side}_{w_i}", type="CURVE")
            w_curve.dimensions = "3D"
            w_curve.bevel_depth = 0.003
            spline = w_curve.splines.new("BEZIER")
            spline.bezier_points.add(2)
            p0 = Vector(origins[w_i])
            dir_vec = Vector(angles[w_i])
            length = 0.42
            droop = 0.06
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
            w_obj = bpy.data.objects.new(f"W_{side}_{w_i}", w_curve)
            persian_col.objects.link(w_obj)
            w_obj.data.materials.append(mat_whisker)
            head_decorations.append(w_obj)

    # -------------------------------------------------------------
    # 5. SKELETAL RIG WITH IK CONSTRAINTS (NO MORE FLOATING!)
    # -------------------------------------------------------------
    arm_data = bpy.data.armatures.new("Persian_Cat_Skeleton")
    arm_obj = bpy.data.objects.new("Persian_Cat_Armature", arm_data)
    persian_col.objects.link(arm_obj)

    if override:
        with override:
            bpy.context.view_layer.objects.active = arm_obj
            bpy.ops.object.mode_set(mode='EDIT')

            # Root (floor level)
            root = arm_data.edit_bones.new("Root")
            root.head = (0, 0, 0)
            root.tail = (0, 0.2, 0)

            # Pelvis & Spine
            pelvis = arm_data.edit_bones.new("Pelvis")
            pelvis.head = (0, -0.38, 0.60)
            pelvis.tail = (0, -0.15, 0.60)
            pelvis.parent = root

            chest = arm_data.edit_bones.new("Chest")
            chest.head = (0, -0.15, 0.60)
            chest.tail = (0, 0.25, 0.62)
            chest.parent = pelvis

            neck = arm_data.edit_bones.new("Neck")
            neck.head = (0, 0.25, 0.62)
            neck.tail = (0, 0.45, 0.75)
            neck.parent = chest

            head_b = arm_data.edit_bones.new("Head")
            head_b.head = (0, 0.45, 0.75)
            head_b.tail = (0, 0.72, 0.88)
            head_b.parent = neck

            # Tail bones
            t1 = arm_data.edit_bones.new("Tail_01")
            t1.head = (0, -0.38, 0.60)
            t1.tail = (0, -0.65, 0.63)
            t1.parent = pelvis

            t2 = arm_data.edit_bones.new("Tail_02")
            t2.head = (0, -0.65, 0.63)
            t2.tail = (0, -0.90, 0.70)
            t2.parent = t1

            t3 = arm_data.edit_bones.new("Tail_03")
            t3.head = (0, -0.90, 0.70)
            t3.tail = (0, -1.15, 0.78)
            t3.parent = t2

            # Front Legs
            for sign, s_name in [(-1, "L"), (1, "R")]:
                x = sign * 0.15
                f_up = arm_data.edit_bones.new(f"Front_Upper_{s_name}")
                f_up.head = (x, 0.20, 0.60)
                f_up.tail = (x, 0.20, 0.38)
                f_up.parent = chest

                f_low = arm_data.edit_bones.new(f"Front_Lower_{s_name}")
                f_low.head = (x, 0.20, 0.38)
                f_low.tail = (x, 0.21, 0.16)
                f_low.parent = f_up

                f_paw = arm_data.edit_bones.new(f"Front_Paw_{s_name}")
                f_paw.head = (x, 0.21, 0.16)
                f_paw.tail = (x, 0.26, 0.055)
                f_paw.parent = f_low

                # IK Target for front paw (Parented to Root, touches floor directly!)
                f_ik = arm_data.edit_bones.new(f"IK_FrontPaw_{s_name}")
                f_ik.head = (x, 0.24, 0.055)
                f_ik.tail = (x, 0.30, 0.055)
                f_ik.parent = root

            # Hind Legs
            for sign, s_name in [(-1, "L"), (1, "R")]:
                x = sign * 0.17
                h_thigh = arm_data.edit_bones.new(f"Hind_Thigh_{s_name}")
                h_thigh.head = (x, -0.38, 0.60)
                h_thigh.tail = (x, -0.26, 0.38)
                h_thigh.parent = pelvis

                h_shin = arm_data.edit_bones.new(f"Hind_Shin_{s_name}")
                h_shin.head = (x, -0.26, 0.38)
                h_shin.tail = (x, -0.40, 0.20)
                h_shin.parent = h_thigh

                h_paw = arm_data.edit_bones.new(f"Hind_Paw_{s_name}")
                h_paw.head = (x, -0.40, 0.20)
                h_paw.tail = (x, -0.36, 0.055)
                h_paw.parent = h_shin

                # IK Target for hind paw (Touches floor directly!)
                h_ik = arm_data.edit_bones.new(f"IK_HindPaw_{s_name}")
                h_ik.head = (x, -0.38, 0.055)
                h_ik.tail = (x, -0.32, 0.055)
                h_ik.parent = root

            # POSE MODE: ADD IK CONSTRAINTS
            bpy.ops.object.mode_set(mode='POSE')
            for sign, s_name in [(-1, "L"), (1, "R")]:
                # Front leg IK
                pb_flow = arm_obj.pose.bones[f"Front_Lower_{s_name}"]
                ik_f = pb_flow.constraints.new('IK')
                ik_f.target = arm_obj
                ik_f.subtarget = f"IK_FrontPaw_{s_name}"
                ik_f.chain_count = 2

                # Hind leg IK
                pb_hshin = arm_obj.pose.bones[f"Hind_Shin_{s_name}"]
                ik_h = pb_hshin.constraints.new('IK')
                ik_h.target = arm_obj
                ik_h.subtarget = f"IK_HindPaw_{s_name}"
                ik_h.chain_count = 2

            bpy.ops.object.mode_set(mode='OBJECT')

            # Parent body to armature with automatic weights
            bpy.ops.object.select_all(action='DESELECT')
            cat_mesh_obj.select_set(True)
            arm_obj.select_set(True)
            bpy.context.view_layer.objects.active = arm_obj
            bpy.ops.object.parent_set(type='ARMATURE_AUTO')

            # Parent head elements without shifting
            for el in head_decorations:
                mat_orig = el.matrix_world.copy()
                el.parent = arm_obj
                el.parent_type = 'BONE'
                el.parent_bone = 'Head'
                el.matrix_world = mat_orig

    # -------------------------------------------------------------
    # 6. GROUNDED IK STRIDE ANIMATION (ZERO FLOATING, GROUND LOCKED)
    # -------------------------------------------------------------
    scene = bpy.context.scene
    scene.frame_start = 1
    scene.frame_end = 32
    scene.render.fps = 24

    pose_bones = arm_obj.pose.bones

    # Helper function for true grounded footstep cycle:
    # Stance (60%): paw stays locked flat on the floor at ground level (Z=0.0) sliding backward relative to body
    # Swing (40%): paw lifts cleanly in an arc (Z=0.14) and steps forward
    def get_ground_step(phase, stride_len=0.22, lift_height=0.12):
        norm_phase = (phase % (2 * math.pi)) / (2 * math.pi) # 0.0 to 1.0
        if norm_phase < 0.60:
            # STANCE PHASE: Planted flat on the floor, zero floating!
            p_frac = norm_phase / 0.60
            y_offset = (0.5 - p_frac) * stride_len
            z_offset = 0.0 # GLUED TO FLOOR!
        else:
            # SWING PHASE: Lifts up and arches forward!
            p_frac = (norm_phase - 0.60) / 0.40
            y_offset = (-0.5 + p_frac) * stride_len
            z_offset = math.sin(p_frac * math.pi) * lift_height # Smooth parabola arc!
        return y_offset, z_offset

    for f in range(1, 33):
        t = (f - 1) / 32.0 * math.pi * 2

        # 1. Pelvis: natural rhythmic bounce as paws bear weight + lateral roll
        pb_pelvis = pose_bones.get("Pelvis")
        if pb_pelvis:
            pb_pelvis.location.z = math.sin(t * 2) * 0.018 # Subtle vertical bounce
            pb_pelvis.rotation_euler.z = math.sin(t) * 0.045 # Lateral sway
            pb_pelvis.rotation_euler.x = math.cos(t * 2) * 0.025
            pb_pelvis.keyframe_insert(data_path="location", frame=f)
            pb_pelvis.keyframe_insert(data_path="rotation_euler", frame=f)

        # 2. Chest: counter-balancing roll
        pb_chest = pose_bones.get("Chest")
        if pb_chest:
            pb_chest.rotation_euler.z = -math.sin(t) * 0.035
            pb_chest.keyframe_insert(data_path="rotation_euler", frame=f)

        # 3. Head: Persian dignified gentle nod
        pb_head = pose_bones.get("Head")
        if pb_head:
            pb_head.rotation_euler.x = math.sin(t * 2) * 0.025
            pb_head.keyframe_insert(data_path="rotation_euler", frame=f)

        # 4. Fluffy Bottle-Brush Tail: Sinuous plume wave
        for t_name, lag, amp in [("Tail_01", 0.4, 0.12), ("Tail_02", 0.8, 0.20), ("Tail_03", 1.2, 0.28)]:
            tb = pose_bones.get(t_name)
            if tb:
                tb.rotation_euler.z = -math.sin(t - lag) * amp
                tb.rotation_euler.x = math.cos(t * 2) * 0.05
                tb.keyframe_insert(data_path="rotation_euler", frame=f)

        # 5. GROUNDED IK FEET: 4-Beat Quadruped Sequence
        # Left Hind (Phase 0%)
        y_lh, z_lh = get_ground_step(t, stride_len=0.24, lift_height=0.11)
        ik_hl = pose_bones.get("IK_HindPaw_L")
        if ik_hl:
            ik_hl.location.y = y_lh
            ik_hl.location.z = z_lh
            ik_hl.keyframe_insert(data_path="location", frame=f)

        # Left Front (Phase 25% = t + pi/2)
        y_lf, z_lf = get_ground_step(t + math.pi * 0.5, stride_len=0.22, lift_height=0.10)
        ik_fl = pose_bones.get("IK_FrontPaw_L")
        if ik_fl:
            ik_fl.location.y = y_lf
            ik_fl.location.z = z_lf
            ik_fl.keyframe_insert(data_path="location", frame=f)

        # Right Hind (Phase 50% = t + pi)
        y_rh, z_rh = get_ground_step(t + math.pi, stride_len=0.24, lift_height=0.11)
        ik_hr = pose_bones.get("IK_HindPaw_R")
        if ik_hr:
            ik_hr.location.y = y_rh
            ik_hr.location.z = z_rh
            ik_hr.keyframe_insert(data_path="location", frame=f)

        # Right Front (Phase 75% = t + 3*pi/2)
        y_rf, z_rf = get_ground_step(t + math.pi * 1.5, stride_len=0.22, lift_height=0.10)
        ik_fr = pose_bones.get("IK_FrontPaw_R")
        if ik_fr:
            ik_fr.location.y = y_rf
            ik_fr.location.z = z_rf
            ik_fr.keyframe_insert(data_path="location", frame=f)

    # -------------------------------------------------------------
    # 7. STUDIO LIGHTING & SIDE-VIEW CAMERA
    # -------------------------------------------------------------
    key_l_data = bpy.data.lights.new("Persian_KeyLight", type="AREA")
    key_l_data.energy = 85.0
    key_l_data.size = 2.5
    key_l_data.color = (1.0, 0.96, 0.92)
    key_l = bpy.data.objects.new("Persian_KeyLight", key_l_data)
    key_l.location = Vector((2.8, 2.2, 2.4))
    look_at(key_l, Vector((0, 0.1, 0.55)))
    persian_col.objects.link(key_l)

    rim_l_data = bpy.data.lights.new("Persian_RimLight", type="AREA")
    rim_l_data.energy = 70.0
    rim_l_data.size = 3.0
    rim_l_data.color = (0.80, 0.90, 1.0) # Silver rim highlighting the fluffy coat
    rim_l = bpy.data.objects.new("Persian_RimLight", rim_l_data)
    rim_l.location = Vector((-2.6, -2.6, 2.2))
    look_at(rim_l, Vector((0, 0, 0.55)))
    persian_col.objects.link(rim_l)

    fill_l_data = bpy.data.lights.new("Persian_FillLight", type="AREA")
    fill_l_data.energy = 35.0
    fill_l_data.size = 4.0
    fill_l = bpy.data.objects.new("Persian_FillLight", fill_l_data)
    fill_l.location = Vector((-2.8, 2.2, 1.6))
    look_at(fill_l, Vector((0, 0.1, 0.55)))
    persian_col.objects.link(fill_l)

    # Studio Floor Plane
    fl_mesh = bpy.data.meshes.new("Studio_Persian_Floor")
    bm_fl = bmesh.new()
    bmesh.ops.create_grid(bm_fl, x_segments=2, y_segments=2, size=12.0)
    bm_fl.to_mesh(fl_mesh)
    bm_fl.free()
    fl_obj = bpy.data.objects.new("Studio_Persian_Floor", fl_mesh)
    fl_obj.location = Vector((0, 0, 0))
    persian_col.objects.link(fl_obj)

    mat_floor = bpy.data.materials.new("Studio_Dark_Floor")
    mat_floor.use_nodes = True
    fl_nodes = mat_floor.node_tree.nodes
    fl_links = mat_floor.node_tree.links
    fl_nodes.clear()
    fl_out = fl_nodes.new("ShaderNodeOutputMaterial")
    fl_bsdf = fl_nodes.new("ShaderNodeBsdfPrincipled")
    fl_bsdf.inputs["Base Color"].default_value = (0.015, 0.016, 0.02, 1.0)
    fl_bsdf.inputs["Roughness"].default_value = 0.28
    fl_links.new(fl_bsdf.outputs["BSDF"], fl_out.inputs["Surface"])
    fl_obj.data.materials.append(mat_floor)

    # Camera framing full Persian cat walking
    cam_data = bpy.data.cameras.new("Persian_Walk_Camera")
    cam_data.lens = 52.0
    cam_data.dof.use_dof = True
    cam_data.dof.focus_distance = 3.3
    cam_data.dof.aperture_fstop = 3.2
    cam_obj = bpy.data.objects.new("Persian_Walk_Camera", cam_data)
    cam_obj.location = Vector((1.8, 2.7, 1.05))
    look_at(cam_obj, Vector((0, 0.25, 0.58)))
    persian_col.objects.link(cam_obj)
    bpy.context.scene.camera = cam_obj

    world = bpy.context.scene.world
    if not world:
        world = bpy.data.worlds.new("Studio_World")
        bpy.context.scene.world = world
    world.use_nodes = True
    w_nodes = world.node_tree.nodes
    w_nodes.clear()
    w_out = w_nodes.new("ShaderNodeOutputWorld")
    w_bg = w_nodes.new("ShaderNodeBackground")
    w_bg.inputs["Color"].default_value = (0.012, 0.012, 0.016, 1.0)
    w_bg.inputs["Strength"].default_value = 0.5
    world.node_tree.links.new(w_bg.outputs["Background"], w_out.inputs["Surface"])

    return {
        "status": "success",
        "breed": "Persian (Cobby Doll-Face)",
        "rig_name": arm_obj.name,
        "bones_count": len(arm_data.bones),
        "ik_constraints": 4,
        "frames_animated": 32,
    }
