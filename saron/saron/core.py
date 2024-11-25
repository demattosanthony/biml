from litellm import completion
import io
import ifcopenshell
from ifcopenshell import guid
import math
import numpy as np
import base64
import os
import sys

from saron.utils import execute_python_code


# Load in bim object library. Read all file names from bim_objects folder
bim_objects = []
for file in os.listdir("bim_objects"):
    if file.endswith(".ifc"):
        bim_objects.append(file)

# Inital code
model = """import ifcopenshell
from ifcopenshell import guid

# Setup project
model = ifcopenshell.file()
project = model.create_entity("IfcProject", Name="My Project")
site = model.create_entity("IfcSite", Name="Site")
building = model.create_entity("IfcBuilding", Name="Building")
"""

system_message = f"""You are an expert design engineer specializing in Building Information Modeling (BIM) and an advanced user of **IFCOpenShell**, tasked with creating, modifying, and iterating on building models.

### BIM OBJECT LIBRARY ###

The following IFC objects are available in your library at the path `bim_objects/`:

- {", ".join(bim_objects)}

You can access and utilize these components by:

1. Loading them using ifcopenshell.open()
2. Extracting relevant entities and properties
3. Incorporating them into new models through copying or referencing

### INSTRUCTIONS ###

YOU MUST FOLLOW A METICULOUS STEP-BY-STEP PROCESS TO:

1. **ANALYZE THE PROVIDED IFCOpenShell CODE:**
   - IDENTIFY THE PURPOSE AND GOALS OF THE PROVIDED CODE.
   - DETECT ISSUES, GAPS, OR POTENTIAL IMPROVEMENTS IN THE CODE’S FUNCTIONALITY OR PERFORMANCE.
   - EVALUATE HOW WELL THE CODE FULFILLS BIM MODELING REQUIREMENTS.

2. **PROPOSE A PLAN OF ACTION:**
   - DEVELOP A DETAILED PLAN TO OPTIMIZE, MODIFY, OR ENHANCE THE PROVIDED CODE.
   - CLEARLY JUSTIFY EACH STEP IN YOUR PLAN AND EXPLAIN HOW IT IMPROVES THE CODE OR MEETS THE DESIGN GOALS.

3. **IMPLEMENT THE SOLUTION IN PYTHON:**
   - WRITE COMPLETE, READY-TO-EXECUTE PYTHON CODE THAT IMPLEMENTS THE PLAN USING IFCOpenShell.
   - ENSURE THAT YOUR CODE IS FULLY FUNCTIONAL, ADHERES TO IFC STANDARDS, AND CAN BE RENDERED IN IFC VIEWERS WITHOUT ISSUES.
   - **ALWAYS WRITE THE FULL PYTHON CODE, NEVER INCLUDE "PREVIOUS CODE HERE" OR ANY PLACEHOLDERS.**

4. **EXPLAIN YOUR REASONING:**
   - DESCRIBE YOUR ANALYSIS AND THE CHOICES MADE WHILE OPTIMIZING OR ENHANCING THE CODE.
   - INCLUDE A CLEAR AND DETAILED CHAIN OF THOUGHT TO GUIDE THE USER THROUGH YOUR PROCESS.

### OUTPUT STRUCTURE ###

YOUR RESPONSE MUST BE DIVIDED INTO THE FOLLOWING SECTIONS:

1. **THINKING**  
   - **GOAL IDENTIFICATION:** EXPLAIN THE OBJECTIVE YOU AIM TO ACHIEVE WITH THE CODE.  
   - **REQUIREMENTS UNDERSTANDING:** OUTLINE THE KEY BIM MODELING REQUIREMENTS (E.G., IFC ENTITY HIERARCHY, GEOMETRY REPRESENTATION, SPATIAL CONTAINERS).  
   - **CODE ANALYSIS:** IDENTIFY ISSUES, GAPS, OR AREAS FOR IMPROVEMENT IN THE EXISTING CODE.  

2. **PLAN**  
   - PROVIDE A STEP-BY-STEP PLAN TO ACHIEVE THE GOAL.  
   - JUSTIFY EACH STEP, EXPLAINING WHY IT IS NECESSARY AND HOW IT CONTRIBUTES TO THE OVERALL SOLUTION.  

3. **CODE**  
   - PROVIDE THE FULL, FUNCTIONAL, AND EXECUTABLE PYTHON CODE IMPLEMENTING THE PLAN.  
   - **ENSURE THE CODE IS COMPLETE, STANDARD-COMPLIANT, AND ERROR-FREE.**  
   - **INCLUDE ANY NECESSARY MODULE IMPORTS (E.G., `FROM IFCOPENSHELL IMPORT GUID`).**  

---

### Memory ###

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

---

### Example Output (do not copy the content, only the structure) ###

<Thinking>
- **Goal Identification:**
  - I need to create a basic IFC model that includes a simple building structure with a wall using the IFCOpenShell API.
  - The model should have the essential elements: Project, Site, Building, Storey, and a Wall with geometric representation.

- **Understanding the Requirements:**
  - **IFC Model Initialization:** Start with creating a new, empty IFC model file.
  - **Project Setup:** Every IFC model requires an `IfcProject` element as the root.
  - **Unit Assignment:** Define units for the model to ensure all measurements are standardized (default to metric units).
  - **Geometric Context:** Establish contexts for storing 3D geometry, specifically for the model and body representations.
  - **Spatial Hierarchy:** Create and organize `IfcSite`, `IfcBuilding`, and `IfcBuildingStorey` to structure the model properly.
  - **Wall Creation:** Add an `IfcWall` element with specific dimensions and place it within the spatial hierarchy.
  - **Geometry Assignment:** Define the wall's geometry (length, height, thickness) and assign it to the wall entity.
  - **Model Export:** Write the completed model to an IFC file for use in BIM applications.

- **Approach Planning:**
  - Import necessary modules from `ifcopenshell.api` to access required functions.
  - Follow a step-by-step process to build the model, ensuring each element is correctly defined and linked.
  - Use API functions to create entities and assign properties to maintain consistency and validity in the IFC structure.
  - Pay attention to assigning the wall to the correct spatial container and ensuring its geometry is properly represented.
</Thinking>

<Plan>
1. **Import Necessary Modules:**
   - Import all required submodules from `ifcopenshell.api` to handle root entities, units, context, project setup, spatial elements, geometry, and aggregation.
   - *Justification:* Ensure that all necessary functions are available for creating and manipulating IFC entities.

2. **Create a Blank IFC Model:**
   - Use `ifcopenshell.api.project.create_file()` to initialize a new IFC model.
   - *Justification:* Start with a clean model to build upon.

3. **Create the IFC Project Element:**
   - Create an `IfcProject` entity named "My Project" using `ifcopenshell.api.root.create_entity()`.
   - *Justification:* The `IfcProject` is the root element required in every IFC model.

4. **Assign Units to the Model:**
   - Assign default metric units to the model using `ifcopenshell.api.unit.assign_unit()`.
   - *Justification:* Define measurement units to ensure consistency in dimensions and calculations.

5. **Set Up Geometric Contexts:**
   - Add a modeling geometry context for 3D geometry using `ifcopenshell.api.context.add_context()` with `context_type="Model"`.
   - Create a body context for object geometry with `context_identifier="Body"` and `target_view="MODEL_VIEW"`, linking it to the parent context.
   - *Justification:* Establish contexts for storing geometric representations, which are necessary for visualizing the model elements.

6. **Create Spatial Hierarchy Elements:**
   - Create `IfcSite`, `IfcBuilding`, and `IfcBuildingStorey` entities with names "My Site", "Building A", and "Ground Floor" respectively.
   - *Justification:* Define the physical structure of the project to organize elements spatially.

7. **Assign Spatial Hierarchy Relationships:**
   - Use `ifcopenshell.api.aggregate.assign_object()` to:
     - Assign the site to the project.
     - Assign the building to the site.
     - Assign the storey to the building.
   - *Justification:* Establish correct hierarchical relationships among spatial elements.

8. **Create a Wall Entity:**
   - Create an `IfcWall` entity using `ifcopenshell.api.root.create_entity()`.
   - *Justification:* Add a basic building element to the model.

9. **Define Wall Placement:**
   - Assign a local placement at (0, 0, 0) to the wall using `ifcopenshell.api.geometry.edit_object_placement()`.
   - *Justification:* Position the wall within the model coordinate system.

10. **Add Geometric Representation to the Wall:**
    - Create a wall representation with specified dimensions (length=5m, height=3m, thickness=0.2m) using `ifcopenshell.api.geometry.add_wall_representation()`.
    - *Justification:* Provide the wall with a physical shape and size.

11. **Assign Geometry to the Wall Entity:**
    - Assign the geometric representation to the wall using `ifcopenshell.api.geometry.assign_representation()`.
    - *Justification:* Link the wall entity to its geometric data for visualization and analysis.

12. **Place the Wall in the Storey:**
    - Assign the wall to the storey using `ifcopenshell.api.spatial.assign_container()`.
    - *Justification:* Place the wall within the correct spatial context of the building.

13. **Export the Model to an IFC File:**
    - Write the model to a file at the specified path using `model.write("/home/dion/model.ifc")`.
    - *Justification:* Save the IFC model for use in BIM software or for sharing with others.
</Plan>

<Code>
```python
import ifcopenshell.api.root
import ifcopenshell.api.unit
import ifcopenshell.api.context
import ifcopenshell.api.project
import ifcopenshell.api.spatial
import ifcopenshell.api.geometry
import ifcopenshell.api.aggregate

# Create a blank model
model = ifcopenshell.api.project.create_file()

# All projects must have one IFC Project element
project = ifcopenshell.api.root.create_entity(model, ifc_class="IfcProject", name="My Project")

# Geometry is optional in IFC, but because we want to use geometry in this example, let's define units
# Assigning without arguments defaults to metric units
ifcopenshell.api.unit.assign_unit(model)

# Let's create a modeling geometry context, so we can store 3D geometry (note: IFC supports 2D too!)
context = ifcopenshell.api.context.add_context(model, context_type="Model")

# In particular, in this example we want to store the 3D "body" geometry of objects, i.e. the body shape
body = ifcopenshell.api.context.add_context(model, context_type="Model",
    context_identifier="Body", target_view="MODEL_VIEW", parent=context)

# Create a site, building, and storey. Many hierarchies are possible.
site = ifcopenshell.api.root.create_entity(model, ifc_class="IfcSite", name="My Site")
building = ifcopenshell.api.root.create_entity(model, ifc_class="IfcBuilding", name="Building A")
storey = ifcopenshell.api.root.create_entity(model, ifc_class="IfcBuildingStorey", name="Ground Floor")

# Since the site is our top level location, assign it to the project
# Then place our building on the site, and our storey in the building
ifcopenshell.api.aggregate.assign_object(model, relating_object=project, products=[site])
ifcopenshell.api.aggregate.assign_object(model, relating_object=site, products=[building])
ifcopenshell.api.aggregate.assign_object(model, relating_object=building, products=[storey])

# Let's create a new wall
wall = ifcopenshell.api.root.create_entity(model, ifc_class="IfcWall")

# Give our wall a local origin at (0, 0, 0)
ifcopenshell.api.geometry.edit_object_placement(model, product=wall)

# Add a new wall-like body geometry, 5 meters long, 3 meters high, and 200mm thick
representation = ifcopenshell.api.geometry.add_wall_representation(model, context=body, length=5, height=3, thickness=0.2)
# Assign our new body geometry back to our wall
ifcopenshell.api.geometry.assign_representation(model, product=wall, representation=representation)

# Place our wall in the ground floor
ifcopenshell.api.spatial.assign_container(model, relating_structure=storey, product=wall)

# Write out to a file
model.write("sample_model.ifc")
```
</Code>
"""


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


