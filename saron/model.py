import ifcopenshell
import ifcopenshell.api
import math

# Create a new IFC file
model = ifcopenshell.file()

# Create project
project = ifcopenshell.api.run("root.create_entity", model, ifc_class="IfcProject", name="Office Building Project")

# Assign basic metric units (we'll handle imperial conversions in the geometry)
ifcopenshell.api.run("unit.assign_unit", model)

# Create geometric contexts
context = ifcopenshell.api.run("context.add_context", model, context_type="Model")
body = ifcopenshell.api.run("context.add_context", model, context_type="Model", 
    context_identifier="Body", target_view="MODEL_VIEW", parent=context)

# Create spatial hierarchy
site = ifcopenshell.api.run("root.create_entity", model, ifc_class="IfcSite", name="Office Site")
building = ifcopenshell.api.run("root.create_entity", model, ifc_class="IfcBuilding", name="Office Building")
storey = ifcopenshell.api.run("root.create_entity", model, ifc_class="IfcBuildingStorey", name="Ground Floor")

# Assign spatial hierarchy
ifcopenshell.api.run("aggregate.assign_object", model, relating_object=project, products=[site])
ifcopenshell.api.run("aggregate.assign_object", model, relating_object=site, products=[building])
ifcopenshell.api.run("aggregate.assign_object", model, relating_object=building, products=[storey])

# Create rooms (spaces) - converting 20ft x 20ft to meters
room_dimensions = {"length": 6.096, "width": 6.096, "height": 3.658}  # 20ft x 20ft x 12ft in meters

room_a = ifcopenshell.api.run("root.create_entity", model, ifc_class="IfcSpace", name="Office Room A")
room_b = ifcopenshell.api.run("root.create_entity", model, ifc_class="IfcSpace", name="Office Room B")

# Assign rooms to storey using aggregate relationship
ifcopenshell.api.run("aggregate.assign_object", model, relating_object=storey, products=[room_a, room_b])

# Wall thickness in meters
exterior_wall_thickness = 0.3048  # 1ft in meters
interior_wall_thickness = 0.1524  # 6inches in meters

# Create exterior walls for Room A
wall_north_a = ifcopenshell.api.run("root.create_entity", model, ifc_class="IfcWall", name="External Wall North A")
wall_east_a = ifcopenshell.api.run("root.create_entity", model, ifc_class="IfcWall", name="External Wall East A")
wall_south_a = ifcopenshell.api.run("root.create_entity", model, ifc_class="IfcWall", name="External Wall South A")

# Create exterior walls for Room B
wall_north_b = ifcopenshell.api.run("root.create_entity", model, ifc_class="IfcWall", name="External Wall North B")
wall_west_b = ifcopenshell.api.run("root.create_entity", model, ifc_class="IfcWall", name="External Wall West B")
wall_south_b = ifcopenshell.api.run("root.create_entity", model, ifc_class="IfcWall", name="External Wall South B")

# Create shared interior wall
interior_wall = ifcopenshell.api.run("root.create_entity", model, ifc_class="IfcWall", name="Interior Wall")

# Create openings (converting to meters)
door_dimensions = {"width": 0.914, "height": 2.134}  # 3ft x 7ft in meters
window_dimensions = {"width": 1.219, "height": 1.829}  # 4ft x 6ft in meters

main_door = ifcopenshell.api.run("root.create_entity", model, ifc_class="IfcDoor", name="Main Entrance")
interior_door = ifcopenshell.api.run("root.create_entity", model, ifc_class="IfcDoor", name="Interior Door")
window_a = ifcopenshell.api.run("root.create_entity", model, ifc_class="IfcWindow", name="Window Room A")
window_b = ifcopenshell.api.run("root.create_entity", model, ifc_class="IfcWindow", name="Window Room B")

# Create building services
hvac_system = ifcopenshell.api.run("root.create_entity", model, ifc_class="IfcSystem", name="HVAC System")
electrical_system = ifcopenshell.api.run("root.create_entity", model, ifc_class="IfcSystem", name="Electrical System")

# Create fire safety elements
smoke_detector_a = ifcopenshell.api.run("root.create_entity", model, ifc_class="IfcSensor", name="Smoke Detector A")
smoke_detector_b = ifcopenshell.api.run("root.create_entity", model, ifc_class="IfcSensor", name="Smoke Detector B")
fire_extinguisher = ifcopenshell.api.run("root.create_entity", model, ifc_class="IfcFireSuppressionTerminal", 
    name="Fire Extinguisher")

# Collect building elements (excluding spaces)
building_elements = [
    wall_north_a, wall_east_a, wall_south_a,
    wall_north_b, wall_west_b, wall_south_b,
    interior_wall, main_door, interior_door,
    window_a, window_b, smoke_detector_a,
    smoke_detector_b, fire_extinguisher
]

# Assign building elements to the storey
ifcopenshell.api.run("spatial.assign_container", model, relating_structure=storey, products=building_elements)

# Add geometric representations for walls
for wall in [wall_north_a, wall_east_a, wall_south_a, wall_north_b, wall_west_b, wall_south_b]:
    # Create wall representation (length=6.096m (20ft), height=3.658m (12ft), thickness=0.3048m (1ft))
    representation = ifcopenshell.api.run("geometry.add_wall_representation", model, 
        context=body, length=6.096, height=3.658, thickness=0.3048)
    ifcopenshell.api.run("geometry.assign_representation", model, product=wall, representation=representation)

# Add geometric representation for interior wall
representation = ifcopenshell.api.run("geometry.add_wall_representation", model,
    context=body, length=6.096, height=3.658, thickness=0.1524)
ifcopenshell.api.run("geometry.assign_representation", model, product=interior_wall, representation=representation)

# Save the IFC file
model.write("office_building.ifc")