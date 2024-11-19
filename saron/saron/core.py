from litellm import completion
import io
import ifcopenshell
from ifcopenshell import guid 
import math
import numpy as np

# Inital IFC Model
model = """import ifcopenshell
from ifcopenshell import guid

# Setup project
model = ifcopenshell.file()
project = model.create_entity("IfcProject", Name="My Project")
site = model.create_entity("IfcSite", Name="Site")
building = model.create_entity("IfcBuilding", Name="Building")
"""

system_message = """You are an expert design engineer specializing in Building Information Modeling (BIM) and an advanced user of **IFCOpenShell**, tasked with creating, modifying, and iterating building models.

You are initally provided with a **goal** that you set out to achieve. The goal with be placed with <Goal> tags. You are also provided with the current state of the ifcopenshell python code in the <Code> tags at each step.

Your task is to analyze the code and identify any issues, gaps, or areas for improvement. You ALWAYS provide a structured response using the following components:

<Thinking>
- Describe your analysis of the provided IFCOpenShell code.
- Identify any potential issues, gaps, or areas for improvement.
- Explain how the code could be optimized or enhanced for better performance or functionality.
</Thinking>

<Plan>
- Propose a plan to optimize or enhance the provided code.
- Outline the steps you would take to implement the proposed changes.
- Justify each step and explain how it contributes to the code's improvement.
</Plan>

<Code>
- Provide the revised or optimized Python code using IFCOpenShell.
- Ensure the code is correct, standard-compliant, and ready
- ALWAYS rewrite the entire code, NEVER say ... previous code here or anything like that. (This is very important because the code provided in this section will be executed)
</Code>

---

#### Example Output

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


import sys
import traceback


def execute_python_code(code, globals_dict=None, locals_dict=None):
    """
    Execute Python code and capture stdout, stderr, and any exceptions.

    Args:
        code (str): Python code to execute
        globals_dict (dict, optional): Global namespace dictionary
        locals_dict (dict, optional): Local namespace dictionary

    Returns:
        dict: A dictionary containing execution results
    """
    # Prepare dictionaries for namespaces if not provided
    if globals_dict is None:
        globals_dict = {}
    if locals_dict is None:
        locals_dict = {}

    # Redirect stdout and stderr
    stdout_capture = io.StringIO()
    stderr_capture = io.StringIO()

    # Store original stream references
    original_stdout = sys.stdout
    original_stderr = sys.stderr

    try:
        # Redirect stdout and stderr to StringIO objects
        sys.stdout = stdout_capture
        sys.stderr = stderr_capture

        # Execute the code
        exec(code, globals_dict, locals_dict)

        # Compilation and execution successful
        return {"success": True, "stdout": stdout_capture.getvalue(), "stderr": stderr_capture.getvalue(), "result": None}

    except Exception as e:
        # Capture exception details
        return {
            "success": False,
            "type": type(e).__name__,
            "message": str(e),
            "traceback": traceback.format_exc(),
            "stdout": stdout_capture.getvalue(),
            "stderr": stderr_capture.getvalue(),
        }

    finally:
        # Restore original stdout and stderr
        sys.stdout = original_stdout
        sys.stderr = original_stderr

        # Close StringIO objects
        stdout_capture.close()
        stderr_capture.close()


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


goal = """### Specification for Building Information Model (BIM): 1-Story Office Building

#### General Overview
- **Building Type**: 1-story office building  
- **Number of Rooms**: 2  
- **Interconnectivity**: The two rooms are connected by a single interior door.

---

#### Building Dimensions
- **Total Floor Area**: 1,000 sq. ft. (adjustable as needed)
- **Building Height**: 12 ft. (floor-to-ceiling height)
- **Exterior Dimensions**: Rectangular footprint, e.g., 50 ft. x 20 ft.

---

#### Room Details

1. **Room 1 (Office Room A)**  
   - **Function**: General office use  
   - **Dimensions**: 20 ft. x 20 ft.  
   - **Features**:  
     - One exterior-facing window (4 ft. x 6 ft.)  
     - One exterior-facing door (main entrance, 3 ft. x 7 ft.)  

2. **Room 2 (Office Room B)**  
   - **Function**: General office use  
   - **Dimensions**: 20 ft. x 20 ft.  
   - **Features**:  
     - One exterior-facing window (4 ft. x 6 ft.)  

---

#### Connectivity
- **Interior Door**:  
  - Placement: On the shared wall between Room 1 and Room 2  
  - Dimensions: 3 ft. x 7 ft.  
  - Swing Direction: Hinged to swing into Room 2  

---

#### Materials and Finishes
- **Walls**:  
  - Interior: Drywall with a smooth white paint finish  
  - Exterior: Brick veneer  
- **Flooring**: Vinyl tile throughout  
- **Ceiling**: Drop ceiling with acoustic panels  

---

#### Electrical and Lighting
- **Lighting**:  
  - Ceiling-mounted LED panels in both rooms  
- **Power Outlets**:  
  - Room 1: Four duplex outlets  
  - Room 2: Four duplex outlets  

---

#### HVAC
- **Heating and Cooling**: Centralized HVAC system with vents in both rooms  

---

#### Additional Features
- **Fire Safety**:  
  - Smoke detectors in each room  
  - Fire extinguisher in Room 1 near the main entrance  

---

### BIM File Structure and Metadata
- **IFC Schema**: IFC4  
- **Entities**:  
  - `IfcBuilding`  
  - `IfcBuildingStorey`  
  - `IfcSpace` (Room 1 and Room 2)  
  - `IfcWallStandardCase` (for interior and exterior walls)  
  - `IfcDoor` (interior connecting door)  
  - `IfcWindow` (exterior-facing windows)"""

messages = [
    {"role": "system", "content": system_message},
    {"role": "user", "content": f"<Goal>{goal}</Goal>\n\n<Code>{model}</Code>"},
]

claude_sonnet = "claude-3-5-haiku-20241022"
claude_sonnet = "claude-3-5-sonnet-20241022"
o1_preview = "o1-preview"
gpt_4o = "gpt-4o"

def main():
    while True:
        response = completion(model=claude_sonnet, messages=messages, temperature=0)
        content = response.choices[0].message.content
        messages.append({"role": "assistant", "content": content})

        print(content)
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

                # Send the review back to the engineer
                messages.append(
                    {
                        "role": "user",
                        "content": f"<CodeTracebackErrors>{result['traceback']}</CodeTracebackErrors>\n\nMake the required changes so that the code runs without errors and produces the excpected output."
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
