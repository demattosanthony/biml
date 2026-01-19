"""IFC generation for BIML using IfcOpenShell."""

import math
import ifcopenshell
import ifcopenshell.api
import ifcopenshell.guid
from dataclasses import dataclass


from .ir import (
    JsonIR,
    MeasurementIR,
    LevelIR,
    WallIR,
    SpaceIR,
    DoorIR,
    WindowIR,
    ColumnIR,
    FurnitureIR,
    SlabIR,
    DoorPositionIR,
    MaterialIR,
    ColorIR,
    TypeIR,
    Point2DIR,
)

# ============================================================================
# Constants
# ============================================================================

# Coordinate system
O = [0.0, 0.0, 0.0]
X = [1.0, 0.0, 0.0]
Z = [0.0, 0.0, 1.0]

# Defaults
DEFAULT_WALL_THICKNESS = 0.2
DEFAULT_WALL_HEIGHT = 3.0
DEFAULT_FLOOR_THICKNESS = 0.2
DEFAULT_CEILING_THICKNESS = 0.1
DEFAULT_DOOR_WIDTH = 0.9
DEFAULT_DOOR_HEIGHT = 2.1
DEFAULT_WINDOW_WIDTH = 1.2
DEFAULT_WINDOW_HEIGHT = 1.5
DEFAULT_WINDOW_SILL = 0.9
DEFAULT_COLUMN_SIZE = 0.4
DEFAULT_DOOR_COLOR = ColorIR(red=0.55, green=0.35, blue=0.20)


# ============================================================================
# Helper Functions
# ============================================================================


def _to_floats(coords: list | tuple) -> list[float]:
    """Convert coordinates to list of floats."""
    values = [float(c) for c in coords]
    return values


def _measurement_to_meters(m: MeasurementIR | None, default: float) -> float:
    """Convert a measurement to meters."""
    if m is None:
        return default
    return m.to_meters()


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


def _create_extruded_solid(ifc, points: list[tuple], height: float):
    """Create an extruded area solid from a 2D point list."""
    ifc_points = [ifc.createIfcCartesianPoint(_to_floats(p)) for p in points]
    polyline = ifc.createIfcPolyLine(ifc_points)
    profile = ifc.createIfcArbitraryClosedProfileDef("AREA", None, polyline)
    direction = ifc.createIfcDirection([0.0, 0.0, 1.0])
    return ifc.createIfcExtrudedAreaSolid(profile, None, direction, float(height))


# ============================================================================
# Wall Geometry Calculation
# ============================================================================


@dataclass
class WallGeometry:
    """Computed wall geometry in world coordinates."""

    name: str
    start_x: float
    start_y: float
    end_x: float
    end_y: float
    thickness: float
    height: float
    length: float
    angle: float  # Angle in radians from X axis


def _calculate_wall_geometry(wall: WallIR, defaults: dict) -> WallGeometry:
    """Calculate wall geometry from IR."""
    thickness = _measurement_to_meters(
        wall.thickness, defaults.get("wall_thickness", DEFAULT_WALL_THICKNESS)
    )
    height = _measurement_to_meters(
        wall.height, defaults.get("wall_height", DEFAULT_WALL_HEIGHT)
    )

    dx = wall.end.x - wall.start.x
    dy = wall.end.y - wall.start.y
    length = math.sqrt(dx * dx + dy * dy)
    angle = math.atan2(dy, dx)

    return WallGeometry(
        name=wall.name,
        start_x=wall.start.x,
        start_y=wall.start.y,
        end_x=wall.end.x,
        end_y=wall.end.y,
        thickness=thickness,
        height=height,
        length=length,
        angle=angle,
    )


def _get_wall_profile_points(geom: WallGeometry) -> list[tuple]:
    """Get the 4 corner points of a wall's footprint."""
    # Wall runs from start to end, with thickness perpendicular
    # Calculate perpendicular offset
    perp_x = -math.sin(geom.angle) * geom.thickness / 2
    perp_y = math.cos(geom.angle) * geom.thickness / 2

    return [
        (geom.start_x - perp_x, geom.start_y - perp_y, 0.0),
        (geom.end_x - perp_x, geom.end_y - perp_y, 0.0),
        (geom.end_x + perp_x, geom.end_y + perp_y, 0.0),
        (geom.start_x + perp_x, geom.start_y + perp_y, 0.0),
        (geom.start_x - perp_x, geom.start_y - perp_y, 0.0),  # Close the loop
    ]


# ============================================================================
# Door/Window Position Calculation
# ============================================================================


