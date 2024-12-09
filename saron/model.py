import ifcopenshell
from ifcopenshell import guid

# Setup project
model = ifcopenshell.file(schema="IFC4")
project = model.create_entity("IfcProject", Name="My Project")
site = model.create_entity("IfcSite", Name="Site")
building = model.create_entity("IfcBuilding", Name="Building")
