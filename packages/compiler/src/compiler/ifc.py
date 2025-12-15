"""IFC generation using IfcOpenShell (v0.6.0)."""

import ifcopenshell
import ifcopenshell.api
import ifcopenshell.guid
from dataclasses import dataclass
from .ir import (
    JsonIR, MeasurementIR, LevelIR, SpaceIR, SpaceDoorIR,
    DoorOffsetNormalizedIR, DoorOffsetCenterIR, DoorOffsetAbsoluteIR,
    MaterialIR, ColorIR,
)

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
DEFAULT_SLAB_THICKNESS = 0.2
DEFAULT_CEILING_THICKNESS = 0.1
DEFAULT_DOOR_COLOR = ColorIR(red=0.55, green=0.35, blue=0.20)  # Warm wood brown


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
    to_room: str  # "exterior" or room name
    position: float  # Position along wall (from wall start)
    width: float
    height: float
    type_ref: str | None = None
    swing: str | None = None
    material: MaterialIR | None = None


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
    return m.to_meters()


# ============================================================================
# Geometry Calculation
# ============================================================================

def _calculate_space_geometry(space: SpaceIR, grid_size: float) -> RoomGeometry:
    """Calculate space world position and dimensions from grid position."""
    # Calculate dimensions
    if space.area:
        area_m2 = space.area.to_meters()
        if space.aspect:
            # Non-square room with aspect ratio
            # area = width * length
            # width/length = aspect.width_ratio / aspect.length_ratio
            # So: width = sqrt(area * aspect.width_ratio / aspect.length_ratio)
            ratio = space.aspect.width_ratio / space.aspect.length_ratio
            width = (area_m2 * ratio) ** 0.5
            length = area_m2 / width
        else:
            # Square room
            width = length = area_m2 ** 0.5
    elif space.width and space.length:
        width = space.width.to_meters()
        length = space.length.to_meters()
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


def _calculate_door_offset(
    door: SpaceDoorIR,
    wall_length: float,
    door_width: float,
) -> float:
    """Calculate door position along wall based on offset specification."""
    if door.offset is None:
        # Default to center
        return wall_length / 2

    offset = door.offset

    if isinstance(offset, DoorOffsetCenterIR):
        return wall_length / 2

    if isinstance(offset, DoorOffsetNormalizedIR):
        # Normalized 0-1 value
        return wall_length * offset.value

    if isinstance(offset, DoorOffsetAbsoluteIR):
        # Absolute distance from anchor
        distance = offset.distance.to_meters()
        anchor = offset.anchor

        # Map anchor to position
        if anchor in ("left", "start", "west", "south"):
            return distance + (door_width / 2)
        elif anchor in ("right", "end", "east", "north"):
            return wall_length - distance - (door_width / 2)
        else:
            # Default to left
            return distance + (door_width / 2)

    return wall_length / 2


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
                door_type = ifcopenshell.api.run(
                    "root.create_entity",
                    ifc,
                    ifc_class="IfcDoorType",
                    name=type_def.name,
                    predefined_type="DOOR",
                )
                door_types[type_def.name] = door_type

    return door_types


# ============================================================================
# Material & Style Generation (v0.5.0)
# ============================================================================


def _create_surface_style(
    ifc: ifcopenshell.file,
    name: str,
    color: ColorIR,
    transparency: float = 0.0,
) -> ifcopenshell.entity_instance:
    """Create an IfcSurfaceStyle with color using IfcOpenShell API."""
    # Use the IfcOpenShell API for proper style creation
    style = ifcopenshell.api.run("style.add_style", ifc, name=name)

    # Add surface shading with the color
    ifcopenshell.api.run(
        "style.add_surface_style",
        ifc,
        style=style,
        ifc_class="IfcSurfaceStyleShading",
        attributes={
            "SurfaceColour": {
                "Name": None,
                "Red": float(color.red),
                "Green": float(color.green),
                "Blue": float(color.blue),
            },
            "Transparency": float(transparency),
        },
    )

    return style


def _create_material_styles(
    ifc: ifcopenshell.file,
    ir: JsonIR,
) -> dict[str, ifcopenshell.entity_instance]:
    """Create IfcSurfaceStyle entities from all library materials."""
    styles = {}

    for lib in ir.libraries:
        for mat in lib.materials:
            color = mat.color if mat.color else DEFAULT_DOOR_COLOR
            transparency = mat.transparency if mat.transparency else 0.0
            style = _create_surface_style(ifc, mat.name, color, transparency)
            styles[mat.name] = style

    return styles


def _apply_style_to_product(
    ifc: ifcopenshell.file,
    product: ifcopenshell.entity_instance,
    style: ifcopenshell.entity_instance,
) -> None:
    """Apply a surface style to a product's representation using IfcOpenShell API."""
    if not product.Representation:
        return

    for rep in product.Representation.Representations:
        if rep.RepresentationIdentifier == "Body":
            ifcopenshell.api.run(
                "style.assign_representation_styles",
                ifc,
                shape_representation=rep,
                styles=[style],
            )


