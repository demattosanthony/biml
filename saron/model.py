import ifcopenshell
from ifcopenshell import guid

# Create a new IFC file
model = ifcopenshell.file()

# Create project
project = model.create_entity(
    "IfcProject",
    GlobalId=guid.new(),
    Name="My Project"
)

# Set up units
length_unit = model.create_entity("IfcSIUnit", UnitType="LENGTHUNIT", Name="METRE")
area_unit = model.create_entity("IfcSIUnit", UnitType="AREAUNIT", Name="SQUARE_METRE")
volume_unit = model.create_entity("IfcSIUnit", UnitType="VOLUMEUNIT", Name="CUBIC_METRE")
units = model.create_entity(
    "IfcUnitAssignment",
    Units=[length_unit, area_unit, volume_unit]
)
project.UnitsInContext = units

# Set up geometric representation context
context = model.create_entity(
    "IfcGeometricRepresentationContext",
    ContextType="Model",
    CoordinateSpaceDimension=3,
    Precision=1.0e-5,
    WorldCoordinateSystem=model.create_entity(
        "IfcAxis2Placement3D",
        Location=model.create_entity("IfcCartesianPoint", Coordinates=(0., 0., 0.))
    )
)

project.RepresentationContexts = [context]

# Create spatial structure
site = model.create_entity(
    "IfcSite",
    GlobalId=guid.new(),
    Name="My Site"
)

building = model.create_entity(
    "IfcBuilding",
    GlobalId=guid.new(),
    Name="My Building"
)

storey = model.create_entity(
    "IfcBuildingStorey",
    GlobalId=guid.new(),
    Name="Ground Floor"
)

# Create spatial hierarchy
model.create_entity(
    "IfcRelAggregates",
    GlobalId=guid.new(),
    RelatingObject=project,
    RelatedObjects=[site]
)

model.create_entity(
    "IfcRelAggregates",
    GlobalId=guid.new(),
    RelatingObject=site,
    RelatedObjects=[building]
)

model.create_entity(
    "IfcRelAggregates",
    GlobalId=guid.new(),
    RelatingObject=building,
    RelatedObjects=[storey]
)

# Create sphere directly
radius = 1.0
sphere = model.create_entity(
    "IfcSphere",
    Radius=radius
)

# Create shape representation
shape_representation = model.create_entity(
    "IfcShapeRepresentation",
    ContextOfItems=context,
    RepresentationIdentifier="Body",
    RepresentationType="CSG",
    Items=[sphere]
)

# Create product definition shape
product_definition_shape = model.create_entity(
    "IfcProductDefinitionShape",
    Representations=[shape_representation]
)

# Create placement
placement = model.create_entity(
    "IfcLocalPlacement",
    RelativePlacement=model.create_entity(
        "IfcAxis2Placement3D",
        Location=model.create_entity("IfcCartesianPoint", Coordinates=(0., 0., 2.))
    )
)

# Create proxy element
sphere_element = model.create_entity(
    "IfcBuildingElementProxy",
    GlobalId=guid.new(),
    Name="Sphere",
    ObjectPlacement=placement,
    Representation=product_definition_shape
)

# Relate sphere to storey
model.create_entity(
    "IfcRelContainedInSpatialStructure",
    GlobalId=guid.new(),
    RelatingStructure=storey,
    RelatedElements=[sphere_element]
)

# Write the file
model.write("sphere.ifc")