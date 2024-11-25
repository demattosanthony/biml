import ifcopenshell
from ifcopenshell import guid
from ifcopenshell.util.element import copy_deep

def create_ifc_model():
    """Creates a new IFC model with necessary contexts and project hierarchy."""
    model = ifcopenshell.file(schema="IFC2X3")

    # Create geometric representation context
    context = model.create_entity(
        "IfcGeometricRepresentationContext",
        ContextIdentifier="Plan",
        ContextType="Model",
        CoordinateSpaceDimension=3,
        Precision=0.0001,
        WorldCoordinateSystem=model.create_entity(
            "IfcAxis2Placement3D",
            Location=model.create_entity("IfcCartesianPoint", Coordinates=(0.0, 0.0, 0.0))
        )
    )

    # Create project hierarchy
    project = model.create_entity("IfcProject", Name="My Project", GlobalId=guid.new())
    project.RepresentationContexts = [context]
    project.UnitsInContext = model.create_entity(
        "IfcUnitAssignment",
        Units=[
            model.create_entity("IfcSIUnit", UnitType="LENGTHUNIT", Name="METRE"),
            model.create_entity("IfcSIUnit", UnitType="PLANEANGLEUNIT", Name="RADIAN")
        ]
    )

    site = model.create_entity("IfcSite", Name="Site", GlobalId=guid.new())
    building = model.create_entity("IfcBuilding", Name="Building", GlobalId=guid.new())

    # Link hierarchy
    model.create_entity(
        "IfcRelAggregates",
        RelatingObject=project,
        RelatedObjects=[site],
    )
    model.create_entity(
        "IfcRelAggregates",
        RelatingObject=site,
        RelatedObjects=[building],
    )

    return model, building

def load_bim_object(file_path, object_type):
    """Loads a BIM object from a file and returns the first entity of the specified type."""
    bim_model = ifcopenshell.open(file_path)
    for entity in bim_model.by_type(object_type):
        return bim_model, entity
    print(f"No object of type {object_type} found in {file_path}.")
    return None, None

def copy_material_definitions(target_model, source_model, material_select, copied_entities):
    """
    Recursively copies all material definitions and their associated properties.
    
    Args:
        target_model: The target IFC model
        source_model: The source IFC model
        material_select: The material or material list to copy
        copied_entities: Dictionary to track copied entities
    
    Returns:
        The copied material definition in the target model
    """
    if material_select is None:
        return None
        
    # If already copied, return the existing copy
    if material_select.id() in copied_entities:
        return copied_entities[material_select.id()]
        
    new_material = None
    
    # Handle different types of material definitions
    if material_select.is_a("IfcMaterial"):
        new_material = copy_deep(target_model, material_select, copied_entities)
        
        # Copy material properties
        for rel in source_model.by_type("IfcMaterialProperties"):
            if rel.Material == material_select:
                copy_deep(target_model, rel, copied_entities)
                
    elif material_select.is_a("IfcMaterialList"):
        materials = [copy_material_definitions(target_model, source_model, m, copied_entities) 
                    for m in material_select.Materials]
        new_material = target_model.create_entity("IfcMaterialList", Materials=materials)
        copied_entities[material_select.id()] = new_material
        
    elif material_select.is_a("IfcMaterialLayerSet"):
        new_layers = []
        for layer in material_select.MaterialLayers:
            new_material_layer = copy_deep(target_model, layer, copied_entities)
            if layer.Material:
                new_material_layer.Material = copy_material_definitions(
                    target_model, source_model, layer.Material, copied_entities
                )
            new_layers.append(new_material_layer)
        
        new_material = target_model.create_entity(
            "IfcMaterialLayerSet",
            MaterialLayers=new_layers,
            LayerSetName=material_select.LayerSetName
        )
        copied_entities[material_select.id()] = new_material
        
    return new_material

