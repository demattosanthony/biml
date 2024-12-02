from litellm import completion, stream_chunk_builder
import base64
import os
import json


# Load in bim object library. Read all file names from bim_objects folder
# bim_objects = []
# for file in os.listdir("bim_objects"):
#     if file.endswith(".ifc"):
#         bim_objects.append(file)

# Inital code
model = """import ifcopenshell
from ifcopenshell import guid

# Setup project
model = ifcopenshell.file(schema="IFC2X3")
project = model.create_entity("IfcProject", Name="My Project")
site = model.create_entity("IfcSite", Name="Site")
building = model.create_entity("IfcBuilding", Name="Building")
"""

bim_spec = """### BIM Specification Document: Single Room

---

**Project Name:** Example Room Specification  

---

### 1. General Overview

**Room Name:** Example Room  
**Room Function:** [Specify Function: e.g., Office, Bedroom, etc.]  
**Dimensions:** Length: 4.0 m, Width: 3.0 m, Height: 2.8 m  

---

### 2. Components and Specifications

#### 2.1. **Walls**  
- **Number of Walls:** 4  
- **Material:**  
  - Internal: Gypsum Plasterboard (12.5 mm thickness)  
  - External (Structural): Concrete (200 mm thickness)  
- **Finish:**  
  - Paint: Matte, White (RAL 9010)  
- **Thermal Insulation:** Polyurethane Foam (50 mm)  
- **Fire Rating:** 1-hour fire resistance  
- **Wall Openings:** 1 (Door)  

---

#### 2.2. **Floor**  
- **Material Layers:**  
  1. Substrate: Reinforced Concrete (150 mm)  
  2. Insulation: Rigid Foam Board (50 mm)  
  3. Finishing: Vinyl Tile Flooring (2 mm thickness, color: Light Oak)  
- **Thermal Resistance:** R-3.0  
- **Load Capacity:** 3 kN/m²  

---

#### 2.3. **Ceiling**  
- **Type:** Suspended Ceiling  
- **Material:** Acoustic Gypsum Panels (12.5 mm thickness)  
- **Finish:** Smooth Matte White Paint (RAL 9016)  
- **Height:** 2.8 m from finished floor level  
- **Lighting Fixtures:**  
  - Recessed LED Panels (4000K Neutral White)  
  - Spacing: 2.0 m apart  

---

#### 2.4. **Door**  
- **Type:** Single Swing Door  
- **Dimensions:** 900 mm (Width) x 2100 mm (Height)  
- **Material:** Solid Core Wood, Veneered  
- **Finish:** Satin Varnish (Natural Oak)  
- **Hardware:**  
  - Handle: Brushed Stainless Steel  
  - Hinges: Concealed Hinges (3 Nos.)  
  - Lock: Keyed Mortise Lock  
- **Fire Rating:** 30-minute fire resistance  
- **Acoustic Rating:** 30 dB  

---

### 3. Room Performance Specifications

#### 3.1. **Thermal Performance**  
- U-Value for Walls: 0.3 W/m²K  
- U-Value for Floor: 0.25 W/m²K  
- U-Value for Ceiling: 0.22 W/m²K  

#### 3.2. **Acoustic Performance**  
- Wall Sound Insulation: 45 dB (Rw)  
- Ceiling Acoustic Absorption: NRC 0.7  

#### 3.3. **Fire Safety**  
- Room Fire Rating: 1-hour fire containment  

---

### 4. BIM Data Fields

**Room Identifier:** Room_001  
**IFC Element Types:**  
- Walls: IfcWall  
- Floor: IfcSlab  
- Ceiling: IfcCovering  
- Door: IfcDoor  
**Geometric Representation:**  
- Coordinate System: Local Room Origin (0,0,0)  
- Units: Millimeters  

---

### 5. Notes and Assumptions

1. Door hardware selection may vary based on client requirements.  
2. Lighting layout to be confirmed upon detailed electrical design.  
3. All materials comply with [Insert Building Code/Standard, e.g., ISO 16739]."""