def _calculate_opening_position(
    position: DoorPositionIR,
    wall_geom: WallGeometry,
    opening_width: float,
) -> float:
    """Calculate opening position along wall (distance from wall start to opening center)."""
    if position.kind == "center":
        return wall_geom.length / 2
    elif position.kind == "absolute":
        return _measurement_to_meters(position.value, wall_geom.length / 2)
    elif position.kind == "from_anchor":
        distance = _measurement_to_meters(position.value, 0)
        anchor = position.anchor or "start"

        if anchor in ("start", "left", "west", "south"):
            return distance + opening_width / 2
        elif anchor in ("end", "right", "east", "north"):
            return wall_geom.length - distance - opening_width / 2
        else:
            return distance + opening_width / 2

    return wall_geom.length / 2


# ============================================================================
# Material & Style Creation
# ============================================================================


def _create_surface_style(
    ifc: ifcopenshell.file,
    name: str,
    color: ColorIR,
    transparency: float = 0.0,
) -> ifcopenshell.entity_instance:
    """Create an IfcSurfaceStyle with color."""
    style = ifcopenshell.api.run("style.add_style", ifc, name=name)
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
    """Apply a surface style to a product's representation."""
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


# ============================================================================
# Type Object Creation
# ============================================================================


def _create_typed_objects(
    ifc: ifcopenshell.file,
    ir: JsonIR,
) -> tuple[
    dict[str, ifcopenshell.entity_instance], dict[str, ifcopenshell.entity_instance]
]:
    """Create IfcDoorType and IfcWindowType entities from library types."""
    door_types: dict[str, ifcopenshell.entity_instance] = {}
    window_types: dict[str, ifcopenshell.entity_instance] = {}

    for lib in ir.libraries:
        for type_def in lib.types:
            if type_def.ifc_class == "IfcDoor":
                door_type = ifcopenshell.api.run(
                    "root.create_entity",
                    ifc,
                    ifc_class="IfcDoorType",
                    name=type_def.name,
                    predefined_type="DOOR",
                )
                door_types[type_def.name] = door_type
            elif type_def.ifc_class == "IfcWindow":
                window_type = ifcopenshell.api.run(
                    "root.create_entity",
                    ifc,
                    ifc_class="IfcWindowType",
                    name=type_def.name,
                    predefined_type="WINDOW",
                )
                window_types[type_def.name] = window_type

    return door_types, window_types


# ============================================================================
# Type Parameter Resolution
# ============================================================================


def _get_type_parameter(
    type_def: TypeIR, name: str, ir: JsonIR
) -> MeasurementIR | float | None:
    """Get a resolved parameter value from a type, following inheritance chain."""
    # Resolve full inheritance chain
    resolved = ir.resolve_type_inheritance(type_def)
    value = resolved.get_parameter_value(name)

    if isinstance(value, MeasurementIR):
        return value
    elif isinstance(value, (int, float)):
        return MeasurementIR(value=value, unit="m")
    return None


# ============================================================================
# Element Creation
# ============================================================================


def _create_wall(
    ifc: ifcopenshell.file,
    context,
    storey_placement,
    wall_geom: WallGeometry,
) -> ifcopenshell.entity_instance:
    """Create an IfcWall from wall geometry."""
    points = _get_wall_profile_points(wall_geom)
    solid = _create_extruded_solid(ifc, points, wall_geom.height)

    body_rep = ifc.createIfcShapeRepresentation(context, "Body", "SweptSolid", [solid])
    product_shape = ifc.createIfcProductDefinitionShape(None, None, [body_rep])

    wall_placement = _create_local_placement(ifc, relative_to=storey_placement)

    wall = ifc.createIfcWall(
        ifcopenshell.guid.new(),
        None,
        wall_geom.name,
        None,
        None,
        wall_placement,
        product_shape,
        None,
    )

    return wall


