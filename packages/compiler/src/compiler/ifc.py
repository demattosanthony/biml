"""IFC generation using IfcOpenShell (v0.3.0 hierarchical)."""

import ifcopenshell
import ifcopenshell.api
import ifcopenshell.guid
from dataclasses import dataclass
from .ir import JsonIR, MeasurementIR, LevelIR, SpaceIR

# Coordinate system
O = [0.0, 0.0, 0.0]
X = [1.0, 0.0, 0.0]
Z = [0.0, 0.0, 1.0]

# Defaults
DEFAULT_HEIGHT = 3.0
DEFAULT_ROOM_SIZE = 5.0
DEFAULT_GRID_SIZE = 5.0
DEFAULT_DOOR_WIDTH = 0.9
DEFAULT_DOOR_HEIGHT = 2.1
WALL_THICKNESS = 0.2
SLAB_THICKNESS = 0.2


# ============================================================================
# Data Classes
# ============================================================================

@dataclass
class RoomGeometry:
    """Computed room geometry in world coordinates."""
    name: str
    x: float  # World X origin
    y: float  # World Y origin
    width: float  # X dimension
    length: float  # Y dimension
    row: int
    col: int


@dataclass
class WallSpec:
    """Specification for a wall to generate."""
    id: str
    room_name: str
    direction: str  # north, south, east, west
    x: float
    y: float
    length: float
    is_exterior: bool
    neighbor: str | None = None


@dataclass
class DoorPlacement:
    """Computed door placement."""
    name: str
    wall_id: str
    from_room: str
    to_room: str
    position: float  # Position along wall (from wall start)
    width: float
    height: float
    type_ref: str | None = None


# ============================================================================
# Helpers
# ============================================================================

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
    ifc_points = [ifc.createIfcCartesianPoint(_to_floats(p)) for p in points]
    polyline = ifc.createIfcPolyLine(ifc_points)
    profile = ifc.createIfcArbitraryClosedProfileDef("AREA", None, polyline)
    direction = ifc.createIfcDirection([0.0, 0.0, 1.0])
    return ifc.createIfcExtrudedAreaSolid(profile, None, direction, float(height))


def _measurement_to_meters(m: MeasurementIR | float | None, default: float) -> float:
    """Convert a measurement to meters, handling unit conversion."""
    if m is None:
        return default
    if isinstance(m, (int, float)):
        return float(m)

    value = m.value
    unit = m.unit.lower()

    if unit == "m":
        return value
    elif unit == "cm":
        return value / 100.0
    elif unit == "mm":
        return value / 1000.0
    elif unit == "ft":
        return value * 0.3048
    elif unit == "in":
        return value * 0.0254
    else:
        return value  # Assume meters


# ============================================================================
# Geometry Calculation
# ============================================================================

def _calculate_space_geometry(space: SpaceIR, grid_size: float) -> RoomGeometry:
    """Calculate space world position and dimensions from grid position."""
    # Dimensions
    if space.area:
        width = length = space.area.value ** 0.5
    elif space.width and space.length:
        width = space.width.value
        length = space.length.value
    else:
        width = length = DEFAULT_ROOM_SIZE

    # World position from grid (row is Y, col is X)
    if space.position:
        x = space.position.col * grid_size
        y = space.position.row * grid_size
        row, col = space.position.row, space.position.col
    else:
        x = y = 0.0
        row = col = 0

    return RoomGeometry(
        name=space.name,
        x=x,
        y=y,
        width=width,
        length=length,
        row=row,
        col=col,
    )


def _find_adjacent_rooms(
    room_geometries: dict[str, RoomGeometry]
) -> dict[tuple[str, str], str]:
    """
    Build adjacency map: (room_name, direction) -> neighbor_name.
    Two rooms are adjacent if they share a grid edge.
    """
    adjacencies = {}

    rooms = list(room_geometries.values())
    for room in rooms:
        for other in rooms:
            if room.name == other.name:
                continue

            # Check adjacency
            row_diff = other.row - room.row
            col_diff = other.col - room.col

            if row_diff == 0 and col_diff == 1:
                adjacencies[(room.name, "east")] = other.name
            elif row_diff == 0 and col_diff == -1:
                adjacencies[(room.name, "west")] = other.name
            elif col_diff == 0 and row_diff == 1:
                adjacencies[(room.name, "north")] = other.name
            elif col_diff == 0 and row_diff == -1:
                adjacencies[(room.name, "south")] = other.name

    return adjacencies


