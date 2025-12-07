"""IFC generation using IfcOpenShell."""

import ifcopenshell
import ifcopenshell.api
from .ir import JsonIR, ProjectIR, FloorIR, RoomIR

# Coordinate system
O = [0.0, 0.0, 0.0]
X = [1.0, 0.0, 0.0]
Z = [0.0, 0.0, 1.0]

# Defaults
DEFAULT_HEIGHT = 3.0
DEFAULT_ROOM_SIZE = 5.0
WALL_THICKNESS = 0.2
SLAB_THICKNESS = 0.2
WALL_GAP = 0.5


def compile_to_ifc(ir: JsonIR) -> ifcopenshell.file:
    """Compile JSON IR to IFC file."""
    if not ir.projects:
        raise ValueError("No projects in IR")

    project_ir = ir.projects[0]
    return _generate_project(project_ir)


def _to_floats(coords):
    """Convert coordinates to list of floats."""
    return [float(c) for c in coords]


def _create_axis2placement(ifc, point=None, dir1=None, dir2=None):
    """Create an IfcAxis2Placement3D."""
    point = ifc.createIfcCartesianPoint(_to_floats(point) if point else O)
    dir1 = ifc.createIfcDirection(_to_floats(dir1) if dir1 else Z)
    dir2 = ifc.createIfcDirection(_to_floats(dir2) if dir2 else X)
    return ifc.createIfcAxis2Placement3D(point, dir1, dir2)


def _create_local_placement(ifc, point=None, relative_to=None):
    """Create an IfcLocalPlacement."""
    axis2placement = _create_axis2placement(ifc, point if point else O)
    return ifc.createIfcLocalPlacement(relative_to, axis2placement)


def _create_extruded_solid(ifc, points, height):
    """Create an extruded area solid from a 2D point list."""
    # Create polyline from points (convert to lists of floats)
    ifc_points = [ifc.createIfcCartesianPoint(_to_floats(p)) for p in points]
    polyline = ifc.createIfcPolyLine(ifc_points)

    # Create profile and extrusion
    profile = ifc.createIfcArbitraryClosedProfileDef("AREA", None, polyline)
    direction = ifc.createIfcDirection([0.0, 0.0, 1.0])
    return ifc.createIfcExtrudedAreaSolid(profile, None, direction, float(height))


def _generate_project(project_ir: ProjectIR) -> ifcopenshell.file:
    """Generate IFC file from a project."""
    ifc = ifcopenshell.api.run("project.create_file", version="IFC4")

    project = ifcopenshell.api.run(
        "root.create_entity", ifc, ifc_class="IfcProject", name=project_ir.name
    )

    ifcopenshell.api.run("unit.assign_unit", ifc, length={"is_metric": True, "raw": "METERS"})

    # Create geometry context
    world_origin = _create_axis2placement(ifc)
    context = ifc.createIfcGeometricRepresentationContext(
        None, "Model", 3, 1.0e-05, world_origin, None
    )

    # Spatial hierarchy with placements
    site_placement = _create_local_placement(ifc)
    site = ifc.createIfcSite(
        ifcopenshell.guid.new(), None, "Site", None, None,
        site_placement, None, None, "ELEMENT", None, None, None, None, None
    )

    building_placement = _create_local_placement(ifc, relative_to=site_placement)
    building = ifc.createIfcBuilding(
        ifcopenshell.guid.new(), None, project_ir.name, None, None,
        building_placement, None, None, "ELEMENT", None, None, None
    )

    # Link spatial hierarchy
    ifc.createIfcRelAggregates(ifcopenshell.guid.new(), None, None, None, project, [site])
    ifc.createIfcRelAggregates(ifcopenshell.guid.new(), None, None, None, site, [building])

    # Generate floors
    for floor_ir in project_ir.floors:
        _generate_floor(ifc, context, building, building_placement, floor_ir)

    return ifc


