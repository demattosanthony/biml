import ifcopenshell
from ifcopenshell.api import root, context, unit, spatial, type, geometry, aggregate, owner
from ifcopenshell import guid
import ifcopenshell.api
import ifcopenshell.api.geometry
import ifcopenshell.api.material
import ifcopenshell.util
import ifcopenshell.util.element
import numpy as np
import time

# Create new IFC file
model = ifcopenshell.file(schema="IFC2X3")

person = model.create_entity("IfcPerson", GivenName="John", FamilyName="Doe")
organization = model.create_entity("IfcOrganization", Name="My Company")
person_and_org = model.create_entity("IfcPersonAndOrganization", ThePerson=person, TheOrganization=organization)
application = model.create_entity(
    "IfcApplication", ApplicationDeveloper=organization, Version="v1.0", ApplicationFullName="My Application", ApplicationIdentifier="MY-APP"
)

# Create owner history
owner_history = model.create_entity(
    "IfcOwnerHistory",
    OwningUser=person_and_org,
    OwningApplication=application,
    State="READWRITE",
    ChangeAction="ADDED",
    CreationDate=int(time.time()),
)

# Create project
project = model.create_entity("IfcProject", GlobalId=guid.new(), Name="Office Chair Project")

# Set up geometric context
context = model.create_entity(
    "IfcGeometricRepresentationContext",
    ContextType="Model",
    CoordinateSpaceDimension=3,
    WorldCoordinateSystem=model.create_entity("IfcAxis2Placement3D", Location=model.create_entity("IfcCartesianPoint", Coordinates=(0.0, 0.0, 0.0))),
)

project.RepresentationContexts = [context]

# Set up units
unit_assignment = model.create_entity(
    "IfcUnitAssignment",
    Units=[
        model.create_entity("IfcSIUnit", UnitType="LENGTHUNIT", Name="METRE"),
        model.create_entity("IfcSIUnit", UnitType="AREAUNIT", Name="SQUARE_METRE"),
        model.create_entity("IfcSIUnit", UnitType="VOLUMEUNIT", Name="CUBIC_METRE"),
    ],
)
project.UnitsInContext = unit_assignment

# Create 3D context
model3d = model.create_entity(
    "IfcGeometricRepresentationSubContext", ContextIdentifier="Body", ContextType="Model", ParentContext=context, TargetView="MODEL_VIEW"
)

# Create site and building
site = model.create_entity("IfcSite", GlobalId=guid.new(), Name="Site")
building = model.create_entity("IfcBuilding", GlobalId=guid.new(), Name="Building")
storey = model.create_entity("IfcBuildingStorey", GlobalId=guid.new(), Name="Ground Floor")

# Create placements
site_placement = model.create_entity(
    "IfcLocalPlacement",
    RelativePlacement=model.create_entity("IfcAxis2Placement3D", Location=model.create_entity("IfcCartesianPoint", Coordinates=(0.0, 0.0, 0.0))),
)
building_placement = model.create_entity(
    "IfcLocalPlacement",
    PlacementRelTo=site_placement,
    RelativePlacement=model.create_entity("IfcAxis2Placement3D", Location=model.create_entity("IfcCartesianPoint", Coordinates=(0.0, 0.0, 0.0))),
)
storey_placement = model.create_entity(
    "IfcLocalPlacement",
    PlacementRelTo=building_placement,
    RelativePlacement=model.create_entity("IfcAxis2Placement3D", Location=model.create_entity("IfcCartesianPoint", Coordinates=(0.0, 0.0, 0.0))),
)

site.ObjectPlacement = site_placement
building.ObjectPlacement = building_placement
storey.ObjectPlacement = storey_placement

# Setup containment
model.create_entity("IfcRelAggregates", GlobalId=guid.new(), RelatingObject=project, RelatedObjects=[site])
model.create_entity("IfcRelAggregates", GlobalId=guid.new(), RelatingObject=site, RelatedObjects=[building])
model.create_entity("IfcRelAggregates", GlobalId=guid.new(), RelatingObject=building, RelatedObjects=[storey])

# Load source IFC with the door
source_file = ifcopenshell.open("bim_objects/DoorPanel_Aluminum_Cline_Louver-TopAndBottom.ifc")
original_door = source_file.by_type("IfcDoor")[0]
original_door_materials = ifcopenshell.util.element.get_materials(original_door)

# Copy the door into the new model
new_door = ifcopenshell.util.element.copy_deep(model, original_door)

# Update the GlobalId and Name
new_door.GlobalId = guid.new()
new_door.Name = "Office Door"
new_door.Description = "This is an office door that was copied from another IFC file."

door_placement = model.create_entity(
    "IfcLocalPlacement",
    RelativePlacement=model.create_entity("IfcAxis2Placement3D", Location=model.create_entity("IfcCartesianPoint", Coordinates=(0.0, 0.0, 0.0))),
)
new_door.ObjectPlacement = door_placement

# Get original door materials
orig_materials = ifcopenshell.util.element.get_materials(original_door)
for orig_mat in orig_materials:
    # Deep copy the material from the source file to the new model
    new_mat = ifcopenshell.util.element.copy_deep(model, orig_mat)

    # Check for any material definition representations that define color
    if hasattr(orig_mat, "HasRepresentation") and orig_mat.HasRepresentation:
        for mdr in orig_mat.HasRepresentation:
            if mdr.is_a("IfcMaterialDefinitionRepresentation"):
                # Deep copy the material definition representation
                new_mdr = ifcopenshell.util.element.copy_deep(model, mdr)
                # Link the new Mdr to the new material
                new_mdr.RepresentedMaterial = new_mat

    # Assign the newly copied material (with its representation) to the new door
    ifcopenshell.api.material.assign_material(file=model, products=[new_door], material=new_mat)

# Set spatial containment
model.create_entity("IfcRelContainedInSpatialStructure", GlobalId=guid.new(), RelatingStructure=storey, RelatedElements=[new_door])

# Save the model
model.write("test.ifc")