def _create_door_with_opening(
    ifc: ifcopenshell.file,
    context,
    storey_placement,
    wall_entity: ifcopenshell.entity_instance,
    wall_geom: WallGeometry,
    door: DoorIR,
    ir: JsonIR,
    defaults: dict,
) -> tuple[ifcopenshell.entity_instance, ifcopenshell.entity_instance]:
    """Create a door with its opening."""
    # Get door dimensions from type or inline
    door_width = DEFAULT_DOOR_WIDTH
    door_height = DEFAULT_DOOR_HEIGHT

    if door.type_ref:
        type_def = ir.get_type(door.type_ref)
        if type_def:
            width_val = _get_type_parameter(type_def, "width", ir)
            height_val = _get_type_parameter(type_def, "height", ir)
            if isinstance(width_val, MeasurementIR):
                door_width = width_val.to_meters()
            if isinstance(height_val, MeasurementIR):
                door_height = height_val.to_meters()

    if defaults.get("door_height"):
        door_height = defaults["door_height"]

    if door.width:
        door_width = door.width.to_meters()
    if door.height:
        door_height = door.height.to_meters()

    # Calculate position along wall
    position_along_wall = _calculate_opening_position(
        door.position, wall_geom, door_width
    )

    # Calculate world position of opening center
    t = position_along_wall / wall_geom.length if wall_geom.length > 0 else 0.5
    center_x = wall_geom.start_x + t * (wall_geom.end_x - wall_geom.start_x)
    center_y = wall_geom.start_y + t * (wall_geom.end_y - wall_geom.start_y)

    # Create opening geometry
    # Opening is perpendicular to wall direction
    perp_x = -math.sin(wall_geom.angle)
    perp_y = math.cos(wall_geom.angle)
    along_x = math.cos(wall_geom.angle)
    along_y = math.sin(wall_geom.angle)

    half_width = door_width / 2
    half_thickness = wall_geom.thickness  # Opening goes through entire wall

    opening_points = [
        (
            center_x - along_x * half_width - perp_x * half_thickness,
            center_y - along_y * half_width - perp_y * half_thickness,
            0.0,
        ),
        (
            center_x + along_x * half_width - perp_x * half_thickness,
            center_y + along_y * half_width - perp_y * half_thickness,
            0.0,
        ),
        (
            center_x + along_x * half_width + perp_x * half_thickness,
            center_y + along_y * half_width + perp_y * half_thickness,
            0.0,
        ),
        (
            center_x - along_x * half_width + perp_x * half_thickness,
            center_y - along_y * half_width + perp_y * half_thickness,
            0.0,
        ),
        (
            center_x - along_x * half_width - perp_x * half_thickness,
            center_y - along_y * half_width - perp_y * half_thickness,
            0.0,
        ),
    ]

    opening_solid = _create_extruded_solid(ifc, opening_points, door_height)
    opening_rep = ifc.createIfcShapeRepresentation(
        context, "Body", "SweptSolid", [opening_solid]
    )
    opening_shape = ifc.createIfcProductDefinitionShape(None, None, [opening_rep])

    opening_placement = _create_local_placement(ifc, relative_to=storey_placement)

    opening = ifc.createIfcOpeningElement(
        ifcopenshell.guid.new(),
        None,
        f"Opening for {door.name}",
        None,
        None,
        opening_placement,
        opening_shape,
        None,
    )

    # Link opening to wall
    ifc.createIfcRelVoidsElement(
        ifcopenshell.guid.new(), None, "Wall Opening", None, wall_entity, opening
    )

    # Create door geometry (thin panel)
    door_thickness = 0.05
    door_points = [
        (center_x - along_x * half_width, center_y - along_y * half_width, 0.0),
        (center_x + along_x * half_width, center_y + along_y * half_width, 0.0),
        (
            center_x + along_x * half_width + perp_x * door_thickness,
            center_y + along_y * half_width + perp_y * door_thickness,
            0.0,
        ),
        (
            center_x - along_x * half_width + perp_x * door_thickness,
            center_y - along_y * half_width + perp_y * door_thickness,
            0.0,
        ),
        (center_x - along_x * half_width, center_y - along_y * half_width, 0.0),
    ]

    door_solid = _create_extruded_solid(ifc, door_points, door_height)
    door_rep = ifc.createIfcShapeRepresentation(
        context, "Body", "SweptSolid", [door_solid]
    )
    door_shape = ifc.createIfcProductDefinitionShape(None, None, [door_rep])

    door_placement = _create_local_placement(ifc, relative_to=storey_placement)

    door_desc = None
    if door.connects:
        door_desc = f"Connects {door.connects.from_space} to {door.connects.to_space}"

    door_entity = ifc.createIfcDoor(
        ifcopenshell.guid.new(),
        None,
        door.name,
        door_desc,
        None,
        door_placement,
        door_shape,
        None,
        door_height,
        door_width,
    )

    # Link door to opening
    ifc.createIfcRelFillsElement(
        ifcopenshell.guid.new(), None, "Door Fill", None, opening, door_entity
    )

    return opening, door_entity


