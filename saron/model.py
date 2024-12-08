import ifcopenshell
from ifcopenshell import guid
import time
import math

# Create new IFC file
model = ifcopenshell.file(schema="IFC2X3")

# Create project structure
project = model.create_entity("IfcProject", GlobalId=guid.new(), Name="Cube Project")
site = model.create_entity("IfcSite", GlobalId=guid.new(), Name="Main Site")
building = model.create_entity("IfcBuilding", GlobalId=guid.new(), Name="Cube Building")

# Create owner history
person = model.create_entity("IfcPerson", FamilyName="Demo", GivenName="User")
organization = model.create_entity("IfcOrganization", Name="Demo Organization")
person_and_org = model.create_entity("IfcPersonAndOrganization", ThePerson=person, TheOrganization=organization)
application = model.create_entity(
    "IfcApplication",
    ApplicationDeveloper=organization,
    Version="1.0",
    ApplicationFullName="Cube Generator",
    ApplicationIdentifier="CubeApp",
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

# Cube Parameters
cube_size = 1000.0  # 1 meter cube in millimeters

# Create 2D profile for extrusion (rectangular profile)
profile_def = model.create_entity(
    "IfcRectangleProfileDef",
    ProfileType="AREA",
    ProfileName="Cube Base",
    XDim=cube_size,
    YDim=cube_size
)

# Create 3D placement for the profile
placement = model.create_entity(
    "IfcAxis2Placement3D",
    Location=model.create_entity("IfcCartesianPoint", Coordinates=(0.0, 0.0, 0.0)),
    Axis=model.create_entity("IfcDirection", DirectionRatios=(0.0, 0.0, 1.0)),
    RefDirection=model.create_entity("IfcDirection", DirectionRatios=(1.0, 0.0, 0.0))
)

# Create extrusion
extrusion = model.create_entity(
    "IfcExtrudedAreaSolid",
    SweptArea=profile_def,
    Position=placement,
    ExtrudedDirection=model.create_entity("IfcDirection", DirectionRatios=(0.0, 0.0, 1.0)),
    Depth=cube_size
)

# Create shape representation
shape_representation = model.create_entity(
    "IfcShapeRepresentation",
    ContextOfItems=model_context,
    RepresentationType="SWEPTSOLID",
    Items=[extrusion]
)

# Create cube as a building element
# Create cube as a building element
cube = model.create_entity(
    "IfcBuildingElementProxy",
    GlobalId=guid.new(),
    Name="Solid Cube",
    OwnerHistory=owner_history,
    Representation=model.create_entity(
        "IfcProductDefinitionShape",
        Representations=[shape_representation]
    )
)

# Save the model
model.write("/Users/anthonydemattos/auto-bim/saron/output.ifc")

print("IFC file with cube created successfully!")