prompt = f"""<ifcopenshellscript>
{model}
</ifcopenshellscript>

Consider the following BIM specification:

<bim_specification>
{bim_spec}
</bim_specification>

Can you help me implement the necessary code to fulfill the requirements specified in the <bim_specification>?

Your task is to write the code leveraging the ifcopenshell python library to meet the specified BIM requirements.

Follow these steps to complete the task:
1. As a first step, analyze the provided code and the BIM specification.
2. Create a plan of action to modify the code to meet the BIM requirements.
3. Update the sourcecode to implement the plan.
4. Run the code to make sure it works as expected.

Your thinking should be thorough and it's fine if it's very long.

<memory>
1. when using the guid or other modules from ifcopenshell you need to import like this: `from ifcopenshell import guid`
2. all the geomtries need to be added in order for the model to be rendered correctly in a ifc viewer
3. you need to ensure that both the source and target IFC files use the same schema version. Here are the steps to correct this:

### Check and Match Schema Versions
When creating the new IFC file, specify the schema version explicitly to match the source file's schema. Here is how you can do it:

```python
model = ifcopenshell.api.project.create_file(version='IFC2X3')  # or 'IFC4' depending on the source file's schema
```

Alternatively, if you are not using the `ifcopenshell.api.project.create_file` method, you can specify the schema when creating the file directly:

```python
model = ifcopenshell.file(schema='IFC2X3')  # or 'IFC4'
```
</memory>"""

tools = [
    {
        "type": "function",
        "function": {
            "name": "update_code",
            "description": """Update and replace the existing ifcopenshell script with a new one.\nWhen invoking this tool, the contents of "new_code" will replace the existing code in the script.\nThe new code should always save the ifc model to a file named "output.ifc".""",
            "parameters": {
                "type": "object",
                "properties": {
                    "new_code": {
                        "type": "string",
                        "description": "The new ifcopenshell script to replace the existing one.",
                    },
                },
                "required": ["new_code"],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "run_code",
            "description": "Run the current ifcopenshell script and generate the output IFC file. This will return any errors that need to be fixed.",
            "parameters": {
                "type": "object",
                "properties": {},
            },
        },
    },
]

def update_code(new_code):
    model = new_code

    with open("model.py", "w") as file:
        file.write(model)

    return "Code updated successfully."

def run_code():
    try:
        import subprocess

        # Run the model.py script using subprocess
        result = subprocess.run(['/Users/anthonydemattos/auto-bim/saron/.venv/bin/python3', '/Users/anthonydemattos/auto-bim/saron/model.py'], capture_output=True, text=True)

        if result.returncode != 0:
            print("An error occurred during code execution.")
            print(f"Error Message: {result.stderr}")

            return f"An error occurred while running the code. The error message is:\n{result.stderr}"
        else:
            print(result.stdout)
            return "Code executed successfully."
    except Exception as e:
        return f"An error occurred: {str(e)}"


# read pdf file as base64 and then utf-8
# with open("arch_set_setty-office.pdf", "rb") as file:
#     pdf_base64 = base64.b64encode(file.read()).decode("utf-8")

messages = [
    # {"role": "system", "content": system_message},
    {
        "role": "user",
        "content": prompt
    },
]

claude_haiku = "claude-3-5-haiku-20241022"
claude_sonnet = "claude-3-5-sonnet-20241022"
o1_preview = "o1-preview"
o1_mini = "o1-mini"
gpt_4o = "gpt-4o"
pplx_online_big = "perplexity/llama-3.1-sonar-large-128k-online"

def main():
    while True:
        response = completion(model=claude_sonnet, messages=messages, temperature=0, stream=True, tools=tools)

        chunks = []
        for chunk in response:
            chunks.append(chunk)
            print(chunk.choices[0].delta.content or "", flush=True, end="")

        # Rebuild the model response from the chunks
        model_response = stream_chunk_builder(chunks)

        # Update the messages
        messages.append(model_response.choices[0].message.model_dump())

        # Check for tool calls
        tool_calls = model_response.choices[0].message.tool_calls
        if tool_calls:
            for tool_call in tool_calls:
                tool_call_id = tool_call.id
                tool_name = tool_call.function.name
                tool_parameters = json.loads(tool_call.function.arguments)

                print(f"Tool Call: {tool_name}")
                print(f"Parameters: {tool_parameters}")

                result = ""
                if tool_name == "update_code":
                    new_code = tool_parameters["new_code"]
                    result = update_code(new_code)
                elif tool_name == "run_code":
                    result = run_code()

                messages.append(
                    {
                        "tool_call_id": tool_call_id,
                        "role": "tool",
                        "name": tool_name,
                        "content": result,
                    }
                )
                print(result)
        else:
            break
        
        print("\n\n")


if __name__ == "__main__":
    main()