def _create_window_with_opening(
    ifc: ifcopenshell.file,
    context,
    storey_placement,
    wall_entity: ifcopenshell.entity_instance,
    wall_geom: WallGeometry,
    window: WindowIR,
    ir: JsonIR,
    defaults: dict,
) -> tuple[ifcopenshell.entity_instance, ifcopenshell.entity_instance]:
    """Create a window with its opening."""
    # Get window dimensions
    window_width = DEFAULT_WINDOW_WIDTH
    window_height = DEFAULT_WINDOW_HEIGHT
    window_sill = DEFAULT_WINDOW_SILL

    if window.type_ref:
        type_def = ir.get_type(window.type_ref)
        if type_def:
            width_val = _get_type_parameter(type_def, "width", ir)
            height_val = _get_type_parameter(type_def, "height", ir)
            sill_val = _get_type_parameter(type_def, "sill", ir) or _get_type_parameter(
                type_def, "sill_height", ir
            )
            if isinstance(width_val, MeasurementIR):
                window_width = width_val.to_meters()
            if isinstance(height_val, MeasurementIR):
                window_height = height_val.to_meters()
            if isinstance(sill_val, MeasurementIR):
                window_sill = sill_val.to_meters()

    if defaults.get("window_sill"):
        window_sill = defaults["window_sill"]

    if window.width:
        window_width = window.width.to_meters()
    if window.height:
        window_height = window.height.to_meters()
    if window.sill:
        window_sill = window.sill.to_meters()

    # Calculate position along wall
    position_along_wall = _calculate_opening_position(
        window.position, wall_geom, window_width
    )

    # Calculate world position
    t = position_along_wall / wall_geom.length if wall_geom.length > 0 else 0.5
    center_x = wall_geom.start_x + t * (wall_geom.end_x - wall_geom.start_x)
    center_y = wall_geom.start_y + t * (wall_geom.end_y - wall_geom.start_y)

    # Direction vectors
    perp_x = -math.sin(wall_geom.angle)
    perp_y = math.cos(wall_geom.angle)
    along_x = math.cos(wall_geom.angle)
    along_y = math.sin(wall_geom.angle)

    half_width = window_width / 2
    half_thickness = wall_geom.thickness

    # Opening points (at sill height)
    opening_points = [
        (
            center_x - along_x * half_width - perp_x * half_thickness,
            center_y - along_y * half_width - perp_y * half_thickness,
            window_sill,
        ),
        (
            center_x + along_x * half_width - perp_x * half_thickness,
            center_y + along_y * half_width - perp_y * half_thickness,
            window_sill,
        ),
        (
            center_x + along_x * half_width + perp_x * half_thickness,
            center_y + along_y * half_width + perp_y * half_thickness,
            window_sill,
        ),
        (
            center_x - along_x * half_width + perp_x * half_thickness,
            center_y - along_y * half_width + perp_y * half_thickness,
            window_sill,
        ),
        (
            center_x - along_x * half_width - perp_x * half_thickness,
            center_y - along_y * half_width - perp_y * half_thickness,
            window_sill,
        ),
    ]

    # Create opening at sill height
    opening_solid = _create_extruded_solid(ifc, opening_points, window_height)
    opening_rep = ifc.createIfcShapeRepresentation(
        context, "Body", "SweptSolid", [opening_solid]
    )
    opening_shape = ifc.createIfcProductDefinitionShape(None, None, [opening_rep])

    opening_placement = _create_local_placement(ifc, relative_to=storey_placement)

    opening = ifc.createIfcOpeningElement(
        ifcopenshell.guid.new(),
        None,
        f"Opening for {window.name}",
        None,
        None,
        opening_placement,
        opening_shape,
        None,
    )

    # Link opening to wall
    ifc.createIfcRelVoidsElement(
        ifcopenshell.guid.new(), None, "Wall Opening", None, wall_entity, opening
    )

    # Create window geometry (glass panel)
    glass_thickness = 0.02
    window_points = [
        (center_x - along_x * half_width, center_y - along_y * half_width, window_sill),
        (center_x + along_x * half_width, center_y + along_y * half_width, window_sill),
        (
            center_x + along_x * half_width + perp_x * glass_thickness,
            center_y + along_y * half_width + perp_y * glass_thickness,
            window_sill,
        ),
        (
            center_x - along_x * half_width + perp_x * glass_thickness,
            center_y - along_y * half_width + perp_y * glass_thickness,
            window_sill,
        ),
        (center_x - along_x * half_width, center_y - along_y * half_width, window_sill),
    ]

    window_solid = _create_extruded_solid(ifc, window_points, window_height)
    window_rep = ifc.createIfcShapeRepresentation(
        context, "Body", "SweptSolid", [window_solid]
    )
    window_shape = ifc.createIfcProductDefinitionShape(None, None, [window_rep])

    window_placement = _create_local_placement(ifc, relative_to=storey_placement)

    window_entity = ifc.createIfcWindow(
        ifcopenshell.guid.new(),
        None,
        window.name,
        None,
        None,
        window_placement,
        window_shape,
        None,
        window_height,
        window_width,
    )

    # Link window to opening
    ifc.createIfcRelFillsElement(
        ifcopenshell.guid.new(), None, "Window Fill", None, opening, window_entity
    )

    return opening, window_entity


