import ifcopenshell
from ifcopenshell import guid
import numpy
import time

# Create new IFC file
model = ifcopenshell.file(schema="IFC2X3")

# Create project structure
project = model.create_entity("IfcProject", GlobalId=guid.new(), Name="My Project")
site = model.create_entity("IfcSite", GlobalId=guid.new(), Name="My Site")
building = model.create_entity("IfcBuilding", GlobalId=guid.new(), Name="My Building")

# Create owner history
person = model.create_entity("IfcPerson", FamilyName="Demo", GivenName="User")
organization = model.create_entity("IfcOrganization", Name="Demo Organization")
person_and_org = model.create_entity("IfcPersonAndOrganization", ThePerson=person, TheOrganization=organization)
application = model.create_entity(
    "IfcApplication",
    ApplicationDeveloper=organization,
    Version="1.0",
    ApplicationFullName="Demo Application",
    ApplicationIdentifier="Demo App",
)
owner_history = model.create_entity(
    "IfcOwnerHistory",
    OwningUser=person_and_org,
    OwningApplication=application,
    ChangeAction="ADDED",
    CreationDate=int(time.time()),
)

# Set up units - using millimeters
units = model.create_entity("IfcUnitAssignment")
length_unit = model.create_entity("IfcSIUnit", UnitType="LENGTHUNIT", Prefix="MILLI", Name="METRE")
units.Units = [length_unit]
project.UnitsInContext = units

# Set up geometric representation contexts
context = model.create_entity(
    "IfcGeometricRepresentationContext",
    ContextType="Model",
    CoordinateSpaceDimension=3,
    Precision=0.01,
    WorldCoordinateSystem=model.create_entity(
        "IfcAxis2Placement3D",
        Location=model.create_entity("IfcCartesianPoint", Coordinates=(0.0, 0.0, 0.0)),
    ),
)

model_context = model.create_entity(
    "IfcGeometricRepresentationSubContext",
    ContextIdentifier="Body",
    ContextType="Model",
    ParentContext=context,
    TargetView="MODEL_VIEW",
)

# Create placement for wall
wall_placement = model.create_entity(
    "IfcLocalPlacement",
    PlacementRelTo=None,
    RelativePlacement=model.create_entity(
        "IfcAxis2Placement3D",
        Location=model.create_entity("IfcCartesianPoint", Coordinates=(0.0, 0.0, 0.0)),
        Axis=model.create_entity("IfcDirection", DirectionRatios=(0.0, 0.0, 1.0)),
        RefDirection=model.create_entity("IfcDirection", DirectionRatios=(1.0, 0.0, 0.0)),
    ),
)

# Create wall profile (6000mm long x 200mm thick)
wall_profile = model.create_entity(
    "IfcRectangleProfileDef",
    ProfileType="AREA",
    XDim=6000.0,  # Length
    YDim=200.0,  # Thickness
)

# Create wall extrusion (3000mm high)
wall_solid = model.create_entity(
    "IfcExtrudedAreaSolid",
    SweptArea=wall_profile,
    Position=model.create_entity(
        "IfcAxis2Placement3D",
        Location=model.create_entity("IfcCartesianPoint", Coordinates=(0.0, 0.0, 0.0)),
    ),
    ExtrudedDirection=model.create_entity("IfcDirection", DirectionRatios=(0.0, 0.0, 1.0)),
    Depth=3000.0,
)

# Create wall shape representation
wall_representation = model.create_entity(
    "IfcShapeRepresentation",
    ContextOfItems=model_context,
    RepresentationIdentifier="Body",
    RepresentationType="SweptSolid",
    Items=[wall_solid],
)

# Create wall product definition shape
wall_shape = model.create_entity("IfcProductDefinitionShape", Representations=[wall_representation])

# Create wall
wall = model.create_entity(
    "IfcWall",
    GlobalId=guid.new(),
    OwnerHistory=owner_history,
    Name="Basic Wall",
    ObjectPlacement=wall_placement,
    Representation=wall_shape,
)

# Create opening
opening_placement = model.create_entity(
    "IfcLocalPlacement",
    PlacementRelTo=wall_placement,
    RelativePlacement=model.create_entity(
        "IfcAxis2Placement3D",
        Location=model.create_entity("IfcCartesianPoint", Coordinates=(1500.0, 0.0, 0.0)),
    ),
)

# Create opening profile
opening_profile = model.create_entity(
    "IfcRectangleProfileDef",
    ProfileType="AREA",
    XDim=900.0,  # Width
    YDim=200.0,  # Same as wall thickness
)

# Create opening extrusion
opening_solid = model.create_entity(
    "IfcExtrudedAreaSolid",
    SweptArea=opening_profile,
    Position=model.create_entity(
        "IfcAxis2Placement3D",
        Location=model.create_entity("IfcCartesianPoint", Coordinates=(0.0, 0.0, 0.0)),
    ),
    ExtrudedDirection=model.create_entity("IfcDirection", DirectionRatios=(0.0, 0.0, 1.0)),
    Depth=2100.0,  # Standard door height
)

