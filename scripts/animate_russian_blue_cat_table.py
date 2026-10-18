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

def build_russian_blue_cat_on_table():
    # -------------------------------------------------------------
    # 1. CLEAN SCENE
    # -------------------------------------------------------------
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

    # -------------------------------------------------------------
    # 2. MATERIALS
    # -------------------------------------------------------------
    # 2.1 Russian Blue Coat: Shimmering Slate-Blue with Silver Tipping
    mat_coat = bpy.data.materials.new("RussianBlue_Fur")
    mat_coat.use_nodes = True
    c_nodes = mat_coat.node_tree.nodes
    c_links = mat_coat.node_tree.links
    c_nodes.clear()
    c_out = c_nodes.new("ShaderNodeOutputMaterial")
    c_bsdf = c_nodes.new("ShaderNodeBsdfPrincipled")
    # Authentic Russian Blue slate-blue grey
    c_bsdf.inputs["Base Color"].default_value = (0.16, 0.19, 0.24, 1.0)
    c_bsdf.inputs["Roughness"].default_value = 0.46
    # Silver sheen tipping on guard hairs
    c_bsdf.inputs["Sheen Weight"].default_value = 0.95
    c_bsdf.inputs["Sheen Tint"].default_value = (0.80, 0.88, 0.98, 1.0)
    c_bsdf.inputs["Subsurface Weight"].default_value = 0.08
    c_bsdf.inputs["Subsurface Radius"].default_value = (0.12, 0.09, 0.08)
    c_links.new(c_bsdf.outputs["BSDF"], c_out.inputs["Surface"])

    # 2.2 Nose Leather & Lip Line: Slate Charcoal / Dark Grey
    mat_nose = bpy.data.materials.new("RussianBlue_NoseLeather")
    mat_nose.use_nodes = True
    n_nodes = mat_nose.node_tree.nodes
    n_links = mat_nose.node_tree.links
    n_nodes.clear()
    n_out = n_nodes.new("ShaderNodeOutputMaterial")
    n_bsdf = n_nodes.new("ShaderNodeBsdfPrincipled")
    n_bsdf.inputs["Base Color"].default_value = (0.07, 0.08, 0.095, 1.0)
    n_bsdf.inputs["Roughness"].default_value = 0.38
    n_links.new(n_bsdf.outputs["BSDF"], n_out.inputs["Surface"])

    # 2.3 Inner Ear Shell: Soft Muted Slate-Pink Skin
    mat_inner_ear = bpy.data.materials.new("RussianBlue_InnerEar")
    mat_inner_ear.use_nodes = True
    ie_nodes = mat_inner_ear.node_tree.nodes
    ie_links = mat_inner_ear.node_tree.links
    ie_nodes.clear()
    ie_out = ie_nodes.new("ShaderNodeOutputMaterial")
    ie_bsdf = ie_nodes.new("ShaderNodeBsdfPrincipled")
    ie_bsdf.inputs["Base Color"].default_value = (0.42, 0.35, 0.38, 1.0)
    ie_bsdf.inputs["Roughness"].default_value = 0.60
    ie_bsdf.inputs["Subsurface Weight"].default_value = 0.25
    ie_links.new(ie_bsdf.outputs["BSDF"], ie_out.inputs["Surface"])

    # 2.4 Vivid Emerald Green Eyes
    mat_iris = bpy.data.materials.new("RussianBlue_Emerald_Iris")
    mat_iris.use_nodes = True
    i_nodes = mat_iris.node_tree.nodes
    i_links = mat_iris.node_tree.links
    i_nodes.clear()
    i_out = i_nodes.new("ShaderNodeOutputMaterial")
    i_bsdf = i_nodes.new("ShaderNodeBsdfPrincipled")
    # Vibrant, radiant emerald green with depth
    i_bsdf.inputs["Base Color"].default_value = (0.04, 0.68, 0.20, 1.0)
    i_bsdf.inputs["Roughness"].default_value = 0.15
    i_bsdf.inputs["Emission Color"].default_value = (0.02, 0.28, 0.09, 1.0)
    i_bsdf.inputs["Emission Strength"].default_value = 0.45
    i_links.new(i_bsdf.outputs["BSDF"], i_out.inputs["Surface"])

    # Cornea Glass
    mat_cornea = bpy.data.materials.new("RussianBlue_Cornea")
    mat_cornea.use_nodes = True
    co_nodes = mat_cornea.node_tree.nodes
    co_links = mat_cornea.node_tree.links
    co_nodes.clear()
    co_out = co_nodes.new("ShaderNodeOutputMaterial")
    co_bsdf = co_nodes.new("ShaderNodeBsdfPrincipled")
    co_bsdf.inputs["Base Color"].default_value = (1.0, 1.0, 1.0, 1.0)
    co_bsdf.inputs["Roughness"].default_value = 0.02
    co_bsdf.inputs["Transmission Weight"].default_value = 1.0
    co_bsdf.inputs["IOR"].default_value = 1.336
    co_links.new(co_bsdf.outputs["BSDF"], co_out.inputs["Surface"])

    # Black Slit Pupil
    mat_pupil = bpy.data.materials.new("RussianBlue_Pupil")
    mat_pupil.use_nodes = True
    pu_nodes = mat_pupil.node_tree.nodes
    pu_links = mat_pupil.node_tree.links
    pu_nodes.clear()
    pu_out = pu_nodes.new("ShaderNodeOutputMaterial")
    pu_bsdf = pu_nodes.new("ShaderNodeBsdfPrincipled")
    pu_bsdf.inputs["Base Color"].default_value = (0.005, 0.005, 0.005, 1.0)
    pu_bsdf.inputs["Roughness"].default_value = 0.10
    pu_links.new(pu_bsdf.outputs["BSDF"], pu_out.inputs["Surface"])

    # Whisker Material (Silvery Translucent White)
    mat_whisker = bpy.data.materials.new("RussianBlue_Whisker")
    mat_whisker.use_nodes = True
    w_nodes = mat_whisker.node_tree.nodes
    w_links = mat_whisker.node_tree.links
    w_nodes.clear()
    w_out = w_nodes.new("ShaderNodeOutputMaterial")
    w_bsdf = w_nodes.new("ShaderNodeBsdfPrincipled")
    w_bsdf.inputs["Base Color"].default_value = (0.95, 0.96, 0.98, 1.0)
    w_bsdf.inputs["Roughness"].default_value = 0.20
    w_links.new(w_bsdf.outputs["BSDF"], w_out.inputs["Surface"])

    # 2.5 Tabletop Wood Material (Rich Warm Oak/Walnut)
    mat_table = bpy.data.materials.new("Table_PolishedWood")
    mat_table.use_nodes = True
    tb_nodes = mat_table.node_tree.nodes
    tb_links = mat_table.node_tree.links
    tb_nodes.clear()
    tb_out = tb_nodes.new("ShaderNodeOutputMaterial")
    tb_bsdf = tb_nodes.new("ShaderNodeBsdfPrincipled")
    # Warm honey-amber oak / walnut
    tb_bsdf.inputs["Base Color"].default_value = (0.34, 0.20, 0.10, 1.0)
    tb_bsdf.inputs["Roughness"].default_value = 0.26 # Soft lacquered reflection
    tb_bsdf.inputs["Specular IOR Level"].default_value = 0.55
    tb_links.new(tb_bsdf.outputs["BSDF"], tb_out.inputs["Surface"])

    # 2.6 House Wall Material (Warm Greige / Off-White)
    mat_wall = bpy.data.materials.new("House_Wall_Linen")
    mat_wall.use_nodes = True
    wl_nodes = mat_wall.node_tree.nodes
    wl_links = mat_wall.node_tree.links
    wl_nodes.clear()
    wl_out = wl_nodes.new("ShaderNodeOutputMaterial")
    wl_bsdf = wl_nodes.new("ShaderNodeBsdfPrincipled")
    wl_bsdf.inputs["Base Color"].default_value = (0.86, 0.84, 0.80, 1.0)
    wl_bsdf.inputs["Roughness"].default_value = 0.85
    wl_links.new(wl_bsdf.outputs["BSDF"], wl_out.inputs["Surface"])

    # 2.7 House Floor Material (Dark Parquet Oak)
    mat_floor = bpy.data.materials.new("House_Floor_Hardwood")
    mat_floor.use_nodes = True
    fl_nodes = mat_floor.node_tree.nodes
    fl_links = mat_floor.node_tree.links
    fl_nodes.clear()
    fl_out = fl_nodes.new("ShaderNodeOutputMaterial")
    fl_bsdf = fl_nodes.new("ShaderNodeBsdfPrincipled")
    fl_bsdf.inputs["Base Color"].default_value = (0.18, 0.11, 0.07, 1.0)
    fl_bsdf.inputs["Roughness"].default_value = 0.40
    fl_links.new(fl_bsdf.outputs["BSDF"], fl_out.inputs["Surface"])

    # Ceramic Mug Material
    mat_mug = bpy.data.materials.new("Ceramic_Mug")
    mat_mug.use_nodes = True
    m_nodes = mat_mug.node_tree.nodes
    m_links = mat_mug.node_tree.links
    m_nodes.clear()
    m_out = m_nodes.new("ShaderNodeOutputMaterial")
    m_bsdf = m_nodes.new("ShaderNodeBsdfPrincipled")
    m_bsdf.inputs["Base Color"].default_value = (0.92, 0.90, 0.86, 1.0)
    m_bsdf.inputs["Roughness"].default_value = 0.18 # Glazed stoneware
    m_links.new(m_bsdf.outputs["BSDF"], m_out.inputs["Surface"])

    # Plant Foliage Material
    mat_succulent = bpy.data.materials.new("Succulent_Green")
    mat_succulent.use_nodes = True
    pl_nodes = mat_succulent.node_tree.nodes
    pl_links = mat_succulent.node_tree.links
    pl_nodes.clear()
    pl_out = pl_nodes.new("ShaderNodeOutputMaterial")
    pl_bsdf = pl_nodes.new("ShaderNodeBsdfPrincipled")
    pl_bsdf.inputs["Base Color"].default_value = (0.12, 0.45, 0.22, 1.0)
    pl_bsdf.inputs["Roughness"].default_value = 0.35
    pl_bsdf.inputs["Subsurface Weight"].default_value = 0.20
    pl_links.new(pl_bsdf.outputs["BSDF"], pl_out.inputs["Surface"])

    # -------------------------------------------------------------
    # 3. BUILD RUSSIAN BLUE ANATOMY
    # -------------------------------------------------------------
    # Helper to construct primitives
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
        # Spheres at joints
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

    # 3.1 Sleek, Athletic Semi-Foreign Torso
    # Muscular, lean pelvis
    make_sphere("RB_Pelvis", 0.22, (0.85, 1.25, 0.95), (0, -0.42, 0.58), (math.radians(-4), 0, 0))
    # Tucked, slender waist
    make_sphere("RB_Waist", 0.19, (0.75, 1.20, 0.88), (0, -0.16, 0.58), (0, 0, 0))
    # Deep, graceful athletic ribcage & chest
    make_sphere("RB_Chest", 0.23, (0.82, 1.25, 0.98), (0, 0.14, 0.60), (math.radians(8), 0, 0))
    # Elegant, long neck (Signature Russian Blue graceful posture)
    make_sphere("RB_Neck", 0.15, (0.78, 1.15, 1.25), (0, 0.36, 0.69), (math.radians(35), 0, 0))

    # 3.2 Russian Blue Head: Smooth Modified Wedge
    # Cranium (flat between ears, medium wedge)
    make_sphere("RB_Cranium", 0.17, (1.05, 1.15, 0.95), (0, 0.52, 0.78), (math.radians(8), 0, 0))
    # Prominent high cheekbones
    make_sphere("RB_Cheek_L", 0.10, (1.1, 1.0, 0.9), (-0.11, 0.54, 0.74))
    make_sphere("RB_Cheek_R", 0.10, (1.1, 1.0, 0.9), (0.11, 0.54, 0.74))
    # Defined, prominent whisker pads (Mystacial pads forming the gentle Russian Blue smile)
    make_sphere("RB_WhiskerPad_L", 0.08, (1.15, 1.05, 0.90), (-0.075, 0.68, 0.70))
    make_sphere("RB_WhiskerPad_R", 0.08, (1.15, 1.05, 0.90), (0.075, 0.68, 0.70))

    # 3.3 MOUTH & CHIN SCULPT (Explicitly modeled mouth, philtrum & lower jaw)
    # Upper Lip Left & Right curved cushion
    make_sphere("RB_UpperLip_L", 0.055, (1.1, 0.9, 0.75), (-0.045, 0.705, 0.675))
    make_sphere("RB_UpperLip_R", 0.055, (1.1, 0.9, 0.75), (0.045, 0.705, 0.675))
    # Philtrum central seam / vertical groove
    make_sphere("RB_Philtrum", 0.035, (0.5, 0.8, 1.2), (0, 0.725, 0.695))
    # Firm, well-developed lower chin
    make_sphere("RB_LowerChin", 0.065, (0.9, 0.95, 0.8), (0, 0.665, 0.64))

    # 3.4 Large, Pointed, Tall Russian Blue Ears (Alert, wide at base)
    for sign, s_name in [(-1, "L"), (1, "R")]:
        x = sign * 0.15
        mesh_ear = bpy.data.meshes.new(f"RB_Ear_{s_name}")
        bm_ear = bmesh.new()
        bmesh.ops.create_cone(bm_ear, segments=16, radius1=0.09, radius2=0.015, depth=0.25)
        bmesh.ops.scale(bm_ear, vec=Vector((1.0, 0.38, 1.0)), verts=bm_ear.verts)
        bm_ear.to_mesh(mesh_ear)
        bm_ear.free()
        ear_obj = bpy.data.objects.new(f"RB_Ear_{s_name}", mesh_ear)
        ear_obj.location = Vector((x, 0.50, 1.00))
        # Pointing upright and alert
        ear_obj.rotation_euler = Euler((math.radians(12), math.radians(18 * sign), math.radians(-16 * sign)))
        cat_col.objects.link(ear_obj)
        body_parts.append(ear_obj)

    # 3.5 Long, Slender, Elegant Legs & Neat Small Oval Paws
    # Front Legs
    for sign, s_name in [(-1, "L"), (1, "R")]:
        x = sign * 0.13
        p_shoulder = (x, 0.16, 0.60)
        p_elbow = (x, 0.16, 0.38)
        p_wrist = (x, 0.17, 0.17)
        p_paw = (x, 0.19, 0.045)

        make_sphere(f"RB_FrontShoulder_{s_name}", 0.12, (0.9, 1.1, 1.1), p_shoulder)
        make_capsule(f"RB_FrontUpper_{s_name}", p_shoulder, p_elbow, radius=0.065)
        make_capsule(f"RB_FrontLower_{s_name}", p_elbow, p_wrist, radius=0.055)
        make_capsule(f"RB_FrontWrist_{s_name}", p_wrist, p_paw, radius=0.050)
        # Neat, small oval paws
        make_sphere(f"RB_FrontPawFoot_{s_name}", 0.075, (1.05, 1.35, 0.55), p_paw)

    # Hind Legs
    for sign, s_name in [(-1, "L"), (1, "R")]:
        x = sign * 0.14
        p_hip = (x, -0.42, 0.58)
        p_knee = (x, -0.28, 0.38)
        p_hock = (x, -0.42, 0.20)
        p_hindpaw = (x, -0.38, 0.045)

        make_sphere(f"RB_HindThigh_{s_name}", 0.18, (0.9, 1.2, 1.05), p_hip)
        make_capsule(f"RB_HindThighToKnee_{s_name}", p_hip, p_knee, radius=0.075)
        make_capsule(f"RB_HindKneeToHock_{s_name}", p_knee, p_hock, radius=0.060)
        make_capsule(f"RB_HindHockToPaw_{s_name}", p_hock, p_hindpaw, radius=0.050)
        # Small oval hind paw
        make_sphere(f"RB_HindPawFoot_{s_name}", 0.075, (1.05, 1.35, 0.55), p_hindpaw)

    # 3.6 Long, Slender Russian Blue Tail (Tapering to blunt tip)
    tail_pts = [
        Vector((0, -0.52, 0.58)),
        Vector((0, -0.70, 0.62)),
        Vector((0, -0.88, 0.68)),
        Vector((0, -1.05, 0.76)),
        Vector((0, -1.20, 0.86)),
    ]
    for t_i in range(len(tail_pts) - 1):
        r_t = 0.045 - t_i * 0.005 # Slender tapering
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
            remesh.voxel_size = 0.020 # High detail for muzzle & mouth
            bpy.ops.object.modifier_apply(modifier="VoxelRemesh")

            smooth = cat_mesh_obj.modifiers.new("SmoothSurface", "SMOOTH")
            smooth.factor = 0.45
            smooth.iterations = 3
            bpy.ops.object.modifier_apply(modifier="SmoothSurface")

            sub = cat_mesh_obj.modifiers.new("Subsurf", "SUBSURF")
            sub.levels = 1

            for f in cat_mesh_obj.data.polygons:
                f.use_smooth = True

    cat_mesh_obj.data.materials.append(mat_coat)

    # -------------------------------------------------------------
    # 4. HEAD DETAILS: EYES, NOSE, INNER EARS, MOUTH SEAM, WHISKERS
    # -------------------------------------------------------------
    head_decorations = []

    # 4.1 Inner Ear Cavity (Slate Pink)
    for sign, s_name in [(-1, "L"), (1, "R")]:
        x = sign * 0.15
        in_mesh = bpy.data.meshes.new(f"InnerEar_{s_name}")
        bm_in = bmesh.new()
        bmesh.ops.create_cone(bm_in, segments=12, radius1=0.065, radius2=0.012, depth=0.18)
        bmesh.ops.scale(bm_in, vec=Vector((1.0, 0.28, 1.0)), verts=bm_in.verts)
        bm_in.to_mesh(in_mesh)
        bm_in.free()
        in_obj = bpy.data.objects.new(f"InnerEar_{s_name}", in_mesh)
        in_obj.location = Vector((x, 0.51, 1.01))
        in_obj.rotation_euler = Euler((math.radians(14), math.radians(18 * sign), math.radians(-16 * sign)))
        cat_col.objects.link(in_obj)
        in_obj.data.materials.append(mat_inner_ear)
        for f in in_mesh.polygons: f.use_smooth = True
        head_decorations.append(in_obj)

    # 4.2 Large Emerald Green Russian Blue Eyes (Almond/Oval)
    for sign, s_name in [(-1, "L"), (1, "R")]:
        x = sign * 0.115
        y = 0.665
        z = 0.81

        # Cornea (Glass)
        c_mesh = bpy.data.meshes.new(f"Eye_{s_name}_Cornea")
        bm = bmesh.new()
        bmesh.ops.create_uvsphere(bm, u_segments=18, v_segments=14, radius=0.052)
        bmesh.ops.scale(bm, vec=Vector((1.0, 1.15, 0.90)), verts=bm.verts)
        bm.to_mesh(c_mesh)
        bm.free()
        c_obj = bpy.data.objects.new(f"Eye_{s_name}_Cornea", c_mesh)
        c_obj.location = Vector((x, y, z))
        cat_col.objects.link(c_obj)
        c_obj.data.materials.append(mat_cornea)
        for f in c_mesh.polygons: f.use_smooth = True
        head_decorations.append(c_obj)

        # Luminous Emerald Green Iris
        i_mesh = bpy.data.meshes.new(f"Eye_{s_name}_Iris")
        bm = bmesh.new()
        bmesh.ops.create_uvsphere(bm, u_segments=18, v_segments=14, radius=0.048)
        bmesh.ops.scale(bm, vec=Vector((1.0, 1.10, 0.88)), verts=bm.verts)
        bm.to_mesh(i_mesh)
        bm.free()
        i_obj = bpy.data.objects.new(f"Eye_{s_name}_Iris", i_mesh)
        i_obj.location = Vector((x, y - 0.003, z))
        cat_col.objects.link(i_obj)
        i_obj.data.materials.append(mat_iris)
        for f in i_mesh.polygons: f.use_smooth = True
        head_decorations.append(i_obj)

        # Slit Black Pupil
        p_mesh = bpy.data.meshes.new(f"Eye_{s_name}_Pupil")
        bm = bmesh.new()
        bmesh.ops.create_uvsphere(bm, u_segments=14, v_segments=10, radius=0.049)
        bmesh.ops.scale(bm, vec=Vector((0.26, 1.12, 0.90)), verts=bm.verts)
        bm.to_mesh(p_mesh)
        bm.free()
        p_obj = bpy.data.objects.new(f"Eye_{s_name}_Pupil", p_mesh)
        p_obj.location = Vector((x, y + 0.002, z))
        cat_col.objects.link(p_obj)
        p_obj.data.materials.append(mat_pupil)
        for f in p_mesh.polygons: f.use_smooth = True
        head_decorations.append(p_obj)

    # 4.3 Slate Charcoal Nose Leather (Triangular feline nose)
    n_mesh = bpy.data.meshes.new("RussianBlue_Nose")
    bm = bmesh.new()
    bmesh.ops.create_uvsphere(bm, u_segments=16, v_segments=12, radius=0.032)
    bmesh.ops.scale(bm, vec=Vector((1.1, 0.7, 0.75)), verts=bm.verts)
    bm.to_mesh(n_mesh)
    bm.free()
    nose_obj = bpy.data.objects.new("RussianBlue_Nose", n_mesh)
    nose_obj.location = Vector((0, 0.735, 0.755))
    nose_obj.rotation_euler = Euler((math.radians(16), 0, 0))
    cat_col.objects.link(nose_obj)
    nose_obj.data.materials.append(mat_nose)
    for f in n_mesh.polygons: f.use_smooth = True
    head_decorations.append(nose_obj)

    # 4.4 Distinct Dark Lip Line / Mouth Seam (Inverted 'Y' cat smile)
    mouth_curves = [
        # Philtrum vertical line (from nose base down to upper lip)
        [Vector((0, 0.74, 0.735)), Vector((0, 0.73, 0.705)), Vector((0, 0.718, 0.675))],
        # Left upper lip curve
        [Vector((0, 0.718, 0.675)), Vector((-0.035, 0.705, 0.665)), Vector((-0.07, 0.67, 0.662))],
        # Right upper lip curve
        [Vector((0, 0.718, 0.675)), Vector((0.035, 0.705, 0.665)), Vector((0.07, 0.67, 0.662))],
    ]
    for m_i, pts in enumerate(mouth_curves):
        m_curve = bpy.data.curves.new(f"Mouth_Seam_{m_i}", type="CURVE")
        m_curve.dimensions = "3D"
        m_curve.bevel_depth = 0.004
        spline = m_curve.splines.new("BEZIER")
        spline.bezier_points.add(len(pts) - 1)
        for p_idx, pt in enumerate(pts):
            spline.bezier_points[p_idx].co = pt
            spline.bezier_points[p_idx].handle_left_type = "AUTO"
            spline.bezier_points[p_idx].handle_right_type = "AUTO"
        m_obj = bpy.data.objects.new(f"Mouth_Seam_{m_i}", m_curve)
        cat_col.objects.link(m_obj)
        m_obj.data.materials.append(mat_nose) # Slate charcoal lip line
        head_decorations.append(m_obj)

    # 4.5 Sweeping White/Silver Whiskers
    for s_sign, side in [(-1, "L"), (1, "R")]:
        origins = [
            (s_sign * 0.09, 0.71, 0.72),
            (s_sign * 0.11, 0.69, 0.70),
            (s_sign * 0.09, 0.70, 0.68),
            (s_sign * 0.12, 0.68, 0.73),
            (s_sign * 0.13, 0.67, 0.69),
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
            w_curve.bevel_depth = 0.0024
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
            w_obj = bpy.data.objects.new(f"RB_Whisker_{side}_{w_i}", w_curve)
            cat_col.objects.link(w_obj)
            w_obj.data.materials.append(mat_whisker)
            head_decorations.append(w_obj)

    # -------------------------------------------------------------
    # 5. ARMATURE & INVERSE KINEMATICS (IK) RIGGING
    # -------------------------------------------------------------
    arm_data = bpy.data.armatures.new("RussianBlue_Skeleton")
    arm_obj = bpy.data.objects.new("RussianBlue_Armature", arm_data)
    cat_col.objects.link(arm_obj)

    if override:
        with override:
            bpy.context.view_layer.objects.active = arm_obj
            bpy.ops.object.mode_set(mode='EDIT')

            # Root (At tabletop surface level Z=0.0)
            root = arm_data.edit_bones.new("Root")
            root.head = (0, 0, 0)
            root.tail = (0, 0.2, 0)

            # Pelvis & Spine
            pelvis = arm_data.edit_bones.new("Pelvis")
            pelvis.head = (0, -0.42, 0.58)
            pelvis.tail = (0, -0.16, 0.58)
            pelvis.parent = root

            chest = arm_data.edit_bones.new("Chest")
            chest.head = (0, -0.16, 0.58)
            chest.tail = (0, 0.22, 0.60)
            chest.parent = pelvis

            neck = arm_data.edit_bones.new("Neck")
            neck.head = (0, 0.22, 0.60)
            neck.tail = (0, 0.45, 0.75)
            neck.parent = chest

            head_b = arm_data.edit_bones.new("Head")
            head_b.head = (0, 0.45, 0.75)
            head_b.tail = (0, 0.72, 0.82)
            head_b.parent = neck

            # Tail bones
            t1 = arm_data.edit_bones.new("Tail_01")
            t1.head = (0, -0.42, 0.58)
            t1.tail = (0, -0.70, 0.62)
            t1.parent = pelvis

            t2 = arm_data.edit_bones.new("Tail_02")
            t2.head = (0, -0.70, 0.62)
            t2.tail = (0, -0.95, 0.70)
            t2.parent = t1

            t3 = arm_data.edit_bones.new("Tail_03")
            t3.head = (0, -0.95, 0.70)
            t3.tail = (0, -1.22, 0.86)
            t3.parent = t2

            # Front Legs
            for sign, s_name in [(-1, "L"), (1, "R")]:
                x = sign * 0.13
                f_up = arm_data.edit_bones.new(f"Front_Upper_{s_name}")
                f_up.head = (x, 0.16, 0.60)
                f_up.tail = (x, 0.16, 0.38)
                f_up.parent = chest

                f_low = arm_data.edit_bones.new(f"Front_Lower_{s_name}")
                f_low.head = (x, 0.16, 0.38)
                f_low.tail = (x, 0.17, 0.16)
                f_low.parent = f_up

                f_paw = arm_data.edit_bones.new(f"Front_Paw_{s_name}")
                f_paw.head = (x, 0.17, 0.16)
                f_paw.tail = (x, 0.20, 0.045)
                f_paw.parent = f_low

                # IK Target for front paw (Parented to Root, steps on Tabletop Z=0.0)
                f_ik = arm_data.edit_bones.new(f"IK_FrontPaw_{s_name}")
                f_ik.head = (x, 0.19, 0.045)
                f_ik.tail = (x, 0.25, 0.045)
                f_ik.parent = root

            # Hind Legs
            for sign, s_name in [(-1, "L"), (1, "R")]:
                x = sign * 0.14
                h_thigh = arm_data.edit_bones.new(f"Hind_Thigh_{s_name}")
                h_thigh.head = (x, -0.42, 0.58)
                h_thigh.tail = (x, -0.28, 0.38)
                h_thigh.parent = pelvis

                h_shin = arm_data.edit_bones.new(f"Hind_Shin_{s_name}")
                h_shin.head = (x, -0.28, 0.38)
                h_shin.tail = (x, -0.42, 0.20)
                h_shin.parent = h_thigh

                h_paw = arm_data.edit_bones.new(f"Hind_Paw_{s_name}")
                h_paw.head = (x, -0.42, 0.20)
                h_paw.tail = (x, -0.38, 0.045)
                h_paw.parent = h_shin

                # IK Target for hind paw (Steps on Tabletop Z=0.0)
                h_ik = arm_data.edit_bones.new(f"IK_HindPaw_{s_name}")
                h_ik.head = (x, -0.38, 0.045)
                h_ik.tail = (x, -0.32, 0.045)
                h_ik.parent = root

            # POSE MODE: ADD IK CONSTRAINTS
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

            # Parent body to armature
            bpy.ops.object.select_all(action='DESELECT')
            cat_mesh_obj.select_set(True)
            arm_obj.select_set(True)
            bpy.context.view_layer.objects.active = arm_obj
            bpy.ops.object.parent_set(type='ARMATURE_AUTO')

            # Parent facial decor to Head bone
            for el in head_decorations:
                mat_orig = el.matrix_world.copy()
                el.parent = arm_obj
                el.parent_type = 'BONE'
                el.parent_bone = 'Head'
                el.matrix_world = mat_orig

    # -------------------------------------------------------------
    # 6. ENVIRONMENT: HOUSE INTERIOR & WOODEN TABLE
    # -------------------------------------------------------------
    # 6.1 Polished Wooden Table
    # Table top board (Top face is exactly at Z = 0.0!)
    mesh_tabletop = bpy.data.meshes.new("Dining_Table_Top")
    bm_t = bmesh.new()
    bmesh.ops.create_cube(bm_t, size=1.0)
    # Scale to 1.6m wide (X), 2.8m long (Y), 0.05m thick (Z)
    bmesh.ops.scale(bm_t, vec=Vector((1.6, 2.8, 0.05)), verts=bm_t.verts)
    # Move so top surface is at Z = 0.0 (center at Z = -0.025)
    bmesh.ops.translate(bm_t, vec=Vector((0, 0, -0.025)), verts=bm_t.verts)
    bm_t.to_mesh(mesh_tabletop)
    bm_t.free()
    tabletop_obj = bpy.data.objects.new("Dining_Table_Top", mesh_tabletop)
    tabletop_obj.location = Vector((0, 0, 0))
    env_col.objects.link(tabletop_obj)
    tabletop_obj.data.materials.append(mat_table)

    # Table Bevel Modifier for soft realistic edges
    tb_bev = tabletop_obj.modifiers.new("TableBevel", "BEVEL")
    tb_bev.width = 0.008
    tb_bev.segments = 3

    # Table Legs (Extending from Z = -0.05 down to room floor at Z = -0.75)
    leg_coords = [
        (-0.70, -1.25), (0.70, -1.25),
        (-0.70, 1.25), (0.70, 1.25)
    ]
    for l_i, (lx, ly) in enumerate(leg_coords):
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

    # 6.2 Tabletop Props: Ceramic Coffee Mug
    # Mug body
    mesh_mug = bpy.data.meshes.new("Prop_Coffee_Mug")
    bm_m = bmesh.new()
    bmesh.ops.create_cone(bm_m, segments=24, radius1=0.045, radius2=0.042, depth=0.10)
    bmesh.ops.translate(bm_m, vec=Vector((0, 0, 0.05)), verts=bm_m.verts)
    bm_m.to_mesh(mesh_mug)
    bm_m.free()
    mug_obj = bpy.data.objects.new("Prop_Coffee_Mug", mesh_mug)
    mug_obj.location = Vector((0.48, 0.50, 0.0))
    env_col.objects.link(mug_obj)
    mug_obj.data.materials.append(mat_mug)
    # Mug handle
    h_curve = bpy.data.curves.new("Mug_Handle", type="CURVE")
    h_curve.dimensions = "3D"
    h_curve.bevel_depth = 0.007
    spl = h_curve.splines.new("BEZIER")
    spl.bezier_points.add(2)
    spl.bezier_points[0].co = Vector((0.525, 0.50, 0.08))
    spl.bezier_points[1].co = Vector((0.585, 0.50, 0.055))
    spl.bezier_points[2].co = Vector((0.525, 0.50, 0.025))
    for bp in spl.bezier_points:
        bp.handle_left_type = "AUTO"
        bp.handle_right_type = "AUTO"
    h_obj = bpy.data.objects.new("Mug_Handle", h_curve)
    env_col.objects.link(h_obj)
    h_obj.data.materials.append(mat_mug)

    # 6.3 Tabletop Props: Potted Succulent Plant
    # Planter Pot
    mesh_pot = bpy.data.meshes.new("Prop_Succulent_Pot")
    bm_pot = bmesh.new()
    bmesh.ops.create_cone(bm_pot, segments=20, radius1=0.065, radius2=0.050, depth=0.08)
    bmesh.ops.translate(bm_pot, vec=Vector((0, 0, 0.04)), verts=bm_pot.verts)
    bm_pot.to_mesh(mesh_pot)
    bm_pot.free()
    pot_obj = bpy.data.objects.new("Prop_Succulent_Pot", mesh_pot)
    pot_obj.location = Vector((-0.46, -0.30, 0.0))
    env_col.objects.link(pot_obj)
    pot_obj.data.materials.append(mat_mug) # Matte white ceramic

    # Succulent leaves (rosette)
    mesh_leaves = bpy.data.meshes.new("Prop_Succulent_Leaves")
    bm_lf = bmesh.new()
    for petal_i in range(8):
        ang = petal_i * (math.pi * 2 / 8)
        bmesh.ops.create_uvsphere(bm_lf, u_segments=10, v_segments=8, radius=0.025)
        # Scale to fleshy succulent leaf
        last_v = bm_lf.verts[-10*8:]
        bmesh.ops.scale(bm_lf, vec=Vector((0.6, 1.4, 0.4)), verts=last_v)
        rot_m = Matrix.Rotation(ang, 3, 'Z') @ Matrix.Rotation(math.radians(-25), 3, 'X')
        bmesh.ops.rotate(bm_lf, cent=Vector((0, 0, 0)), matrix=rot_m, verts=last_v)
        bmesh.ops.translate(bm_lf, vec=Vector((math.sin(ang)*0.035, math.cos(ang)*0.035, 0.085)), verts=last_v)
    bm_lf.to_mesh(mesh_leaves)
    bm_lf.free()
    leaves_obj = bpy.data.objects.new("Prop_Succulent_Leaves", mesh_leaves)
    leaves_obj.location = Vector((-0.46, -0.30, 0.0))
    env_col.objects.link(leaves_obj)
    leaves_obj.data.materials.append(mat_succulent)

    # 6.4 House Floor & Walls
    # Room Floor Plane (at Z = -0.75m)
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

    # House Back Wall (at Y = -2.4m)
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

    # Baseboard Molding along back wall
    mesh_base = bpy.data.meshes.new("House_Baseboard")
    bm_bb = bmesh.new()
    bmesh.ops.create_cube(bm_bb, size=1.0)
    bmesh.ops.scale(bm_bb, vec=Vector((10.0, 0.04, 0.16)), verts=bm_bb.verts)
    bmesh.ops.translate(bm_bb, vec=Vector((0, -2.33, -0.67)), verts=bm_bb.verts)
    bm_bb.to_mesh(mesh_base)
    bm_bb.free()
    base_obj = bpy.data.objects.new("House_Baseboard", mesh_base)
    env_col.objects.link(base_obj)
    base_obj.data.materials.append(mat_mug) # Soft white satin trim

    # -------------------------------------------------------------
    # 7. GROUNDED IK STRIDE ANIMATION ON THE TABLETOP (Z=0.0)
    # -------------------------------------------------------------
    scene = bpy.context.scene
    scene.frame_start = 1
    scene.frame_end = 32
    scene.render.fps = 24

    pose_bones = arm_obj.pose.bones

    # Walk Cycle Helper:
    # 60% Stance Phase: Paw is locked firmly on Tabletop (Z = 0.0), sliding smoothly backward relative to body
    # 40% Swing Phase: Paw lifts cleanly in a parabolic arc (Z = 0.11) and steps forward
    def get_ground_step(phase, stride_len=0.25, lift_height=0.11):
        norm_phase = (phase % (2 * math.pi)) / (2 * math.pi)
        if norm_phase < 0.60:
            p_frac = norm_phase / 0.60
            y_offset = (0.5 - p_frac) * stride_len
            z_offset = 0.0 # GLUED TO TABLETOP SURFACE!
        else:
            p_frac = (norm_phase - 0.60) / 0.40
            y_offset = (-0.5 + p_frac) * stride_len
            z_offset = math.sin(p_frac * math.pi) * lift_height
        return y_offset, z_offset

    for f in range(1, 33):
        t = (f - 1) / 32.0 * math.pi * 2

        # 1. Pelvis: Sleek rhythmic sway & bounce
        pb_pelvis = pose_bones.get("Pelvis")
        if pb_pelvis:
            pb_pelvis.location.z = math.sin(t * 2) * 0.016
            pb_pelvis.rotation_euler.z = math.sin(t) * 0.042
            pb_pelvis.rotation_euler.x = math.cos(t * 2) * 0.022
            pb_pelvis.keyframe_insert(data_path="location", frame=f)
            pb_pelvis.keyframe_insert(data_path="rotation_euler", frame=f)

        # 2. Chest: Athletic counter-balancing roll
        pb_chest = pose_bones.get("Chest")
        if pb_chest:
            pb_chest.rotation_euler.z = -math.sin(t) * 0.035
            pb_chest.keyframe_insert(data_path="rotation_euler", frame=f)

        # 3. Head: Alert, focused horizontal gaze
        pb_head = pose_bones.get("Head")
        if pb_head:
            pb_head.rotation_euler.x = math.sin(t * 2) * 0.018
            pb_head.keyframe_insert(data_path="rotation_euler", frame=f)

        # 4. Long Sleek Tail: Sinuous wave with upward alert curve
        for t_name, lag, amp in [("Tail_01", 0.4, 0.14), ("Tail_02", 0.8, 0.22), ("Tail_03", 1.2, 0.30)]:
            tb = pose_bones.get(t_name)
            if tb:
                tb.rotation_euler.z = -math.sin(t - lag) * amp
                tb.rotation_euler.x = math.cos(t * 2) * 0.04
                tb.keyframe_insert(data_path="rotation_euler", frame=f)

        # 5. GROUNDED IK FEET (Tabletop contact Z=0.0)
        # Left Hind
        y_lh, z_lh = get_ground_step(t, stride_len=0.25, lift_height=0.11)
        ik_hl = pose_bones.get("IK_HindPaw_L")
        if ik_hl:
            ik_hl.location.y = y_lh
            ik_hl.location.z = z_lh
            ik_hl.keyframe_insert(data_path="location", frame=f)

        # Left Front (Phase + pi/2)
        y_lf, z_lf = get_ground_step(t + math.pi * 0.5, stride_len=0.24, lift_height=0.10)
        ik_fl = pose_bones.get("IK_FrontPaw_L")
        if ik_fl:
            ik_fl.location.y = y_lf
            ik_fl.location.z = z_lf
            ik_fl.keyframe_insert(data_path="location", frame=f)

        # Right Hind (Phase + pi)
        y_rh, z_rh = get_ground_step(t + math.pi, stride_len=0.25, lift_height=0.11)
        ik_hr = pose_bones.get("IK_HindPaw_R")
        if ik_hr:
            ik_hr.location.y = y_rh
            ik_hr.location.z = z_rh
            ik_hr.keyframe_insert(data_path="location", frame=f)

        # Right Front (Phase + 3pi/2)
        y_rf, z_rf = get_ground_step(t + math.pi * 1.5, stride_len=0.24, lift_height=0.10)
        ik_fr = pose_bones.get("IK_FrontPaw_R")
        if ik_fr:
            ik_fr.location.y = y_rf
            ik_fr.location.z = z_rf
            ik_fr.keyframe_insert(data_path="location", frame=f)

    # -------------------------------------------------------------
    # 8. HOUSE LIGHTING & CINEMATIC CAMERA
    # -------------------------------------------------------------
    # 8.1 Key Light: Warm Afternoon Window Light streaming across the table
    light_win = bpy.data.lights.new("Window_Sunlight", type='AREA')
    light_win.energy = 380.0
    light_win.color = (1.0, 0.94, 0.86) # Warm golden daylight
    light_win.size = 2.4
    light_win.shape = 'RECTANGLE'
    light_win.size_y = 1.8
    obj_win = bpy.data.objects.new("Window_Sunlight", light_win)
    obj_win.location = Vector((2.8, 1.8, 2.4))
    look_at(obj_win, Vector((0, 0.1, 0.2)))
    env_col.objects.link(obj_win)

    # 8.2 Fill Light: Cozy Warm Ambient Bounce Light
    light_fill = bpy.data.lights.new("Room_Ambient_Fill", type='AREA')
    light_fill.energy = 110.0
    light_fill.color = (0.90, 0.92, 1.0) # Soft daylight ambient
    light_fill.size = 3.0
    obj_fill = bpy.data.objects.new("Room_Ambient_Fill", light_fill)
    obj_fill.location = Vector((-2.4, 2.0, 1.8))
    look_at(obj_fill, Vector((0, 0.1, 0.2)))
    env_col.objects.link(obj_fill)

    # 8.3 Rim / Hair Light: Highlights Russian Blue silver coat & spine
    light_rim = bpy.data.lights.new("Coat_Silver_Rim", type='SPOT')
    light_rim.energy = 260.0
    light_rim.color = (0.85, 0.92, 1.0) # Crisp cool silver highlight
    light_rim.spot_size = math.radians(45)
    light_rim.spot_blend = 0.5
    obj_rim = bpy.data.objects.new("Coat_Silver_Rim", light_rim)
    obj_rim.location = Vector((-1.4, -2.0, 2.2))
    look_at(obj_rim, Vector((0, -0.1, 0.5)))
    env_col.objects.link(obj_rim)

    # 8.4 Cinematic Camera: Framing Cat walking proudly on the table
    cam_data = bpy.data.cameras.new("House_Table_Camera")
    cam_data.lens = 55.0 # Editorial portrait focal length
    cam_data.dof.use_dof = True
    cam_data.dof.focus_distance = 2.9
    cam_data.dof.aperture_fstop = 3.0 # Soft cinematic room blur
    cam_obj = bpy.data.objects.new("House_Table_Camera", cam_data)
    cam_obj.location = Vector((1.75, 2.35, 0.85))
    look_at(cam_obj, Vector((0, 0.15, 0.45)))
    env_col.objects.link(cam_obj)
    bpy.context.scene.camera = cam_obj

    # 8.5 World Environment: Warm indoor ambient tone
    world = bpy.context.scene.world
    if not world:
        world = bpy.data.worlds.new("House_World")
        bpy.context.scene.world = world
    world.use_nodes = True
    w_nodes = world.node_tree.nodes
    w_nodes.clear()
    w_out = w_nodes.new("ShaderNodeOutputWorld")
    w_bg = w_nodes.new("ShaderNodeBackground")
    w_bg.inputs["Color"].default_value = (0.04, 0.038, 0.035, 1.0)
    w_bg.inputs["Strength"].default_value = 0.6
    world.node_tree.links.new(w_bg.outputs["Background"], w_out.inputs["Surface"])

    return {
        "status": "success",
        "breed": "Russian Blue (Sleek, Athletic)",
        "mouth": "Modeled philtrum, upper lip curves & chin",
        "eyes": "Vivid Emerald Green",
        "environment": "House interior with polished wooden table, mug, potted plant, floor & walls",
        "rig_name": arm_obj.name,
        "frames_animated": 32,
    }
