import ifcopenshell
import ifcopenshell.api
import math
import numpy as np
from ifcopenshell.api import run

# Create a new IFC file
model = ifcopenshell.file(schema="IFC4")

# Create project
project = run("root.create_entity", model, ifc_class="IfcProject", name="Office Building Project")

# Set up units - using default metric units
run("unit.assign_unit", model)

# Set up geometric contexts
context = run("context.add_context", model, context_type="Model")
body = run("context.add_context", model, context_type="Model", context_identifier="Body", target_view="MODEL_VIEW", parent=context)

# Create spatial hierarchy
site = run("root.create_entity", model, ifc_class="IfcSite", name="Office Site")
building = run("root.create_entity", model, ifc_class="IfcBuilding", name="Office Building")
storey = run("root.create_entity", model, ifc_class="IfcBuildingStorey", name="Ground Floor")

# Set up spatial hierarchy relationships
run("aggregate.assign_object", model, relating_object=project, products=[site])
run("aggregate.assign_object", model, relating_object=site, products=[building])
run("aggregate.assign_object", model, relating_object=building, products=[storey])

# Convert dimensions from feet to meters
wall_thickness = 0.2  # ~8 inches
room_height = 3.66    # 12 feet in meters
length_50ft = 15.24   # 50 feet in meters
length_20ft = 6.096   # 20 feet in meters
floor_thickness = 0.3 # 12 inches
door_width = 0.914    # 3 feet
door_height = 2.134   # 7 feet

# Create floor slab
floor_slab = run("root.create_entity", model, ifc_class="IfcSlab", name="Ground Floor Slab")
matrix = np.eye(4)
matrix[0:3, 3] = [0, 0, -floor_thickness]
run("geometry.edit_object_placement", model, product=floor_slab, matrix=matrix)

# Create floor slab representation
floor_rep = run("geometry.add_wall_representation", model, context=body, 
                length=length_50ft, height=floor_thickness, thickness=length_20ft)
run("geometry.assign_representation", model, product=floor_slab, representation=floor_rep)

# Create roof slab
roof_slab = run("root.create_entity", model, ifc_class="IfcSlab", name="Roof Slab")
matrix = np.eye(4)
matrix[0:3, 3] = [0, 0, room_height]
run("geometry.edit_object_placement", model, product=roof_slab, matrix=matrix)

# Create roof slab representation
roof_rep = run("geometry.add_wall_representation", model, context=body, 
               length=length_50ft, height=floor_thickness, thickness=length_20ft)
run("geometry.assign_representation", model, product=roof_slab, representation=roof_rep)

# Create walls with specific positions
# South wall (with main entrance)
south_wall = run("root.create_entity", model, ifc_class="IfcWallStandardCase", name="South Wall")
matrix = np.eye(4)
matrix[0:3, 3] = [0, 0, 0]
run("geometry.edit_object_placement", model, product=south_wall, matrix=matrix)

# Create opening for main entrance
main_door_opening = run("root.create_entity", model, ifc_class="IfcOpeningElement", name="Main Door Opening")
opening_rep = run("geometry.add_wall_representation", model, context=body,
                 length=door_width + 0.1, height=door_height + 0.1, thickness=wall_thickness + 0.1)
run("geometry.assign_representation", model, product=main_door_opening, representation=opening_rep)

# Position opening in south wall
matrix = np.eye(4)
matrix[0:3, 3] = [length_50ft/4, 0, 0]
run("geometry.edit_object_placement", model, product=main_door_opening, matrix=matrix)

# Create void in south wall for door
run("void.add_opening", model, opening=main_door_opening, element=south_wall)

# Create other walls
north_wall = run("root.create_entity", model, ifc_class="IfcWallStandardCase", name="North Wall")
matrix = np.eye(4)
matrix[0:3, 3] = [0, length_20ft, 0]
run("geometry.edit_object_placement", model, product=north_wall, matrix=matrix)

east_wall = run("root.create_entity", model, ifc_class="IfcWallStandardCase", name="East Wall")
matrix = np.eye(4)
matrix[0:3, 3] = [length_50ft, 0, 0]
matrix = np.dot(matrix, np.array([[0, -1, 0, 0], [1, 0, 0, 0], [0, 0, 1, 0], [0, 0, 0, 1]]))
run("geometry.edit_object_placement", model, product=east_wall, matrix=matrix)

west_wall = run("root.create_entity", model, ifc_class="IfcWallStandardCase", name="West Wall")
matrix = np.eye(4)
matrix = np.dot(matrix, np.array([[0, -1, 0, 0], [1, 0, 0, 0], [0, 0, 1, 0], [0, 0, 0, 1]]))
run("geometry.edit_object_placement", model, product=west_wall, matrix=matrix)

# Interior wall with opening
interior_wall = run("root.create_entity", model, ifc_class="IfcWallStandardCase", name="Interior Wall")
matrix = np.eye(4)
matrix[0:3, 3] = [length_50ft/2, 0, 0]
matrix = np.dot(matrix, np.array([[0, -1, 0, 0], [1, 0, 0, 0], [0, 0, 1, 0], [0, 0, 0, 1]]))
run("geometry.edit_object_placement", model, product=interior_wall, matrix=matrix)