def _create_column(
    ifc: ifcopenshell.file,
    context,
    storey_placement,
    column: ColumnIR,
    level_height: float,
    ir: JsonIR,
) -> ifcopenshell.entity_instance:
    """Create an IfcColumn."""
    width = _measurement_to_meters(column.width, DEFAULT_COLUMN_SIZE)
    depth = _measurement_to_meters(column.depth, DEFAULT_COLUMN_SIZE)
    height = _measurement_to_meters(column.height, level_height)

    if column.type_ref:
        type_def = ir.get_type(column.type_ref)
        if type_def:
            w = _get_type_parameter(type_def, "width", ir)
            d = _get_type_parameter(type_def, "depth", ir)
            h = _get_type_parameter(type_def, "height", ir)
            if isinstance(w, MeasurementIR):
                width = w.to_meters()
            if isinstance(d, MeasurementIR):
                depth = d.to_meters()
            if isinstance(h, MeasurementIR):
                height = h.to_meters()

    half_w = width / 2
    half_d = depth / 2

    points = [
        (column.position.x - half_w, column.position.y - half_d, 0.0),
        (column.position.x + half_w, column.position.y - half_d, 0.0),
        (column.position.x + half_w, column.position.y + half_d, 0.0),
        (column.position.x - half_w, column.position.y + half_d, 0.0),
        (column.position.x - half_w, column.position.y - half_d, 0.0),
    ]

    solid = _create_extruded_solid(ifc, points, height)
    body_rep = ifc.createIfcShapeRepresentation(context, "Body", "SweptSolid", [solid])
    product_shape = ifc.createIfcProductDefinitionShape(None, None, [body_rep])

    column_placement = _create_local_placement(ifc, relative_to=storey_placement)

    column_entity = ifc.createIfcColumn(
        ifcopenshell.guid.new(),
        None,
        column.name,
        None,
        None,
        column_placement,
        product_shape,
        None,
    )

    return column_entity


def _create_slab(
    ifc: ifcopenshell.file,
    context,
    storey_placement,
    slab: SlabIR,
    z_offset: float = 0.0,
) -> ifcopenshell.entity_instance | None:
    """Create an IfcSlab."""
    thickness = _measurement_to_meters(slab.thickness, DEFAULT_FLOOR_THICKNESS)

    if not slab.boundary:
        return None

    points = [(p.x, p.y, z_offset) for p in slab.boundary]
    points.append(points[0])  # Close the loop

    solid = _create_extruded_solid(ifc, points, thickness)
    body_rep = ifc.createIfcShapeRepresentation(context, "Body", "SweptSolid", [solid])
    product_shape = ifc.createIfcProductDefinitionShape(None, None, [body_rep])

    slab_placement = _create_local_placement(ifc, relative_to=storey_placement)

    predefined_type = "FLOOR"
    if slab.slab_type == "roof":
        predefined_type = "ROOF"
    elif slab.slab_type == "landing":
        predefined_type = "LANDING"

    slab_entity = ifc.createIfcSlab(
        ifcopenshell.guid.new(),
        None,
        slab.name,
        None,
        None,
        slab_placement,
        product_shape,
        None,
        predefined_type,
    )

    return slab_entity


def _calculate_floor_boundary(
    wall_geometries: dict[str, WallGeometry],
) -> list[tuple[float, float]] | None:
    """Calculate floor boundary from wall endpoints (bounding box)."""
    if not wall_geometries:
        return None

    # Collect all wall endpoints
    all_x = []
    all_y = []
    for geom in wall_geometries.values():
        all_x.extend([geom.start_x, geom.end_x])
        all_y.extend([geom.start_y, geom.end_y])

    if not all_x or not all_y:
        return None

    min_x, max_x = min(all_x), max(all_x)
    min_y, max_y = min(all_y), max(all_y)

    # Return rectangle corners (counterclockwise)
    return [
        (min_x, min_y),
        (max_x, min_y),
        (max_x, max_y),
        (min_x, max_y),
    ]


def _create_auto_slab(
    ifc: ifcopenshell.file,
    context,
    storey_placement,
    name: str,
    boundary: list[tuple[float, float]],
    thickness: float,
    z_offset: float,
    predefined_type: str = "FLOOR",
) -> ifcopenshell.entity_instance:
    """Create an auto-generated floor or ceiling slab."""
    points = [(p[0], p[1], z_offset) for p in boundary]
    points.append(points[0])  # Close the loop

    solid = _create_extruded_solid(ifc, points, thickness)
    body_rep = ifc.createIfcShapeRepresentation(context, "Body", "SweptSolid", [solid])
    product_shape = ifc.createIfcProductDefinitionShape(None, None, [body_rep])

    slab_placement = _create_local_placement(ifc, relative_to=storey_placement)

    slab_entity = ifc.createIfcSlab(
        ifcopenshell.guid.new(),
        None,
        name,
        None,
        None,
        slab_placement,
        product_shape,
        None,
        predefined_type,
    )

    return slab_entity