def _generate_wall_specs(
    room_geometries: dict[str, RoomGeometry],
    adjacencies: dict[tuple[str, str], str],
) -> list[WallSpec]:
    """Generate wall specifications, handling shared walls."""
    walls = []
    generated_shared = set()

    for room_name, geom in room_geometries.items():
        for direction in ["south", "east", "north", "west"]:
            neighbor = adjacencies.get((room_name, direction))

            # Calculate wall position and length
            t = WALL_THICKNESS
            if direction == "south":
                x, y = geom.x, geom.y
                length = geom.width
            elif direction == "north":
                x, y = geom.x, geom.y + geom.length - t
                length = geom.width
            elif direction == "west":
                x, y = geom.x, geom.y
                length = geom.length
            elif direction == "east":
                x, y = geom.x + geom.width - t, geom.y
                length = geom.length

            if neighbor:
                # Shared wall - only generate once
                # Use sorted room names to ensure consistent key regardless of direction
                shared_key = tuple(sorted([room_name, neighbor]))
                if shared_key in generated_shared:
                    continue
                generated_shared.add(shared_key)

                wall_id = f"{room_name}_{direction}_to_{neighbor}"
                walls.append(WallSpec(
                    id=wall_id,
                    room_name=room_name,
                    direction=direction,
                    x=x,
                    y=y,
                    length=length,
                    is_exterior=False,
                    neighbor=neighbor,
                ))
            else:
                # Exterior wall
                wall_id = f"{room_name}_{direction}"
                walls.append(WallSpec(
                    id=wall_id,
                    room_name=room_name,
                    direction=direction,
                    x=x,
                    y=y,
                    length=length,
                    is_exterior=True,
                ))

    return walls


# ============================================================================
# Type Object Generation
# ============================================================================

def _create_door_types(
    ifc: ifcopenshell.file,
    ir: JsonIR,
) -> dict[str, ifcopenshell.entity_instance]:
    """Create IfcDoorType entities from library types."""
    door_types = {}

    for lib in ir.libraries:
        for type_def in lib.types:
            if type_def.family == "Door":
                # Use ifcopenshell.api for cleaner type creation
                door_type = ifcopenshell.api.run(
                    "root.create_entity",
                    ifc,
                    ifc_class="IfcDoorType",
                    name=type_def.name,
                    predefined_type="DOOR",
                )

                # Store for later reference
                door_types[type_def.name] = door_type

    return door_types


# ============================================================================
# IFC Generation - Main Entry Point
# ============================================================================

def compile_to_ifc(ir: JsonIR) -> ifcopenshell.file:
    """Compile JSON IR to IFC file."""
    if not ir.projects:
        raise ValueError("No projects in IR")

    # For now, just compile the first project
    project_ir = ir.projects[0]

    ifc = ifcopenshell.api.run("project.create_file", version="IFC4")

    # Create IFC project with name from IR
    project = ifcopenshell.api.run(
        "root.create_entity", ifc, ifc_class="IfcProject", name=project_ir.name
    )

    ifcopenshell.api.run("unit.assign_unit", ifc, length={"is_metric": True, "raw": "METERS"})

    # Create geometry context
    world_origin = _create_axis2placement(ifc)
    context = ifc.createIfcGeometricRepresentationContext(
        None, "Model", 3, 1.0e-05, world_origin, None
    )

    # Create door types from libraries
    door_types = _create_door_types(ifc, ir)

    # Generate sites
    for site_ir in project_ir.sites:
        site_placement = _create_local_placement(ifc)
        site = ifc.createIfcSite(
            ifcopenshell.guid.new(), None, site_ir.name, None, None,
            site_placement, None, None, "ELEMENT", None, None, None, None, None
        )
        ifc.createIfcRelAggregates(ifcopenshell.guid.new(), None, None, None, project, [site])

        # Generate buildings
        for building_ir in site_ir.buildings:
            building_placement = _create_local_placement(ifc, relative_to=site_placement)
            building = ifc.createIfcBuilding(
                ifcopenshell.guid.new(), None, building_ir.name, None, None,
                building_placement, None, None, "ELEMENT", None, None, None
            )
            ifc.createIfcRelAggregates(ifcopenshell.guid.new(), None, None, None, site, [building])

            # Generate levels
            for level_ir in building_ir.levels:
                _generate_level(
                    ifc, context, building, building_placement,
                    level_ir, ir, door_types
                )

    return ifc


