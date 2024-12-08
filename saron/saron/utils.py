import ifcopenshell
from ifcopenshell import file
import json

def build_object_tree(ifc_entity) -> dict:
    """
    Recursively builds a dictionary representation of the object tree of an IFC entity.

    :param ifc_entity: The IFC entity to process.
    :return: A dictionary representing the object tree.
    """
    # Create the base node for this entity
    entity_node = {
        "guid": ifc_entity.GlobalId,  # Add the GUID
        "type": ifc_entity.is_a(),
        "name": ifc_entity.Name or ifc_entity.LongName or "Unnamed",
        "children": [],
    }

    # Fetch related elements for spaces or building structure
    if ifc_entity.is_a("IfcSpatialStructureElement"):
        related_elements = ifc_entity.ContainsElements
        for element_relation in related_elements:
            for element in element_relation.RelatedElements:
                entity_node["children"].append(
                    {
                        "guid": element.GlobalId,  # Add the GUID
                        "type": element.is_a(),
                        "name": element.Name or "Unnamed",
                        "children": [],  # Ensure child nodes are consistent
                    }
                )

    # Check if the entity has a decomposition relationship and recurse
    if ifc_entity.is_a("IfcObjectDefinition") or ifc_entity.is_a("IfcSpatialStructureElement"):
        for related in ifc_entity.IsDecomposedBy:
            for child in related.RelatedObjects:
                entity_node["children"].append(build_object_tree(child))

    return entity_node


def get_ifc_object_tree(ifc_file: file, output_format="dict"):
    """
    Loads an IFC file and returns its object tree in the specified format.

    :param ifc_file: IFC file.
    :param output_format: Output format ('dict', 'json', or 'string').
    :return: Object tree in the desired format.
    """

    # Get the top-level project entity
    project = ifc_file.by_type("IfcProject")[0]
    object_tree = build_object_tree(project)

    if output_format == "dict":
        return object_tree
    elif output_format == "json":
        return json.dumps(object_tree, indent=2)
    elif output_format == "string":
        return format_tree_as_string(object_tree)
    else:
        raise ValueError("Unsupported output format. Use 'dict', 'json', or 'string'.")


def format_tree_as_string(tree, indent=0):
    """
    Formats the object tree as a nicely indented string.

    :param tree: The object tree dictionary.
    :param indent: Current indentation level.
    :return: Nicely formatted string.
    """
    result = " " * indent + f"{tree['type']} ({tree['guid']}) - {tree['name']}\n"
    for child in tree.get("children", []):  # Use get() to ensure no KeyError
        result += format_tree_as_string(child, indent + 2)
    return result


def extract_code_blocks(content):
    # Remove the outer <Code> tags
    code_content = content.split("<Code>")[1].split("</Code>")[0].strip()

    # Split the content by code block markers
    code_blocks = code_content.split("```")

    # Filter out empty strings and strip whitespace
    code_blocks = [block.strip() for block in code_blocks if block.strip()]

    # Separate code blocks by their language (first word after ```)
    parsed_blocks = []
    for block in code_blocks:
        # Split the first line to get the language
        lines = block.split("\n")
        language = lines[0].strip()
        # Combine the rest of the lines as the code
        code = "\n".join(lines[1:])
        parsed_blocks.append({"language": language, "code": code})

    return parsed_blocks



if __name__ == "__main__":
    # Replace with the path to your IFC file
    ifc_file_path = "/Users/anthonydemattos/auto-bim/saron/output.ifc"

    ifc_file = ifcopenshell.open(ifc_file_path)
    # Get the object tree in the desired format
    result = get_ifc_object_tree(ifc_file, output_format="string")  # Change to 'dict' or 'json' as needed
    print(result)  # Prints the string if 'string' format is chosen