import bpy
import bmesh
import math
from mathutils import Vector, Matrix, Euler

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

def build_realistic_cat():
    # 1. Clean existing scene objects
    for obj in list(bpy.data.objects):
        bpy.data.objects.remove(obj, do_unlink=True)
    for mesh in list(bpy.data.meshes):
        bpy.data.meshes.remove(mesh, do_unlink=True)
    for mat in list(bpy.data.materials):
        bpy.data.materials.remove(mat, do_unlink=True)
    for curve in list(bpy.data.curves):
        bpy.data.curves.remove(curve, do_unlink=True)

    cat_collection = bpy.data.collections.new("Realistic_Cat")
    bpy.context.scene.collection.children.link(cat_collection)

    # -------------------------------------------------------------
    # 2. MATERIALS DEFINITION
    # -------------------------------------------------------------
    # 2.1 Rich Domestic Shorthair Fur (Dark Charcoal with subtle warm tone)
    mat_fur = bpy.data.materials.new("Cat_Fur")
    mat_fur.use_nodes = True
    nodes = mat_fur.node_tree.nodes
    links = mat_fur.node_tree.links
    nodes.clear()

    output = nodes.new("ShaderNodeOutputMaterial")
    principled = nodes.new("ShaderNodeBsdfPrincipled")
    principled.inputs["Base Color"].default_value = (0.05, 0.055, 0.065, 1.0) # Sleek charcoal
    principled.inputs["Roughness"].default_value = 0.65
    principled.inputs["Sheen Weight"].default_value = 1.0 # Silky fur sheen
    principled.inputs["Sheen Tint"].default_value = (0.5, 0.6, 0.75, 1.0)

    # Micro-fur texture
    tex_noise = nodes.new("ShaderNodeTexNoise")
    tex_noise.inputs["Scale"].default_value = 220.0
    tex_noise.inputs["Detail"].default_value = 8.0
    tex_noise.inputs["Roughness"].default_value = 0.8

    bump = nodes.new("ShaderNodeBump")
    bump.inputs["Strength"].default_value = 0.05
    bump.inputs["Distance"].default_value = 0.015
    links.new(tex_noise.outputs["Fac"], bump.inputs["Height"])
    links.new(bump.outputs["Normal"], principled.inputs["Normal"])
    links.new(principled.outputs["BSDF"], output.inputs["Surface"])

    # 2.2 Soft Fleshy Leather (Nose, inner ears, paw pads)
    mat_pink = bpy.data.materials.new("Cat_Skin_Pink")
    mat_pink.use_nodes = True
    p_nodes = mat_pink.node_tree.nodes
    p_links = mat_pink.node_tree.links
    p_nodes.clear()
    p_out = p_nodes.new("ShaderNodeOutputMaterial")
    p_bsdf = p_nodes.new("ShaderNodeBsdfPrincipled")
    p_bsdf.inputs["Base Color"].default_value = (0.88, 0.42, 0.48, 1.0)
    p_bsdf.inputs["Roughness"].default_value = 0.3
    p_links.new(p_bsdf.outputs["BSDF"], p_out.inputs["Surface"])

    # 2.3 Eye Cornea (Glossy Refractive Glass)
    mat_cornea = bpy.data.materials.new("Cat_Eye_Cornea")
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

    # 2.4 Eye Iris (Luminous Feline Emerald)
    mat_iris = bpy.data.materials.new("Cat_Iris_Emerald")
    mat_iris.use_nodes = True
    i_nodes = mat_iris.node_tree.nodes
    i_links = mat_iris.node_tree.links
    i_nodes.clear()
    i_out = i_nodes.new("ShaderNodeOutputMaterial")
    i_bsdf = i_nodes.new("ShaderNodeBsdfPrincipled")
    i_bsdf.inputs["Base Color"].default_value = (0.04, 0.88, 0.45, 1.0)
    i_bsdf.inputs["Roughness"].default_value = 0.1
    i_bsdf.inputs["Emission Color"].default_value = (0.02, 0.45, 0.2, 1.0)
    i_bsdf.inputs["Emission Strength"].default_value = 0.4
    i_links.new(i_bsdf.outputs["BSDF"], i_out.inputs["Surface"])

    # 2.5 Pupil (Vertical Deep Black Slit)
    mat_pupil = bpy.data.materials.new("Cat_Pupil_Black")
    mat_pupil.use_nodes = True
    pu_nodes = mat_pupil.node_tree.nodes
    pu_links = mat_pupil.node_tree.links
    pu_nodes.clear()
    pu_out = pu_nodes.new("ShaderNodeOutputMaterial")
    pu_bsdf = pu_nodes.new("ShaderNodeBsdfPrincipled")
    pu_bsdf.inputs["Base Color"].default_value = (0.005, 0.005, 0.005, 1.0)
    pu_bsdf.inputs["Roughness"].default_value = 0.05
    pu_links.new(pu_bsdf.outputs["BSDF"], pu_out.inputs["Surface"])

    # 2.6 Whiskers (Fine Keratin Strands)
    mat_whisker = bpy.data.materials.new("Cat_Whisker")
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
    # 3. MESH PRIMITIVE GENERATORS (FOR BODY BLENDING)
    # -------------------------------------------------------------
    body_primitives = []

    def add_body_part(name, radius, scale, loc, rot=(0,0,0)):
        mesh = bpy.data.meshes.new(name)
        bm = bmesh.new()
        bmesh.ops.create_uvsphere(bm, u_segments=24, v_segments=16, radius=radius)
        bmesh.ops.scale(bm, vec=Vector(scale), verts=bm.verts)
        bm.to_mesh(mesh)
        bm.free()
        obj = bpy.data.objects.new(name, mesh)
        obj.location = Vector(loc)
        obj.rotation_euler = Euler(rot)
        cat_collection.objects.link(obj)
        body_primitives.append(obj)
        return obj

    # 3.1 Anatomical Feline Volumes (Oriented forward towards +Y):
    # Pelvis & Rear resting on the floor
    add_body_part("P_Pelvis", 0.42, (1.1, 1.25, 0.9), (0, -0.15, 0.42), (math.radians(10), 0, 0))
    # Waist & Lower Spine
    add_body_part("P_Waist", 0.38, (0.95, 1.05, 1.15), (0, -0.06, 0.72), (math.radians(-12), 0, 0))
    # Chest & Upper Ribcage
    add_body_part("P_Chest", 0.40, (0.9, 1.05, 1.1), (0, 0.05, 1.05), (math.radians(-22), 0, 0))
    # Neck
    add_body_part("P_Neck", 0.26, (0.85, 0.92, 1.05), (0, 0.14, 1.35), (math.radians(-14), 0, 0))
    # Cranium / Skull
    add_body_part("P_Head", 0.32, (1.12, 1.0, 0.92), (0, 0.22, 1.62), (math.radians(-4), 0, 0))
    
    # Whisker Muzzle Pads (Left and Right)
    add_body_part("P_WhiskerPad_L", 0.10, (1.2, 1.1, 0.85), (-0.08, 0.44, 1.55), (0, math.radians(-10), 0))
    add_body_part("P_WhiskerPad_R", 0.10, (1.2, 1.1, 0.85), (0.08, 0.44, 1.55), (0, math.radians(10), 0))
    # Chin
    add_body_part("P_Chin", 0.075, (0.95, 1.1, 0.7), (0, 0.40, 1.47), (0, 0, 0))

    # Front Shoulders & Forelegs
    for sign, s_name in [(-1, "L"), (1, "R")]:
        add_body_part(f"P_Shoulder_{s_name}", 0.16, (0.9, 1.1, 1.2), (sign * 0.16, 0.05, 0.82), (math.radians(8), 0, 0))
        add_body_part(f"P_Forearm_{s_name}", 0.10, (0.85, 0.9, 1.7), (sign * 0.15, 0.12, 0.42), (math.radians(-4), 0, 0))
        add_body_part(f"P_PawBase_{s_name}", 0.11, (1.1, 1.3, 0.6), (sign * 0.15, 0.18, 0.07), (0, 0, 0))
        # Paws toes
        for toe in range(4):
            t_ang = (toe - 1.5) * 0.28
            t_x = sign * 0.15 + math.sin(t_ang) * 0.08
            t_y = 0.18 + math.cos(t_ang) * 0.09
            add_body_part(f"P_Toe_{s_name}_{toe}", 0.045, (0.85, 1.1, 0.7), (t_x, t_y, 0.045), (0, 0, t_ang))

    # Folded Hind Haunches
    for sign, s_name in [(-1, "L"), (1, "R")]:
        add_body_part(f"P_Thigh_{s_name}", 0.30, (0.95, 1.25, 0.95), (sign * 0.34, -0.12, 0.35), (math.radians(20), math.radians(-10 * sign), 0))
        add_body_part(f"P_Hock_{s_name}", 0.14, (0.85, 1.3, 0.7), (sign * 0.31, 0.04, 0.16), (math.radians(-10), 0, math.radians(-10 * sign)))
        add_body_part(f"P_HindPaw_{s_name}", 0.10, (1.0, 1.3, 0.6), (sign * 0.28, 0.16, 0.07), (0, 0, math.radians(-12 * sign)))

    # -------------------------------------------------------------
    # 4. JOIN & VOXEL REMESH BODY INTO SEAMLESS SCULPT
    # -------------------------------------------------------------
    override = get_context_override()
    base_body = body_primitives[0]
    base_body.name = "Realistic_Cat_Body"

    if override:
        with override:
            bpy.ops.object.select_all(action='DESELECT')
            for p in body_primitives:
                p.select_set(True)
            bpy.context.view_layer.objects.active = base_body
            bpy.ops.object.join()

            # Voxel remesh for seamless organic blending
            remesh = base_body.modifiers.new("VoxelRemesh", "REMESH")
            remesh.mode = "VOXEL"
            remesh.voxel_size = 0.022
            remesh.adaptivity = 0.0
            bpy.ops.object.modifier_apply(modifier="VoxelRemesh")

            # Smooth modifier to soften all muscle lines
            smooth = base_body.modifiers.new("SmoothSurface", "SMOOTH")
            smooth.factor = 0.6
            smooth.iterations = 4
            bpy.ops.object.modifier_apply(modifier="SmoothSurface")

            # Subtle subdivision
            sub = base_body.modifiers.new("Subsurf", "SUBSURF")
            sub.levels = 1
            sub.render_levels = 2

            # Smooth shading
            for f in base_body.data.polygons:
                f.use_smooth = True

    base_body.data.materials.append(mat_fur)

    # -------------------------------------------------------------
    # 5. DETAILED HIGH-FI EYE UNITS (Cornea, Iris, Pupil)
    # -------------------------------------------------------------
    def create_eye(name, is_left=True):
        x = -0.14 if is_left else 0.14
        y = 0.42
        z = 1.68
        rot_y = math.radians(-14 if is_left else 14)
        rot_z = math.radians(-8 if is_left else 8)

        # Cornea (Refractive glassy sphere)
        c_mesh = bpy.data.meshes.new(f"{name}_Cornea")
        bm = bmesh.new()
        bmesh.ops.create_uvsphere(bm, u_segments=24, v_segments=16, radius=0.072)
        bmesh.ops.scale(bm, vec=Vector((1.1, 1.25, 0.95)), verts=bm.verts)
        bm.to_mesh(c_mesh)
        bm.free()
        c_obj = bpy.data.objects.new(f"{name}_Cornea", c_mesh)
        c_obj.location = Vector((x, y, z))
        c_obj.rotation_euler = Euler((math.radians(10), rot_y, rot_z))
        cat_collection.objects.link(c_obj)
        c_obj.data.materials.append(mat_cornea)
        for f in c_mesh.polygons: f.use_smooth = True

        # Iris (Emerald Feline Core)
        i_mesh = bpy.data.meshes.new(f"{name}_Iris")
        bm = bmesh.new()
        bmesh.ops.create_uvsphere(bm, u_segments=24, v_segments=16, radius=0.067)
        bmesh.ops.scale(bm, vec=Vector((1.05, 1.2, 0.9)), verts=bm.verts)
        bm.to_mesh(i_mesh)
        bm.free()
        i_obj = bpy.data.objects.new(f"{name}_Iris", i_mesh)
        i_obj.location = Vector((x, y - 0.004, z))
        i_obj.rotation_euler = Euler((math.radians(10), rot_y, rot_z))
        cat_collection.objects.link(i_obj)
        i_obj.data.materials.append(mat_iris)
        for f in i_mesh.polygons: f.use_smooth = True

        # Pupil (Vertical Slit)
        p_mesh = bpy.data.meshes.new(f"{name}_Pupil")
        bm = bmesh.new()
        bmesh.ops.create_uvsphere(bm, u_segments=16, v_segments=12, radius=0.068)
        bmesh.ops.scale(bm, vec=Vector((0.24, 1.22, 0.88)), verts=bm.verts)
        bm.to_mesh(p_mesh)
        bm.free()
        p_obj = bpy.data.objects.new(f"{name}_Pupil", p_mesh)
        p_obj.location = Vector((x, y + 0.002, z))
        p_obj.rotation_euler = Euler((math.radians(10), rot_y, rot_z))
        cat_collection.objects.link(p_obj)
        p_obj.data.materials.append(mat_pupil)
        for f in p_mesh.polygons: f.use_smooth = True

    create_eye("Eye_L", is_left=True)
    create_eye("Eye_R", is_left=False)

    # -------------------------------------------------------------
    # 6. EARS (Curved triangular feline ears with pink inner cavity)
    # -------------------------------------------------------------
    def create_ear(name, is_left=True):
        mesh = bpy.data.meshes.new(name)
        bm = bmesh.new()
        bmesh.ops.create_cone(bm, segments=16, radius1=0.15, radius2=0.018, depth=0.34)
        for v in bm.verts:
            v.co.y *= 0.32
            if v.co.z > 0:
                v.co.y -= (v.co.z ** 1.5) * 0.12
                v.co.x += (v.co.z ** 1.2) * (0.07 if is_left else -0.07)
        bm.to_mesh(mesh)
        bm.free()
        obj = bpy.data.objects.new(name, mesh)
        x_pos = -0.19 if is_left else 0.19
        y_rot = math.radians(16) if is_left else math.radians(-16)
        z_rot = math.radians(-20) if is_left else math.radians(20)
        obj.location = Vector((x_pos, 0.18, 1.88))
        obj.rotation_euler = Euler((math.radians(-10), y_rot, z_rot))
        cat_collection.objects.link(obj)
        obj.data.materials.append(mat_fur)
        for f in mesh.polygons: f.use_smooth = True
        sub = obj.modifiers.new("Subsurf", "SUBSURF")
        sub.levels = 1

        # Inner Pink Cavity
        in_mesh = bpy.data.meshes.new(f"{name}_Inner")
        bm_in = bmesh.new()
        bmesh.ops.create_cone(bm_in, segments=12, radius1=0.10, radius2=0.012, depth=0.25)
        for v in bm_in.verts: v.co.y *= 0.22
        bm_in.to_mesh(in_mesh)
        bm_in.free()
        in_obj = bpy.data.objects.new(f"{name}_Inner", in_mesh)
        in_obj.location = Vector((x_pos, 0.205, 1.88))
        in_obj.rotation_euler = Euler((math.radians(-8), y_rot, z_rot))
        cat_collection.objects.link(in_obj)
        in_obj.data.materials.append(mat_pink)
        for f in in_mesh.polygons: f.use_smooth = True

    create_ear("Cat_Ear_L", is_left=True)
    create_ear("Cat_Ear_R", is_left=False)

    # -------------------------------------------------------------
    # 7. NOSE (Soft Pink Leather Triangle)
    # -------------------------------------------------------------
    nose_mesh = bpy.data.meshes.new("Cat_Nose")
    bm_nose = bmesh.new()
    bmesh.ops.create_uvsphere(bm_nose, u_segments=16, v_segments=12, radius=0.038)
    bmesh.ops.scale(bm_nose, vec=Vector((1.1, 0.65, 0.8)), verts=bm_nose.verts)
    bm_nose.to_mesh(nose_mesh)
    bm_nose.free()
    nose_obj = bpy.data.objects.new("Cat_Nose", nose_mesh)
    nose_obj.location = Vector((0, 0.49, 1.58))
    nose_obj.rotation_euler = Euler((math.radians(22), 0, 0))
    cat_collection.objects.link(nose_obj)
    nose_obj.data.materials.append(mat_pink)
    for f in nose_mesh.polygons: f.use_smooth = True

    # -------------------------------------------------------------
    # 8. CURVED SINUOUS TAIL (Wrapping around front paws)
    # -------------------------------------------------------------
    tail_curve_data = bpy.data.curves.new("Cat_Tail_Curve", type="CURVE")
    tail_curve_data.dimensions = "3D"
    tail_curve_data.bevel_depth = 0.065
    tail_curve_data.bevel_resolution = 8
    tail_spline = tail_curve_data.splines.new("BEZIER")

    tail_points = [
        Vector((0.0, -0.32, 0.28)),
        Vector((-0.16, -0.38, 0.14)),
        Vector((-0.38, -0.22, 0.05)),
        Vector((-0.44, 0.08, 0.045)),
        Vector((-0.34, 0.32, 0.05)),
        Vector((-0.15, 0.38, 0.08)),
        Vector((0.02, 0.35, 0.09)),
    ]

    tail_spline.bezier_points.add(len(tail_points) - 1)
    for i, pt in enumerate(tail_points):
        bp = tail_spline.bezier_points[i]
        bp.co = pt
        bp.handle_left_type = "AUTO"
        bp.handle_right_type = "AUTO"
        bp.radius = 1.0 - (i / len(tail_points)) * 0.45

    tail_obj = bpy.data.objects.new("Cat_Tail", tail_curve_data)
    cat_collection.objects.link(tail_obj)
    tail_obj.data.materials.append(mat_fur)

    # -------------------------------------------------------------
    # 9. WHISKERS (Natural Sweeping Vibrissae Curves)
    # -------------------------------------------------------------
    def create_whisker(name, origin, dir_vec, length, droop):
        w_curve = bpy.data.curves.new(name, type="CURVE")
        w_curve.dimensions = "3D"
        w_curve.bevel_depth = 0.003
        w_curve.bevel_resolution = 4
        spline = w_curve.splines.new("BEZIER")
        spline.bezier_points.add(2)
        
        p0 = Vector(origin)
        p1 = p0 + Vector(dir_vec) * (length * 0.5) - Vector((0, 0, droop * 0.3))
        p2 = p0 + Vector(dir_vec) * length - Vector((0, 0, droop))
        
        spline.bezier_points[0].co = p0
        spline.bezier_points[0].radius = 1.0
        spline.bezier_points[1].co = p1
        spline.bezier_points[1].radius = 0.65
        spline.bezier_points[2].co = p2
        spline.bezier_points[2].radius = 0.2
        
        for bp in spline.bezier_points:
            bp.handle_left_type = "AUTO"
            bp.handle_right_type = "AUTO"
            
        w_obj = bpy.data.objects.new(name, w_curve)
        cat_collection.objects.link(w_obj)
        w_obj.data.materials.append(mat_whisker)

    for side, s_sign in [("L", -1), ("R", 1)]:
        origins = [
            (s_sign * 0.14, 0.47, 1.57),
            (s_sign * 0.16, 0.45, 1.54),
            (s_sign * 0.14, 0.46, 1.51),
            (s_sign * 0.17, 0.43, 1.58),
            (s_sign * 0.18, 0.42, 1.53),
            (s_sign * 0.15, 0.44, 1.48),
        ]
        angles = [
            (s_sign * 0.85, 0.2, 0.12),
            (s_sign * 0.90, 0.15, -0.05),
            (s_sign * 0.80, 0.25, -0.22),
            (s_sign * 0.75, 0.38, 0.18),
            (s_sign * 0.85, 0.3, 0.0),
            (s_sign * 0.78, 0.35, -0.18),
        ]
        for w_i in range(6):
            create_whisker(
                f"Cat_Whisker_{side}_{w_i}",
                origins[w_i],
                angles[w_i],
                length=0.42 + (w_i % 2) * 0.06,
                droop=0.06 + (w_i % 3) * 0.02
            )
        # Brow whiskers
        create_whisker(
            f"Cat_Brow_{side}",
            (s_sign * 0.10, 0.38, 1.76),
            (s_sign * 0.35, 0.2, 0.55),
            length=0.24,
            droop=-0.03
        )

    # -------------------------------------------------------------
    # 10. STUDIO LIGHTING & FRONT 3/4 CAMERA
    # -------------------------------------------------------------
    # Front Key Light (Focused on face and eyes for catchlights)
    key_light_data = bpy.data.lights.new("Studio_KeyLight", type="AREA")
    key_light_data.energy = 75.0
    key_light_data.size = 2.0
    key_light_data.color = (1.0, 0.96, 0.92) # Soft warm studio key
    key_light = bpy.data.objects.new("Studio_KeyLight", key_light_data)
    key_light.location = Vector((-1.6, 2.6, 2.4))
    look_at(key_light, Vector((0, 0.25, 1.35)))
    cat_collection.objects.link(key_light)

    # Rim / Hair Light (behind cat for luminous silhouette & whiskers)
    rim_light_data = bpy.data.lights.new("Studio_RimLight", type="AREA")
    rim_light_data.energy = 60.0
    rim_light_data.size = 2.5
    rim_light_data.color = (0.75, 0.88, 1.0) # Luminous silver rim
    rim_light = bpy.data.objects.new("Studio_RimLight", rim_light_data)
    rim_light.location = Vector((1.8, -2.4, 2.6))
    look_at(rim_light, Vector((0, 0.1, 1.2)))
    cat_collection.objects.link(rim_light)

    # Soft Fill Light (front-right)
    fill_light_data = bpy.data.lights.new("Studio_FillLight", type="AREA")
    fill_light_data.energy = 30.0
    fill_light_data.size = 3.5
    fill_light_data.color = (0.88, 0.92, 1.0)
    fill_light = bpy.data.objects.new("Studio_FillLight", fill_light_data)
    fill_light.location = Vector((2.2, 2.0, 1.6))
    look_at(fill_light, Vector((0, 0.2, 1.0)))
    cat_collection.objects.link(fill_light)

    # Studio Floor
    floor_mesh = bpy.data.meshes.new("Studio_Floor")
    bm_floor = bmesh.new()
    bmesh.ops.create_grid(bm_floor, x_segments=2, y_segments=2, size=8.0)
    bm_floor.to_mesh(floor_mesh)
    bm_floor.free()
    floor_obj = bpy.data.objects.new("Studio_Floor", floor_mesh)
    floor_obj.location = Vector((0, 0, 0))
    cat_collection.objects.link(floor_obj)
    
    mat_floor = bpy.data.materials.new("Studio_Dark_Floor")
    mat_floor.use_nodes = True
    fl_nodes = mat_floor.node_tree.nodes
    fl_links = mat_floor.node_tree.links
    fl_nodes.clear()
    fl_out = fl_nodes.new("ShaderNodeOutputMaterial")
    fl_bsdf = fl_nodes.new("ShaderNodeBsdfPrincipled")
    fl_bsdf.inputs["Base Color"].default_value = (0.015, 0.016, 0.02, 1.0)
    fl_bsdf.inputs["Roughness"].default_value = 0.28 # Soft dark reflection
    fl_links.new(fl_bsdf.outputs["BSDF"], fl_out.inputs["Surface"])
    floor_obj.data.materials.append(mat_floor)

    # Front-Left 3/4 Camera (Full body portrait framing)
    cam_data = bpy.data.cameras.new("Cat_Portrait_Camera")
    cam_data.lens = 55.0 # 55mm lens for natural full-body portrait
    cam_data.dof.use_dof = True
    cam_data.dof.focus_distance = 3.6
    cam_data.dof.aperture_fstop = 3.5
    cam_obj = bpy.data.objects.new("Cat_Portrait_Camera", cam_data)
    cam_obj.location = Vector((1.8, 3.4, 1.35))
    look_at(cam_obj, Vector((0, 0.15, 0.95)))
    cat_collection.objects.link(cam_obj)
    bpy.context.scene.camera = cam_obj

    # World background setup
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
        "objects_created": len(cat_collection.objects),
        "collection": cat_collection.name,
    }