def _generate_level(
    ifc: ifcopenshell.file,
    context,
    building,
    building_placement,
    level_ir: LevelIR,
    ir: JsonIR,
    door_types: dict[str, ifcopenshell.entity_instance],
) -> None:
    """Generate IfcBuildingStorey with spaces, walls and doors."""
    elevation = level_ir.elevation.value if level_ir.elevation else 0.0
    height = level_ir.height.value if level_ir.height else DEFAULT_HEIGHT

    # Create storey
    storey_placement = _create_local_placement(ifc, (0.0, 0.0, elevation), relative_to=building_placement)
    storey = ifc.createIfcBuildingStorey(
        ifcopenshell.guid.new(), None, level_ir.name, None, None,
        storey_placement, None, None, "ELEMENT", elevation
    )
    ifc.createIfcRelAggregates(ifcopenshell.guid.new(), None, None, None, building, [storey])

    if not level_ir.spaces:
        return

    # Calculate space geometries
    space_geometries = {s.name: _calculate_space_geometry(s, DEFAULT_GRID_SIZE) for s in level_ir.spaces}

    # Build adjacency map
    adjacencies = _find_adjacent_rooms(space_geometries)

    # Generate wall specifications
    wall_specs = _generate_wall_specs(space_geometries, adjacencies)

    # Collect all doors from spaces
    door_placements = []
    for space in level_ir.spaces:
        for door in space.doors:
            # For hierarchical, doors are in spaces, so we need to figure out wall placement
            # For now, use explicit wall if provided, otherwise exterior on south
            wall_direction = door.wall if door.wall else "south"
            wall_id = f"{space.name}_{wall_direction}"

            # Find the wall
            wall_spec = None
            for ws in wall_specs:
                if ws.id == wall_id:
                    wall_spec = ws
                    break

            if wall_spec:
                # Get door dimensions from type if available
                door_width = DEFAULT_DOOR_WIDTH
                door_height = DEFAULT_DOOR_HEIGHT

                if door.type_ref:
                    type_def = ir.get_type(door.type_ref)
                    if type_def:
                        width_param = type_def.get_parameter("width")
                        height_param = type_def.get_parameter("height")
                        door_width = _measurement_to_meters(width_param, DEFAULT_DOOR_WIDTH)
                        door_height = _measurement_to_meters(height_param, DEFAULT_DOOR_HEIGHT)

                # Override with explicit door dimensions if provided
                if door.width:
                    door_width = _measurement_to_meters(door.width, door_width)
                if door.height:
                    door_height = _measurement_to_meters(door.height, door_height)

                offset = door.offset if door.offset is not None else 0.5
                position = wall_spec.length * offset

                door_placements.append(DoorPlacement(
                    name=door.name,
                    wall_id=wall_spec.id,
                    from_room=space.name,
                    to_room="exterior",  # For now, all hierarchical doors are exterior
                    position=position,
                    width=door_width,
                    height=door_height,
                    type_ref=door.type_ref,
                ))

    # Generate walls and collect elements
    elements = []
    wall_entities = {}  # wall_id -> (IfcWall, WallSpec)

    for wall_spec in wall_specs:
        wall_entity = _create_wall(ifc, context, storey_placement, wall_spec, height)
        wall_entities[wall_spec.id] = (wall_entity, wall_spec)
        elements.append(wall_entity)

    # Generate floor slabs for each space
    for space in level_ir.spaces:
        geom = space_geometries[space.name]
        slab = _create_floor_slab(ifc, context, storey_placement, space.name, geom)
        elements.append(slab)

    # Create door openings
    for placement in door_placements:
        if placement.wall_id in wall_entities:
            wall_entity, wall_spec = wall_entities[placement.wall_id]
            opening, door_entity = _create_door_with_opening(
                ifc, context, storey_placement,
                wall_entity, wall_spec, placement
            )
            elements.append(opening)
            elements.append(door_entity)

            # Link door to type if available
            if placement.type_ref and placement.type_ref in door_types:
                door_type = door_types[placement.type_ref]
                ifc.createIfcRelDefinesByType(
                    ifcopenshell.guid.new(),
                    None,
                    "Door Type Assignment",
                    None,
                    [door_entity],
                    door_type
                )

    # Contain all elements in storey
    if elements:
        ifc.createIfcRelContainedInSpatialStructure(
            ifcopenshell.guid.new(), None, None, None, elements, storey
        )


