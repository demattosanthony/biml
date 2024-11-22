import ifcopenshell
from ifcopenshell.file import file

# Initialize an empty IFC model with the specified schema
model = file(schema="IFC4")

# Create the main project entity
project = ifcopenshell.api.run("root.create_entity", model, ifc_class="IfcProject", name="2-Story Office Project")

# Assign metric units
ifcopenshell.api.run("unit.assign_unit", model)

# Create a modeling geometry context for 3D geometry
context = ifcopenshell.api.run("context.add_context", model, context_type="Model")

# Context for the body geometry
body_context = ifcopenshell.api.run("context.add_context", model, context_type="Model",
    context_identifier="Body", target_view="MODEL_VIEW", parent=context)

# Create spatial hierarchy
site = ifcopenshell.api.run("root.create_entity", model, ifc_class="IfcSite", name="Site")
building = ifcopenshell.api.run("root.create_entity", model, ifc_class="IfcBuilding", name="Office Building")
storey_1 = ifcopenshell.api.run("root.create_entity", model, ifc_class="IfcBuildingStorey", name="First Floor")
storey_2 = ifcopenshell.api.run("root.create_entity", model, ifc_class="IfcBuildingStorey", name="Second Floor")

# Assign the hierarchy: Site -> Building -> Storeys
ifcopenshell.api.run("aggregate.assign_object", model, relating_object=project, products=[site])
ifcopenshell.api.run("aggregate.assign_object", model, relating_object=site, products=[building])
ifcopenshell.api.run("aggregate.assign_object", model, relating_object=building, products=[storey_1, storey_2])

# Define office spaces and major areas
def create_space(name, area):
    return ifcopenshell.api.run("root.create_entity", model, ifc_class="IfcSpace", name=name)

entrance_lobby = create_space("Entrance Lobby", 400)
open_office_1 = create_space("Open Office 1", 1500)
open_office_2 = create_space("Open Office 2", 2000)
private_offices = [create_space(f"Private Office {i+1}", 150) for i in range(4)]
conference_rooms = [create_space(f"Conference Room {i+1}", 300) for i in range(2)]
restrooms = [create_space(f"Restroom {i+1}", 150) for i in range(4)]
break_room = create_space("Break Room", 300)
mechanical_room = create_space("Mechanical Room", 200)

# Assign spaces to storeys
ifcopenshell.api.run("aggregate.assign_object", model, relating_object=storey_1, products=[entrance_lobby, open_office_1] + private_offices[:2] + [conference_rooms[0]] + restrooms[:2])
ifcopenshell.api.run("aggregate.assign_object", model, relating_object=storey_2, products=[open_office_2] + private_offices[2:] + [conference_rooms[1], break_room] + restrooms[2:] + [mechanical_room])

# Create structural elements (walls)
wall = ifcopenshell.api.run("root.create_entity", model, ifc_class="IfcWall")

# Add wall representation as a placeholder
representation = ifcopenshell.api.run("geometry.add_wall_representation", model, context=body_context, length=10, height=3, thickness=0.3)
ifcopenshell.api.run("geometry.assign_representation", model, product=wall, representation=representation)

# Assign walls to the building's storeys
ifcopenshell.api.run("spatial.assign_container", model, products=[wall], relating_structure=storey_1)
ifcopenshell.api.run("spatial.assign_container", model, products=[wall], relating_structure=storey_2)

# MEP placeholders using a valid IFC4 entity
for _ in range(4):
    pipe_placeholder = ifcopenshell.api.run("root.create_entity", model, ifc_class="IfcDistributionElement", name="Pipe Placeholder")
    ifcopenshell.api.run("spatial.assign_container", model, products=[pipe_placeholder], relating_structure=storey_1)

# Export to IFC file format
model.write("office_building_model.ifc")