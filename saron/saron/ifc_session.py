import io
import sys
from typing import Dict, Optional
import uuid
import ifcopenshell
import ifcopenshell.api
import ifcopenshell.util.element
import json

from saron.tools import tool


class IfcSession:
    def __init__(self, ifc_file_path: str):
        self.model = ifcopenshell.open(ifc_file_path)
        if not self.model:
            raise FileNotFoundError(f"Could not open IFC file at: {ifc_file_path}")
        self.session_id: str = str(uuid.uuid4())

    def get_metadata(self):
        file_name = self.model.header.file_name
        file_description = self.model.header.file_description
        file_schema = self.model.header.file_schema
        return {
            "name": file_name.name if file_name else None,
            "time_stamp": file_name.time_stamp if file_name else None,
            "author": file_name.author if file_name else None,
            "organization": file_name.organization if file_name else None,
            "description": file_description.description if file_description else None,
            "schema": file_schema.schema_identifiers if file_schema else None,
        }

    def get_element_properties(self, element):
        return ifcopenshell.util.element.get_psets(element)

    def list_projects(self):
        """List top-level projects."""
        projects = self.model.by_type("IfcProject")
        return [self._element_summary(p) for p in projects]

    def list_categories(self):
        """List all unique categories of elements in the model."""
        categories = set()
        for element in self.model.by_type("IfcProduct"):
            categories.add(element.is_a())
        return list(categories)

    def get_elements_of_category(self, category):
        """List all elements of a given category."""
        elements = self.model.by_type(category)
        return [self._element_summary(e) for e in elements]

    def list_children(self, guid, ifc_type=None):
        """
        List the children of a given element, whether via decomposition or containment.
        Optionally filter by IFC type (e.g., 'IfcBuilding', 'IfcSpace', etc.).

        Returns a list of dicts: [{ "guid": <>, "type": <>, "name": <> }, ...]
        """
        parent = self._get_element_by_guid(guid)
        if not parent:
            return []

        children = []
        # Children from decomposition (IsDecomposedBy)
        if hasattr(parent, "IsDecomposedBy"):
            for rel in parent.IsDecomposedBy:
                for child in rel.RelatedObjects:
                    if ifc_type is None or child.is_a(ifc_type):
                        children.append(self._element_summary(child))

        # Children from containment (ContainsElements)
        if hasattr(parent, "ContainsElements"):
            for rel in parent.ContainsElements:
                for child in rel.RelatedElements:
                    if ifc_type is None or child.is_a(ifc_type):
                        children.append(self._element_summary(child))

        return children

    def get_node_info(self, guid: str):
        """
        Returns detailed info about a node (element).
        """
        element = self._get_element_by_guid(guid)
        if not element:
            return None

        # Get spatial container if available
        container = None
        if hasattr(element, "ContainedInStructure"):
            for rel in element.ContainedInStructure:
                if rel.RelatingStructure:
                    container = self._element_summary(rel.RelatingStructure)
                    break

        # Get type information
        type = ifcopenshell.util.element.get_type(element)
        type_info = self

        return {
            "guid": element.GlobalId,
            "ifc_class": element.is_a(),
            "name": getattr(element, "Name", None),
            "properties": self.get_element_properties(element),
            "spatial_container": container,
            "type_object": type_info,
        }

    def get_units(self):
        project = self.model.by_type("IfcProject")
        if not project:
            return None
        project = project[0]
        if project.UnitsInContext:
            units = {}
            for unit_assignment in project.UnitsInContext.Units:
                unit_type = getattr(unit_assignment, "UnitType", None)
                units[unit_type] = {"prefix": getattr(unit_assignment, "Prefix", None), "name": getattr(unit_assignment, "Name", None)}
            return units
        return None

    def summarize(self):
        """
        Quick summary of model counts.
        """

        def count(ifc_type):
            return len(self.model.by_type(ifc_type))

        return {
            "projects_count": count("IfcProject"),
            "sites_count": count("IfcSite"),
            "buildings_count": count("IfcBuilding"),
            "storeys_count": count("IfcBuildingStorey"),
            "elements_count": len(self.model.by_type("IfcProduct")),
            "spaces_count": count("IfcSpace"),
            "systems_count": count("IfcSystem"),
            "types_count": count("IfcTypeObject"),
        }

    def execute_code(self, code: str):
        """
        Execute Python code in the context of the session and return its output.
        """
        try:
            # Create string buffer to capture output
            output_buffer = io.StringIO()
            # Redirect stdout to the buffer
            old_stdout = sys.stdout
            sys.stdout = output_buffer

            console_locals = {"session": self, "ifc": self.model, "ifcopenshell": ifcopenshell, "api": ifcopenshell.api}
            # Execute the code
            exec(code, console_locals)

            # Get output and restore stdout
            output = output_buffer.getvalue()
            sys.stdout = old_stdout
            return output
        except Exception as e:
            sys.stdout = old_stdout
            return str(e)

    def save(self, path: str = "output.ifc"):
        self.model.write(path)
        return f"IFC project saved to {path}"

    # ---------------------
    # Internal Helper Methods
    # ---------------------

    def _get_element_by_guid(self, guid, expected_type=None):
        element = self.model.by_guid(guid)
        if element and (expected_type is None or element.is_a(expected_type)):
            return element
        return None

    def _element_summary(self, element):
        return {"guid": element.GlobalId, "type": element.is_a(), "name": getattr(element, "Name", None)}

    # ---------------------
    # Define tools for LLM
    # ---------------------
    @tool
    def list_children_of_element(self, guid: str, ifc_type: str | None = None):
        """This tool acts as model browser for the ifc model. You can use it to navigate the element tree of the ifc model. Provide a guid of an element to list its children.

        Most elemenet trees beging with the project then a site, then a building, then floors, then spaces, then elements. You can use this tool to navigate the tree and explore the model.

        Provide a ifc_type to filter the children by type. For example, ifc_type=IfcWall will only return children that are walls. Only do this if you know the ifc type of the children you are looking for.
        """
        return json.dumps(self.list_children(guid, ifc_type=ifc_type), indent=2)

    @tool
    def get_node_information(self, guid: str):
        """Returns detailed info about a node (element)."""
        return json.dumps(self.get_node_info(guid), indent=2)

    @tool
    def get_all_ifc_categories(self):
        """Returns a list of all the unqiue ifc categories in the model."""
        return json.dumps(self.list_categories(), indent=2)

    @tool
    def get_elements_of_a_category(self, ifc_category: str):
        """Returns a list of all the elements of a given ifc category."""
        return json.dumps(self.get_elements_of_category(ifc_category), indent=2)

    @tool
    def execute_python_code_against_model(self, code: str):
        """Execute python code against the model. This is a powerful tool that allows you to write custom code to interact with the model. Be careful with this tool as it can modify the model. This tool is useful when you need to do something that is not supported by the other tools.

        It leverages the exec function in python and these are the console locals provided:

        {
            "ifc": ifcopenshell.file, # instance of the loaded ifc file
            "ifcopenshell": ifcopenshell, # ifcopenshell module
            "api": ifcopenshell.api # ifcopenshell.api module
        }

        For example:

        ```
        import ifcopenshell.util.element

        for storey in model.by_type("IfcBuildingStorey"):
            elements = ifcopenshell.util.element.get_decomposition(storey)
            print(f"There are {len(elements)} located on storey {storey.Name}, they are:")
            for element in elements:
                print(element.Name)
        ```

        The output of the code will be returned as a string. Output is captured from stdout and stderr. This means you need to use the print function to output anything.
        """
        try:
            output = self.execute_code(code)
            return output
        except Exception as e:
            return f"An error occurred: {str(e)}"

    @tool
    def save_model(self):
        """Save the current state of the model."""
        self.save()
        return "Model saved successfully."

    @tool
    def get_project_info(self):
        """Get metadata about the IFC project."""
        project = self.list_projects()[0]
        return json.dumps(project, indent=2)

    def get_tools(self):
        return {
            "get_project_info": self.get_project_info,
            "list_children": self.list_children_of_element,
            "get_node_info": self.get_node_information,
            "get_all_ifc_categories": self.get_all_ifc_categories,
            "get_elements_of_category": self.get_elements_of_a_category,
            "execute_python_code_against_model": self.execute_python_code_against_model,
            "save_model": self.save_model,
        }