# ============================================================================
# Element Creation Helpers
# ============================================================================

def _create_wall(
    ifc: ifcopenshell.file,
    context,
    storey_placement,
    wall_spec: WallSpec,
    height: float,
) -> ifcopenshell.entity_instance:
    """Create a single wall."""
    t = WALL_THICKNESS

    # Wall points depend on direction
    if wall_spec.direction in ["south", "north"]:
        # Horizontal wall (runs along X axis)
        points = [
            (wall_spec.x, wall_spec.y, 0.0),
            (wall_spec.x + wall_spec.length, wall_spec.y, 0.0),
            (wall_spec.x + wall_spec.length, wall_spec.y + t, 0.0),
            (wall_spec.x, wall_spec.y + t, 0.0),
            (wall_spec.x, wall_spec.y, 0.0),
        ]
    else:
        # Vertical wall (runs along Y axis)
        points = [
            (wall_spec.x, wall_spec.y, 0.0),
            (wall_spec.x + t, wall_spec.y, 0.0),
            (wall_spec.x + t, wall_spec.y + wall_spec.length, 0.0),
            (wall_spec.x, wall_spec.y + wall_spec.length, 0.0),
            (wall_spec.x, wall_spec.y, 0.0),
        ]

    solid = _create_extruded_solid(ifc, points, height)
    body_rep = ifc.createIfcShapeRepresentation(context, "Body", "SweptSolid", [solid])
    product_shape = ifc.createIfcProductDefinitionShape(None, None, [body_rep])

    wall_placement = _create_local_placement(ifc, relative_to=storey_placement)

    wall_name = f"{wall_spec.room_name} - {wall_spec.direction.capitalize()} Wall"
    if wall_spec.neighbor:
        wall_name = f"Wall between {wall_spec.room_name} and {wall_spec.neighbor}"

    wall = ifc.createIfcWall(
        ifcopenshell.guid.new(), None, wall_name, None, None,
        wall_placement, product_shape, None
    )

    return wall


def _create_floor_slab(
    ifc: ifcopenshell.file,
    context,
    storey_placement,
    room_name: str,
    geom: RoomGeometry,
) -> ifcopenshell.entity_instance:
    """Create floor slab for a room."""
    t = WALL_THICKNESS

    # Slab inside walls
    points = [
        (geom.x + t, geom.y + t, 0.0),
        (geom.x + geom.width - t, geom.y + t, 0.0),
        (geom.x + geom.width - t, geom.y + geom.length - t, 0.0),
        (geom.x + t, geom.y + geom.length - t, 0.0),
        (geom.x + t, geom.y + t, 0.0),
    ]

    solid = _create_extruded_solid(ifc, points, SLAB_THICKNESS)
    slab_rep = ifc.createIfcShapeRepresentation(context, "Body", "SweptSolid", [solid])
    slab_shape = ifc.createIfcProductDefinitionShape(None, None, [slab_rep])

    slab_placement = _create_local_placement(ifc, relative_to=storey_placement)

    slab = ifc.createIfcSlab(
        ifcopenshell.guid.new(), None, f"{room_name} - Floor", None, None,
        slab_placement, slab_shape, None, "FLOOR"
    )

    return slab


