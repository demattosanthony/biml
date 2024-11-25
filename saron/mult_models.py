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
        return bim_model, entity  # Return both the model and the entity
    print(f"No object of type {object_type} found in {file_path}.")
    return None, None

def copy_and_place_bim_object(target_model, bim_model, bim_object, container, placement=None):
    """Copies a BIM object into the target model and places it within the spatial structure."""
    # Copy the object into the target model
    copied_entities = {}
    new_object = copy_deep(
        ifc_file=target_model,
        element=bim_object,
        copied_entities=copied_entities
    )

    # Copy related property sets and materials
    for relationship in bim_model.by_type("IfcRelDefinesByProperties"):
        if bim_object in relationship.RelatedObjects:
            # Copy the property set and link it to the new object
            new_relationship = copy_deep(
                ifc_file=target_model,
                element=relationship,
                copied_entities=copied_entities
            )
            new_relationship.RelatedObjects = [new_object]

    for material_relation in bim_model.by_type("IfcRelAssociatesMaterial"):
        if bim_object == material_relation.RelatedObjects[0]:
            # Copy material relationship and assign it to the new object
            new_material_relation = copy_deep(
                ifc_file=target_model,
                element=material_relation,
                copied_entities=copied_entities
            )
            new_material_relation.RelatedObjects = [new_object]

    # If a specific placement is provided, update the object's placement
    if placement:
        # Update the object's object placement
        new_object.ObjectPlacement = placement
    else:
        # If no placement is provided, create a default placement at the origin
        new_object.ObjectPlacement = target_model.create_entity(
            "IfcLocalPlacement",
            PlacementRelTo=None,
            RelativePlacement=target_model.create_entity(
                "IfcAxis2Placement3D",
                Location=target_model.create_entity("IfcCartesianPoint", Coordinates=(0.0, 0.0, 0.0))
            )
        )

    # Assign the object to the container (e.g., building)
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