def copy_and_place_bim_object(target_model, bim_model, bim_object, container, placement=None):
    """Copies a BIM object into the target model and places it within the spatial structure."""
    # Copy the object into the target model
    copied_entities = {}
    new_object = copy_deep(
        ifc_file=target_model,
        element=bim_object,
        copied_entities=copied_entities
    )

    # Copy property sets
    for relationship in bim_model.by_type("IfcRelDefinesByProperties"):
        if bim_object in relationship.RelatedObjects:
            new_relationship = copy_deep(
                ifc_file=target_model,
                element=relationship,
                copied_entities=copied_entities
            )
            new_relationship.RelatedObjects = [new_object]

    # Copy materials and their definitions
    for material_relation in bim_model.by_type("IfcRelAssociatesMaterial"):
        if bim_object in material_relation.RelatedObjects:
            # Get the material definition
            material_select = material_relation.RelatingMaterial
            
            # Copy the complete material definition
            new_material_select = copy_material_definitions(
                target_model,
                bim_model,
                material_select,
                copied_entities
            )
            
            # Create new material association
            target_model.create_entity(
                "IfcRelAssociatesMaterial",
                GlobalId=guid.new(),
                RelatedObjects=[new_object],
                RelatingMaterial=new_material_select
            )

    # Handle placement
    if placement:
        new_object.ObjectPlacement = placement
    else:
        new_object.ObjectPlacement = target_model.create_entity(
            "IfcLocalPlacement",
            PlacementRelTo=None,
            RelativePlacement=target_model.create_entity(
                "IfcAxis2Placement3D",
                Location=target_model.create_entity("IfcCartesianPoint", Coordinates=(0.0, 0.0, 0.0))
            )
        )

    # Assign the object to the container
    target_model.create_entity(
        "IfcRelContainedInSpatialStructure",
        RelatedElements=[new_object],
        RelatingStructure=container
    )

    return new_object

def main():
    # Create the new IFC model and get the building container
    model, building = create_ifc_model()

    # List of BIM objects to load with their file paths and object types
    bim_objects_info = [
        {
            "file_path": 'bim_objects/DoorPanel_Aluminum_Cline_Louver-TopAndBottom.ifc',
            "object_type": "IfcDoor",
            "placement": model.create_entity(
                "IfcLocalPlacement",
                PlacementRelTo=None,
                RelativePlacement=model.create_entity(
                    "IfcAxis2Placement3D",
                    Location=model.create_entity("IfcCartesianPoint", Coordinates=(0.0, 0.0, 0.0))
                )
            )
        },
        {
            "file_path": 'bim_objects/Hot-Water-Heater.ifc',
            "object_type": "IFCBUILDINGELEMENTPROXY",
            "placement": model.create_entity(
                "IfcLocalPlacement",
                PlacementRelTo=None,
                RelativePlacement=model.create_entity(
                    "IfcAxis2Placement3D",
                    Location=model.create_entity("IfcCartesianPoint", Coordinates=(5.0, 0.0, 2.0))
                )
            )
        },
        {
            "file_path": 'bim_objects/Ice-Hockey-Rink.ifc',
            "object_type": "IFCBUILDINGELEMENTPROXY",
            "placement": model.create_entity(
                "IfcLocalPlacement",
                PlacementRelTo=None,
                RelativePlacement=model.create_entity(
                    "IfcAxis2Placement3D",
                    Location=model.create_entity("IfcCartesianPoint", Coordinates=(10.0, 0.0, 0.0))
                )
            )
        },
    ]

    for obj_info in bim_objects_info:
        bim_model, bim_object = load_bim_object(obj_info["file_path"], obj_info["object_type"])
        if bim_object:
            new_object = copy_and_place_bim_object(
                target_model=model,
                bim_model=bim_model,
                bim_object=bim_object,
                container=building,
                placement=obj_info.get("placement")
            )
            print(f"{obj_info['object_type']} added with GlobalId: {new_object.GlobalId}")

    # Write the new IFC model to a file
    model.write('new_model.ifc')
    print("New IFC model created with multiple BIM objects.")

if __name__ == "__main__":
    main()