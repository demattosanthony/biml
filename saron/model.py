import ifcopenshell
from ifcopenshell import guid
import math

# Create a new IFC file
model = ifcopenshell.file(schema="IFC4")

# Set up units
length_unit = model.createIfcSIUnit(
    UnitType="LENGTHUNIT",
    Prefix="MILLI",
    Name="METRE"
)
units = model.createIfcUnitAssignment([length_unit])

# Set up 3D and Plan contexts
context_3d = model.createIfcGeometricRepresentationContext(
    ContextIdentifier="Model",
    ContextType="Model",
    CoordinateSpaceDimension=3,
    WorldCoordinateSystem=model.createIfcAxis2Placement3D(
        Location=model.createIfcCartesianPoint([0.0, 0.0, 0.0])
    )
)

# Add subcontexts for 3D
body_context = model.createIfcGeometricRepresentationSubContext(
    ContextIdentifier="Body",
    ContextType="Model",
    ParentContext=context_3d,
    TargetView="MODEL_VIEW"
)

# Create project and assign units and contexts
project = model.createIfcProject(
    GlobalId=guid.new(),
    Name="Table Project",
    UnitsInContext=units,
    RepresentationContexts=[context_3d]
)

# Create site
site = model.createIfcSite(
    GlobalId=guid.new(),
    Name="Site"
)

# Create building
building = model.createIfcBuilding(
    GlobalId=guid.new(),
    Name="Building"
)

# Create spatial hierarchy
site_container = model.createIfcRelAggregates(
    GlobalId=guid.new(),
    RelatingObject=project,
    RelatedObjects=[site]
)

building_container = model.createIfcRelAggregates(
    GlobalId=guid.new(),
    RelatingObject=site,
    RelatedObjects=[building]
)

# Create table using extruded area solids
# Table parameters (in millimeters)
width = 1200
depth = 700
height = 750
leg_size = 50
thickness = 50

# Create table top profile
table_top_profile = model.createIfcRectangleProfileDef(
    ProfileType="AREA",
    XDim=float(width),
    YDim=float(depth)
)

# Create table top solid
table_top = model.createIfcExtrudedAreaSolid(
    SweptArea=table_top_profile,
    Position=model.createIfcAxis2Placement3D(
        Location=model.createIfcCartesianPoint([0.0, 0.0, float(height - thickness)]),
        Axis=model.createIfcDirection([0.0, 0.0, 1.0]),
        RefDirection=model.createIfcDirection([1.0, 0.0, 0.0])
    ),
    ExtrudedDirection=model.createIfcDirection([0.0, 0.0, 1.0]),
    Depth=float(thickness)
)

# Create leg profile
leg_profile = model.createIfcRectangleProfileDef(
    ProfileType="AREA",
    XDim=float(leg_size),
    YDim=float(leg_size)
)

# Create four legs
legs = []
leg_positions = [
    [-width/2 + leg_size/2, -depth/2 + leg_size/2, 0],
    [width/2 - leg_size/2, -depth/2 + leg_size/2, 0],
    [-width/2 + leg_size/2, depth/2 - leg_size/2, 0],
    [width/2 - leg_size/2, depth/2 - leg_size/2, 0]
]

for pos in leg_positions:
    leg = model.createIfcExtrudedAreaSolid(
        SweptArea=leg_profile,
        Position=model.createIfcAxis2Placement3D(
            Location=model.createIfcCartesianPoint([float(x) for x in pos]),
            Axis=model.createIfcDirection([0.0, 0.0, 1.0]),
            RefDirection=model.createIfcDirection([1.0, 0.0, 0.0])
        ),
        ExtrudedDirection=model.createIfcDirection([0.0, 0.0, 1.0]),
        Depth=float(height - thickness)
    )
    legs.append(leg)

# Create shape representation
shape_representation = model.createIfcShapeRepresentation(
    ContextOfItems=body_context,
    RepresentationIdentifier="Body",
    RepresentationType="SweptSolid",
    Items=[table_top] + legs
)

# Create table instance
table = model.createIfcFurniture(
    GlobalId=guid.new(),
    Name="Table 01",
    ObjectType="Table"
)

# Create placement at origin
placement = model.createIfcLocalPlacement(
    RelativePlacement=model.createIfcAxis2Placement3D(
        Location=model.createIfcCartesianPoint([0.0, 0.0, 0.0])
    )
)
table.ObjectPlacement = placement

# Assign representation
table_shape = model.createIfcProductDefinitionShape(
    Representations=[shape_representation]
)
table.Representation = table_shape

# Add table to building
building_contents = model.createIfcRelContainedInSpatialStructure(
    GlobalId=guid.new(),
    RelatingStructure=building,
    RelatedElements=[table]
)

# Save the file
model.write("output.ifc")