def _create_furniture(
    ifc: ifcopenshell.file,
    context,
    storey_placement,
    furniture: FurnitureIR,
    ir: JsonIR,
) -> ifcopenshell.entity_instance:
    """Create an IfcFurnishingElement."""
    # Default bounding box
    width = 1.0
    depth = 0.6
    height = 0.75

    if furniture.type_ref:
        type_def = ir.get_type(furniture.type_ref)
        if type_def:
            w = _get_type_parameter(type_def, "width", ir)
            d = _get_type_parameter(type_def, "depth", ir)
            h = _get_type_parameter(type_def, "height", ir)
            if isinstance(w, MeasurementIR):
                width = w.to_meters()
            if isinstance(d, MeasurementIR):
                depth = d.to_meters()
            if isinstance(h, MeasurementIR):
                height = h.to_meters()

    if furniture.size:
        width = furniture.size.width.to_meters()
        depth = furniture.size.depth.to_meters()

    rotation = 0.0
    if furniture.facing:
        facing_angles = {
            "north": 0,
            "east": -90,
            "south": 180,
            "west": 90,
        }
        rotation = math.radians(facing_angles.get(furniture.facing, 0))

    # Create bounding box geometry
    half_w = width / 2
    half_d = depth / 2

    cos_r = math.cos(rotation)
    sin_r = math.sin(rotation)

    def rotate_point(x, y):
        return (
            furniture.position.x + x * cos_r - y * sin_r,
            furniture.position.y + x * sin_r + y * cos_r,
        )

    p1 = rotate_point(-half_w, -half_d)
    p2 = rotate_point(half_w, -half_d)
    p3 = rotate_point(half_w, half_d)
    p4 = rotate_point(-half_w, half_d)

    points = [
        (p1[0], p1[1], 0.0),
        (p2[0], p2[1], 0.0),
        (p3[0], p3[1], 0.0),
        (p4[0], p4[1], 0.0),
        (p1[0], p1[1], 0.0),
    ]

    solid = _create_extruded_solid(ifc, points, height)
    body_rep = ifc.createIfcShapeRepresentation(context, "Body", "SweptSolid", [solid])
    product_shape = ifc.createIfcProductDefinitionShape(None, None, [body_rep])

    furniture_placement = _create_local_placement(ifc, relative_to=storey_placement)

    name = furniture.name or furniture.type_ref or "Furniture"

    furniture_entity = ifc.createIfcFurnishingElement(
        ifcopenshell.guid.new(),
        None,
        name,
        None,
        None,
        furniture_placement,
        product_shape,
        None,
    )

    return furniture_entity


# ============================================================================
# Level Generation
# ============================================================================


