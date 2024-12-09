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
