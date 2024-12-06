import ifcopenshell
from ifcopenshell.api import (
    root,
    context,
    unit,
    spatial,
    type,
    geometry,
    aggregate,
    owner,
)
from ifcopenshell import guid, validate
import ifcopenshell.api
import ifcopenshell.api.geometry
import ifcopenshell.api.material
import ifcopenshell.api.pset
import ifcopenshell.api.root
import ifcopenshell.api.style
import ifcopenshell.api.type
import ifcopenshell.util
import ifcopenshell.util.element
import numpy as np
import time


def setup_project(model):
    # Create OwnerHistory once and reuse
    person = model.create_entity("IfcPerson", GivenName="John", FamilyName="Doe")
    organization = model.create_entity("IfcOrganization", Name="My Company")
    person_and_org = model.create_entity("IfcPersonAndOrganization", ThePerson=person, TheOrganization=organization)
    application = model.create_entity(
        "IfcApplication",
        ApplicationDeveloper=organization,
        Version="v1.0",
        ApplicationFullName="My Application",
        ApplicationIdentifier="MY-APP",
    )

    owner_history = model.create_entity(
        "IfcOwnerHistory",
        OwningUser=person_and_org,
        OwningApplication=application,
        State="READWRITE",
        ChangeAction="ADDED",
        CreationDate=int(time.time()),
        LastModifiedDate=int(time.time()),
    )

    # Set up units - this must be done before setting the project's UnitsInContext
    unit_assignment = model.create_entity(
        "IfcUnitAssignment",
        Units=[
            model.create_entity("IfcSIUnit", UnitType="LENGTHUNIT", Prefix="MILLI", Name="METRE"),
            model.create_entity("IfcSIUnit", UnitType="AREAUNIT", Name="SQUARE_METRE"),
            model.create_entity("IfcSIUnit", UnitType="VOLUMEUNIT", Name="CUBIC_METRE"),
            model.create_entity("IfcSIUnit", UnitType="PLANEANGLEUNIT", Name="RADIAN"),
            model.create_entity("IfcSIUnit", UnitType="MASSUNIT", Name="GRAM"),
            model.create_entity("IfcSIUnit", UnitType="TIMEUNIT", Name="SECOND"),
            model.create_entity("IfcSIUnit", UnitType="THERMODYNAMICTEMPERATUREUNIT", Name="KELVIN"),
            model.create_entity("IfcSIUnit", UnitType="LUMINOUSINTENSITYUNIT", Name="CANDELA"),
        ],
    )

    # Setup project with all required attributes including UnitsInContext
    project = model.create_entity(
        "IfcProject",
        GlobalId=guid.new(),
        OwnerHistory=owner_history,
        Name="My Project",
        Description="Project Description",
        ObjectType="Project",
        LongName="My Long Project Name",
        Phase="Design",
        UnitsInContext=unit_assignment,  # Make sure this is set
    )

    # Set up geometric context with more complete definition
    wcs = model.create_entity(
        "IfcAxis2Placement3D",
        Location=model.create_entity("IfcCartesianPoint", Coordinates=(0.0, 0.0, 0.0)),
        Axis=model.create_entity("IfcDirection", DirectionRatios=(0.0, 0.0, 1.0)),
        RefDirection=model.create_entity("IfcDirection", DirectionRatios=(1.0, 0.0, 0.0)),
    )

    main_context = model.create_entity(
        "IfcGeometricRepresentationContext",
        ContextType="Model",
        CoordinateSpaceDimension=3,
        Precision=1.0e-05,
        WorldCoordinateSystem=wcs,
        ContextIdentifier="Building Model",
        TrueNorth=model.create_entity("IfcDirection", DirectionRatios=(0.0, 1.0, 0.0)),
    )

    # Create a sub context for body geometry
    body_context = model.create_entity(
        "IfcGeometricRepresentationSubContext",
        ContextIdentifier="Body",
        ContextType="Model",
        ParentContext=main_context,
        TargetView="MODEL_VIEW",
    )

    # Only add the main context to project's RepresentationContexts
    project.RepresentationContexts = [main_context]

    # Create site with corrected coordinates
    # Using positive values for latitude (North) and longitude (East)
    site = model.create_entity(
        "IfcSite",
        GlobalId=guid.new(),
        OwnerHistory=owner_history,
        Name="Site",
        Description="Site Description",
        ObjectType="Site",
        CompositionType="ELEMENT",
        RefLatitude=(42, 21, 31, 181945),  # All positive for North
        RefLongitude=(71, 3, 21, 999999),  # All positive for East
    )

    building = model.create_entity(
        "IfcBuilding",
        GlobalId=guid.new(),
        OwnerHistory=owner_history,
        Name="Building",
        Description="Building Description",
        ObjectType="Building",
        CompositionType="ELEMENT",
        ElevationOfRefHeight=0.0,
        ElevationOfTerrain=0.0,
    )

    storey = model.create_entity(
        "IfcBuildingStorey",
        GlobalId=guid.new(),
        OwnerHistory=owner_history,
        Name="Ground Floor",
        Description="Ground Floor Description",
        ObjectType="Building Storey",
        CompositionType="ELEMENT",
        Elevation=0.0,
    )

    # Create placements with more complete definitions
    site_placement = model.create_entity(
        "IfcLocalPlacement",
        RelativePlacement=model.create_entity(
            "IfcAxis2Placement3D",
            Location=model.create_entity("IfcCartesianPoint", Coordinates=(0.0, 0.0, 0.0)),
            Axis=model.create_entity("IfcDirection", DirectionRatios=(0.0, 0.0, 1.0)),
            RefDirection=model.create_entity("IfcDirection", DirectionRatios=(1.0, 0.0, 0.0)),
        ),
    )

    building_placement = model.create_entity(
        "IfcLocalPlacement",
        PlacementRelTo=site_placement,
        RelativePlacement=model.create_entity(
            "IfcAxis2Placement3D",
            Location=model.create_entity("IfcCartesianPoint", Coordinates=(0.0, 0.0, 0.0)),
            Axis=model.create_entity("IfcDirection", DirectionRatios=(0.0, 0.0, 1.0)),
            RefDirection=model.create_entity("IfcDirection", DirectionRatios=(1.0, 0.0, 0.0)),
        ),
    )

    storey_placement = model.create_entity(
        "IfcLocalPlacement",
        PlacementRelTo=building_placement,
        RelativePlacement=model.create_entity(
            "IfcAxis2Placement3D",
            Location=model.create_entity("IfcCartesianPoint", Coordinates=(0.0, 0.0, 0.0)),
            Axis=model.create_entity("IfcDirection", DirectionRatios=(0.0, 0.0, 1.0)),
            RefDirection=model.create_entity("IfcDirection", DirectionRatios=(1.0, 0.0, 0.0)),
        ),
    )

    site.ObjectPlacement = site_placement
    building.ObjectPlacement = building_placement
    storey.ObjectPlacement = storey_placement

    # Setup containment relationships
    model.create_entity(
        "IfcRelAggregates",
        GlobalId=guid.new(),
        OwnerHistory=owner_history,
        Name="Project Container",
        Description="Project Container for Sites",
        RelatingObject=project,
        RelatedObjects=[site],
    )

    model.create_entity(
        "IfcRelAggregates",
        GlobalId=guid.new(),
        OwnerHistory=owner_history,
        Name="Site Container",
        Description="Site Container for Buildings",
        RelatingObject=site,
        RelatedObjects=[building],
    )

    model.create_entity(
        "IfcRelAggregates",
        GlobalId=guid.new(),
        OwnerHistory=owner_history,
        Name="Building Container",
        Description="Building Container for Storeys",
        RelatingObject=building,
        RelatedObjects=[storey],
    )

    return project, site, building, storey, owner_history, main_context


