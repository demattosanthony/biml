import ifcopenshell
import ifcopenshell.geom
from ifcopenshell import guid
import uuid
import time

# IFC template setup
def create_ifc_file():
    timestamp = time.time()
    timestring = time.strftime("%Y-%m-%dT%H:%M:%S", time.gmtime(timestamp))
    filename = "wall_with_door.ifc"
    creator = "Your Name"
    organization = "Your Organization"
    application = "IfcOpenShell"
    project_name = "Wall with Door Project"

    # IFC schema
    schema = "IFC4"

    # Create a new IFC file
    ifcfile = ifcopenshell.file(schema=schema)

    # Set file header
    ifcfile.header.file_description.description = ("ViewDefinition [CoordinationView]")
    ifcfile.header.file_name.name = filename
    ifcfile.header.file_name.time_stamp = timestring
    ifcfile.header.file_name.author = (creator)
    ifcfile.header.file_name.organization = (organization)
    ifcfile.header.file_name.preprocessor_version = "IfcOpenShell " + ifcopenshell.version
    ifcfile.header.file_name.originating_system = application
    ifcfile.header.file_name.authorization = ""
    ifcfile.header.file_schema.schema_identifiers = (schema)

    # Set units
    length_unit = ifcfile.createIfcSIUnit(None, "LENGTHUNIT", None, "METRE")
    area_unit = ifcfile.createIfcSIUnit(None, "AREAUNIT", None, "SQUARE_METRE")
    volume_unit = ifcfile.createIfcSIUnit(None, "VOLUMEUNIT", None, "CUBIC_METRE")
    plane_angle_unit = ifcfile.createIfcSIUnit(None, "PLANEANGLEUNIT", None, "RADIAN")

    unit_assignment = ifcfile.createIfcUnitAssignment(
        [length_unit, area_unit, volume_unit, plane_angle_unit]
    )

    # Create project
    project = ifcfile.createIfcProject(
        ifcopenshell.guid.new(),
        None,
        project_name,
        None,
        None,
        None,
        None,
        [unit_assignment],
        None,
    )

    # Create site
    site_placement = create_ifclocalplacement(ifcfile)
    site = ifcfile.createIfcSite(
        ifcopenshell.guid.new(),
        None,
        "Site",
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

    # Create building
    building_placement = create_ifclocalplacement(ifcfile, relative_to=site_placement)
    building = ifcfile.createIfcBuilding(
        ifcopenshell.guid.new(),
        None,
        "Building",
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

    # Create building storey
    storey_placement = create_ifclocalplacement(
        ifcfile, relative_to=building_placement
    )
    elevation = 0.0
    building_storey = ifcfile.createIfcBuildingStorey(
        ifcopenshell.guid.new(),
        None,
        "Ground Floor",
        None,
        None,
        storey_placement,
        None,
        None,
        "ELEMENT",
        elevation,
    )

    # Create spatial structure relationships
    ifcfile.createIfcRelAggregates(ifcopenshell.guid.new(), None, "Site Container", None, project, [site])
    ifcfile.createIfcRelAggregates(ifcopenshell.guid.new(), None, "Building Container", None, site, [building])
    ifcfile.createIfcRelAggregates(ifcopenshell.guid.new(), None, "Storey Container", None, building, [building_storey])

    return ifcfile, building_storey

# Helper functions for creating IFC entities
def create_ifclocalplacement(ifcfile, point=(0.0, 0.0, 0.0), dir1=(0.0, 0.0, 1.0), dir2=(1.0, 0.0, 0.0), relative_to=None):
    axis2placement = ifcfile.createIfcAxis2Placement3D(
        ifcfile.createIfcCartesianPoint(point),
        ifcfile.createIfcDirection(dir1),
        ifcfile.createIfcDirection(dir2),
    )
    if relative_to:
        return ifcfile.createIfcLocalPlacement(relative_to, axis2placement)
    else:
        return ifcfile.createIfcLocalPlacement(None, axis2placement)

def create_ifcpolyline(ifcfile, point_list):
    ifcpts = []
    for point in point_list:
        ifcpts.append(ifcfile.createIfcCartesianPoint(point))
    return ifcfile.createIfcPolyline(ifcpts)

def create_ifcextrudedareasolid(ifcfile, point_list, ifcaxis2placement, extrude_dir, extrusion):
    polyline = create_ifcpolyline(ifcfile, point_list)
    ifcclosedprofile = ifcfile.createIfcArbitraryClosedProfileDef("AREA", None, polyline)
    ifcdir = ifcfile.createIfcDirection(extrude_dir)
    return ifcfile.createIfcExtrudedAreaSolid(ifcclosedprofile, ifcaxis2placement, ifcdir, extrusion)

def create_ifcdoorstyle(ifcfile):
    door_lining_props = ifcfile.createIfcDoorLiningProperties(
        ifcopenshell.guid.new(),
        None,  # OwnerHistory
        "Standard Door Lining Properties",  # Name
        None,  # Description
        0.1,  # LiningDepth
        0.05,  # LiningThickness
        0.05,  # ThresholdDepth
        0.02,  # ThresholdThickness
        0.0,  # TransomThickness
        0.0,  # TransomOffset
        0.0,  # LiningOffset
        0.0,  # ThresholdOffset
        None,  # CasingThickness
        None,  # CasingDepth
        None,  # ShapeAspectStyle
    )

    door_panel_props = ifcfile.createIfcDoorPanelProperties(
        ifcopenshell.guid.new(),
        None,  # OwnerHistory
        "Standard Door Panel Properties",  # Name
        None,  # Description
        0.8,  # PanelDepth
        "SWINGING",  # PanelOperation
        0.9,  # PanelWidth
        "NOTDEFINED",  # PanelPosition
        None,  # ShapeAspectStyle
    )

    # Create the door style
    door_style = ifcfile.createIfcDoorStyle(
        ifcopenshell.guid.new(),
        None,
        "Standard Door Style",
        None,
        "STANDARD",
        "STANDARD",
        [], # Modified this line
        "NOTDEFINED",
        None
    )

    # Add the property sets to the door style
    door_style.HasPropertySets = [door_lining_props, door_panel_props] # Modified this line

    return door_style

# Create the wall
def create_wall(ifcfile, building_storey):
    wall_placement = create_ifclocalplacement(ifcfile)
    wall_length = 5.0
    wall_width = 0.2
    wall_height = 3.0
    p1 = (0.0, 0.0, 0.0)
    p2 = (wall_length, 0.0, 0.0)
    p3 = (wall_length, wall_width, 0.0)
    p4 = (0.0, wall_width, 0.0)
    point_list = [p1, p2, p3, p4]
    extrusion_direction = (0.0, 0.0, 1.0)
    wall_body = create_ifcextrudedareasolid(
        ifcfile, point_list, wall_placement, extrusion_direction, wall_height
    )
    material = ifcfile.createIfcMaterial("Concrete")
    material_layer = ifcfile.createIfcMaterialLayer(material, wall_width, None)
    material_layer_set = ifcfile.createIfcMaterialLayerSet([material_layer], None)
    material_layer_set_usage = ifcfile.createIfcMaterialLayerSetUsage(
        material_layer_set, "AXIS2", "POSITIVE", -wall_width / 2
    )
    wall = ifcfile.createIfcWallStandardCase(
        ifcopenshell.guid.new(),
        None,
        "Wall",
        None,
        None,
        wall_placement,
        wall_body,
        None,
        "STANDARD",
    )
    ifcfile.createIfcRelAssociatesMaterial(ifcopenshell.guid.new(), None, None, None, [wall], material_layer_set_usage)
    ifcfile.createIfcRelContainedInSpatialStructure(
        ifcopenshell.guid.new(), None, "Building Storey Container", None, [wall], building_storey
    )
    return wall, wall_length, wall_width, wall_height

# Create the door opening
def create_door_opening(ifcfile, wall, wall_length, wall_width, wall_height):
    door_width = 1.0
    door_height = 2.1
    door_placement_x = (wall_length - door_width) / 2
    door_placement_y = 0.0
    door_placement_z = 0.0

    door_placement = create_ifclocalplacement(
        ifcfile,
        point=(door_placement_x, door_placement_y, door_placement_z),
        relative_to=wall.ObjectPlacement,
    )

    opening_placement = create_ifclocalplacement(
        ifcfile,
        point=(door_placement_x, door_placement_y, door_placement_z),
        relative_to=wall.ObjectPlacement,
    )

    p1 = (0.0, 0.0, 0.0)
    p2 = (door_width, 0.0, 0.0)
    p3 = (door_width, wall_width, 0.0)
    p4 = (0.0, wall_width, 0.0)
    point_list = [p1, p2, p3, p4]
    extrusion_direction = (0.0, 0.0, 1.0)
    opening_body = create_ifcextrudedareasolid(
        ifcfile, point_list, opening_placement, extrusion_direction, door_height
    )
    opening_element = ifcfile.createIfcOpeningElement(
        ifcopenshell.guid.new(),
        None,
        "Door Opening",
        None,
        None,
        opening_placement,
        opening_body,
        None,
    )

    # Create the door
    door_style = create_ifcdoorstyle(ifcfile)
    door = ifcfile.createIfcDoor(
        ifcopenshell.guid.new(),
        None,
        "Door",
        None,
        None,
        door_placement,
        None,
        None,
        door_height,
        door_width,
        door_style
    )

    # Relate the opening to the wall
    ifcfile.createIfcRelVoidsElement(ifcopenshell.guid.new(), None, "RelVoidsElement", None, wall, opening_element)
    ifcfile.createIfcRelFillsElement(ifcopenshell.guid.new(), None, "RelFillsElement", None, opening_element, door)

    return opening_element, door

# Main execution
ifcfile, building_storey = create_ifc_file()
wall, wall_length, wall_width, wall_height = create_wall(ifcfile, building_storey)
opening_element, door = create_door_opening(ifcfile, wall, wall_length, wall_width, wall_height)

# Write the IFC file
ifcfile.write("wall_with_door.ifc")

print("IFC model created successfully: wall_with_door.ifc")