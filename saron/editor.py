import ifcopenshell
from ifcopenshell.api import root, context, unit, spatial, type, geometry, aggregate, owner
from ifcopenshell import guid
import ifcopenshell.api
import ifcopenshell.api.geometry
import ifcopenshell.api.material
import ifcopenshell.api.pset
import ifcopenshell.api.style
import ifcopenshell.util
import ifcopenshell.util.element
import numpy as np
import time


def setup_project(model):
    # Setup project
    project = model.create_entity("IfcProject", Name="My Project", GlobalId=guid.new())

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

    return project, site, building, storey



def copy_material_structure(model, old_material_select):
    # This function copies the entire material structure (material, list, or layer set).
    if old_material_select.is_a("IfcMaterial"):
        return copy_material(model, old_material_select)
    elif old_material_select.is_a("IfcMaterialList"):
        new_mats = [copy_material(model, mat) for mat in old_material_select.Materials]
        return model.create_entity("IfcMaterialList", Materials=new_mats)
    elif old_material_select.is_a("IfcMaterialLayerSet"):
        new_layers = []
        for layer in old_material_select.MaterialLayers:
            # Copy the layer's material
            new_layer_mat = copy_material(model, layer.Material) if layer.Material else None
            new_layer = model.create_entity(
                "IfcMaterialLayer",
                Material=new_layer_mat,
                LayerThickness=layer.LayerThickness,
                IsVentilated=layer.IsVentilated
            )
            new_layers.append(new_layer)

        return model.create_entity(
            "IfcMaterialLayerSet",
            MaterialLayers=new_layers,
            LayerSetName=old_material_select.LayerSetName
        )

    # If there are other IfcMaterialSelect subtypes you need, handle them similarly.
    return None

def copy_material(model, old_material):
    new_mat = ifcopenshell.util.element.copy_deep(model, old_material)
    # Copy material representations if any
    if hasattr(old_material, "HasRepresentation") and old_material.HasRepresentation:
        for mdr in old_material.HasRepresentation:
            if mdr.is_a("IfcMaterialDefinitionRepresentation"):
                new_mdr = ifcopenshell.util.element.copy_deep(model, mdr)
                new_mdr.RepresentedMaterial = new_mat
    return new_mat


def load_template(model: ifcopenshell.file, path: str, coordinates: tuple, storey: ifcopenshell.entity_instance):
    source_file = ifcopenshell.open(path)
    original_product = source_file.by_type("IfcProduct")[0]
    psets = ifcopenshell.util.element.get_psets(original_product, psets_only=True)
    materials = ifcopenshell.util.element.get_materials(original_product)
    styles = ifcopenshell.util.element.get_styles(original_product)

    # Get owner history from the model
    owner_history = model.by_type("IfcOwnerHistory")[0]

    new_product = ifcopenshell.util.element.copy_deep(model, original_product)
    new_product.GlobalId = guid.new()
    new_product.OwnerHistory = owner_history

    # Copy psets
    for pset_name, pset_values in psets.items():
        pset = ifcopenshell.api.pset.add_pset(model, new_product, name=pset_name)
        ifcopenshell.api.pset.edit_pset(model, pset=pset, properties=pset_values)

    # Copy materials
    for material in materials:
        material_copy = ifcopenshell.api.material.copy_material(model, material=material)
        # Copy material representations if any
        if hasattr(material, "HasRepresentation") and material.HasRepresentation:
            for mdr in material.HasRepresentation:
                if mdr.is_a("IfcMaterialDefinitionRepresentation"):
                    new_mdr = ifcopenshell.util.element.copy_deep(model, mdr)
                    new_mdr.RepresentedMaterial = material_copy

        ifcopenshell.api.material.assign_material(model, products=[new_product], material=material_copy)
        
    # Assign placement
    new_placement = model.create_entity(
        "IfcLocalPlacement",
        RelativePlacement=model.create_entity("IfcAxis2Placement3D", 
                                              Location=model.create_entity("IfcCartesianPoint", Coordinates=coordinates)),
    )
    new_product.ObjectPlacement = new_placement

    # # Get and copy materials
    # orig_mats = ifcopenshell.util.element.get_materials(original_elem)
    # copy_and_assign_materials(model, new_elem, orig_mats)

    # Set spatial containment as you did before
    model.create_entity("IfcRelContainedInSpatialStructure", GlobalId=guid.new(), RelatingStructure=storey, RelatedElements=[new_product], OwnerHistory=owner_history)  


def main():
    # Create new IFC file
    model = ifcopenshell.file(schema="IFC2X3")

    # Setup project
    project, site, building, storey = setup_project(model)

    template_paths = [
        "bim_objects/DoorPanel_Aluminum_Cline_Louver-TopAndBottom.ifc",
        # "/Users/anthonydemattos/auto-bim/saron/bim_objects/Hot-Water-Heater.ifc",
        # "/Users/anthonydemattos/auto-bim/saron/bim_objects/Ice-Hockey-Rink.ifc"
    ]

    coordinates = [
        (0.0, 0.0, 0.0),
        # (0.0, 5.0, 0.0),
        # (0.0, 20.0, 0.0)
    ]

    for path, coord in zip(template_paths, coordinates):
        load_template(model=model, path=path, coordinates=coord, storey=storey)

    # Save the model
    model.write("test.ifc")



if __name__ == "__main__":
    main()