import ifcopenshell
import ifcopenshell.guid
import math

# Setup project
model = ifcopenshell.file()

# Create contexts with explicit coordinate system
model_context = model.createIfcGeometricRepresentationContext(
    ContextIdentifier="Model",
    ContextType="Model",
    CoordinateSpaceDimension=3,
    Precision=1e-5,
    WorldCoordinateSystem=model.createIfcAxis2Placement3D(
        Location=model.createIfcCartesianPoint((0.0, 0.0, 0.0)),
        Axis=model.createIfcDirection((0.0, 0.0, 1.0)),
        RefDirection=model.createIfcDirection((1.0, 0.0, 0.0)),
    ),
)

# Create project
project = model.createIfcProject(GlobalId=ifcopenshell.guid.new(), Name="Door Model Project", RepresentationContexts=[model_context])

# Create site
site = model.createIfcSite(
    GlobalId=ifcopenshell.guid.new(),
    Name="Main Site",
    CompositionType="ELEMENT",
    RefElevation=0.0,
    ObjectPlacement=model.createIfcLocalPlacement(
        RelativePlacement=model.createIfcAxis2Placement3D(
            Location=model.createIfcCartesianPoint((0.0, 0.0, 0.0)),
            Axis=model.createIfcDirection((0.0, 0.0, 1.0)),
            RefDirection=model.createIfcDirection((1.0, 0.0, 0.0)),
        )
    ),
)

# Create building
building = model.createIfcBuilding(
    GlobalId=ifcopenshell.guid.new(),
    Name="Sample Building",
    CompositionType="ELEMENT",
    ObjectPlacement=model.createIfcLocalPlacement(
        PlacementRelTo=site.ObjectPlacement,
        RelativePlacement=model.createIfcAxis2Placement3D(
            Location=model.createIfcCartesianPoint((0.0, 0.0, 0.0)),
            Axis=model.createIfcDirection((0.0, 0.0, 1.0)),
            RefDirection=model.createIfcDirection((1.0, 0.0, 0.0)),
        ),
    ),
)

# Create storey
storey = model.createIfcBuildingStorey(
    GlobalId=ifcopenshell.guid.new(),
    Name="Ground Floor",
    CompositionType="ELEMENT",
    ObjectPlacement=model.createIfcLocalPlacement(
        PlacementRelTo=building.ObjectPlacement,
        RelativePlacement=model.createIfcAxis2Placement3D(
            Location=model.createIfcCartesianPoint((0.0, 0.0, 0.0)),
            Axis=model.createIfcDirection((0.0, 0.0, 1.0)),
            RefDirection=model.createIfcDirection((1.0, 0.0, 0.0)),
        ),
    ),
)

# Spatial hierarchy
model.createIfcRelAggregates(GlobalId=ifcopenshell.guid.new(), RelatingObject=project, RelatedObjects=[site])
model.createIfcRelAggregates(GlobalId=ifcopenshell.guid.new(), RelatingObject=site, RelatedObjects=[building])
model.createIfcRelAggregates(GlobalId=ifcopenshell.guid.new(), RelatingObject=building, RelatedObjects=[storey])

# Wall geometry with precise positioning
wall_placement = model.createIfcLocalPlacement(
    PlacementRelTo=storey.ObjectPlacement,
    RelativePlacement=model.createIfcAxis2Placement3D(
        Location=model.createIfcCartesianPoint((0.0, 0.0, 0.0)),
        Axis=model.createIfcDirection((0.0, 0.0, 1.0)),
        RefDirection=model.createIfcDirection((1.0, 0.0, 0.0)),
    ),
)

# Wall profile (rectangular)
wall_profile = model.createIfcRectangleProfileDef(
    ProfileType="AREA",
    ProfileName="Wall Profile",
    Position=model.createIfcCartesianPoint((0.0, 0.0)),
    XDim=0.2,  # Wall thickness
    YDim=5.0,  # Wall length
)