def _get_door_material(
    door: SpaceDoorIR,
    ir: JsonIR,
) -> MaterialIR | None:
    """Get the material for a door, checking overrides and type defaults."""
    # First check for direct material override on door
    if door.material:
        return ir.get_material(door.material)

    # Then check the type's material
    if door.type_ref:
        type_def = ir.get_type(door.type_ref)
        if type_def and type_def.material:
            return ir.get_material(type_def.material)

    return None


# ============================================================================
# IFC Generation - Main Entry Point
# ============================================================================

def compile_to_ifc(ir: JsonIR) -> ifcopenshell.file:
    """Compile JSON IR to IFC file."""
    if not ir.projects:
        raise ValueError("No projects in IR")

    project_ir = ir.projects[0]

    ifc = ifcopenshell.api.run("project.create_file", version="IFC4")

    project = ifcopenshell.api.run(
        "root.create_entity", ifc, ifc_class="IfcProject", name=project_ir.name
    )

    ifcopenshell.api.run("unit.assign_unit", ifc, length={"is_metric": True, "raw": "METERS"})

    # Create geometry context using proper API for styled representations
    model3d = ifcopenshell.api.run("context.add_context", ifc, context_type="Model")
    context = ifcopenshell.api.run(
        "context.add_context",
        ifc,
        context_type="Model",
        context_identifier="Body",
        target_view="MODEL_VIEW",
        parent=model3d,
    )

    # Create door types from libraries
    door_types = _create_door_types(ifc, ir)

    # Create material styles from libraries
    material_styles = _create_material_styles(ifc, ir)

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

            # Track cumulative elevation for auto-stacking
            cumulative_elevation = 0.0

            # Generate levels
            for level_ir in building_ir.levels:
                # Calculate elevation: use explicit or auto-stack
                if level_ir.elevation is not None:
                    elevation = level_ir.elevation.to_meters()
                else:
                    elevation = cumulative_elevation

                # Get height for next level calculation
                height = level_ir.height.to_meters() if level_ir.height else DEFAULT_HEIGHT

                # Update cumulative for next level
                cumulative_elevation = elevation + height

                _generate_level(
                    ifc, context, building, building_placement,
                    level_ir, ir, door_types, material_styles, elevation
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
    material_styles: dict[str, ifcopenshell.entity_instance],
    elevation: float,
) -> None:
    """Generate IfcBuildingStorey with spaces, walls and doors."""
    height = level_ir.height.to_meters() if level_ir.height else DEFAULT_HEIGHT
    slab_thickness = (
        level_ir.slab_thickness.to_meters()
        if level_ir.slab_thickness
        else DEFAULT_SLAB_THICKNESS
    )
    ceiling_thickness = (
        level_ir.ceiling_thickness.to_meters()
        if level_ir.ceiling_thickness
        else DEFAULT_CEILING_THICKNESS
    )

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

    # Build map of wall IDs for door placement
    wall_map = {ws.id: ws for ws in wall_specs}

    # Also create reverse lookup for interior walls (shared between rooms)
    # This allows doors with "connects" to find the correct wall
    for ws in wall_specs:
        if ws.neighbor:
            # Create aliases so doors from either room can find this wall
            reverse_id = f"{ws.neighbor}_{_opposite_direction(ws.direction)}_to_{ws.room_name}"
            wall_map[reverse_id] = ws
            # Also add simple format for the neighbor side
            wall_map[f"{ws.neighbor}_{_opposite_direction(ws.direction)}"] = ws

    # Collect all doors from spaces
    door_placements = []
    for space in level_ir.spaces:
        for door in space.doors:
            placement = _calculate_door_placement(
                door, space, space_geometries, wall_map, adjacencies, ir
            )
            if placement:
                # Resolve material for this door
                material = _get_door_material(door, ir)
                placement.material = material
                door_placements.append(placement)

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
        slab = _create_floor_slab(ifc, context, storey_placement, space.name, geom, slab_thickness)
        elements.append(slab)

    # Generate ceilings for each space
    for space in level_ir.spaces:
        geom = space_geometries[space.name]
        ceiling = _create_ceiling_covering(
            ifc, context, storey_placement, space.name, geom, height, ceiling_thickness
        )
        elements.append(ceiling)

    # Create door openings
    for placement in door_placements:
        wall_id = placement.wall_id
        # Find the wall - check both the exact ID and aliases
        wall_data = wall_entities.get(wall_id)
        if not wall_data:
            # Try to find by alternate naming
            for wid, (we, ws) in wall_entities.items():
                if wid == wall_id or wall_id in wid:
                    wall_data = (we, ws)
                    break

        if wall_data:
            wall_entity, wall_spec = wall_data
            opening, door_entity = _create_door_with_opening(
                ifc, context, storey_placement,
                wall_entity, wall_spec, placement
            )
            elements.append(opening)
            elements.append(door_entity)

            # Apply material style to door if available
            if placement.material and placement.material.name in material_styles:
                style = material_styles[placement.material.name]
                _apply_style_to_product(ifc, door_entity, style)

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


