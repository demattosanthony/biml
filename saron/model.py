import ifcopenshell
from ifcopenshell import guid
import math

# Create a new IFC file
model = ifcopenshell.file(schema="IFC2X3")

# Helper function to create direction
def create_direction(x, y, z):
    return model.create_entity('IfcDirection', DirectionRatios=[x, y, z])

def create_cartesian_point(coords):
    return model.create_entity('IfcCartesianPoint', Coordinates=coords)

# Create basic IFC elements
project = model.create_entity("IfcProject", 
    GlobalId=guid.new(), 
    Name="Example Room Specification")

# Set up the units
length_unit = model.create_entity('IfcSIUnit', 
    UnitType='LENGTHUNIT', 
    Name='METRE')
area_unit = model.create_entity('IfcSIUnit',
    UnitType='AREAUNIT',
    Name='SQUARE_METRE')
volume_unit = model.create_entity('IfcSIUnit',
    UnitType='VOLUMEUNIT',
    Name='CUBIC_METRE')
units = model.create_entity('IfcUnitAssignment', Units=[length_unit, area_unit, volume_unit])
project.UnitsInContext = units

# Create geometric context
context = model.create_entity('IfcGeometricRepresentationContext',
    ContextType="Model",
    CoordinateSpaceDimension=3,
    Precision=0.00001,
    WorldCoordinateSystem=model.create_entity('IfcAxis2Placement3D', Location=create_cartesian_point([0., 0., 0.])))

# Set up the site, building and storey hierarchy
site = model.create_entity("IfcSite", 
    GlobalId=guid.new(), 
    Name="Site")
building = model.create_entity("IfcBuilding", 
    GlobalId=guid.new(), 
    Name="Building")
storey = model.create_entity("IfcBuildingStorey", 
    GlobalId=guid.new(), 
    Name="Ground Floor")

# Create spatial structure relationships
model.create_entity('IfcRelAggregates', 
    GlobalId=guid.new(),
    RelatingObject=project,
    RelatedObjects=[site])
model.create_entity('IfcRelAggregates',
    GlobalId=guid.new(),
    RelatingObject=site,
    RelatedObjects=[building])
model.create_entity('IfcRelAggregates',
    GlobalId=guid.new(),
    RelatingObject=building,
    RelatedObjects=[storey])

# Create the room (space)
room = model.create_entity('IfcSpace',
    GlobalId=guid.new(),
    Name='Example Room',
    ObjectType='Room',
    CompositionType='ELEMENT')

# Create relationship between storey and room
model.create_entity('IfcRelAggregates',
    GlobalId=guid.new(),
    RelatingObject=storey,
    RelatedObjects=[room])

# Create materials
concrete_material = model.create_entity('IfcMaterial', Name='Concrete')
gypsum_material = model.create_entity('IfcMaterial', Name='Gypsum Plasterboard')
insulation_material = model.create_entity('IfcMaterial', Name='Polyurethane Foam')

# Create wall layer set
wall_layer_set = model.create_entity('IfcMaterialLayerSet',
    MaterialLayers=[
        model.create_entity('IfcMaterialLayer', Material=concrete_material, LayerThickness=0.2),
        model.create_entity('IfcMaterialLayer', Material=insulation_material, LayerThickness=0.05),
        model.create_entity('IfcMaterialLayer', Material=gypsum_material, LayerThickness=0.0125)
    ],
    LayerSetName='External Wall Construction')

# Create walls (simplified geometry)
walls = []
wall_lengths = [4.0, 3.0, 4.0, 3.0]  # Length of each wall in meters
wall_directions = [[1,0,0], [0,1,0], [-1,0,0], [0,-1,0]]  # Direction vectors for each wall
wall_positions = [[0,0,0], [4,0,0], [4,3,0], [0,3,0]]  # Starting position for each wall

for i in range(4):
    wall = model.create_entity('IfcWall',
        GlobalId=guid.new(),
        Name=f'Wall {i+1}',
        ObjectType='External Wall')
    
    # Associate material layer set with wall
    model.create_entity('IfcRelAssociatesMaterial',
        GlobalId=guid.new(),
        RelatedObjects=[wall],
        RelatingMaterial=wall_layer_set)
    
    walls.append(wall)

# Create door (simplified)
door = model.create_entity('IfcDoor',
    GlobalId=guid.new(),
    Name='Room Door',
    OverallHeight=2.1,
    OverallWidth=0.9)

# Create floor slab
floor_slab = model.create_entity('IfcSlab',
    GlobalId=guid.new(),
    Name='Floor',
    ObjectType='FLOOR')

# Create ceiling
ceiling = model.create_entity('IfcCovering',
    GlobalId=guid.new(),
    Name='Suspended Ceiling',
    ObjectType='CEILING')

# Create property sets for thermal properties
thermal_props = model.create_entity('IfcPropertySet',
    GlobalId=guid.new(),
    Name='Pset_ThermalProperties',
    HasProperties=[
        model.create_entity('IfcPropertySingleValue',
            Name='ThermalTransmittance',
            NominalValue=model.create_entity('IfcThermodynamicTemperatureMeasure', 0.3))
    ])

# Associate elements with the storey
model.create_entity('IfcRelContainedInSpatialStructure',
    GlobalId=guid.new(),
    RelatingStructure=storey,
    RelatedElements=walls + [door, floor_slab, ceiling])

# Save the IFC file
model.write('output.ifc')