# Wall extrusion
wall_extrusion = model.createIfcExtrudedAreaSolid(
    SweptArea=wall_profile,
    Position=model.createIfcAxis2Placement3D(
        Location=model.createIfcCartesianPoint((0.0, 0.0, 0.0)),
        Axis=model.createIfcDirection((0.0, 0.0, 1.0)),
        RefDirection=model.createIfcDirection((1.0, 0.0, 0.0)),
    ),
    ExtrudedDirection=model.createIfcDirection((0.0, 0.0, 1.0)),
    Depth=3.0,  # Wall height
)

# Wall shape representation
wall_shape_rep = model.createIfcShapeRepresentation(
    ContextOfItems=model_context, RepresentationType="SweptSolid", RepresentationIdentifier="Body", Items=[wall_extrusion]
)

# Wall product definition shape
wall_prod_def_shape = model.createIfcProductDefinitionShape(Representations=[wall_shape_rep])

# Create wall
wall = model.createIfcWall(GlobalId=ifcopenshell.guid.new(), Name="Exterior Wall", ObjectPlacement=wall_placement, Representation=wall_prod_def_shape)

# Relate wall to storey
model.createIfcRelContainedInSpatialStructure(GlobalId=ifcopenshell.guid.new(), RelatingStructure=storey, RelatedElements=[wall])

# Door geometry with precise positioning
door_placement = model.createIfcLocalPlacement(
    PlacementRelTo=wall_placement,
    RelativePlacement=model.createIfcAxis2Placement3D(
        Location=model.createIfcCartesianPoint((2.0, 0.0, 1.0)),
        Axis=model.createIfcDirection((0.0, 0.0, 1.0)),
        RefDirection=model.createIfcDirection((1.0, 0.0, 0.0)),
    ),
)

# Door profile (rectangular)
door_profile = model.createIfcRectangleProfileDef(
    ProfileType="AREA",
    ProfileName="Door Profile",
    Position=model.createIfcCartesianPoint((0.0, 0.0)),
    XDim=1.0,  # Door width
    YDim=2.1,  # Door height
)

# Door extrusion
door_extrusion = model.createIfcExtrudedAreaSolid(
    SweptArea=door_profile,
    Position=model.createIfcAxis2Placement3D(
        Location=model.createIfcCartesianPoint((0.0, 0.0, 0.0)),
        Axis=model.createIfcDirection((0.0, 0.0, 1.0)),
        RefDirection=model.createIfcDirection((1.0, 0.0, 0.0)),
    ),
    ExtrudedDirection=model.createIfcDirection((1.0, 0.0, 0.0)),
    Depth=0.1,  # Door thickness
)

# Door shape representation
door_shape_rep = model.createIfcShapeRepresentation(
    ContextOfItems=model_context, RepresentationType="SweptSolid", RepresentationIdentifier="Body", Items=[door_extrusion]
)

# Door product definition shape
door_prod_def_shape = model.createIfcProductDefinitionShape(Representations=[door_shape_rep])

# Create door
door = model.createIfcDoor(
    GlobalId=ifcopenshell.guid.new(), Name="Main Entrance Door", ObjectPlacement=door_placement, Representation=door_prod_def_shape
)

# Relate door to storey
model.createIfcRelContainedInSpatialStructure(GlobalId=ifcopenshell.guid.new(), RelatingStructure=storey, RelatedElements=[door])

# Create opening for the door in the wall
opening = model.createIfcOpeningElement(
    GlobalId=ifcopenshell.guid.new(), Name="Door Opening", ObjectPlacement=door_placement, Representation=door_prod_def_shape
)

# Relate opening to wall
model.createIfcRelVoidsElement(GlobalId=ifcopenshell.guid.new(), RelatingBuildingElement=wall, RelatedOpeningElement=opening)

# Relate door to opening
model.createIfcRelFillsElement(GlobalId=ifcopenshell.guid.new(), RelatingOpeningElement=opening, RelatedBuildingElement=door)

# Save the model
model.write("/Users/anthonydemattos/auto-bim/saron/output.ifc")
print("IFC model with door created successfully!")
