"""Build the extruded JB flag mark from flag_shapes.json and render a preview.

blender --background --python build_flag.py
"""
import json
import math
from pathlib import Path

import bpy

HERE = Path(__file__).parent
WHITE = (1.0, 1.0, 1.0, 1.0)
NAVY = (0.0065, 0.0116, 0.0194, 1.0)  # #131C26 in linear space
WIDTH = 2.0        # model width in metres
DEPTH = 0.06       # half-thickness of the extrusion
BEVEL = 0.008

data = json.loads((HERE / "flag_shapes.json").read_text())
k = WIDTH / data["width"]
cx, cy = data["width"] / 2, data["height"] / 2

bpy.ops.wm.read_factory_settings(use_empty=True)
scene = bpy.context.scene


def material(name, color, rough):
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    bsdf = m.node_tree.nodes["Principled BSDF"]
    bsdf.inputs["Base Color"].default_value = color
    bsdf.inputs["Roughness"].default_value = rough
    return m


# One curve with a spline per shape, extruded and bevelled, then baked to mesh.
curve = bpy.data.curves.new("FlagMark", "CURVE")
curve.dimensions = "2D"
curve.fill_mode = "BOTH"
curve.extrude = DEPTH
curve.bevel_depth = BEVEL
curve.bevel_resolution = 3
for shape in data["shapes"]:
    sp = curve.splines.new("POLY")
    sp.points.add(len(shape) - 1)
    for p, (x, y) in zip(sp.points, shape):
        p.co = ((x - cx) * k, (cy - y) * k, 0, 1)  # image y points down
    sp.use_cyclic_u = True

mark = bpy.data.objects.new("FlagMark", curve)
scene.collection.objects.link(mark)
mark.data.materials.append(material("Mark White", WHITE, 0.35))
bpy.context.view_layer.objects.active = mark
mark.select_set(True)
bpy.ops.object.convert(target="MESH")
if hasattr(bpy.ops.object, "shade_smooth_by_angle"):  # Blender 4.1+
    bpy.ops.object.shade_smooth_by_angle(angle=math.radians(30))
mark.rotation_euler = (math.radians(90), 0, 0)  # stand it upright, facing -Y

# Navy floor/backdrop so the white mark reads in the brand colours.
bpy.ops.mesh.primitive_plane_add(size=30, location=(0, 0, -data["height"] * k / 2 - DEPTH))
floor = bpy.context.object
floor.name = "Backdrop"
floor.data.materials.append(material("Navy", NAVY, 0.6))

world = bpy.data.worlds.new("World")
world.use_nodes = True
world.node_tree.nodes["Background"].inputs["Color"].default_value = NAVY
world.node_tree.nodes["Background"].inputs["Strength"].default_value = 1.0
scene.world = world

for name, loc, energy, size in (
    ("Key", (-2.5, -3.5, 3.0), 600, 2.5),
    ("Rim", (3.0, 2.0, 2.5), 400, 1.5),
    ("Fill", (3.0, -3.0, 0.5), 120, 3.0),
):
    light = bpy.data.lights.new(name, "AREA")
    light.energy, light.size = energy, size
    obj = bpy.data.objects.new(name, light)
    obj.location = loc
    scene.collection.objects.link(obj)
    track = obj.constraints.new("TRACK_TO")
    track.target = mark

cam = bpy.data.objects.new("Camera", bpy.data.cameras.new("Camera"))
cam.location = (1.6, -4.2, 0.9)
cam.data.lens = 60
scene.collection.objects.link(cam)
cam.constraints.new("TRACK_TO").target = mark
scene.camera = cam

engines = [e.identifier for e in bpy.types.RenderSettings.bl_rna.properties["engine"].enum_items]
scene.render.engine = "BLENDER_EEVEE_NEXT" if "BLENDER_EEVEE_NEXT" in engines else "BLENDER_EEVEE"
scene.render.resolution_x, scene.render.resolution_y = 1920, 1080
scene.render.filepath = str(HERE / "flag_render.png")
scene.view_settings.view_transform = "AgX" if "AgX" in [
    t.identifier for t in scene.view_settings.bl_rna.properties["view_transform"].enum_items
] else "Filmic"

bpy.ops.wm.save_as_mainfile(filepath=str(HERE / "flag_mark.blend"))
bpy.ops.render.render(write_still=True)
for obj in scene.objects:
    obj.select_set(obj is mark)
bpy.ops.export_scene.gltf(filepath=str(HERE / "flag_mark.glb"), use_selection=True)
print("built", len(mark.data.vertices), "verts")