def _opposite_direction(direction: str) -> str:
    """Get the opposite wall direction."""
    opposites = {
        "north": "south",
        "south": "north",
        "east": "west",
        "west": "east",
    }
    return opposites.get(direction, direction)


def _calculate_door_placement(
    door: SpaceDoorIR,
    space: SpaceIR,
    space_geometries: dict[str, RoomGeometry],
    wall_map: dict[str, WallSpec],
    adjacencies: dict[tuple[str, str], str],
    ir: JsonIR,
) -> DoorPlacement | None:
    """Calculate door placement, handling both exterior and interior doors."""
    # Determine wall direction
    wall_direction = door.wall if door.wall else "south"

    # Determine target room
    if door.connects:
        # Interior door - connects to another room
        target_room = door.connects
        # Check if this is a valid adjacency
        actual_neighbor = adjacencies.get((space.name, wall_direction))
        if actual_neighbor != target_room:
            # Door connects to a room that isn't adjacent on this wall
            # Try to find the correct wall direction
            for dir_check in ["north", "south", "east", "west"]:
                if adjacencies.get((space.name, dir_check)) == target_room:
                    wall_direction = dir_check
                    break
    else:
        # Exterior door
        target_room = "exterior"

    # Build wall ID
    neighbor = adjacencies.get((space.name, wall_direction))
    if neighbor and (target_room == neighbor or target_room == "exterior"):
        # Shared wall
        wall_id = f"{space.name}_{wall_direction}_to_{neighbor}"
    else:
        # Exterior wall
        wall_id = f"{space.name}_{wall_direction}"

    # Get wall spec
    wall_spec = wall_map.get(wall_id)
    if not wall_spec:
        # Try alternate format
        for wid, ws in wall_map.items():
            if space.name in wid and wall_direction in wid:
                wall_spec = ws
                wall_id = wid
                break

    if not wall_spec:
        return None

    # Get door dimensions from type or inline
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
        door_width = door.width.to_meters()
    if door.height:
        door_height = door.height.to_meters()

    # Calculate position along wall
    position = _calculate_door_offset(door, wall_spec.length, door_width)

    return DoorPlacement(
        name=door.name,
        wall_id=wall_id,
        from_room=space.name,
        to_room=target_room if target_room != "exterior" else "exterior",
        position=position,
        width=door_width,
        height=door_height,
        type_ref=door.type_ref,
        swing=door.swing,
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
    slab_thickness: float = DEFAULT_SLAB_THICKNESS,
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

    solid = _create_extruded_solid(ifc, points, slab_thickness)
    slab_rep = ifc.createIfcShapeRepresentation(context, "Body", "SweptSolid", [solid])
    slab_shape = ifc.createIfcProductDefinitionShape(None, None, [slab_rep])

    slab_placement = _create_local_placement(ifc, relative_to=storey_placement)

    slab = ifc.createIfcSlab(
        ifcopenshell.guid.new(), None, f"{room_name} - Floor", None, None,
        slab_placement, slab_shape, None, "FLOOR"
    )

    return slab


def _create_ceiling_covering(
    ifc: ifcopenshell.file,
    context,
    storey_placement,
    room_name: str,
    geom: RoomGeometry,
    height: float,
    thickness: float = DEFAULT_CEILING_THICKNESS,
) -> ifcopenshell.entity_instance:
    """Create ceiling covering for a room."""
    t = WALL_THICKNESS
    base_z = max(height - thickness, 0.0)

    points = [
        (geom.x + t, geom.y + t, 0.0),
        (geom.x + geom.width - t, geom.y + t, 0.0),
        (geom.x + geom.width - t, geom.y + geom.length - t, 0.0),
        (geom.x + t, geom.y + geom.length - t, 0.0),
        (geom.x + t, geom.y + t, 0.0),
    ]

    solid = _create_extruded_solid(ifc, points, thickness)
    ceiling_rep = ifc.createIfcShapeRepresentation(context, "Body", "SweptSolid", [solid])
    ceiling_shape = ifc.createIfcProductDefinitionShape(None, None, [ceiling_rep])

    ceiling_placement = _create_local_placement(
        ifc, point=(0.0, 0.0, base_z), relative_to=storey_placement
    )

    ceiling = ifc.createIfcCovering(
        ifcopenshell.guid.new(), None, f"{room_name} - Ceiling", None, None,
        ceiling_placement, ceiling_shape, None, "CEILING"
    )

    return ceiling


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

    # Door description includes connection info
    door_desc = None
    if placement.to_room != "exterior":
        door_desc = f"Connects {placement.from_room} to {placement.to_room}"

    door_entity = ifc.createIfcDoor(
        ifcopenshell.guid.new(), None,
        placement.name,
        door_desc, None,
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
