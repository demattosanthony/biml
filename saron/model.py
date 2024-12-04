import ifcopenshell
from ifcopenshell import guid
import math

def create_sphere_vertices(radius, segments=32):
    vertices = []
    
    # Add top vertex
    vertices.append([0., 0., radius])
    
    # Add middle vertices
    for i in range(1, segments):
        lat = math.pi * (-0.5 + float(i) / segments)
        for j in range(segments):
            lon = 2 * math.pi * float(j) / segments
            x = float(radius * math.cos(lat) * math.cos(lon))
            y = float(radius * math.cos(lat) * math.sin(lon))
            z = float(radius * math.sin(lat))
            vertices.append([x, y, z])
    
    # Add bottom vertex
    vertices.append([0., 0., -radius])
    
    return vertices

def create_sphere_faces(segments=32):
    faces = []
    
    # Top cap faces
    for i in range(segments):
        next_i = (i + 1) % segments
        faces.append([0, i + 1, next_i + 1])
    
    # Middle faces
    for i in range(1, segments - 1):
        for j in range(segments):
            first = (i - 1) * segments + j + 1
            second = (i - 1) * segments + ((j + 1) % segments) + 1
            third = i * segments + ((j + 1) % segments) + 1
            fourth = i * segments + j + 1
            faces.append([first, second, third, fourth])
    
    # Bottom cap faces
    bottom_vertex_index = (segments - 1) * segments + 1
    for i in range(segments):
        next_i = (i + 1) % segments
        last_row_first = (segments - 2) * segments + i + 1
        last_row_second = (segments - 2) * segments + next_i + 1
        faces.append([last_row_first, last_row_second, bottom_vertex_index])
    
    return faces

# Create a new IFC file
model = ifcopenshell.file(schema="IFC2X3")

# Create project structure
project = model.create_entity("IfcProject", GlobalId=guid.new(), Name="My Project")

# Set up units
length_unit = model.create_entity("IfcSIUnit", UnitType="LENGTHUNIT", Name="METRE")
units = model.create_entity("IfcUnitAssignment", Units=[length_unit])
project.UnitsInContext = units

# Set up geometric context
context = model.create_entity("IfcGeometricRepresentationContext",
    ContextType="Model",
    CoordinateSpaceDimension=3,
    Precision=1.0e-5,
    WorldCoordinateSystem=model.create_entity("IfcAxis2Placement3D", Location=model.create_entity("IfcCartesianPoint", Coordinates=[0., 0., 0.]))
)
project.RepresentationContexts = [context]

# Create site
site = model.create_entity("IfcSite", 
    GlobalId=guid.new(),
    Name="My Site",
    ObjectPlacement=model.create_entity("IfcLocalPlacement", RelativePlacement=model.create_entity(
        "IfcAxis2Placement3D", Location=model.create_entity("IfcCartesianPoint", Coordinates=[0., 0., 0.])))
)

# Create building
building = model.create_entity("IfcBuilding",
    GlobalId=guid.new(),
    Name="My Building",
    ObjectPlacement=model.create_entity("IfcLocalPlacement", 
        PlacementRelTo=site.ObjectPlacement,
        RelativePlacement=model.create_entity(
            "IfcAxis2Placement3D", Location=model.create_entity("IfcCartesianPoint", Coordinates=[0., 0., 0.])))
)

# Create aggregation relationships
model.create_entity("IfcRelAggregates", GlobalId=guid.new(),
    RelatingObject=project, RelatedObjects=[site])
model.create_entity("IfcRelAggregates", GlobalId=guid.new(),
    RelatingObject=site, RelatedObjects=[building])

# Create sphere geometry
radius = 1.0
segments = 32  # Increase this number for a smoother sphere
points = create_sphere_vertices(radius, segments)
faces = create_sphere_faces(segments)

# Create IFC points
ifc_points = [model.create_entity("IfcCartesianPoint", Coordinates=p) for p in points]

# Create faces
ifc_faces = []
for face in faces:
    if len(face) == 3:  # Triangle face
        polyloop = model.create_entity("IfcPolyLoop", Polygon=[ifc_points[i] for i in face])
        face_outer_bound = model.create_entity("IfcFaceOuterBound", Bound=polyloop, Orientation=True)
        face = model.create_entity("IfcFace", Bounds=[face_outer_bound])
        ifc_faces.append(face)
    elif len(face) == 4:  # Quad face
        polyloop = model.create_entity("IfcPolyLoop", Polygon=[ifc_points[i] for i in face])
        face_outer_bound = model.create_entity("IfcFaceOuterBound", Bound=polyloop, Orientation=True)
        face = model.create_entity("IfcFace", Bounds=[face_outer_bound])
        ifc_faces.append(face)

# Create the closed shell and brep
closed_shell = model.create_entity("IfcClosedShell", CfsFaces=ifc_faces)
faceted_brep = model.create_entity("IfcFacetedBrep", Outer=closed_shell)

# Create shape representation
shape_representation = model.create_entity("IfcShapeRepresentation",
    ContextOfItems=context,
    RepresentationIdentifier="Body",
    RepresentationType="Brep",
    Items=[faceted_brep])

# Create product definition shape
product_definition_shape = model.create_entity("IfcProductDefinitionShape",
    Representations=[shape_representation])

# Create building element proxy for the sphere
sphere_element = model.create_entity("IfcBuildingElementProxy",
    GlobalId=guid.new(),
    Name="Sphere",
    ObjectPlacement=model.create_entity("IfcLocalPlacement", 
        PlacementRelTo=building.ObjectPlacement,
        RelativePlacement=model.create_entity(
            "IfcAxis2Placement3D", Location=model.create_entity("IfcCartesianPoint", Coordinates=[0., 0., 0.]))),
    Representation=product_definition_shape)

# Create containment relationship
model.create_entity("IfcRelContainedInSpatialStructure", GlobalId=guid.new(),
    RelatingStructure=building,
    RelatedElements=[sphere_element])

# Save the file
model.write("output.ifc")