def _generate_floor(
    ifc: ifcopenshell.file,
    context,
    building,
    building_placement,
    floor_ir: FloorIR,
) -> ifcopenshell.entity_instance:
    """Generate IfcBuildingStorey with walls."""
    elevation = floor_ir.elevation.value if floor_ir.elevation else 0.0
    height = floor_ir.height.value if floor_ir.height else DEFAULT_HEIGHT

    storey_placement = _create_local_placement(ifc, (0.0, 0.0, elevation), relative_to=building_placement)
    storey = ifc.createIfcBuildingStorey(
        ifcopenshell.guid.new(), None, floor_ir.name, None, None,
        storey_placement, None, None, "ELEMENT", elevation
    )
    ifc.createIfcRelAggregates(ifcopenshell.guid.new(), None, None, None, building, [storey])

    # Generate walls + floor slab per room
    elements = []
    x_offset = 0.0

    for room_ir in floor_ir.rooms:
        room_elements = _generate_room_elements(ifc, context, storey_placement, room_ir, height, x_offset)
        elements.extend(room_elements)

        # Move offset for next room
        width = room_ir.width.value if room_ir.width else DEFAULT_ROOM_SIZE
        if room_ir.area:
            width = room_ir.area.value ** 0.5
        x_offset += width + WALL_GAP

    if elements:
        ifc.createIfcRelContainedInSpatialStructure(
            ifcopenshell.guid.new(), None, None, None, elements, storey
        )

    return storey


def _generate_room_elements(
    ifc: ifcopenshell.file,
    context,
    storey_placement,
    room_ir: RoomIR,
    height: float,
    x_offset: float,
) -> list[ifcopenshell.entity_instance]:
    """Generate 4 walls + floor slab for a room."""
    # Derive dimensions
    if room_ir.area:
        width = length = room_ir.area.value ** 0.5
    elif room_ir.width and room_ir.length:
        width = room_ir.width.value
        length = room_ir.length.value
    else:
        width = length = DEFAULT_ROOM_SIZE

    t = WALL_THICKNESS
    room_placement = _create_local_placement(ifc, (x_offset, 0.0, 0.0), relative_to=storey_placement)

    elements = []

    # Floor slab (inside walls, flush with bottom)
    slab_points = [(t, t, 0.0), (width - t, t, 0.0), (width - t, length - t, 0.0), (t, length - t, 0.0), (t, t, 0.0)]
    slab_solid = _create_extruded_solid(ifc, slab_points, SLAB_THICKNESS)
    slab_rep = ifc.createIfcShapeRepresentation(context, "Body", "SweptSolid", [slab_solid])
    slab_shape = ifc.createIfcProductDefinitionShape(None, None, [slab_rep])
    slab = ifc.createIfcSlab(
        ifcopenshell.guid.new(), None, f"{room_ir.name} - Floor", None, None,
        room_placement, slab_shape, None, "FLOOR"
    )
    elements.append(slab)

    # 4 walls: South, East, North, West (same base as slab)
    wall_specs = [
        (f"{room_ir.name} - South", [(0, 0), (width, 0), (width, t), (0, t), (0, 0)]),
        (f"{room_ir.name} - East", [(width - t, 0), (width, 0), (width, length), (width - t, length), (width - t, 0)]),
        (f"{room_ir.name} - North", [(0, length - t), (width, length - t), (width, length), (0, length), (0, length - t)]),
        (f"{room_ir.name} - West", [(0, 0), (t, 0), (t, length), (0, length), (0, 0)]),
    ]

    for name, points_2d in wall_specs:
        points = [(p[0], p[1], 0.0) for p in points_2d]
        solid = _create_extruded_solid(ifc, points, height)
        body_rep = ifc.createIfcShapeRepresentation(context, "Body", "SweptSolid", [solid])
        product_shape = ifc.createIfcProductDefinitionShape(None, None, [body_rep])

        wall = ifc.createIfcWall(
            ifcopenshell.guid.new(), None, name, None, None,
            room_placement, product_shape, None
        )
        elements.append(wall)

    return elements