def _generate_level(
    ifc: ifcopenshell.file,
    context,
    building,
    building_placement,
    level_ir: LevelIR,
    ir: JsonIR,
    door_types: dict[str, ifcopenshell.entity_instance],
    window_types: dict[str, ifcopenshell.entity_instance],
    material_styles: dict[str, ifcopenshell.entity_instance],
    elevation: float,
    defaults: dict,
) -> None:
    """Generate IfcBuildingStorey with all elements."""
    height = _measurement_to_meters(level_ir.height, DEFAULT_WALL_HEIGHT)

    # Create storey
    storey_placement = _create_local_placement(
        ifc, (0.0, 0.0, elevation), relative_to=building_placement
    )
    storey = ifc.createIfcBuildingStorey(
        ifcopenshell.guid.new(),
        None,
        level_ir.name,
        None,
        None,
        storey_placement,
        None,
        None,
        "ELEMENT",
        elevation,
    )
    ifc.createIfcRelAggregates(
        ifcopenshell.guid.new(), None, None, None, building, [storey]
    )

    elements = []

    # Build wall geometry map
    wall_geometries: dict[str, WallGeometry] = {}
    wall_entities: dict[str, ifcopenshell.entity_instance] = {}

    level_defaults = {
        "wall_thickness": defaults.get("wall_thickness", DEFAULT_WALL_THICKNESS),
        "wall_height": height,
    }

    # Create walls
    for wall_ir in level_ir.walls:
        wall_geom = _calculate_wall_geometry(wall_ir, level_defaults)
        wall_geometries[wall_ir.name] = wall_geom

        wall_entity = _create_wall(ifc, context, storey_placement, wall_geom)
        wall_entities[wall_ir.name] = wall_entity
        elements.append(wall_entity)

    # Auto-generate floor and ceiling slabs from wall boundaries
    floor_boundary = _calculate_floor_boundary(wall_geometries)
    if floor_boundary:
        floor_thickness = defaults.get("floor_thickness", DEFAULT_FLOOR_THICKNESS)
        ceiling_height = defaults.get("ceiling_height", height - DEFAULT_CEILING_THICKNESS)

        # Create floor slab (at z=0, extruding downward is handled by negative offset)
        floor_slab = _create_auto_slab(
            ifc,
            context,
            storey_placement,
            f"{level_ir.name} Floor",
            floor_boundary,
            floor_thickness,
            z_offset=-floor_thickness,  # Floor sits below the level
            predefined_type="FLOOR",
        )
        elements.append(floor_slab)

        # Create ceiling slab
        ceiling_thickness = DEFAULT_CEILING_THICKNESS
        ceiling_slab = _create_auto_slab(
            ifc,
            context,
            storey_placement,
            f"{level_ir.name} Ceiling",
            floor_boundary,
            ceiling_thickness,
            z_offset=ceiling_height,
            predefined_type="FLOOR",  # Ceilings are also slabs
        )
        elements.append(ceiling_slab)

    # Create doors at level scope
    for door_ir in level_ir.doors:
        wall_geom = wall_geometries.get(door_ir.wall)
        wall_entity = wall_entities.get(door_ir.wall)
        if wall_geom and wall_entity:
            opening, door_entity = _create_door_with_opening(
                ifc,
                context,
                storey_placement,
                wall_entity,
                wall_geom,
                door_ir,
                ir,
                defaults,
            )
            elements.append(opening)
            elements.append(door_entity)

            # Apply material
            mat_name = door_ir.material
            if not mat_name and door_ir.type_ref:
                type_def = ir.get_type(door_ir.type_ref)
                if type_def and type_def.material:
                    mat_name = type_def.material
            if mat_name and mat_name in material_styles:
                _apply_style_to_product(ifc, door_entity, material_styles[mat_name])

            # Link to type
            if door_ir.type_ref and door_ir.type_ref in door_types:
                ifc.createIfcRelDefinesByType(
                    ifcopenshell.guid.new(),
                    None,
                    "Door Type",
                    None,
                    [door_entity],
                    door_types[door_ir.type_ref],
                )

    # Create windows at level scope
    for window_ir in level_ir.windows:
        wall_geom = wall_geometries.get(window_ir.wall)
        wall_entity = wall_entities.get(window_ir.wall)
        if wall_geom and wall_entity:
            opening, window_entity = _create_window_with_opening(
                ifc,
                context,
                storey_placement,
                wall_entity,
                wall_geom,
                window_ir,
                ir,
                defaults,
            )
            elements.append(opening)
            elements.append(window_entity)

            # Apply material
            mat_name = window_ir.material
            if not mat_name and window_ir.type_ref:
                type_def = ir.get_type(window_ir.type_ref)
                if type_def and type_def.material:
                    mat_name = type_def.material
            if mat_name and mat_name in material_styles:
                _apply_style_to_product(ifc, window_entity, material_styles[mat_name])

            # Link to type
            if window_ir.type_ref and window_ir.type_ref in window_types:
                ifc.createIfcRelDefinesByType(
                    ifcopenshell.guid.new(),
                    None,
                    "Window Type",
                    None,
                    [window_entity],
                    window_types[window_ir.type_ref],
                )

    # Create columns
    for column_ir in level_ir.columns:
        column_entity = _create_column(
            ifc, context, storey_placement, column_ir, height, ir
        )
        elements.append(column_entity)

    # Create slabs
    for slab_ir in level_ir.slabs:
        slab_entity = _create_slab(ifc, context, storey_placement, slab_ir)
        if slab_entity:
            elements.append(slab_entity)

    # Create furniture at level scope
    for furniture_ir in level_ir.furniture:
        furniture_entity = _create_furniture(
            ifc, context, storey_placement, furniture_ir, ir
        )
        elements.append(furniture_entity)

    # Process spaces and their elements
    for space_ir in level_ir.spaces:
        # Process doors within spaces
        for door_ir in space_ir.doors:
            wall_geom = wall_geometries.get(door_ir.wall)
            wall_entity = wall_entities.get(door_ir.wall)
            if wall_geom and wall_entity:
                opening, door_entity = _create_door_with_opening(
                    ifc,
                    context,
                    storey_placement,
                    wall_entity,
                    wall_geom,
                    door_ir,
                    ir,
                    defaults,
                )
                elements.append(opening)
                elements.append(door_entity)

                mat_name = door_ir.material
                if not mat_name and door_ir.type_ref:
                    type_def = ir.get_type(door_ir.type_ref)
                    if type_def and type_def.material:
                        mat_name = type_def.material
                if mat_name and mat_name in material_styles:
                    _apply_style_to_product(ifc, door_entity, material_styles[mat_name])

                if door_ir.type_ref and door_ir.type_ref in door_types:
                    ifc.createIfcRelDefinesByType(
                        ifcopenshell.guid.new(),
                        None,
                        "Door Type",
                        None,
                        [door_entity],
                        door_types[door_ir.type_ref],
                    )

        # Process windows within spaces
        for window_ir in space_ir.windows:
            wall_geom = wall_geometries.get(window_ir.wall)
            wall_entity = wall_entities.get(window_ir.wall)
            if wall_geom and wall_entity:
                opening, window_entity = _create_window_with_opening(
                    ifc,
                    context,
                    storey_placement,
                    wall_entity,
                    wall_geom,
                    window_ir,
                    ir,
                    defaults,
                )
                elements.append(opening)
                elements.append(window_entity)

                mat_name = window_ir.material
                if not mat_name and window_ir.type_ref:
                    type_def = ir.get_type(window_ir.type_ref)
                    if type_def and type_def.material:
                        mat_name = type_def.material
                if mat_name and mat_name in material_styles:
                    _apply_style_to_product(
                        ifc, window_entity, material_styles[mat_name]
                    )

                if window_ir.type_ref and window_ir.type_ref in window_types:
                    ifc.createIfcRelDefinesByType(
                        ifcopenshell.guid.new(),
                        None,
                        "Window Type",
                        None,
                        [window_entity],
                        window_types[window_ir.type_ref],
                    )

        # Process furniture within spaces
        for furniture_ir in space_ir.furniture:
            furniture_entity = _create_furniture(
                ifc, context, storey_placement, furniture_ir, ir
            )
            elements.append(furniture_entity)

    # Contain all elements in storey
    if elements:
        ifc.createIfcRelContainedInSpatialStructure(
            ifcopenshell.guid.new(), None, None, None, elements, storey
        )