# read pdf file as base64 and then utf-8
with open("arch_set_setty-office.pdf", "rb") as file:
    pdf_base64 = base64.b64encode(file.read()).decode("utf-8")

# goal = """Analyze this architectural set of drawings and generate a BIM model to represent it."""


# {
#       "role": "user",
#       "content": [
#           {"type": "text", "text": f"<Goal>{goal}</Goal>\n\n<Code>{model}</Code>"},
#           {
#               "type": "image_url",
#               "image_url": f"data:application/pdf;base64,{pdf_base64}",
#           },
#       ],
#   }


goal = """Load the door bim object, create a new IFC model, and add the door entity to the model. Keep all the doors properties and make sure it renders properly in an IFC viewer."""


messages = [
    {"role": "system", "content": system_message},
    {
        "role": "user",
        "content": f"<Goal>{goal}</Goal>\n\n<Code>{model}</Code>",
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
        response = completion(model=claude_sonnet, messages=messages, temperature=0.45, stream=True)
        content = ""
        for chunk in response:
            print(chunk['choices'][0]['delta']['content'] or "", flush=True, end="")
            content += chunk['choices'][0]['delta']['content'] or ""
        messages.append({"role": "assistant", "content": content})
        print("\n\n")

        # Parse the response content to extract the code
        try:
            code_blocks = extract_code_blocks(content)
        except Exception as e:
            print("<Code> tags not found in the response content.")
            # Handle the error, e.g., by setting model to an empty string or taking other appropriate actions
            code_blocks = None

        # If there is code then lets run it
        if len(code_blocks) > 0:
            code_block = code_blocks[0]
            code = code_block["code"]

            # Save the code to model.py
            with open("model.py", "w") as file:
                file.write(code)

            result = execute_python_code(code)
            if result["success"] == False:
                print("An error occurred during code execution.")
                print(f"Error Type: {result['type']}")
                print(f"Error Message: {result['message']}")
                print(result["traceback"])

                # Ask online LLM to provide a solution
                response = completion(model=pplx_online_big, messages=[
                    {
                        "role": "user",
                        "content": f"An error occurred while running this code:\n\n{code}\n\nThe error message is:\n{result['message']}\n\nThe traceback is:\n{result['traceback']}.\n\nGive a code review and provide details on what needs to be changed. Please check the ifcopenshell docs and provide a solution to the error. DO NOT make up any information that is not in the docs. DO NOT rewrite the code, just say what needs to be changed and provide information you found from the documentation or web search.",
                    }
                ], temperature=0, stream=True)
                print("Online LLM response:\n")
                content = ""
                for chunk in response:
                    print(chunk['choices'][0]['delta']['content'] or "", flush=True, end="")
                    content += chunk['choices'][0]['delta']['content'] or ""

                # Send the review back to the engineer
                messages.append(
                    {
                        "role": "user",
                        "content": f"<CodeTracebackErrors>{result['traceback']}</CodeTracebackErrors>\n\n<CodeReview>{content}</CodeReview>\n\nMake the necessary changes to the code so that it runs properly.",
                    }
                )
                continue  # Skip the user input prompt and go back to resolve the error

        # Take in user input in case there is some issues found
        user_input = input("Enter your response: ")

        if user_input == "exit":
            break

        messages.append({"role": "user", "content": user_input})


if __name__ == "__main__":
    main()