def purge_orphan_placements(model):
    # Remove any IfcLocalPlacement that is not referenced by a product
    all_placements = model.by_type("IfcLocalPlacement")
    used_placements = set()
    for product in model.by_type("IfcProduct"):
        if product.ObjectPlacement and product.ObjectPlacement.is_a("IfcLocalPlacement"):
            used_placements.add(product.ObjectPlacement.id())
    for placement in all_placements:
        if placement.id() not in used_placements:
            model.remove(placement)


def remove_extra_representation_contexts(model, main_context):
    # Remove all other representation contexts except the main one
    contexts = model.by_type("IfcRepresentationContext")
    for ctx in contexts:
        if ctx.id() != main_context.id():
            model.remove(ctx)
    # Ensure project references only the main_context
    project = model.by_type("IfcProject")[0]
    project.RepresentationContexts = [main_context]


def assign_context_to_representations(model, main_context):
    # Assign the main_context to any IfcRepresentation missing it
    for rep in model.by_type("IfcRepresentation"):
        if not rep.ContextOfItems:
            rep.ContextOfItems = main_context


def load_template(
    model: ifcopenshell.file,
    path: str,
    coordinates: tuple,
    storey: ifcopenshell.entity_instance,
    owner_history,
):
    source_file = ifcopenshell.open(path)
    original_product = source_file.by_type("IfcProduct")[0]

    psets = ifcopenshell.util.element.get_psets(original_product, psets_only=True)
    materials = ifcopenshell.util.element.get_materials(original_product)

    # Deep copy product
    new_product = ifcopenshell.util.element.copy_deep(model, original_product)
    new_product.GlobalId = guid.new()
    new_product.OwnerHistory = owner_history

    # Overwrite object placement with a fresh one
    new_placement = model.create_entity(
        "IfcLocalPlacement",
        RelativePlacement=model.create_entity(
            "IfcAxis2Placement3D",
            Location=model.create_entity("IfcCartesianPoint", Coordinates=coordinates),
        ),
    )
    new_product.ObjectPlacement = new_placement

    # Copy psets
    for pset_name, pset_values in psets.items():
        pset = ifcopenshell.api.pset.add_pset(model, new_product, name=pset_name)
        ifcopenshell.api.pset.edit_pset(model, pset=pset, properties=pset_values)

    # Copy materials
    for material in materials:
        material_copy = ifcopenshell.api.material.copy_material(model, material=material)
        if hasattr(material, "HasRepresentation") and material.HasRepresentation:
            for mdr in material.HasRepresentation:
                if mdr.is_a("IfcMaterialDefinitionRepresentation"):
                    new_mdr = ifcopenshell.util.element.copy_deep(model, mdr)
                    new_mdr.RepresentedMaterial = material_copy
        ifcopenshell.api.material.assign_material(model, products=[new_product], material=material_copy)

    # Add spatial containment relationship
    model.create_entity(
        "IfcRelContainedInSpatialStructure",
        GlobalId=guid.new(),
        RelatingStructure=storey,
        RelatedElements=[new_product],
        OwnerHistory=owner_history,
    )

    # Purge any orphan placements that might have come from copy_deep
    purge_orphan_placements(model)


