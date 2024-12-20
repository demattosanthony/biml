import ifcopenshell
import json
import ifcopenshell.util.element

class IfcSession:
    def __init__(self, ifc_file_path: str):
        self.model = ifcopenshell.open(ifc_file_path)
        if not self.model:
            raise FileNotFoundError(f"Could not open IFC file at: {ifc_file_path}")

    def get_metadata(self):
        """Return basic file metadata: file name, schema, description."""
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


    def get_all_elements(self):
        """Return a list of all elements in the model (e.g. IfcWall, IfcBeam, IfcDoor, etc.)."""
        # Generally, all physical building elements are subtypes of IfcProduct
        return self.model.by_type("IfcProduct")

    def get_element_details(self, element):
        """Return detailed info about a single element, including its properties and attributes."""
        details = {
            "guid": getattr(element, "GlobalId", None),
            "type": element.is_a(),
            "name": getattr(element, "Name", None),
            "object_type": getattr(element, "ObjectType", None),
            "tag": getattr(element, "Tag", None),
            "properties": self.get_element_properties(element)
        }
        return details

    def get_element_properties(self, element):
        """Extract all psets and qtos for the given element."""
        # ifcopenshell.util.element.get_psets returns a dictionary { "PsetName": { "PropertyName": value, ...}, ... }
        return ifcopenshell.util.element.get_psets(element)

    def get_element_hierarchy(self):
        """
        Return a nested dictionary representing the project hierarchy:
        Project -> Site(s) -> Building(s) -> Storey(s) -> Space(s) -> Elements + Their Types
        """
        project = self.model.by_type("IfcProject")
        if not project:
            return {}
        project = project[0]

        def decompose(element):
            hierarchy = {
                "guid": getattr(element, "GlobalId", None),
                "type": element.is_a(),
                "name": getattr(element, "Name", None),
                "children": []
            }

            # Decompose spatial structure (Project -> Site -> Building -> Storey -> Space)
            if hasattr(element, "IsDecomposedBy"):
                for rel in element.IsDecomposedBy:
                    for child in rel.RelatedObjects:
                        hierarchy["children"].append(decompose(child))

            # Include elements contained in the spatial structure
            # For example, a building storey typically "contains" walls, doors, etc.
            if hasattr(element, "ContainsElements"):
                for rel in element.ContainsElements:
                    for contained_elem in rel.RelatedElements:
                        elem_info = {
                            "guid": getattr(contained_elem, "GlobalId", None),
                            "type": contained_elem.is_a(),
                            "name": getattr(contained_elem, "Name", None),
                            "properties": self.get_element_properties(contained_elem),
                            "types": []
                        }

                        # Check if element is defined by a type
                        if hasattr(contained_elem, "IsDefinedBy"):
                            for definition_rel in contained_elem.IsDefinedBy:
                                if definition_rel.is_a("IfcRelDefinesByType") and definition_rel.RelatingType:
                                    t = definition_rel.RelatingType
                                    elem_info["types"].append({
                                        "guid": getattr(t, "GlobalId", None),
                                        "type": t.is_a(),
                                        "name": getattr(t, "Name", None),
                                        "properties": self.get_element_properties(t)
                                    })

                        hierarchy["children"].append(elem_info)

            return hierarchy

        return decompose(project)


    def list_spaces(self):
        """Return a list of IfcSpace elements."""
        return self.model.by_type("IfcSpace")

    def list_systems(self):
        """Return a list of IfcSystem elements in the model."""
        return self.model.by_type("IfcSystem")

    def list_types(self):
        """Return a list of all IfcTypeObject (including IfcElementType) elements."""
        return self.model.by_type("IfcTypeObject")

    def list_projects(self):
        """Return a list of projects (usually there's only one)."""
        return self.model.by_type("IfcProject")

    def list_sites(self):
        """Return a list of IfcSite elements."""
        return self.model.by_type("IfcSite")

    def list_buildings(self):
        """Return a list of IfcBuilding elements."""
        return self.model.by_type("IfcBuilding")

    def list_storeys(self):
        """Return a list of IfcBuildingStorey elements."""
        return self.model.by_type("IfcBuildingStorey")

    def find_element_by_guid(self, guid: str):
        """Find a single element by its GlobalId."""
        return self.model.by_guid(guid)

    def get_units(self):
        """Return the units used in the model (e.g. length units, area units, etc.)."""
        project = self.model.by_type("IfcProject")
        if not project:
            return None
        project = project[0]
        if project.UnitsInContext:
            units = {}
            for unit_assignment in project.UnitsInContext.Units:
                unit_type = unit_assignment.UnitType if hasattr(unit_assignment, 'UnitType') else None
                # The naming of units can vary, attempt to store meaningful info
                units[unit_type] = {
                    "prefix": getattr(unit_assignment, "Prefix", None),
                    "name": getattr(unit_assignment, "Name", None)
                }
            return units
        return None

    def summarize(self):
        """Return a high-level summary of the model: counts of elements, spaces, systems, etc."""
        return {
            "projects_count": len(self.list_projects()),
            "sites_count": len(self.list_sites()),
            "buildings_count": len(self.list_buildings()),
            "storeys_count": len(self.list_storeys()),
            "elements_count": len(self.get_all_elements()),
            "spaces_count": len(self.list_spaces()),
            "systems_count": len(self.list_systems()),
            "types_count": len(self.list_types())
        }

# Example usage:
session = IfcSession("/Users/anthonydemattos/auto-bim/train/dataset/Architectural_Updated.ifc")
# Save metadata to file
with open('metadata.json', 'w') as f:
    json.dump(session.get_metadata(), f, indent=4)

# Save spaces list to file
spaces = [space.GlobalId for space in session.list_spaces()]  # Convert IFC objects to IDs
with open('spaces.json', 'w') as f:
    json.dump(spaces, f, indent=4)

# Save hierarchy to file
with open('hierarchy.json', 'w') as f:
    json.dump(session.get_element_hierarchy(), f, indent=4)

# Save element details to file
element = session.get_all_elements()[0]
with open('element_details.json', 'w') as f:
    json.dump(session.get_element_details(element), f, indent=4)

# Save summary to file
with open('summary.json', 'w') as f:
    json.dump(session.summarize(), f, indent=4)