# ============================================================================
# Main Entry Point
# ============================================================================


def compile_to_ifc(ir: JsonIR) -> ifcopenshell.file:
    """Compile JSON IR to IFC file."""
    if not ir.buildings:
        raise ValueError("No buildings in IR")

    building_ir = ir.buildings[0]

    ifc = ifcopenshell.api.run("project.create_file", version="IFC4")

    project = ifcopenshell.api.run(
        "root.create_entity", ifc, ifc_class="IfcProject", name=building_ir.name
    )

    ifcopenshell.api.run(
        "unit.assign_unit", ifc, length={"is_metric": True, "raw": "METERS"}
    )

    # Create geometry context
    model3d = ifcopenshell.api.run("context.add_context", ifc, context_type="Model")
    context = ifcopenshell.api.run(
        "context.add_context",
        ifc,
        context_type="Model",
        context_identifier="Body",
        target_view="MODEL_VIEW",
        parent=model3d,
    )

    # Create type objects
    door_types, window_types = _create_typed_objects(ifc, ir)

    # Create material styles
    material_styles = _create_material_styles(ifc, ir)

    # Create site
    site_name = building_ir.site.name if building_ir.site else "Default Site"
    site_placement = _create_local_placement(ifc)
    site = ifc.createIfcSite(
        ifcopenshell.guid.new(),
        None,
        site_name,
        None,
        None,
        site_placement,
        None,
        None,
        "ELEMENT",
        None,
        None,
        None,
        None,
        None,
    )
    ifc.createIfcRelAggregates(
        ifcopenshell.guid.new(), None, None, None, project, [site]
    )

    # Create building
    building_placement = _create_local_placement(ifc, relative_to=site_placement)
    building = ifc.createIfcBuilding(
        ifcopenshell.guid.new(),
        None,
        building_ir.name,
        None,
        None,
        building_placement,
        None,
        None,
        "ELEMENT",
        None,
        None,
        None,
    )
    ifc.createIfcRelAggregates(
        ifcopenshell.guid.new(), None, None, None, site, [building]
    )

    # Build defaults from building
    defaults = {}
    if building_ir.defaults:
        if building_ir.defaults.wall_thickness:
            defaults["wall_thickness"] = building_ir.defaults.wall_thickness.to_meters()
        if building_ir.defaults.floor_thickness:
            defaults["floor_thickness"] = (
                building_ir.defaults.floor_thickness.to_meters()
            )
        if building_ir.defaults.ceiling_height:
            defaults["ceiling_height"] = building_ir.defaults.ceiling_height.to_meters()
        if building_ir.defaults.door_height:
            defaults["door_height"] = building_ir.defaults.door_height.to_meters()
        if building_ir.defaults.window_sill:
            defaults["window_sill"] = building_ir.defaults.window_sill.to_meters()

    # Track cumulative elevation for relative levels
    level_elevations: dict[str, float] = {}
    cumulative_elevation = 0.0

    # Generate levels
    for level_ir in building_ir.levels:
        # Calculate elevation
        if level_ir.elevation.value:
            elevation = level_ir.elevation.value.to_meters()
        elif level_ir.elevation.ref:
            ref_level = level_ir.elevation.ref
            if ref_level in level_elevations:
                # Find the referenced level's top
                ref_elevation = level_elevations[ref_level]
                # Find ref level height
                ref_level_ir = next(
                    (l for l in building_ir.levels if l.name == ref_level), None
                )
                if ref_level_ir and ref_level_ir.height:
                    elevation = ref_elevation + ref_level_ir.height.to_meters()
                else:
                    elevation = ref_elevation + DEFAULT_WALL_HEIGHT
            else:
                elevation = cumulative_elevation
        else:
            elevation = cumulative_elevation

        level_elevations[level_ir.name] = elevation

        # Get level height
        height = _measurement_to_meters(level_ir.height, DEFAULT_WALL_HEIGHT)
        cumulative_elevation = elevation + height

        _generate_level(
            ifc,
            context,
            building,
            building_placement,
            level_ir,
            ir,
            door_types,
            window_types,
            material_styles,
            elevation,
            defaults,
        )

    return ifc