class IfcSessionManager:
    def __init__(self):
        self._sessions: Dict[str, IfcSession] = {}

    def create_session(self, file_path: str) -> str:
        session = IfcSession(ifc_file_path=file_path)
        self._sessions[session.session_id] = session
        return session.session_id

    def get_session(self, session_id: str) -> Optional[IfcSession]:
        return self._sessions.get(session_id)

    def remove_session(self, session_id: str):
        self._sessions.pop(session_id, None)


#     def start_console(self):
#         """Start an interactive Python console with the current session available as 'session'"""
#         console_locals = {
#             'session': self,
#             'ifc': self.model,
#             'ifcopenshell': ifcopenshell,
#             'api': ifcopenshell.api
#         }

#         banner = """
# IFC Interactive Console
# ----------------------
# Available objects:
# - session: Current IfcSession instance
# - ifc: Current IFC file
# - ifcopenshell: IfcOpenShell module
# - api: IfcOpenShell API module

# Type 'exit()' or Ctrl+D to exit
# """
#         code.InteractiveConsole(console_locals).interact(banner=banner)


#     def create_new_ifc_project(self, schema: str = "IFC4", path: str = "output.ifc") -> None:
#         model = ifcopenshell.file(schema=schema)
#         self.file = model

#         # setup owner history if schema is IFC2X3
#         if schema == "IFC2X3":
#             application = ifcopenshell.api.owner.add_application(model)
#             person = ifcopenshell.api.owner.add_person(model, identification="LPARTEE", family_name="Partee", given_name="Leeable")
#             organisation = ifcopenshell.api.owner.add_organisation(model, identification="AWB", name="Architects Without Ballpens")
#             user = ifcopenshell.api.owner.add_person_and_organisation(model, person=person, organisation=organisation)
#             ifcopenshell.api.owner.settings.get_user = lambda x: user
#             ifcopenshell.api.owner.settings.get_application = lambda x: application