# Create opening shape representation
opening_representation = model.create_entity(
    "IfcShapeRepresentation",
    ContextOfItems=model_context,
    RepresentationIdentifier="Body",
    RepresentationType="SweptSolid",
    Items=[opening_solid],
)

# Create opening product definition shape
opening_shape = model.create_entity("IfcProductDefinitionShape", Representations=[opening_representation])

# Create opening element
opening = model.create_entity(
    "IfcOpeningElement",
    GlobalId=guid.new(),
    OwnerHistory=owner_history,
    Name="Door Opening",
    ObjectPlacement=opening_placement,
    Representation=opening_shape,
)

# Create relationship between wall and opening
void_relation = model.create_entity(
    "IfcRelVoidsElement",
    GlobalId=guid.new(),
    OwnerHistory=owner_history,
    RelatingBuildingElement=wall,
    RelatedOpeningElement=opening,
)

# Create door placement (relative to the opening)
door_placement = model.create_entity(
    "IfcLocalPlacement",
    PlacementRelTo=opening_placement,
    RelativePlacement=model.create_entity(
        "IfcAxis2Placement3D",
        Location=model.create_entity("IfcCartesianPoint", Coordinates=(0.0, 0.0, 0.0)),
    ),
)

# Create door profile (slightly smaller than opening)
door_profile = model.create_entity(
    "IfcRectangleProfileDef",
    ProfileType="AREA",
    XDim=850.0,  # Door panel width (slightly smaller than opening)
    YDim=40.0,  # Door thickness
)

# Create door panel extrusion
door_solid = model.create_entity(
    "IfcExtrudedAreaSolid",
    SweptArea=door_profile,
    Position=model.create_entity(
        "IfcAxis2Placement3D",
        Location=model.create_entity("IfcCartesianPoint", Coordinates=(25.0, 80.0, 0.0)),  # Centered in opening
    ),
    ExtrudedDirection=model.create_entity("IfcDirection", DirectionRatios=(0.0, 0.0, 1.0)),
    Depth=2050.0,  # Door panel height (slightly smaller than opening)
)

# Create door frame profiles and extrusions
frame_width = 50.0
frame_depth = 200.0  # Same as wall thickness
frame_thickness = 40.0

# Jamb (vertical frame) profile
jamb_profile = model.create_entity("IfcRectangleProfileDef", ProfileType="AREA", XDim=frame_width, YDim=frame_depth)

# Head (horizontal frame) profile
head_profile = model.create_entity(
    "IfcRectangleProfileDef",
    ProfileType="AREA",
    XDim=900.0,  # Full opening width
    YDim=frame_width,
)

# Create left jamb
left_jamb = model.create_entity(
    "IfcExtrudedAreaSolid",
    SweptArea=jamb_profile,
    Position=model.create_entity(
        "IfcAxis2Placement3D",
        Location=model.create_entity("IfcCartesianPoint", Coordinates=(0.0, 0.0, 0.0)),
    ),
    ExtrudedDirection=model.create_entity("IfcDirection", DirectionRatios=(0.0, 0.0, 1.0)),
    Depth=2100.0,  # Full opening height
)

# Create right jamb
right_jamb = model.create_entity(
    "IfcExtrudedAreaSolid",
    SweptArea=jamb_profile,
    Position=model.create_entity(
        "IfcAxis2Placement3D",
        Location=model.create_entity("IfcCartesianPoint", Coordinates=(850.0, 0.0, 0.0)),
    ),
    ExtrudedDirection=model.create_entity("IfcDirection", DirectionRatios=(0.0, 0.0, 1.0)),
    Depth=2100.0,
)

# Create head (top frame)
head = model.create_entity(
    "IfcExtrudedAreaSolid",
    SweptArea=head_profile,
    Position=model.create_entity(
        "IfcAxis2Placement3D",
        Location=model.create_entity("IfcCartesianPoint", Coordinates=(0.0, 0.0, 2050.0)),
    ),
    ExtrudedDirection=model.create_entity("IfcDirection", DirectionRatios=(0.0, 1.0, 0.0)),
    Depth=frame_depth,
)

# Create door shape representation including panel and frame
door_representation = model.create_entity(
    "IfcShapeRepresentation",
    ContextOfItems=model_context,
    RepresentationIdentifier="Body",
    RepresentationType="SweptSolid",
    Items=[door_solid, left_jamb, right_jamb, head],
)

# Create door product definition shape
door_shape = model.create_entity("IfcProductDefinitionShape", Representations=[door_representation])

# Create door
door = model.create_entity(
    "IfcDoor",
    GlobalId=guid.new(),
    OwnerHistory=owner_history,
    Name="Standard Door",
    ObjectPlacement=door_placement,
    Representation=door_shape,
    OverallHeight=2100.0,
    OverallWidth=900.0,
)

# Create relationship between opening and door
fill_relation = model.create_entity(
    "IfcRelFillsElement",
    GlobalId=guid.new(),
    OwnerHistory=owner_history,
    RelatingOpeningElement=opening,
    RelatedBuildingElement=door,
)

# Save the file
model.write("output.ifc")
