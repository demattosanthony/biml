import ifcopenshell
import ifcopenshell.api
import ifcopenshell.util
import ifcopenshell.api.root
import ifcopenshell.api.context
import ifcopenshell.api.aggregate

# Open the library file
library_model = ifcopenshell.open("./blenderbim-site-library.ifc")

# Create a new project file with IFC4 schema
model = ifcopenshell.file(schema="IFC4")

# Create project
project = ifcopenshell.api.root.create_entity(model, ifc_class="IfcProject", name="My Project")

# Set up units - using meters
units = model.create_entity("IfcUnitAssignment")
length_unit = model.create_entity("IfcSIUnit", UnitType="LENGTHUNIT", Name="METRE")
units.Units = [length_unit]
project.UnitsInContext = units

# Set up geometric representation contexts
context = model.create_entity(
    "IfcGeometricRepresentationContext",
    ContextType="Model",
    CoordinateSpaceDimension=3,
    Precision=0.01,
    WorldCoordinateSystem=model.create_entity(
        "IfcAxis2Placement3D",
        Location=model.create_entity("IfcCartesianPoint", Coordinates=(0.0, 0.0, 0.0)),
    ),
)

model_context = model.create_entity(
    "IfcGeometricRepresentationSubContext",
    ContextIdentifier="Body",
    ContextType="Model",
    ParentContext=context,
    TargetView="MODEL_VIEW",
)

# Create spatial hierarchy
site = ifcopenshell.api.root.create_entity(model, ifc_class="IfcSite", name="My Site")
building = ifcopenshell.api.root.create_entity(model, ifc_class="IfcBuilding", name="Building A")
storey = ifcopenshell.api.root.create_entity(model, ifc_class="IfcBuildingStorey", name="Ground Floor")

# Assign spatial hierarchy
ifcopenshell.api.aggregate.assign_object(model, relating_object=project, products=[site])
ifcopenshell.api.aggregate.assign_object(model, relating_object=site, products=[building])
ifcopenshell.api.aggregate.assign_object(model, relating_object=building, products=[storey])

# Get the crane type from library
lib = library_model.by_type("IfcProjectLibrary")[0]
library_objects = lib.Declares[0].RelatedDefinitions
crane_type = library_objects[0]  # Assuming first object is the crane

# First copy all representation items and their styles
for rep_map in crane_type.RepresentationMaps:
    # Copy all items in the representation
    for item in rep_map.MappedRepresentation.Items:
        # Copy styles if they exist
        if hasattr(item, 'StyledByItem'):
            for styled_item in item.StyledByItem:
                # Copy the style assignment
                model.add(styled_item)
                for style in styled_item.Styles:
                    # Copy the presentation style
                    model.add(style)
                    if hasattr(style, 'Styles'):
                        for substyle in style.Styles:
                            # Copy surface styles and colors
                            model.add(substyle)
                            if hasattr(substyle, 'SurfaceColour'):
                                model.add(substyle.SurfaceColour)

# Copy the crane type
new_crane_type = model.add(crane_type)

# Copy the representation maps and their contents
for rep_map in crane_type.RepresentationMaps:
    model.add(rep_map)
    model.add(rep_map.MappedRepresentation)

# Create crane instance
crane = model.create_entity("IfcBuildingElementProxy", Name="cool crane")
crane.ObjectType = new_crane_type.Name

# Create type relationship
type_relationship = model.create_entity(
    "IfcRelDefinesByType",
    GlobalId=ifcopenshell.guid.new(),
    RelatedObjects=[crane],
    RelatingType=new_crane_type
)

# Create placement for the crane
placement = model.create_entity(
    "IfcLocalPlacement",
    PlacementRelTo=storey.ObjectPlacement,
    RelativePlacement=model.create_entity(
        "IfcAxis2Placement3D",
        Location=model.create_entity(
            "IfcCartesianPoint",
            Coordinates=(0.0, 0.0, 0.0)
        )
    )
)
crane.ObjectPlacement = placement

# Copy representation
if new_crane_type.RepresentationMaps:
    shape = model.create_entity(
        "IfcShapeRepresentation",
        ContextOfItems=model_context,
        RepresentationIdentifier=new_crane_type.RepresentationMaps[0].MappedRepresentation.RepresentationIdentifier,
        RepresentationType=new_crane_type.RepresentationMaps[0].MappedRepresentation.RepresentationType,
    )
    
    # Create mapping
    mapped_item = model.create_entity(
        "IfcMappedItem",
        MappingSource=new_crane_type.RepresentationMaps[0],
        MappingTarget=model.create_entity(
            "IfcCartesianTransformationOperator3D",
            Axis1=None,
            Axis2=None,
            LocalOrigin=model.create_entity(
                "IfcCartesianPoint",
                Coordinates=(0.0, 0.0, 0.0)
            ),
            Scale=1.0,
            Axis3=None
        )
    )
    shape.Items = [mapped_item]
    
    # Create product definition shape
    product_shape = model.create_entity(
        "IfcProductDefinitionShape",
        Representations=[shape]
    )
    crane.Representation = product_shape

# Assign the crane to the storey
ifcopenshell.api.aggregate.assign_object(
    model,
    relating_object=storey,
    products=[crane]
)

# Copy materials and their associations
if hasattr(crane_type, 'HasAssociations'):
    for association in crane_type.HasAssociations:
        if association.is_a('IfcRelAssociatesMaterial'):
            # Copy the material
            material = association.RelatingMaterial
            model.add(material)
            
            # Copy material properties
            if material.is_a('IfcMaterial'):
                if hasattr(material, 'HasProperties'):
                    for props in material.HasProperties:
                        model.add(props)
                if hasattr(material, 'HasRepresentation'):
                    model.add(material.HasRepresentation)
                    for rep in material.HasRepresentation.Representations:
                        model.add(rep)
            
            # Copy the association
            model.add(association)

# Write the new file
model.write("new_project_with_crane.ifc")