#         project = model.create_entity("IfcProject", Name="My Project")

#         # Set up units
#         units = model.create_entity("IfcUnitAssignment")
#         length_unit = model.create_entity("IfcSIUnit", UnitType="LENGTHUNIT", Name="METRE")
#         units.Units = [length_unit]
#         project.UnitsInContext = units

#         site = model.create_entity("IfcSite", Name="Site")
#         building = model.create_entity("IfcBuilding", Name="Building")
#         storey = model.create_entity("IfcBuildingStorey", Name="Storey")

#         # Setup all the contexts
#         # If we plan to store 3D geometry in our IFC model, we have to setup a "Model" context.
#         model3d = ifcopenshell.api.context.add_context(model, context_type="Model")
#         # And/Or, if we plan to store 2D geometry, we need a "Plan" context
#         plan = ifcopenshell.api.context.add_context(model, context_type="Plan")
#         # Now we setup the subcontexts with each of the geometric "purposes"
#         # we plan to store in our model. "Body" is by far the most important
#         # and common context, as most IFC models are assumed to be viewable
#         # in 3D.
#         body = ifcopenshell.api.context.add_context(model, context_type="Model", context_identifier="Body", target_view="MODEL_VIEW", parent=model3d)

#         # The 3D Axis subcontext is important if any "axis-based" parametric
#         # geometry is going to be created. For example, a beam, or column
#         # may be drawn using a single 3D axis line, and for this we need an
#         # Axis subcontext.
#         ifcopenshell.api.context.add_context(model, context_type="Model", context_identifier="Axis", target_view="GRAPH_VIEW", parent=model3d)

#         # It's also important to have a 2D Axis subcontext for things like
#         # walls and claddings which can be drawn using a 2D axis line.
#         ifcopenshell.api.context.add_context(model, context_type="Plan", context_identifier="Axis", target_view="GRAPH_VIEW", parent=plan)

#         # The 3D Box subcontext is useful for clash detection or shape
#         # analysis, or even lazy-loading of large models.
#         ifcopenshell.api.context.add_context(model, context_type="Model", context_identifier="Box", target_view="MODEL_VIEW", parent=model3d)

#         # A 2D annotation subcontext for plan views are important for door
#         # swings, window cuts, and symbols for equipment like GPOs, fire
#         # extinguishers, and so on.
#         ifcopenshell.api.context.add_context(model, context_type="Plan", context_identifier="Annotation", target_view="PLAN_VIEW", parent=plan)

#         # You may also create 2D annotation subcontexts for sections and
#         # elevation views.
#         ifcopenshell.api.context.add_context(model, context_type="Plan", context_identifier="Annotation", target_view="SECTION_VIEW", parent=plan)
#         ifcopenshell.api.context.add_context(model, context_type="Plan", context_identifier="Annotation", target_view="ELEVATION_VIEW", parent=plan)

#         self.context = model.create_entity(
#             "IfcGeometricRepresentationContext",
#             ContextType="Model",
#             CoordinateSpaceDimension=3,
#             Precision=0.01,
#             WorldCoordinateSystem=model.create_entity(
#                 "IfcAxis2Placement3D",
#                 Location=model.create_entity("IfcCartesianPoint", Coordinates=(0.0, 0.0, 0.0)),
#             ),
#         )
#         self.model_context = model.create_entity(
#             "IfcGeometricRepresentationSubContext",
#             ContextIdentifier="Body",
#             ContextType="Model",
#             ParentContext=self.context,
#             TargetView="MODEL_VIEW",
#         )