def _create_door_with_opening(
    ifc: ifcopenshell.file,
    context,
    storey_placement,
    wall: ifcopenshell.entity_instance,
    wall_spec: WallSpec,
    placement: DoorPlacement,
) -> tuple[ifcopenshell.entity_instance, ifcopenshell.entity_instance]:
    """Create door with opening in wall."""
    t = WALL_THICKNESS
    door_width = placement.width
    door_height = placement.height

    # Calculate opening position based on wall direction
    if wall_spec.direction in ["south", "north"]:
        # Horizontal wall - door position is along X
        opening_x = wall_spec.x + placement.position - (door_width / 2)
        opening_y = wall_spec.y
    else:
        # Vertical wall - door position is along Y
        opening_x = wall_spec.x
        opening_y = wall_spec.y + placement.position - (door_width / 2)

    # Create opening geometry (rectangular void)
    if wall_spec.direction in ["south", "north"]:
        opening_points = [
            (opening_x, opening_y, 0.0),
            (opening_x + door_width, opening_y, 0.0),
            (opening_x + door_width, opening_y + t, 0.0),
            (opening_x, opening_y + t, 0.0),
            (opening_x, opening_y, 0.0),
        ]
    else:
        opening_points = [
            (opening_x, opening_y, 0.0),
            (opening_x + t, opening_y, 0.0),
            (opening_x + t, opening_y + door_width, 0.0),
            (opening_x, opening_y + door_width, 0.0),
            (opening_x, opening_y, 0.0),
        ]

    opening_solid = _create_extruded_solid(ifc, opening_points, door_height)
    opening_rep = ifc.createIfcShapeRepresentation(context, "Body", "SweptSolid", [opening_solid])
    opening_shape = ifc.createIfcProductDefinitionShape(None, None, [opening_rep])

    opening_placement = _create_local_placement(ifc, relative_to=storey_placement)

    opening = ifc.createIfcOpeningElement(
        ifcopenshell.guid.new(), None,
        f"Opening for {placement.name}",
        None, None,
        opening_placement, opening_shape, None
    )

    # Link opening to wall (creates the cutout)
    ifc.createIfcRelVoidsElement(
        ifcopenshell.guid.new(), None,
        "Wall Opening", None,
        wall,
        opening
    )

    # Create door entity (simplified - just a thin panel)
    door_thickness = 0.05
    if wall_spec.direction in ["south", "north"]:
        door_points = [
            (opening_x, opening_y + t/2 - door_thickness/2, 0.0),
            (opening_x + door_width, opening_y + t/2 - door_thickness/2, 0.0),
            (opening_x + door_width, opening_y + t/2 + door_thickness/2, 0.0),
            (opening_x, opening_y + t/2 + door_thickness/2, 0.0),
            (opening_x, opening_y + t/2 - door_thickness/2, 0.0),
        ]
    else:
        door_points = [
            (opening_x + t/2 - door_thickness/2, opening_y, 0.0),
            (opening_x + t/2 + door_thickness/2, opening_y, 0.0),
            (opening_x + t/2 + door_thickness/2, opening_y + door_width, 0.0),
            (opening_x + t/2 - door_thickness/2, opening_y + door_width, 0.0),
            (opening_x + t/2 - door_thickness/2, opening_y, 0.0),
        ]

    door_solid = _create_extruded_solid(ifc, door_points, door_height)
    door_rep = ifc.createIfcShapeRepresentation(context, "Body", "SweptSolid", [door_solid])
    door_shape = ifc.createIfcProductDefinitionShape(None, None, [door_rep])

    door_placement = _create_local_placement(ifc, relative_to=storey_placement)

    door_entity = ifc.createIfcDoor(
        ifcopenshell.guid.new(), None,
        placement.name,
        None, None,
        door_placement, door_shape, None,
        door_height, door_width
    )

    # Link door to opening
    ifc.createIfcRelFillsElement(
        ifcopenshell.guid.new(), None,
        "Door Fill", None,
        opening,
        door_entity
    )

    return opening, door_entity