# Create opening for interior door
interior_door_opening = run("root.create_entity", model, ifc_class="IfcOpeningElement", name="Interior Door Opening")
opening_rep = run("geometry.add_wall_representation", model, context=body,
                 length=door_width + 0.1, height=door_height + 0.1, thickness=wall_thickness + 0.1)
run("geometry.assign_representation", model, product=interior_door_opening, representation=opening_rep)

# Position opening in interior wall
matrix = np.eye(4)
matrix[0:3, 3] = [length_50ft/2, length_20ft/2, 0]
matrix = np.dot(matrix, np.array([[0, -1, 0, 0], [1, 0, 0, 0], [0, 0, 1, 0], [0, 0, 0, 1]]))
run("geometry.edit_object_placement", model, product=interior_door_opening, matrix=matrix)

# Create void in interior wall for door
run("void.add_opening", model, opening=interior_door_opening, element=interior_wall)

# Add representations for walls
north_wall_rep = run("geometry.add_wall_representation", model, context=body, length=length_50ft, height=room_height, thickness=wall_thickness)
south_wall_rep = run("geometry.add_wall_representation", model, context=body, length=length_50ft, height=room_height, thickness=wall_thickness)
east_wall_rep = run("geometry.add_wall_representation", model, context=body, length=length_20ft, height=room_height, thickness=wall_thickness)
west_wall_rep = run("geometry.add_wall_representation", model, context=body, length=length_20ft, height=room_height, thickness=wall_thickness)
interior_wall_rep = run("geometry.add_wall_representation", model, context=body, length=length_20ft, height=room_height, thickness=wall_thickness)

# Assign representations to walls
run("geometry.assign_representation", model, product=north_wall, representation=north_wall_rep)
run("geometry.assign_representation", model, product=south_wall, representation=south_wall_rep)
run("geometry.assign_representation", model, product=east_wall, representation=east_wall_rep)
run("geometry.assign_representation", model, product=west_wall, representation=west_wall_rep)
run("geometry.assign_representation", model, product=interior_wall, representation=interior_wall_rep)

# Create and position doors
main_door = run("root.create_entity", model, ifc_class="IfcDoor", name="Main Entrance")
main_door_rep = run("geometry.add_wall_representation", model, context=body, 
                    length=door_width, height=door_height, thickness=wall_thickness/2)
run("geometry.assign_representation", model, product=main_door, representation=main_door_rep)

# Position main door in opening
matrix = np.eye(4)
matrix[0:3, 3] = [length_50ft/4, 0, 0]
run("geometry.edit_object_placement", model, product=main_door, matrix=matrix)

# Create relationship between door and opening
rel_fills_element = model.create_entity(
    "IfcRelFillsElement",
    GlobalId=ifcopenshell.guid.new(),
    RelatingOpeningElement=main_door_opening,
    RelatedBuildingElement=main_door
)

# Create interior door
interior_door = run("root.create_entity", model, ifc_class="IfcDoor", name="Interior Door")
interior_door_rep = run("geometry.add_wall_representation", model, context=body, 
                       length=door_width, height=door_height, thickness=wall_thickness/2)
run("geometry.assign_representation", model, product=interior_door, representation=interior_door_rep)

# Position interior door in opening
matrix = np.eye(4)
matrix[0:3, 3] = [length_50ft/2, length_20ft/2, 0]
matrix = np.dot(matrix, np.array([[0, -1, 0, 0], [1, 0, 0, 0], [0, 0, 1, 0], [0, 0, 0, 1]]))
run("geometry.edit_object_placement", model, product=interior_door, matrix=matrix)

# Create relationship between interior door and opening
rel_fills_element = model.create_entity(
    "IfcRelFillsElement",
    GlobalId=ifcopenshell.guid.new(),
    RelatingOpeningElement=interior_door_opening,
    RelatedBuildingElement=interior_door
)

# Create spaces (rooms)
room_a = run("root.create_entity", model, ifc_class="IfcSpace", name="Office Room A")
room_b = run("root.create_entity", model, ifc_class="IfcSpace", name="Office Room B")

# Add all elements to storey
all_elements = [
    floor_slab, roof_slab,
    north_wall, south_wall, east_wall, west_wall, interior_wall,
    main_door, interior_door,
    room_a, room_b
]
run("aggregate.assign_object", model, relating_object=storey, products=all_elements)

# Add material information
brick_material = run("material.add_material", model, name="Brick Veneer")
drywall_material = run("material.add_material", model, name="Drywall")
concrete_material = run("material.add_material", model, name="Concrete")
door_material = run("material.add_material", model, name="Wood - Solid Core")

# Assign materials
exterior_walls = [north_wall, south_wall, east_wall, west_wall]
run("material.assign_material", model, products=exterior_walls, material=brick_material, type="IfcMaterial")
run("material.assign_material", model, products=[interior_wall], material=drywall_material, type="IfcMaterial")
run("material.assign_material", model, products=[floor_slab, roof_slab], material=concrete_material, type="IfcMaterial")
run("material.assign_material", model, products=[main_door, interior_door], material=door_material, type="IfcMaterial")

# Write the IFC file
model.write("office_building.ifc")