import ifcopenshell
from ifcopenshell import api
from ifcopenshell.api import context, aggregate, owner
import ifcopenshell.api
import ifcopenshell.api.owner

from saron.utils import build_hierarchy 

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
            
    
