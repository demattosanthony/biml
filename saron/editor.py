import ifcopenshell
from ifcopenshell.api import root, context, unit, spatial, type, geometry, aggregate, owner
import numpy as np

def create_owner_history(file):
    """Create a more detailed owner history"""
    person = owner.add_person(
        file,
        identification="user123",
        family_name="Doe",
        given_name="John"
    )
    
    org = owner.add_organisation(
        file,
        identification="company123",
        name="Example Company"
    )
    
    user = owner.add_person_and_organisation(file, person, org)
    
    application = owner.add_application(
        file,
        application_identifier="MyApp",
        version="1.0",
        application_full_name="My IFC Application"
    )
    
    # Set up owner history settings
    owner.settings.get_user = lambda x: user
    owner.settings.get_application = lambda x: application
    
    return user, application

def create_ifc_hierarchy(schema="IFC2X3"):
    # Create a new IFC file with matching schema
    new_file = ifcopenshell.file(schema=schema) 
    
    # Create detailed owner history
    user, application = create_owner_history(new_file)
    
    # Create project
    project = root.create_entity(new_file, ifc_class="IfcProject", name="New Project")
    
    # Set up geometric representation contexts
    model_context = context.add_context(new_file, context_type="Model")
    body_context = context.add_context(
        new_file, 
        context_type="Model",
        context_identifier="Body",
        target_view="MODEL_VIEW",
        parent=model_context
    )
    
    # Set units - using metric
    length_unit = unit.add_si_unit(new_file, unit_type="LENGTHUNIT", prefix="MILLI")
    unit.assign_unit(new_file, units=[length_unit])
    
    # Create spatial hierarchy
    site = root.create_entity(new_file, ifc_class="IfcSite", name="Site")
    building = root.create_entity(new_file, ifc_class="IfcBuilding", name="Building")
    storey = root.create_entity(new_file, ifc_class="IfcBuildingStorey", name="Level 1")
    
    # Set up the spatial containment
    aggregate.assign_object(new_file, relating_object=project, products=[site])
    aggregate.assign_object(new_file, relating_object=site, products=[building])
    aggregate.assign_object(new_file, relating_object=building, products=[storey])
    
    return new_file, storey, body_context

def copy_door_with_geometry(source_file, target_file, source_door):
    """Create a new door with copied geometry"""
    # Create new door
    new_door = root.create_entity(target_file, ifc_class="IfcDoor")
    
    # Find door style/type
    door_style = None
    for rel in source_file.by_type("IfcRelDefinesByType"):
        if rel.RelatedObjects and rel.RelatedObjects[0].id() == source_door.id():
            door_style = rel.RelatingType
            break
    
    # Copy door style if found
    if door_style:
        new_style = target_file.add(door_style)
        type.assign_type(target_file, [new_door], new_style)
    
    # Copy representation
    if source_door.Representation:
        # Add the representation to the target file
        new_representation = target_file.add(source_door.Representation)
        # Assign the representation to the new door
        new_door.Representation = new_representation
        
    return new_door

def main():
    # Load source IFC with the door
    source_file = ifcopenshell.open('bim_objects/DoorPanel_Aluminum_Cline_Louver-TopAndBottom.ifc')
    original_door = source_file.by_type('IfcDoor')[0]
    
    # Create new IFC file with proper hierarchy and matching schema
    new_file, storey, body_context = create_ifc_hierarchy(schema=source_file.schema)
    
    # Create multiple doors
    spacing = 3000  # 3000mm = 3m spacing
    doors = []
    
    # Create a 10x10 grid of doors
    for i in range(10):
        for j in range(10):
            # Calculate placement (in millimeters since we set units to MILLI)
            x = i * spacing
            y = j * spacing
            z = 0
            
            # Copy the door with geometry
            new_door = copy_door_with_geometry(source_file, new_file, original_door)
            
            # Create a transformation matrix for the new placement
            matrix = np.eye(4)
            matrix[0:3, 3] = [x, y, z]  # Set the translation
            
            # Set the new placement
            geometry.edit_object_placement(new_file, product=new_door, matrix=matrix)
            
            # Assign door to storey
            spatial.assign_container(new_file, products=[new_door], relating_structure=storey)
            
            doors.append(new_door)
    
    # Save the new file
    new_file.write('output_with_multiple_doors.ifc')

if __name__ == "__main__":
    main()