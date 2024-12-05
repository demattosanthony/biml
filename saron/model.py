import ifcopenshell
from ifcopenshell import guid
import math
from ifcopenshell.util.shape_builder import ShapeBuilder, V
from ifcopenshell.util.placement import get_axis2placement

# Create new IFC file
model = ifcopenshell.file(schema="IFC4")

# Create project
project = model.create_entity("IfcProject", GlobalId=guid.new(), Name="Office Chair Project")

# Set up units
context = model.create_entity("IfcGeometricRepresentationContext", ContextType="Model", CoordinateSpaceDimension=3)
model.create_entity("IfcSIUnit", UnitType="LENGTHUNIT", Prefix="MILLI", Name="METRE")
model.create_entity("IfcSIUnit", UnitType="AREAUNIT", Name="SQUARE_METRE")
model.create_entity("IfcSIUnit", UnitType="VOLUMEUNIT", Name="CUBIC_METRE")

# Create 3D and plan contexts
model3d = model.create_entity(
    "IfcGeometricRepresentationSubContext", ContextIdentifier="Body", ContextType="Model", ParentContext=context, TargetView="MODEL_VIEW"
)

# Create site and building
site = model.create_entity("IfcSite", GlobalId=guid.new(), Name="Site")
building = model.create_entity("IfcBuilding", GlobalId=guid.new(), Name="Building")
storey = model.create_entity("IfcBuildingStorey", GlobalId=guid.new(), Name="Ground Floor")

# Setup containment
model.create_entity("IfcRelAggregates", GlobalId=guid.new(), RelatingObject=project, RelatedObjects=[site])
model.create_entity("IfcRelAggregates", GlobalId=guid.new(), RelatingObject=site, RelatedObjects=[building])
model.create_entity("IfcRelAggregates", GlobalId=guid.new(), RelatingObject=building, RelatedObjects=[storey])

# Create shape builder
builder = ShapeBuilder(model)

# Create furniture type
chair_type = model.create_entity("IfcFurnitureType", GlobalId=guid.new(), Name="Office Chair Type", PredefinedType="CHAIR")

# Create materials
plastic_material = model.create_entity("IfcMaterial", Name="Black Plastic")
metal_material = model.create_entity("IfcMaterial", Name="Chrome Metal")
fabric_material = model.create_entity("IfcMaterial", Name="Blue Fabric")


def create_circular_extrusion(builder, radius, height):
    circle = builder.circle(radius=radius)
    return builder.extrude(builder.profile(circle), height)


# Create base star shape
base_radius = 300
leg_width = 50
leg_height = 30
base_items = []

# Create 5 star legs
for i in range(5):
    angle = i * 2 * math.pi / 5
    # Create leg profile
    points = [
        V(0, -leg_width / 2),
        V(base_radius, -leg_width / 4),
        V(base_radius, leg_width / 4),
        V(0, leg_width / 2),
    ]
    leg_curve = builder.polyline(points, closed=True)
    leg = builder.extrude(builder.profile(leg_curve), leg_height)

    # Rotate and position leg
    builder.rotate([leg], angle)
    base_items.append(leg)

    # Add simplified caster as cylinder
    caster = create_circular_extrusion(builder, 30, 20)
    builder.translate([caster], V(base_radius * math.cos(angle), base_radius * math.sin(angle), -20))
    base_items.append(caster)

# Create central hub
hub_radius = 80
hub_height = 50
hub = create_circular_extrusion(builder, hub_radius, hub_height)
base_items.append(hub)

# Create gas lift cylinder
cylinder_height = 400
cylinder_radius = 25
gas_lift = create_circular_extrusion(builder, cylinder_radius, cylinder_height)
builder.translate([gas_lift], V(0, 0, hub_height))
base_items.append(gas_lift)

# Create seat cushion
seat_width = 500
seat_depth = 480
seat_thickness = 80

# Main seat cushion
seat_points = [
    V(-seat_width / 2, -seat_depth / 2),
    V(seat_width / 2, -seat_depth / 2),
    V(seat_width / 2, seat_depth / 2),
    V(-seat_width / 2, seat_depth / 2),
]
seat_curve = builder.polyline(seat_points, closed=True)
seat = builder.extrude(builder.profile(seat_curve), seat_thickness)
builder.translate([seat], V(0, 0, hub_height + cylinder_height))

# Create backrest
back_height = 600
back_width = 460
back_thickness = 60

# Simplified backrest as a rectangular extrusion
back_points = [
    V(0, -back_width / 2),
    V(0, back_width / 2),
    V(back_height, back_width / 2),
    V(back_height, -back_width / 2),
]
back_curve = builder.polyline(back_points, closed=True)
back = builder.extrude(builder.profile(back_curve), back_thickness)

# Position backrest
builder.translate([back], V(-back_thickness / 2, 0, hub_height + cylinder_height + seat_thickness))

# Create armrests
arm_items = []
for side in [-1, 1]:
    # Simplified armrest as rectangular extrusion
    arm_width = 50
    arm_length = 300
    arm_height = 30

    arm_points = [
        V(0, -arm_width / 2),
        V(arm_length, -arm_width / 2),
        V(arm_length, arm_width / 2),
        V(0, arm_width / 2),
    ]
    arm_curve = builder.polyline(arm_points, closed=True)
    arm = builder.extrude(builder.profile(arm_curve), arm_height)

    # Position armrest
    builder.translate([arm], V(side * seat_width / 3, -seat_depth / 4, hub_height + cylinder_height + seat_thickness + 200))
    arm_items.append(arm)

    # Armrest support
    support = create_circular_extrusion(builder, 20, 200)
    builder.translate([support], V(side * seat_width / 3, -seat_depth / 4, hub_height + cylinder_height + seat_thickness))
    arm_items.append(support)

# Combine all items
all_items = base_items + [seat] + [back] + arm_items

# Create the chair representation
chair_representation = builder.get_representation(context=model3d, items=all_items)

# Assign representation to chair type
model.create_entity("IfcRelDefinesByRepresentation", GlobalId=guid.new(), RelatingRepresentation=chair_representation, RelatedObjects=[chair_type])

# Create chair occurrence
chair = model.create_entity("IfcFurniture", GlobalId=guid.new(), Name="Office Chair")

# Create placement for chair
placement = model.create_entity("IfcLocalPlacement")
axis2placement = model.create_entity("IfcAxis2Placement3D", Location=model.create_entity("IfcCartesianPoint", Coordinates=(0.0, 0.0, 0.0)))
placement.RelativePlacement = axis2placement

chair.ObjectPlacement = placement

# Assign type to occurrence
model.create_entity("IfcRelDefinesByType", GlobalId=guid.new(), RelatingType=chair_type, RelatedObjects=[chair])

# Add chair to storey
model.create_entity("IfcRelContainedInSpatialStructure", GlobalId=guid.new(), RelatingStructure=storey, RelatedElements=[chair])

# Save the file
model.write("output.ifc")
