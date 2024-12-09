import ifcopenshell
from ifcopenshell import api
from ifcopenshell.api import context, aggregate, owner
import ifcopenshell.api
import ifcopenshell.api.owner

class IfcSession:
    def __init__(self) -> None:
        self.file: ifcopenshell.file = None
        self.ifc_project_library = ifcopenshell.open("/Users/anthonydemattos/auto-bim/saron/blenderbim-demo-library.ifc").by_type("IfcProject")[0]

    def open_ifc_project(self, path: str) -> None:
        self.file = ifcopenshell.open(path)

    def create_new_ifc_project(self, schema: str = "IFC4", path: str = "output.ifc") -> None:
        model = ifcopenshell.file(schema=schema)
        self.file = model

        # setup owner history if schema is IFC2X3
        if schema == "IFC2X3":
            application = ifcopenshell.api.owner.add_application(model)
            person = ifcopenshell.api.owner.add_person(model, identification="LPARTEE", family_name="Partee", given_name="Leeable")
            organisation = ifcopenshell.api.owner.add_organisation(model, identification="AWB", name="Architects Without Ballpens")
            user = ifcopenshell.api.owner.add_person_and_organisation(model, person=person, organisation=organisation)
            ifcopenshell.api.owner.settings.get_user = lambda x: user
            ifcopenshell.api.owner.settings.get_application = lambda x: application

        project = model.create_entity("IfcProject", Name="My Project")
        site = model.create_entity("IfcSite", Name="Site")
        building = model.create_entity("IfcBuilding", Name="Building")
        storey = model.create_entity("IfcBuildingStorey", Name="Storey")

        # Setup all the contexts
        # If we plan to store 3D geometry in our IFC model, we have to setup a "Model" context.
        model3d = ifcopenshell.api.context.add_context(model, context_type="Model")
        # And/Or, if we plan to store 2D geometry, we need a "Plan" context
        plan = ifcopenshell.api.context.add_context(model, context_type="Plan")
        # Now we setup the subcontexts with each of the geometric "purposes"
        # we plan to store in our model. "Body" is by far the most important
        # and common context, as most IFC models are assumed to be viewable
        # in 3D.
        body = ifcopenshell.api.context.add_context(model, context_type="Model", context_identifier="Body", target_view="MODEL_VIEW", parent=model3d)

        # The 3D Axis subcontext is important if any "axis-based" parametric
        # geometry is going to be created. For example, a beam, or column
        # may be drawn using a single 3D axis line, and for this we need an
        # Axis subcontext.
        ifcopenshell.api.context.add_context(model, context_type="Model", context_identifier="Axis", target_view="GRAPH_VIEW", parent=model3d)

        # It's also important to have a 2D Axis subcontext for things like
        # walls and claddings which can be drawn using a 2D axis line.
        ifcopenshell.api.context.add_context(model, context_type="Plan", context_identifier="Axis", target_view="GRAPH_VIEW", parent=plan)

        # The 3D Box subcontext is useful for clash detection or shape
        # analysis, or even lazy-loading of large models.
        ifcopenshell.api.context.add_context(model, context_type="Model", context_identifier="Box", target_view="MODEL_VIEW", parent=model3d)

        # A 2D annotation subcontext for plan views are important for door
        # swings, window cuts, and symbols for equipment like GPOs, fire
        # extinguishers, and so on.
        ifcopenshell.api.context.add_context(model, context_type="Plan", context_identifier="Annotation", target_view="PLAN_VIEW", parent=plan)

        # You may also create 2D annotation subcontexts for sections and
        # elevation views.
        ifcopenshell.api.context.add_context(model, context_type="Plan", context_identifier="Annotation", target_view="SECTION_VIEW", parent=plan)
        ifcopenshell.api.context.add_context(model, context_type="Plan", context_identifier="Annotation", target_view="ELEVATION_VIEW", parent=plan)

        # assign spatial containers
        ifcopenshell.api.aggregate.assign_object(model, products=[site], relating_object=project)
        ifcopenshell.api.aggregate.assign_object(model, products=[building], relating_object=site)
        ifcopenshell.api.aggregate.assign_object(model, products=[storey], relating_object=building)

        model.write(path)

    def get_geometry_tree(self):
        return build_hierarchy(self.file.by_type("IfcProduct"))
        
    
    def get_ifc_project_library_tree(self) -> str:
        types_dict = {}
        for decl in self.ifc_project_library.Declares:
            for defn in decl.RelatedDefinitions:
                if 'Type' in defn.is_a():  # Quick filter for type products
                    type_name = defn.is_a()
                    name = defn.Name if hasattr(defn, 'Name') else 'Unnamed'
                    types_dict.setdefault(type_name, []).append(name)

        tree = ""
        for type_name, items in sorted(types_dict.items()):
            content += f"   * {type_name}\n"
            for item in sorted(items):
                content += f"      * {item}\n"

        return tree

def build_hierarchy(project: ifcopenshell.entity_instance, with_properties=False):
    """Build the hierarchy of the IFC project
    
    Args:
        project (ifcopenshell.entity_instance): The IFC project
        with_properties (bool, optional): Include properties. Defaults to False.
    
    Returns:
        str: The hierarchy of the IFC project
    """
    result = []
    spacer = '.  '
    
    def add_line(text, level):
        result.append(spacer * level + text)
    
    def add_property_set(property_set, level):
        add_line(property_set.Name, level)
        for prop in property_set.HasProperties:
            if prop.is_a('IfcPropertySingleValue'):
                add_line(f"{prop.Name} = {str(prop.NominalValue.wrappedValue)}", level + 1)

    def add_quantity_set(quantity_set, level):
        add_line(quantity_set.Name, level)
        for quantity in quantity_set.Quantities:
            if quantity.is_a('IfcQuantityLength'):
                add_line(f"{quantity.Name} = {str(quantity.LengthValue)}", level + 1)
            elif quantity.is_a('IfcQuantityArea'):
                add_line(f"{quantity.Name} = {str(quantity.AreaValue)}", level + 1)
            elif quantity.is_a('IfcQuantityVolume'):
                add_line(f"{quantity.Name} = {str(quantity.VolumeValue)}", level + 1)
            elif quantity.is_a('IfcQuantityCount'):
                add_line(f"{quantity.Name} = {str(quantity.CountValue)}", level + 1)
            else:
                add_line(quantity.Name, level + 1)

    def add_element_type(type, level):
        add_line(type.Name, level)

    def add_element(element, level):
        add_line(f"#{element.id()} = {element.is_a()} \"{element.Name}\" ({element.GlobalId})", level)
        
        for definition in element.IsDefinedBy:
            if with_properties:
                if definition.is_a('IfcRelDefinesByProperties'):
                    related_data = definition.RelatingPropertyDefinition
                    if related_data.is_a('IfcPropertySet'):
                        add_property_set(related_data, level + 1)
                    elif related_data.is_a('IfcElementQuantity'):
                        add_quantity_set(related_data, level + 1)
            if definition.is_a('IfcRelDefinesByType'):
                add_element_type(definition.RelatingType, level + 1)

        # Spatial relation
        if element.is_a('IfcSpatialStructureElement'):
            for rel in element.ContainsElements:
                for child in rel.RelatedElements:
                    add_element(child, level + 1)

        # Aggregation Relation
        if element.is_a('IfcObjectDefinition'):
            for rel in element.IsDecomposedBy:
                for child in rel.RelatedObjects:
                    add_element(child, level + 1)

    # Main execution
    for item in project:
        add_element(item, 0)
    
    return '\n'.join(result)