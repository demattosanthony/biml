import ifcopenshell
from ifcopenshell.api import aggregate
import ifcopenshell.guid
from saron.utils import get_ifc_object_tree
import json


class BimEnvironment:
    def __init__(self) -> None:
        # Create a blank IFC file
        self.model = ifcopenshell.file()

        # Set up the root project element
        self.project = self.model.create_entity("IfcProject", Name="My Project")
        self.site = self.model.create_entity("IfcSite", Name="Site")
        self.building = self.model.create_entity("IfcBuilding", Name="Building")

        # Relate site and building to the project
        self._relate_hierarchy(self.project, [self.site])
        self._relate_hierarchy(self.site, [self.building])

    def _relate_hierarchy(self, relating_object, related_objects):
        """Creates a relationship to define a hierarchy."""
        self.model.create_entity(
            "IfcRelAggregates",
            RelatingObject=relating_object,
            RelatedObjects=related_objects,
        )

    def get_current_state(self):
        return get_ifc_object_tree(ifc_file=self.model, output_format="string")

    def get_element(self, guid):
        element = self.model.by_guid(guid)
        assert element, f"Element with GUID {guid} not found."
        element_info = element.get_info()
        psets_and_qtos = ifcopenshell.util.element.get_psets(element)
        container = ifcopenshell.util.element.get_container(element)

        return json.dumps(
            {
                "element": element_info,
                "psets_and_qtos": psets_and_qtos,
                "container": container,
            },
            indent=4,
        )

    def create_storey(self, name, elevation):
        storey = self.model.create_entity("IfcBuildingStorey", Name=name, Elevation=elevation)
        self._relate_hierarchy(self.building, [storey])
        return storey

    def create_entity(self, ifc_class):
        return self.model.create_entity(ifc_class, GlobalId=ifcopenshell.guid.new())

    def assign_container(self, entity, container):
        self.model.create_entity(
            "IfcRelContainedInSpatialStructure",
            RelatingStructure=container,
            RelatedElements=[entity],
        )




class Agent:
    def __init__(self, model="claude-3-5-sonnet-20241022") -> None:
        self.model = model