#         # assign spatial containers
#         ifcopenshell.api.aggregate.assign_object(model, products=[site], relating_object=project)
#         ifcopenshell.api.aggregate.assign_object(model, products=[building], relating_object=site)
#         ifcopenshell.api.aggregate.assign_object(model, products=[storey], relating_object=building)

#         model.write(path)


#     def load_ifc_project_library(self, path: str) -> None:
#         self.ifc_project_library = ifcopenshell.open(path)

#     def load_library_element_by_guid(self, guid: str):
#         if self.ifc_project_library is None:
#             return "No IFC project library loaded."

#         element = self.ifc_project_library.by_guid(guid)
#         if element is None:
#             return f"Element with GUID {guid} not found."

#         # First copy all representation items and their styles
#         if element.RepresentationMaps:
#             for rep_map in element.RepresentationMaps:
#                 # Copy all items in the representation
#                 for item in rep_map.MappedRepresentation.Items:
#                     # Copy styles if they exist
#                     if hasattr(item, 'StyledByItem'):
#                         for styled_item in item.StyledByItem:
#                             # Copy the style assignment
#                             self.file.add(styled_item)
#                             for style in styled_item.Styles:
#                                 # Copy the presentation style
#                                 self.file.add(style)
#                                 if hasattr(style, 'Styles'):
#                                     for substyle in style.Styles:
#                                         # Copy surface styles and colors
#                                         self.file.add(substyle)
#                                         if hasattr(substyle, 'SurfaceColour'):
#                                             self.file.add(substyle.SurfaceColour)

#         self.file.add(element)
#         if element.RepresentationMaps:
#             for rep_map in element.RepresentationMaps:
#                 self.file.add(rep_map)
#                 self.file.add(rep_map.MappedRepresentation)

#         return f"Loaded {element.is_a()} \"{element.Name}\" ({element.GlobalId})"

#     def create_instance(self, type_guid: str, instance_name: str, ifc_class: str):
#         if self.ifc_project_library is None:
#             return "No IFC project library loaded."

#         type_entity = self.ifc_project_library.by_guid(type_guid)
#         if type_entity is None:
#             return f"Type with GUID {type_guid} not found."

#         instance = self.file.create_entity(ifc_class, Name=instance_name)
#         instance.ObjectType = type_entity.Name
#         type_relationship = self.file.create_entity("IfcRelDefinesByType", GlobalId=ifcopenshell.guid.new(), RelatedObjects=[instance], RelatingType=type_entity)

#         # Create placement
#         storey = self.file.by_type("IfcBuildingStorey")[0]
#         placement = self.file.create_entity(
#             "IfcLocalPlacement",
#             PlacementRelTo=storey.ObjectPlacement,
#             RelativePlacement=self.file.create_entity(
#                 "IfcAxis2Placement3D",
#                 Location=self.file.create_entity(
#                     "IfcCartesianPoint",
#                     Coordinates=(0.0, 0.0, 0.0)
#                 )
#             )
#         )
#         instance.ObjectPlacement = placement

#         ifcopenshell.api.aggregate.assign_object(self.file, relating_object=storey, products=[instance])

#         # Copy representation
#         if type_entity.RepresentationMaps:
#             shape = self.file.create_entity(
#                 "IfcShapeRepresentation",
#                 ContextOfItems=self.model_context,
#                 RepresentationIdentifier=type_entity.RepresentationMaps[0].MappedRepresentation.RepresentationIdentifier,
#                 RepresentationType=type_entity.RepresentationMaps[0].MappedRepresentation.RepresentationType,
#             )

#             # Create mapping
#             mapped_item = self.file.create_entity(
#                 "IfcMappedItem",
#                 MappingSource=type_entity.RepresentationMaps[0],
#                 MappingTarget=self.file.create_entity(
#                     "IfcCartesianTransformationOperator3D",
#                     Axis1=None,
#                     Axis2=None,
#                     LocalOrigin=self.file.create_entity(
#                         "IfcCartesianPoint",
#                         Coordinates=(0.0, 0.0, 0.0)
#                     ),
#                     Scale=1.0,
#                     Axis3=None
#                 )
#             )
#             shape.Items = [mapped_item]

#             # Create product definition shape
#             product_shape = self.file.create_entity(
#                 "IfcProductDefinitionShape",
#                 Representations=[shape]
#             )
#             instance.Representation = product_shape


#         return f"Created {instance.is_a()} \"{instance.Name}\" ({instance.GlobalId})"


#     def save(self, path: str="output.ifc"):
#         if self.file is None: return "No IFC project loaded."
#         self.file.write(path)
#         print("IFC project saved to", path)
