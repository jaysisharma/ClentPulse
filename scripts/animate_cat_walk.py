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

def build_walking_cat():
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

    cat_col = bpy.data.collections.new("Walking_Cat_Rig")
    bpy.context.scene.collection.children.link(cat_col)

    # -------------------------------------------------------------
    # 2. MATERIALS
    # -------------------------------------------------------------
    mat_fur = bpy.data.materials.new("Cat_Fur")
    mat_fur.use_nodes = True
    f_nodes = mat_fur.node_tree.nodes
    f_links = mat_fur.node_tree.links
    f_nodes.clear()
    f_out = f_nodes.new("ShaderNodeOutputMaterial")
    f_bsdf = f_nodes.new("ShaderNodeBsdfPrincipled")
    f_bsdf.inputs["Base Color"].default_value = (0.05, 0.055, 0.065, 1.0)
    f_bsdf.inputs["Roughness"].default_value = 0.55
    f_bsdf.inputs["Sheen Weight"].default_value = 1.0
    f_bsdf.inputs["Sheen Tint"].default_value = (0.6, 0.7, 0.85, 1.0)
    f_links.new(f_bsdf.outputs["BSDF"], f_out.inputs["Surface"])

    mat_pink = bpy.data.materials.new("Cat_Pink")
    mat_pink.use_nodes = True
    p_nodes = mat_pink.node_tree.nodes
    p_links = mat_pink.node_tree.links
    p_nodes.clear()
    p_out = p_nodes.new("ShaderNodeOutputMaterial")
    p_bsdf = p_nodes.new("ShaderNodeBsdfPrincipled")
    p_bsdf.inputs["Base Color"].default_value = (0.88, 0.42, 0.48, 1.0)
    p_bsdf.inputs["Roughness"].default_value = 0.35
    p_links.new(p_bsdf.outputs["BSDF"], p_out.inputs["Surface"])

    mat_cornea = bpy.data.materials.new("Cat_Cornea")
    mat_cornea.use_nodes = True
    c_nodes = mat_cornea.node_tree.nodes
    c_links = mat_cornea.node_tree.links
    c_nodes.clear()
    c_out = c_nodes.new("ShaderNodeOutputMaterial")
    c_bsdf = c_nodes.new("ShaderNodeBsdfPrincipled")
    c_bsdf.inputs["Base Color"].default_value = (0.95, 1.0, 0.98, 1.0)
    c_bsdf.inputs["Roughness"].default_value = 0.02
    c_bsdf.inputs["Transmission Weight"].default_value = 0.95
    c_links.new(c_bsdf.outputs["BSDF"], c_out.inputs["Surface"])

    mat_iris = bpy.data.materials.new("Cat_Iris")
    mat_iris.use_nodes = True
    i_nodes = mat_iris.node_tree.nodes
    i_links = mat_iris.node_tree.links
    i_nodes.clear()
    i_out = i_nodes.new("ShaderNodeOutputMaterial")
    i_bsdf = i_nodes.new("ShaderNodeBsdfPrincipled")
    i_bsdf.inputs["Base Color"].default_value = (0.05, 0.88, 0.42, 1.0)
    i_bsdf.inputs["Roughness"].default_value = 0.1
    i_bsdf.inputs["Emission Color"].default_value = (0.02, 0.45, 0.2, 1.0)
    i_bsdf.inputs["Emission Strength"].default_value = 0.4
    i_links.new(i_bsdf.outputs["BSDF"], i_out.inputs["Surface"])

    mat_pupil = bpy.data.materials.new("Cat_Pupil")
    mat_pupil.use_nodes = True
    pu_nodes = mat_pupil.node_tree.nodes
    pu_links = mat_pupil.node_tree.links
    pu_nodes.clear()
    pu_out = pu_nodes.new("ShaderNodeOutputMaterial")
    pu_bsdf = pu_nodes.new("ShaderNodeBsdfPrincipled")
    pu_bsdf.inputs["Base Color"].default_value = (0.005, 0.005, 0.005, 1.0)
    pu_bsdf.inputs["Roughness"].default_value = 0.05
    pu_links.new(pu_bsdf.outputs["BSDF"], pu_out.inputs["Surface"])

    mat_whisker = bpy.data.materials.new("Cat_Whisker")
    mat_whisker.use_nodes = True
    w_nodes = mat_whisker.node_tree.nodes
    w_links = mat_whisker.node_tree.links
    w_nodes.clear()
    w_out = w_nodes.new("ShaderNodeOutputMaterial")
    w_bsdf = w_nodes.new("ShaderNodeBsdfPrincipled")
    w_bsdf.inputs["Base Color"].default_value = (0.95, 0.95, 0.95, 1.0)
    w_bsdf.inputs["Roughness"].default_value = 0.2
    w_bsdf.inputs["Transmission Weight"].default_value = 0.4
    w_links.new(w_bsdf.outputs["BSDF"], w_out.inputs["Surface"])

    # -------------------------------------------------------------
    # 3. CONTINUOUS SOLID ANATOMICAL FELINE BODY
    # -------------------------------------------------------------
    body_parts = []

    def make_sphere(name, radius, scale, loc, rot=(0,0,0)):
        mesh = bpy.data.meshes.new(name)
        bm = bmesh.new()
        bmesh.ops.create_uvsphere(bm, u_segments=20, v_segments=14, radius=radius)
        bmesh.ops.scale(bm, vec=Vector(scale), verts=bm.verts)
        bm.to_mesh(mesh)
        bm.free()
        obj = bpy.data.objects.new(name, mesh)
        obj.location = Vector(loc)
        obj.rotation_euler = Euler(rot)
        cat_col.objects.link(obj)
        body_parts.append(obj)
        return obj

    def make_capsule_segment(name, p1, p2, radius):
        """Creates a solid cylinder segment with spheres at joints connecting p1 to p2"""
        v1 = Vector(p1)
        v2 = Vector(p2)
        diff = v2 - v1
        dist = diff.length
        mid = (v1 + v2) * 0.5
        
        mesh = bpy.data.meshes.new(name)
        bm = bmesh.new()
        # Create cylinder connecting the two points
        bmesh.ops.create_cone(bm, segments=16, radius1=radius, radius2=radius, depth=dist)
        # Orient cylinder along direction
        rot = Vector((0, 0, 1)).rotation_difference(diff).to_euler()
        bmesh.ops.rotate(bm, cent=Vector((0, 0, 0)), matrix=Matrix.Rotation(rot.z, 3, 'Z') @ Matrix.Rotation(rot.y, 3, 'Y') @ Matrix.Rotation(rot.x, 3, 'X'), verts=bm.verts)
        # Add sphere caps
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

    # Torso (Solid overlapping spine: Pelvis -> Loin -> Chest -> Neck -> Head)
    make_sphere("B_Pelvis", 0.28, (1.0, 1.25, 0.95), (0, -0.45, 0.76), (math.radians(-6), 0, 0))
    make_sphere("B_Loin", 0.24, (0.88, 1.35, 0.92), (0, -0.16, 0.76), (0, 0, 0))
    make_sphere("B_Chest", 0.28, (0.95, 1.35, 1.1), (0, 0.18, 0.75), (math.radians(12), 0, 0))
    make_sphere("B_Neck", 0.19, (0.85, 0.95, 1.15), (0, 0.44, 0.86), (math.radians(35), 0, 0))
    make_sphere("B_Head", 0.23, (1.1, 1.0, 0.92), (0, 0.62, 0.98), (math.radians(6), 0, 0))

    # Muzzle Whisker Pads & Chin
    make_sphere("B_WhiskerPad_L", 0.08, (1.2, 1.1, 0.85), (-0.075, 0.80, 0.92))
    make_sphere("B_WhiskerPad_R", 0.08, (1.2, 1.1, 0.85), (0.075, 0.80, 0.92))
    make_sphere("B_Chin", 0.065, (0.9, 1.0, 0.7), (0, 0.76, 0.86))

    # Ears (built directly into base body for perfect organic blending)
    for sign, s_name in [(-1, "L"), (1, "R")]:
        x = sign * 0.14
        mesh_ear = bpy.data.meshes.new(f"B_EarCone_{s_name}")
        bm_ear = bmesh.new()
        bmesh.ops.create_cone(bm_ear, segments=16, radius1=0.12, radius2=0.015, depth=0.28)
        bmesh.ops.scale(bm_ear, vec=Vector((1.0, 0.35, 1.0)), verts=bm_ear.verts)
        bm_ear.to_mesh(mesh_ear)
        bm_ear.free()
        ear_obj = bpy.data.objects.new(f"B_EarCone_{s_name}", mesh_ear)
        ear_obj.location = Vector((x, 0.58, 1.20))
        ear_obj.rotation_euler = Euler((math.radians(14), math.radians(16 * sign), math.radians(-20 * sign)))
        cat_col.objects.link(ear_obj)
        body_parts.append(ear_obj)

    # SOLID CONTINUOUS FRONT LEGS (Connected capsule segments)
    for sign, s_name in [(-1, "L"), (1, "R")]:
        x = sign * 0.13
        p_shoulder = (x, 0.20, 0.72)
        p_elbow = (x, 0.20, 0.46)
        p_wrist = (x, 0.21, 0.18)
        p_paw = (x, 0.24, 0.055)

        make_sphere(f"B_FrontShoulderSphere_{s_name}", 0.14, (0.9, 1.1, 1.2), p_shoulder)
        make_capsule_segment(f"B_FrontUpperArm_{s_name}", p_shoulder, p_elbow, radius=0.085)
        make_capsule_segment(f"B_FrontForearm_{s_name}", p_elbow, p_wrist, radius=0.072)
        make_capsule_segment(f"B_FrontWristToPaw_{s_name}", p_wrist, p_paw, radius=0.068)
        make_sphere(f"B_FrontPawFoot_{s_name}", 0.09, (1.15, 1.35, 0.55), p_paw)

    # SOLID CONTINUOUS HIND LEGS (Thigh -> Knee -> Hock -> Paw)
    for sign, s_name in [(-1, "L"), (1, "R")]:
        x = sign * 0.15
        p_hip = (x, -0.42, 0.72)
        p_knee = (x, -0.28, 0.46)
        p_hock = (x, -0.44, 0.22)
        p_hindpaw = (x, -0.38, 0.055)

        make_sphere(f"B_HindThighSphere_{s_name}", 0.22, (0.9, 1.25, 1.0), p_hip)
        make_capsule_segment(f"B_HindThighToKnee_{s_name}", p_hip, p_knee, radius=0.10)
        make_capsule_segment(f"B_HindKneeToHock_{s_name}", p_knee, p_hock, radius=0.085)
        make_capsule_segment(f"B_HindHockToPaw_{s_name}", p_hock, p_hindpaw, radius=0.075)
        make_sphere(f"B_HindPawFoot_{s_name}", 0.09, (1.1, 1.35, 0.55), p_hindpaw)

    # SOLID CONTINUOUS LONG CURVED TAIL
    tail_pts = [
        Vector((0, -0.55, 0.76)),
        Vector((0, -0.72, 0.78)),
        Vector((0, -0.90, 0.81)),
        Vector((0, -1.08, 0.85)),
        Vector((0, -1.25, 0.90)),
        Vector((0, -1.40, 0.96)),
    ]
    for t_i in range(len(tail_pts) - 1):
        r_t = 0.060 - t_i * 0.007
        make_capsule_segment(f"B_TailSeg_{t_i}", tail_pts[t_i], tail_pts[t_i+1], radius=r_t)

    # Join and Voxel Remesh into ONE unified solid organic cat body
    override = get_context_override()
    cat_mesh_obj = body_parts[0]
    cat_mesh_obj.name = "Realistic_Cat_Body"

    if override:
        with override:
            bpy.ops.object.select_all(action='DESELECT')
            for p in body_parts:
                p.select_set(True)
            bpy.context.view_layer.objects.active = cat_mesh_obj
            bpy.ops.object.join()

            remesh = cat_mesh_obj.modifiers.new("VoxelRemesh", "REMESH")
            remesh.mode = "VOXEL"
            remesh.voxel_size = 0.020
            bpy.ops.object.modifier_apply(modifier="VoxelRemesh")

            smooth = cat_mesh_obj.modifiers.new("SmoothSurface", "SMOOTH")
            smooth.factor = 0.55
            smooth.iterations = 3
            bpy.ops.object.modifier_apply(modifier="SmoothSurface")

            sub = cat_mesh_obj.modifiers.new("Subsurf", "SUBSURF")
            sub.levels = 1

            for f in cat_mesh_obj.data.polygons:
                f.use_smooth = True

    cat_mesh_obj.data.materials.append(mat_fur)

    # -------------------------------------------------------------
    # 4. HEAD ATTACHMENTS (EYES, INNER EARS, NOSE, WHISKERS)
    # -------------------------------------------------------------
    head_decorations = []

    # Inner Pink Ear Cavities
    for sign, s_name in [(-1, "L"), (1, "R")]:
        x = sign * 0.14
        in_mesh = bpy.data.meshes.new(f"InnerEar_{s_name}")
        bm_in = bmesh.new()
        bmesh.ops.create_cone(bm_in, segments=12, radius1=0.08, radius2=0.01, depth=0.20)
        bmesh.ops.scale(bm_in, vec=Vector((1.0, 0.22, 1.0)), verts=bm_in.verts)
        bm_in.to_mesh(in_mesh)
        bm_in.free()
        in_obj = bpy.data.objects.new(f"InnerEar_{s_name}", in_mesh)
        in_obj.location = Vector((x, 0.60, 1.20))
        in_obj.rotation_euler = Euler((math.radians(16), math.radians(16 * sign), math.radians(-20 * sign)))
        cat_col.objects.link(in_obj)
        in_obj.data.materials.append(mat_pink)
        for f in in_mesh.polygons: f.use_smooth = True
        head_decorations.append(in_obj)

    # Eyes (Cornea, Emerald Iris, Pupil)
    for sign, s_name in [(-1, "L"), (1, "R")]:
        x = sign * 0.12
        y = 0.77
        z = 1.04

        c_mesh = bpy.data.meshes.new(f"Eye_{s_name}_Cornea")
        bm = bmesh.new()
        bmesh.ops.create_uvsphere(bm, u_segments=16, v_segments=12, radius=0.055)
        bm.to_mesh(c_mesh)
        bm.free()
        c_obj = bpy.data.objects.new(f"Eye_{s_name}_Cornea", c_mesh)
        c_obj.location = Vector((x, y, z))
        cat_col.objects.link(c_obj)
        c_obj.data.materials.append(mat_cornea)
        for f in c_mesh.polygons: f.use_smooth = True
        head_decorations.append(c_obj)

        i_mesh = bpy.data.meshes.new(f"Eye_{s_name}_Iris")
        bm = bmesh.new()
        bmesh.ops.create_uvsphere(bm, u_segments=16, v_segments=12, radius=0.051)
        bm.to_mesh(i_mesh)
        bm.free()
        i_obj = bpy.data.objects.new(f"Eye_{s_name}_Iris", i_mesh)
        i_obj.location = Vector((x, y - 0.003, z))
        cat_col.objects.link(i_obj)
        i_obj.data.materials.append(mat_iris)
        for f in i_mesh.polygons: f.use_smooth = True
        head_decorations.append(i_obj)

        p_mesh = bpy.data.meshes.new(f"Eye_{s_name}_Pupil")
        bm = bmesh.new()
        bmesh.ops.create_uvsphere(bm, u_segments=14, v_segments=10, radius=0.052)
        bmesh.ops.scale(bm, vec=Vector((0.24, 1.15, 0.85)), verts=bm.verts)
        bm.to_mesh(p_mesh)
        bm.free()
        p_obj = bpy.data.objects.new(f"Eye_{s_name}_Pupil", p_mesh)
        p_obj.location = Vector((x, y + 0.002, z))
        cat_col.objects.link(p_obj)
        p_obj.data.materials.append(mat_pupil)
        for f in p_mesh.polygons: f.use_smooth = True
        head_decorations.append(p_obj)

    # Nose
    n_mesh = bpy.data.meshes.new("Cat_Nose")
    bm = bmesh.new()
    bmesh.ops.create_uvsphere(bm, u_segments=16, v_segments=12, radius=0.032)
    bmesh.ops.scale(bm, vec=Vector((1.1, 0.6, 0.8)), verts=bm.verts)
    bm.to_mesh(n_mesh)
    bm.free()
    nose_obj = bpy.data.objects.new("Cat_Nose", n_mesh)
    nose_obj.location = Vector((0, 0.84, 0.95))
    cat_col.objects.link(nose_obj)
    nose_obj.data.materials.append(mat_pink)
    for f in n_mesh.polygons: f.use_smooth = True
    head_decorations.append(nose_obj)

    # Whiskers
    for side, s_sign in [("L", -1), ("R", 1)]:
        origins = [
            (s_sign * 0.12, 0.81, 0.94),
            (s_sign * 0.14, 0.79, 0.92),
            (s_sign * 0.12, 0.80, 0.90),
            (s_sign * 0.15, 0.78, 0.95),
            (s_sign * 0.16, 0.77, 0.91),
        ]
        angles = [
            (s_sign * 0.85, 0.25, 0.10),
            (s_sign * 0.90, 0.20, -0.05),
            (s_sign * 0.80, 0.30, -0.20),
            (s_sign * 0.75, 0.40, 0.15),
            (s_sign * 0.85, 0.35, -0.15),
        ]
        for w_i in range(5):
            w_curve = bpy.data.curves.new(f"W_{side}_{w_i}", type="CURVE")
            w_curve.dimensions = "3D"
            w_curve.bevel_depth = 0.003
            spline = w_curve.splines.new("BEZIER")
            spline.bezier_points.add(2)
            p0 = Vector(origins[w_i])
            dir_vec = Vector(angles[w_i])
            length = 0.38
            droop = 0.05
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
            cat_col.objects.link(w_obj)
            w_obj.data.materials.append(mat_whisker)
            head_decorations.append(w_obj)

    # -------------------------------------------------------------
    # 5. SKELETAL RIG (ARMATURE)
    # -------------------------------------------------------------
    arm_data = bpy.data.armatures.new("Cat_Skeleton")
    arm_obj = bpy.data.objects.new("Cat_Armature", arm_data)
    cat_col.objects.link(arm_obj)

    if override:
        with override:
            bpy.context.view_layer.objects.active = arm_obj
            bpy.ops.object.mode_set(mode='EDIT')

            root = arm_data.edit_bones.new("Root")
            root.head = (0, 0, 0)
            root.tail = (0, 0.2, 0)

            pelvis = arm_data.edit_bones.new("Pelvis")
            pelvis.head = (0, -0.45, 0.76)
            pelvis.tail = (0, -0.20, 0.76)
            pelvis.parent = root

            chest = arm_data.edit_bones.new("Chest")
            chest.head = (0, -0.20, 0.76)
            chest.tail = (0, 0.25, 0.75)
            chest.parent = pelvis

            neck = arm_data.edit_bones.new("Neck")
            neck.head = (0, 0.25, 0.75)
            neck.tail = (0, 0.50, 0.88)
            neck.parent = chest

            head_b = arm_data.edit_bones.new("Head")
            head_b.head = (0, 0.50, 0.88)
            head_b.tail = (0, 0.82, 1.02)
            head_b.parent = neck

            # Tail bones
            t1 = arm_data.edit_bones.new("Tail_01")
            t1.head = (0, -0.45, 0.76)
            t1.tail = (0, -0.80, 0.78)
            t1.parent = pelvis

            t2 = arm_data.edit_bones.new("Tail_02")
            t2.head = (0, -0.80, 0.78)
            t2.tail = (0, -1.15, 0.84)
            t2.parent = t1

            t3 = arm_data.edit_bones.new("Tail_03")
            t3.head = (0, -1.15, 0.84)
            t3.tail = (0, -1.45, 0.94)
            t3.parent = t2

            # Front Legs
            for sign, s_name in [(-1, "L"), (1, "R")]:
                x = sign * 0.13
                f_up = arm_data.edit_bones.new(f"Front_Upper_{s_name}")
                f_up.head = (x, 0.20, 0.72)
                f_up.tail = (x, 0.20, 0.46)
                f_up.parent = chest

                f_low = arm_data.edit_bones.new(f"Front_Lower_{s_name}")
                f_low.head = (x, 0.20, 0.46)
                f_low.tail = (x, 0.21, 0.18)
                f_low.parent = f_up

                f_paw = arm_data.edit_bones.new(f"Front_Paw_{s_name}")
                f_paw.head = (x, 0.21, 0.18)
                f_paw.tail = (x, 0.26, 0.05)
                f_paw.parent = f_low

            # Hind Legs
            for sign, s_name in [(-1, "L"), (1, "R")]:
                x = sign * 0.15
                h_thigh = arm_data.edit_bones.new(f"Hind_Thigh_{s_name}")
                h_thigh.head = (x, -0.42, 0.72)
                h_thigh.tail = (x, -0.28, 0.46)
                h_thigh.parent = pelvis

                h_shin = arm_data.edit_bones.new(f"Hind_Shin_{s_name}")
                h_shin.head = (x, -0.28, 0.46)
                h_shin.tail = (x, -0.44, 0.22)
                h_shin.parent = h_thigh

                h_paw = arm_data.edit_bones.new(f"Hind_Paw_{s_name}")
                h_paw.head = (x, -0.44, 0.22)
                h_paw.tail = (x, -0.36, 0.05)
                h_paw.parent = h_shin

            bpy.ops.object.mode_set(mode='OBJECT')

            # Parent cat body to armature with automatic weights
            bpy.ops.object.select_all(action='DESELECT')
            cat_mesh_obj.select_set(True)
            arm_obj.select_set(True)
            bpy.context.view_layer.objects.active = arm_obj
            bpy.ops.object.parent_set(type='ARMATURE_AUTO')

            # Parent head elements without shifting position
            for el in head_decorations:
                mat_orig = el.matrix_world.copy()
                el.parent = arm_obj
                el.parent_type = 'BONE'
                el.parent_bone = 'Head'
                el.matrix_world = mat_orig

    # -------------------------------------------------------------
    # 6. FELINE 32-FRAME LOOPABLE WALK CYCLE ANIMATION
    # -------------------------------------------------------------
    scene = bpy.context.scene
    scene.frame_start = 1
    scene.frame_end = 32
    scene.render.fps = 24

    pose_bones = arm_obj.pose.bones

    # 4 beats: Left Hind (0%) -> Left Front (25%) -> Right Hind (50%) -> Right Front (75%)
    for f in range(1, 33):
        t = (f - 1) / 32.0 * math.pi * 2

        # 1. Pelvis: double-bounce vertical dip + rhythmic yaw sway
        pb_pelvis = pose_bones.get("Pelvis")
        if pb_pelvis:
            pb_pelvis.location.z = math.sin(t * 2) * 0.025
            pb_pelvis.rotation_euler.z = math.sin(t) * 0.06
            pb_pelvis.rotation_euler.x = math.cos(t * 2) * 0.04
            pb_pelvis.keyframe_insert(data_path="location", frame=f)
            pb_pelvis.keyframe_insert(data_path="rotation_euler", frame=f)

        # 2. Chest: counter-roll
        pb_chest = pose_bones.get("Chest")
        if pb_chest:
            pb_chest.rotation_euler.z = -math.sin(t) * 0.05
            pb_chest.rotation_euler.x = -math.cos(t * 2) * 0.03
            pb_chest.keyframe_insert(data_path="rotation_euler", frame=f)

        # 3. Head: rhythmic stabilization nod
        pb_head = pose_bones.get("Head")
        if pb_head:
            pb_head.rotation_euler.x = math.sin(t * 2) * 0.04
            pb_head.keyframe_insert(data_path="rotation_euler", frame=f)

        # 4. Tail: sinuous counter-wave
        for t_name, lag, amp in [("Tail_01", 0.5, 0.15), ("Tail_02", 1.0, 0.25), ("Tail_03", 1.5, 0.35)]:
            tb = pose_bones.get(t_name)
            if tb:
                tb.rotation_euler.z = -math.sin(t - lag) * amp
                tb.rotation_euler.y = math.cos(t * 2) * 0.08
                tb.keyframe_insert(data_path="rotation_euler", frame=f)

        # 5. Quadruped Limbs Stride
        # Left Hind: phase = t
        phase_lh = t
        thigh_l = pose_bones.get("Hind_Thigh_L")
        if thigh_l:
            thigh_l.rotation_euler.x = math.sin(phase_lh) * 0.65
            thigh_l.keyframe_insert(data_path="rotation_euler", frame=f)
        shin_l = pose_bones.get("Hind_Shin_L")
        if shin_l:
            shin_l.rotation_euler.x = max(0, -math.sin(phase_lh)) * 0.85
            shin_l.keyframe_insert(data_path="rotation_euler", frame=f)
        paw_hl = pose_bones.get("Hind_Paw_L")
        if paw_hl:
            paw_hl.rotation_euler.x = math.sin(phase_lh + 0.3) * 0.45
            paw_hl.keyframe_insert(data_path="rotation_euler", frame=f)

        # Left Front: phase = t + pi/2
        phase_lf = t + math.pi * 0.5
        up_fl = pose_bones.get("Front_Upper_L")
        if up_fl:
            up_fl.rotation_euler.x = math.sin(phase_lf) * 0.55
            up_fl.keyframe_insert(data_path="rotation_euler", frame=f)
        low_fl = pose_bones.get("Front_Lower_L")
        if low_fl:
            low_fl.rotation_euler.x = max(0, math.sin(phase_lf)) * 0.65
            low_fl.keyframe_insert(data_path="rotation_euler", frame=f)
        paw_fl = pose_bones.get("Front_Paw_L")
        if paw_fl:
            paw_fl.rotation_euler.x = -math.sin(phase_lf - 0.2) * 0.40
            paw_fl.keyframe_insert(data_path="rotation_euler", frame=f)

        # Right Hind: phase = t + pi
        phase_rh = t + math.pi
        thigh_r = pose_bones.get("Hind_Thigh_R")
        if thigh_r:
            thigh_r.rotation_euler.x = math.sin(phase_rh) * 0.65
            thigh_r.keyframe_insert(data_path="rotation_euler", frame=f)
        shin_r = pose_bones.get("Hind_Shin_R")
        if shin_r:
            shin_r.rotation_euler.x = max(0, -math.sin(phase_rh)) * 0.85
            shin_r.keyframe_insert(data_path="rotation_euler", frame=f)
        paw_hr = pose_bones.get("Hind_Paw_R")
        if paw_hr:
            paw_hr.rotation_euler.x = math.sin(phase_rh + 0.3) * 0.45
            paw_hr.keyframe_insert(data_path="rotation_euler", frame=f)

        # Right Front: phase = t + 3*pi/2
        phase_rf = t + math.pi * 1.5
        up_fr = pose_bones.get("Front_Upper_R")
        if up_fr:
            up_fr.rotation_euler.x = math.sin(phase_rf) * 0.55
            up_fr.keyframe_insert(data_path="rotation_euler", frame=f)
        low_fr = pose_bones.get("Front_Lower_R")
        if low_fr:
            low_fr.rotation_euler.x = max(0, math.sin(phase_rf)) * 0.65
            low_fr.keyframe_insert(data_path="rotation_euler", frame=f)
        paw_fr = pose_bones.get("Front_Paw_R")
        if paw_fr:
            paw_fr.rotation_euler.x = -math.sin(phase_rf - 0.2) * 0.40
            paw_fr.keyframe_insert(data_path="rotation_euler", frame=f)

    # -------------------------------------------------------------
    # 7. STUDIO LIGHTING & SIDE-VIEW CAMERA
    # -------------------------------------------------------------
    key_l_data = bpy.data.lights.new("Walk_KeyLight", type="AREA")
    key_l_data.energy = 80.0
    key_l_data.size = 2.5
    key_l_data.color = (1.0, 0.96, 0.92)
    key_l = bpy.data.objects.new("Walk_KeyLight", key_l_data)
    key_l.location = Vector((2.8, 2.2, 2.4))
    look_at(key_l, Vector((0, 0.1, 0.65)))
    cat_col.objects.link(key_l)

    rim_l_data = bpy.data.lights.new("Walk_RimLight", type="AREA")
    rim_l_data.energy = 60.0
    rim_l_data.size = 3.0
    rim_l_data.color = (0.75, 0.88, 1.0)
    rim_l = bpy.data.objects.new("Walk_RimLight", rim_l_data)
    rim_l.location = Vector((-2.6, -2.6, 2.2))
    look_at(rim_l, Vector((0, 0, 0.65)))
    cat_col.objects.link(rim_l)

    fill_l_data = bpy.data.lights.new("Walk_FillLight", type="AREA")
    fill_l_data.energy = 30.0
    fill_l_data.size = 4.0
    fill_l = bpy.data.objects.new("Walk_FillLight", fill_l_data)
    fill_l.location = Vector((-2.8, 2.2, 1.6))
    look_at(fill_l, Vector((0, 0.1, 0.65)))
    cat_col.objects.link(fill_l)

    fl_mesh = bpy.data.meshes.new("Studio_Walk_Floor")
    bm_fl = bmesh.new()
    bmesh.ops.create_grid(bm_fl, x_segments=2, y_segments=2, size=12.0)
    bm_fl.to_mesh(fl_mesh)
    bm_fl.free()
    fl_obj = bpy.data.objects.new("Studio_Walk_Floor", fl_mesh)
    fl_obj.location = Vector((0, 0, 0))
    cat_col.objects.link(fl_obj)

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

    cam_data = bpy.data.cameras.new("Walk_Camera")
    cam_data.lens = 48.0
    cam_data.dof.use_dof = True
    cam_data.dof.focus_distance = 3.6
    cam_data.dof.aperture_fstop = 3.2
    cam_obj = bpy.data.objects.new("Walk_Camera", cam_data)
    cam_obj.location = Vector((2.6, 2.2, 1.35))
    look_at(cam_obj, Vector((0, 0.05, 0.65)))
    cat_col.objects.link(cam_obj)
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
        "rig_name": arm_obj.name,
        "bones_count": len(arm_data.bones),
        "frames_animated": 32,
    }
