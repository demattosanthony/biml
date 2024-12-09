import ifcopenshell
import ifcopenshell.util

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

def build_hierarchy(project: ifcopenshell.entity_instance, with_properties=False):
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
