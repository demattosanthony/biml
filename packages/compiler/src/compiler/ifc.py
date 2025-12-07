"""IFC generation using IfcOpenShell (v0.2.0 with door openings)."""

import ifcopenshell
import ifcopenshell.api
import ifcopenshell.guid
from dataclasses import dataclass
from .ir import JsonIR, FloorIR, RoomIR, DoorIR

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
    wall_id: str
    from_room: str
    to_room: str
    position: float  # Position along wall (from wall start)
    width: float
    height: float


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


# ============================================================================
# Geometry Calculation
# ============================================================================

def _calculate_room_geometry(room: RoomIR, grid_size: float) -> RoomGeometry:
    """Calculate room world position and dimensions from grid position."""
    # Dimensions
    if room.area:
        width = length = room.area.value ** 0.5
    elif room.width and room.length:
        width = room.width.value
        length = room.length.value
    else:
        width = length = DEFAULT_ROOM_SIZE

    # World position from grid (row is Y, col is X)
    x = room.position.col * grid_size
    y = room.position.row * grid_size

    return RoomGeometry(
        name=room.name,
        x=x,
        y=y,
        width=width,
        length=length,
        row=room.position.row,
        col=room.position.col,
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


def _find_wall_for_door(
    door: DoorIR,
    adjacencies: dict[tuple[str, str], str],
    walls: list[WallSpec],
) -> tuple[WallSpec | None, str]:
    """Find the wall that a door should cut through."""
    from_room = door.from_room
    to_room = door.to

    # For exterior doors, find the specified wall
    if to_room == "exterior":
        if not door.wall:
            return None, "Exterior doors must specify 'wall' direction"

        wall_id = f"{from_room}_{door.wall}"
        for wall in walls:
            if wall.id == wall_id:
                return wall, ""
        return None, f"No {door.wall} wall found for room {from_room}"

    # For room-to-room doors, find shared wall
    direction = None
    for (room, dir), neighbor in adjacencies.items():
        if room == from_room and neighbor == to_room:
            direction = dir
            break
        if room == to_room and neighbor == from_room:
            # Flip direction
            flip = {"north": "south", "south": "north", "east": "west", "west": "east"}
            direction = flip[dir]
            break

    if not direction:
        # Use explicit wall if provided
        direction = door.wall
        if not direction:
            return None, f"Rooms {from_room} and {to_room} are not adjacent"

    # Find the wall
    for wall in walls:
        if wall.room_name == from_room and wall.direction == direction:
            return wall, ""
        # Check if it's a shared wall owned by the other room
        if wall.neighbor == from_room and wall.room_name == to_room:
            return wall, ""

    return None, f"Could not find wall between {from_room} and {to_room}"


# ============================================================================
# IFC Generation
# ============================================================================

def compile_to_ifc(ir: JsonIR) -> ifcopenshell.file:
    """Compile JSON IR to IFC file."""
    if not ir.floors:
        raise ValueError("No floors in IR")

    ifc = ifcopenshell.api.run("project.create_file", version="IFC4")

    # Create project
    project = ifcopenshell.api.run(
        "root.create_entity", ifc, ifc_class="IfcProject", name="Building"
    )

    ifcopenshell.api.run("unit.assign_unit", ifc, length={"is_metric": True, "raw": "METERS"})

    # Create geometry context
    world_origin = _create_axis2placement(ifc)
    context = ifc.createIfcGeometricRepresentationContext(
        None, "Model", 3, 1.0e-05, world_origin, None
    )

    # Spatial hierarchy
    site_placement = _create_local_placement(ifc)
    site = ifc.createIfcSite(
        ifcopenshell.guid.new(), None, "Site", None, None,
        site_placement, None, None, "ELEMENT", None, None, None, None, None
    )

    building_placement = _create_local_placement(ifc, relative_to=site_placement)
    building = ifc.createIfcBuilding(
        ifcopenshell.guid.new(), None, "Building", None, None,
        building_placement, None, None, "ELEMENT", None, None, None
    )

    ifc.createIfcRelAggregates(ifcopenshell.guid.new(), None, None, None, project, [site])
    ifc.createIfcRelAggregates(ifcopenshell.guid.new(), None, None, None, site, [building])

    # Group rooms by floor
    rooms_by_floor: dict[str, list[RoomIR]] = {}
    for room in ir.rooms:
        floor_name = room.floor
        if floor_name not in rooms_by_floor:
            rooms_by_floor[floor_name] = []
        rooms_by_floor[floor_name].append(room)

    # Generate each floor
    for floor_ir in ir.floors:
        floor_rooms = rooms_by_floor.get(floor_ir.name, [])
        _generate_floor(
            ifc, context, building, building_placement,
            floor_ir, floor_rooms, ir.doors
        )

    return ifc


def _generate_floor(
    ifc: ifcopenshell.file,
    context,
    building,
    building_placement,
    floor_ir: FloorIR,
    rooms: list[RoomIR],
    all_doors: list[DoorIR],
) -> None:
    """Generate IfcBuildingStorey with walls and door openings."""
    elevation = floor_ir.elevation.value if floor_ir.elevation else 0.0
    height = floor_ir.height.value if floor_ir.height else DEFAULT_HEIGHT

    # Create storey
    storey_placement = _create_local_placement(ifc, (0.0, 0.0, elevation), relative_to=building_placement)
    storey = ifc.createIfcBuildingStorey(
        ifcopenshell.guid.new(), None, floor_ir.name, None, None,
        storey_placement, None, None, "ELEMENT", elevation
    )
    ifc.createIfcRelAggregates(ifcopenshell.guid.new(), None, None, None, building, [storey])

    if not rooms:
        return

    # Calculate room geometries
    room_geometries = {r.name: _calculate_room_geometry(r, DEFAULT_GRID_SIZE) for r in rooms}

    # Build adjacency map
    adjacencies = _find_adjacent_rooms(room_geometries)

    # Generate wall specifications
    wall_specs = _generate_wall_specs(room_geometries, adjacencies)

    # Filter doors for this floor
    floor_room_names = {r.name for r in rooms}
    floor_doors = [d for d in all_doors if d.from_room in floor_room_names]

    # Calculate door placements
    door_placements = []
    for door in floor_doors:
        wall, _ = _find_wall_for_door(door, adjacencies, wall_specs)
        if wall:
            offset = door.offset if door.offset is not None else 0.5
            door_width = door.width.value if door.width else DEFAULT_DOOR_WIDTH
            door_height = door.height.value if door.height else DEFAULT_DOOR_HEIGHT

            # Position along wall
            position = wall.length * offset

            door_placements.append(DoorPlacement(
                wall_id=wall.id,
                from_room=door.from_room,
                to_room=door.to,
                position=position,
                width=door_width,
                height=door_height,
            ))

    # Generate walls and collect elements
    elements = []
    wall_entities = {}  # wall_id -> IfcWall

    for wall_spec in wall_specs:
        wall_entity = _create_wall(ifc, context, storey_placement, wall_spec, height)
        wall_entities[wall_spec.id] = (wall_entity, wall_spec)
        elements.append(wall_entity)

    # Generate floor slabs for each room
    for room in rooms:
        geom = room_geometries[room.name]
        slab = _create_floor_slab(ifc, context, storey_placement, room.name, geom)
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

    # Contain all elements in storey
    if elements:
        ifc.createIfcRelContainedInSpatialStructure(
            ifcopenshell.guid.new(), None, None, None, elements, storey
        )


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
        f"Opening for door from {placement.from_room} to {placement.to_room}",
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
        f"Door from {placement.from_room} to {placement.to_room}",
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
