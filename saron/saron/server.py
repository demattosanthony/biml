from fastapi import FastAPI, Body
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
import uvicorn
import json
from typing import Generator

from saron.agent import Agent
from saron.tools import tool
from saron.ifc_session import IfcSession

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

session = IfcSession(ifc_file_path="/Users/anthonydemattos/auto-bim/next-app/public/sample.ifc")

@tool 
def list_children(guid: str, ifc_type: str | None = None):
    """This tool acts as model browser for the ifc model. You can use it to navigate the element tree of the ifc model. Provide a guid of an element to list its children.
    
Most elemenet trees beging with the project then a site, then a building, then floors, then spaces, then elements. You can use this tool to navigate the tree and explore the model.

Provide a ifc_type to filter the children by type. For example, ifc_type=IfcWall will only return children that are walls. Only do this if you know the ifc type of the children you are looking for."""
    return json.dumps(session.list_children(guid, ifc_type=ifc_type), indent=2)

@tool
def get_node_info(guid: str):
    """Returns detailed info about a node (element)."""
    return json.dumps(session.get_node_info(guid), indent=2)

@tool 
def get_all_ifc_categories():
    """Returns a list of all the unqiue ifc categories in the model."""
    return json.dumps(session.list_categories(), indent=2)

@tool
def get_elements_of_category(ifc_category: str):
    """Returns a list of all the elements of a given ifc category."""
    return json.dumps(session.get_elements_of_category(ifc_category), indent=2)

@tool 
def execute_python_code_against_model(code: str):
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

```
import ifcopenshell.util.classification

wall = model.by_type("IfcWall")[0]
# Elements may have multiple classification references assigned
references = ifcopenshell.util.classification.get_references(wall)
for reference in references:
    # A reference code might be Pr_30_59_99_02
    print("The wall has a classification reference of", reference[1])
    # A system might be Uniclass 2015
    system = ifcopenshell.util.classification.get_classification(reference)
    print("This reference is part of the system", system.Name)
```

The output of the code will be returned as a string. Output is captured from stdout and stderr. This means you need to use the print function to output anything."""
    try:
        output = session.execute_code(code)
        return output
    except Exception as e:
        return f"An error occurred: {str(e)}"
    
@tool 
def save_model():
    """Save the current state of the model."""
    session.save()
    return "Model saved successfully."

tools = {
    "list_children": list_children,
    "get_node_info": get_node_info,
    "get_all_ifc_categories": get_all_ifc_categories,
    "get_elements_of_category": get_elements_of_category,
    "execute_python_code_against_model": execute_python_code_against_model,
    "save_model": save_model,
}

claude_haiku = "claude-3-5-haiku-20241022"
claude_sonnet = "claude-3-5-sonnet-20241022"
o1 = "o1"
o1_mini = "o1-mini"
gpt_4o = "gpt-4o"
gemini = "gemini/gemini-exp-1206"
gemini_flash = "gemini/gemini-2.0-flash-exp"

agent = Agent(tools=tools, ifc_session=session, model_name=claude_sonnet)

@app.post("/chat")
async def chat_endpoint(
    message: str = Body(...),
) -> StreamingResponse:
    print(f"User: {message}")   
    def event_stream() -> Generator[str, None, None]:
        for chunk in agent.send_message(
            message=message
        ):
            yield f"event: message\ndata: {chunk}\n\n"

        yield "event: DONE\ndata: {}\n\n"

    return StreamingResponse(event_stream(), media_type="text/event-stream")

@app.get("/")
async def root():
    return {"message": "Welcome to AI Chat API"}

if __name__ == "__main__":
    uvicorn.run(host="0.0.0.0", port=8000, reload=True, app="saron.server:app")