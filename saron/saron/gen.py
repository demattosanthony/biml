import ifcopenshell
from ifcopenshell.api import (
    root, project, owner, unit, 
    context, geometry, material,
    system, spatial, aggregate
)
import numpy as np

# Create a new IFC file and set up the project
model = project.create_file()
project = root.create_entity(model, ifc_class="IfcProject", name="MEP Project")

# Set up units (using millimeters)
unit.assign_unit(model)

# Set up contexts for 3D geometry
model3d = context.add_context(model, context_type="Model")
body = context.add_context(model, context_type="Model", context_identifier="Body", target_view="MODEL_VIEW", parent=model3d)

# Create basic spatial structure
site = root.create_entity(model, ifc_class="IfcSite", name="Site")
building = root.create_entity(model, ifc_class="IfcBuilding", name="Building")
storey = root.create_entity(model, ifc_class="IfcBuildingStorey", name="Level 1")

# Set up the spatial hierarchy using aggregation throughout
aggregate.assign_object(model, relating_object=project, products=[site])
aggregate.assign_object(model, relating_object=site, products=[building])
aggregate.assign_object(model, relating_object=building, products=[storey])

# Create a mechanical system
hvac_system = system.add_system(model)
system.edit_system(model, system=hvac_system, attributes={
    "Name": "AHU-01 System",
    "PredefinedType": "AIRCONDITIONING"
})

# Create the AHU
ahu = root.create_entity(model, 
    ifc_class="IfcUnitaryEquipment",
    name="AHU-01",
    predefined_type="AIRHANDLINGUNIT"
)

# Create AHU geometry (simplified box representation)
ahu_rep = geometry.add_wall_representation(model, context=body, 
    length=2.0, height=2.0, thickness=1.0)
geometry.assign_representation(model, product=ahu, representation=ahu_rep)

# Position AHU
matrix = np.eye(4)
matrix[0:3, 3] = [0.0, 0.0, 0.0]  # Place at origin
geometry.edit_object_placement(model, product=ahu, matrix=matrix)

# Create AHU ports
ahu_supply_port = system.add_port(model, element=ahu)
ahu_return_port = system.add_port(model, element=ahu)

# Create main supply duct
supply_duct = root.create_entity(model, 
    ifc_class="IfcDuctSegment",
    name="SD-01",
    predefined_type="RIGIDSEGMENT"
)

# Create duct geometry (simplified)
duct_rep = geometry.add_wall_representation(model, context=body,
    length=3.0, height=0.3, thickness=0.3)
geometry.assign_representation(model, product=supply_duct, representation=duct_rep)

# Position duct
matrix = np.eye(4)
matrix[0:3, 3] = [2.0, 0.0, 0.0]  # Place next to AHU
geometry.edit_object_placement(model, product=supply_duct, matrix=matrix)

# Create duct ports
duct_port1 = system.add_port(model, element=supply_duct)
duct_port2 = system.add_port(model, element=supply_duct)

# Create terminal unit
terminal = root.create_entity(model,
    ifc_class="IfcAirTerminalBox",
    name="VAV-01",
    predefined_type="VARIABLEFLOWPRESSUREDEPENDANT"
)

# Create terminal geometry
terminal_rep = geometry.add_wall_representation(model, context=body,
    length=0.6, height=0.3, thickness=0.3)
geometry.assign_representation(model, product=terminal, representation=terminal_rep)

# Position terminal
matrix = np.eye(4)
matrix[0:3, 3] = [5.0, 0.0, 0.0]  # Place at end of duct
geometry.edit_object_placement(model, product=terminal, matrix=matrix)

# Create terminal port
terminal_port = system.add_port(model, element=terminal)

# Connect ports
system.connect_port(model, port1=ahu_supply_port, port2=duct_port1)
system.connect_port(model, port1=duct_port2, port2=terminal_port)

# Assign everything to the system
system.assign_system(model, products=[ahu, supply_duct, terminal], system=hvac_system)

# Assign to spatial container (this is still containment, not aggregation)
spatial.assign_container(model, products=[ahu, supply_duct, terminal], relating_structure=storey)

# Save the file
model.write("ahu_system.ifc")