import ifcopenshell
import json
import ifcopenshell.util.element

class IfcSession:
    def __init__(self, ifc_file_path: str):
        self.model = ifcopenshell.open(ifc_file_path)
        if not self.model:
            raise FileNotFoundError(f"Could not open IFC file at: {ifc_file_path}")

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

    def get_all_elements(self):
        return self.model.by_type("IfcProduct")

    def list_projects(self):
        return self.model.by_type("IfcProject")

    def list_sites(self):
        return self.model.by_type("IfcSite")

    def list_buildings(self):
        return self.model.by_type("IfcBuilding")

    def list_storeys(self):
        return self.model.by_type("IfcBuildingStorey")

    def list_spaces(self):
        return self.model.by_type("IfcSpace")

    def list_systems(self):
        return self.model.by_type("IfcSystem")

    def list_types(self):
        return self.model.by_type("IfcTypeObject")

    def get_units(self):
        project = self.list_projects()
        if not project:
            return None
        project = project[0]
        if project.UnitsInContext:
            units = {}
            for unit_assignment in project.UnitsInContext.Units:
                unit_type = getattr(unit_assignment, 'UnitType', None)
                units[unit_type] = {
                    "prefix": getattr(unit_assignment, "Prefix", None),
                    "name": getattr(unit_assignment, "Name", None)
                }
            return units
        return None

    def summarize(self):
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

    def get_containment_hierarchy(self):
        projects = self.list_projects()
        if not projects:
            return {}
        project = projects[0]

        def decompose(spatial_element):
            node = {
                "guid": getattr(spatial_element, "GlobalId", None),
                "type": spatial_element.is_a(),
                "name": getattr(spatial_element, "Name", None),
                "children": []
            }

            # Spatial Decomposition
            if hasattr(spatial_element, "IsDecomposedBy"):
                for rel in spatial_element.IsDecomposedBy:
                    for child in rel.RelatedObjects:
                        node["children"].append(decompose(child))

            # Contained elements (non-spatial)
            if hasattr(spatial_element, "ContainsElements"):
                for rel in spatial_element.ContainsElements:
                    for elem in rel.RelatedElements:
                        node["children"].append({
                            "guid": getattr(elem, "GlobalId", None),
                            "type": elem.is_a(),
                            "name": getattr(elem, "Name", None),
                            "properties": self.get_element_properties(elem)
                        })
            return node

        return decompose(project)

    def get_component_hierarchy(self):
        elements = self.get_all_elements()
        hierarchy = {}
        for elem in elements:
            elem_class = elem.is_a()
            if elem_class not in hierarchy:
                hierarchy[elem_class] = []
            hierarchy[elem_class].append({
                "guid": getattr(elem, "GlobalId", None),
                "name": getattr(elem, "Name", None),
                "properties": self.get_element_properties(elem)
            })
        return hierarchy

    def get_federated_floor_hierarchy(self):
        storeys = self.list_storeys()
        federated = {}
        for st in storeys:
            elevation = getattr(st, "Elevation", None)
            fed_key = round(elevation, 2) if elevation is not None else "Unknown"
            if fed_key not in federated:
                federated[fed_key] = {
                    "elevation": fed_key,
                    "storeys": [],
                    "elements": []
                }
            federated[fed_key]["storeys"].append({
                "guid": getattr(st, "GlobalId", None),
                "name": getattr(st, "Name", None),
                "type": st.is_a()
            })

            # Get elements contained in this storey
            if hasattr(st, "ContainsElements"):
                for rel in st.ContainsElements:
                    for elem in rel.RelatedElements:
                        federated[fed_key]["elements"].append({
                            "guid": getattr(elem, "GlobalId", None),
                            "type": elem.is_a(),
                            "name": getattr(elem, "Name", None),
                            "properties": self.get_element_properties(elem)
                        })

        return federated

    def build_all_hierarchies(self):
        return {
            "containment_hierarchy": self.get_containment_hierarchy(),
            "component_hierarchy": self.get_component_hierarchy(),
            "federated_floor_hierarchy": self.get_federated_floor_hierarchy()
        }

    # ----------------------------------------------------------
    # Search Functionality (Containment Only)
    # ----------------------------------------------------------

    def search_in_containment(self, search_term):
        """
        Searches through the containment hierarchy for entries matching the search_term.
        Match is partial and case-insensitive. It looks into 'guid', 'type', 'name',
        and string properties.
        """

        hierarchy = self.get_containment_hierarchy()

        results = []

        def matches_search(value):
            if isinstance(value, str):
                return search_term.lower() in value.lower()
            return False

        def check_item(item):
            if not isinstance(item, dict):
                return False

            # Check standard fields
            for key in ["guid", "type", "name"]:
                if key in item and item[key] and matches_search(item[key]):
                    return True

            # Check properties if available
            if "properties" in item and isinstance(item["properties"], dict):
                for p_key, p_val in item["properties"].items():
                    if isinstance(p_val, dict):
                        for subkey, subval in p_val.items():
                            if isinstance(subval, str) and matches_search(subval):
                                return True
                    elif isinstance(p_val, str) and matches_search(p_val):
                        return True

            return False

        def recursive_search(structure):
            if isinstance(structure, dict):
                # If this dict matches, add to results
                if check_item(structure):
                    results.append(structure)

                for v in structure.values():
                    recursive_search(v)

            elif isinstance(structure, list):
                for item in structure:
                    recursive_search(item)

        recursive_search(hierarchy)

        return results


# Example usage:
session = IfcSession("/Users/anthonydemattos/auto-bim/train/dataset/mechanical.ifc")
hierarchies = session.build_all_hierarchies()

# Save each hierarchy to separate JSON files
with open('containment_hierarchy.json', 'w') as f:
    json.dump(hierarchies["containment_hierarchy"], f, indent=2)

with open('component_hierarchy.json', 'w') as f:
    json.dump(hierarchies["component_hierarchy"], f, indent=2)

with open('federated_floor_hierarchy.json', 'w') as f:
    json.dump(hierarchies["federated_floor_hierarchy"], f, indent=2)

print("Hierarchies have been saved to separate JSON files")

# Example of searching:
import time
start = time.time()
search_term = "DOAS 2"
search_results = session.search_in_containment(search_term)
end_time = time.time() - start
print(f"Search results for '{search_term}':")
print(json.dumps(search_results, indent=2))
print(f"Search took {end_time} seconds")