def main():
    # Create new IFC file
    model = ifcopenshell.file(schema="IFC2X3")

    # Setup project
    project, site, building, storey, owner_history, main_context = setup_project(model)

    template_paths = [
        "bim_objects/DoorPanel_Aluminum_Cline_Louver-TopAndBottom.ifc",
        # "bim_objects/Hot-Water-Heater.ifc"
    ]

    coordinates = [
        (0.0, 0.0, 0.0),
    ]

    ifc_door_style = ifcopenshell.open(template_paths[0]).by_type("IfcTypeProduct")[0]

    copied_door_style = ifcopenshell.util.element.copy_deep(model, ifc_door_style)

    # Create a new door
    door = ifcopenshell.api.root.create_entity(model, ifc_class="IfcDoor", name="Door created from style")

    ifcopenshell.api.type.assign_type(model, related_objects=[door], relating_type=copied_door_style)

    # place the door
    door_placement = model.create_entity(
        "IfcLocalPlacement",
        RelativePlacement=model.create_entity(
            "IfcAxis2Placement3D",
            Location=model.create_entity("IfcCartesianPoint", Coordinates=coordinates[0]),
        ),
    )

    door.ObjectPlacement = door_placement

    # Add the door to the storey
    model.create_entity(
        "IfcRelContainedInSpatialStructure",
        GlobalId=guid.new(),
        RelatingStructure=storey,
        RelatedElements=[door],
        OwnerHistory=owner_history,
    )

    # for path, coord in zip(template_paths, coordinates):
    #     load_template(model=model, path=path, coordinates=coord, storey=storey, owner_history=owner_history)

    # # Remove extra representation contexts
    # remove_extra_representation_contexts(model, main_context)

    # # Assign context to any representation missing it
    # assign_context_to_representations(model, main_context)

    # Save the model
    model.write("test.ifc")

    # Validate the model
    logger = ifcopenshell.validate.json_logger()
    ifcopenshell.validate.validate("test.ifc", logger, express_rules=True)
    from pprint import pprint

    pprint(logger.statements)


if __name__ == "__main__":
    main()
