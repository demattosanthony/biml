grammar Bim

// ============================================================================
// ENTRY POINT
// ============================================================================
// A model consists of imports, type definitions (libraries), and buildings

entry Model:
    imports+=Import*
    (libraries+=Library | buildings+=Building)*;

// ============================================================================
// MODULE SYSTEM
// ============================================================================

Import:
    'import' (
        '{' members+=ID (',' members+=ID)* '}' 'from' |
        '*' 'as' alias=ID 'from' |
        defaultMember=ID 'from'
    ) path=STRING;

// ============================================================================
// TYPE LIBRARY
// ============================================================================
// Libraries contain materials and types (no families - types handle everything)

Library:
    'library' name=STRING '{'
        (materials+=Material | types+=Type)*
    '}';

// ----------------------------------------------------------------------------
// Materials
// ----------------------------------------------------------------------------

Material:
    'material' name=ID '{'
        properties+=MaterialProperty*
    '}';

MaterialProperty:
    MaterialColorProperty | MaterialTransparencyProperty | MaterialTextureProperty;

MaterialColorProperty:
    'color' ':' (
        {infer RgbColor} 'rgb' '(' red=NUMBER ',' green=NUMBER ',' blue=NUMBER ')' |
        {infer HexColor} value=HEX_COLOR |
        {infer NamedColor} name=ColorName
    );

MaterialTransparencyProperty:
    'transparency' ':' value=NUMBER;

MaterialTextureProperty:
    'texture' ':' value=STRING;

ColorName returns string:
    'white' | 'black' | 'red' | 'green' | 'blue' | 'grey' | 'gray' |
    'brown' | 'wood' | 'steel' | 'glass' | 'oak' | 'walnut' | 'mahogany' |
    'silver' | 'gold' | 'bronze' | 'copper' | 'concrete' | 'brick';

// ----------------------------------------------------------------------------
// Types (unified: can define parameters AND/OR extend other types)
// ----------------------------------------------------------------------------
// Examples:
//   type Door { param width: Length = 900mm }           - base type with params
//   type SingleDoor : Door { material: Oak }            - extends Door
//   type FireDoor : SingleDoor { width = 1000mm }       - extends SingleDoor

Type:
    'type' name=ID (':' baseType=[Type:ID])? '{'
        members+=TypeMember*
    '}';

TypeMember:
    TypeParameter | TypeParameterOverride | TypeGeometry | TypeOpening | 
    TypeProperty | TypeMaterial | TypeIfcClass;

// Parameter definition (like what family used to have)
TypeParameter:
    'param' name=ParameterName ':' paramType=ParamTypeName ('=' defaultValue=Expression)? constraint=ParameterConstraint?;

// Allow keywords to be used as parameter names
ParameterName returns string:
    ID | 'width' | 'height' | 'depth' | 'thickness' | 'radius' | 'area' | 'length' |
    'sill' | 'offset' | 'position' | 'elevation' | 'floor' | 'ceiling' | 'material' |
    'color' | 'transparency' | 'profile' | 'boundary' | 'type' | 'name' | 'sill_height';

ParamTypeName returns string:
    'Length' | 'Area' | 'Angle' | 'Number' | 'Boolean' | 'String' | 
    'Material' | 'Profile' | 'Geometry' | ID;

ParameterConstraint:
    'in' min=Expression '..' max=Expression;

// Parameter override (setting a value for an inherited parameter)
TypeParameterOverride:
    name=ParameterName '=' value=Expression;

// Geometry definition
TypeGeometry:
    'geometry' ('{' expression=GeometryExpression '}' | ':' expression=GeometryExpression);

// Opening geometry (for doors/windows)
TypeOpening:
    'opening' ('{' expression=GeometryExpression '}' | ':' expression=GeometryExpression);

// Custom property
TypeProperty:
    'property' name=ParameterName ':' value=Expression;

// Material assignment
TypeMaterial:
    'material' ':' materialRef=[Material:ID];

// IFC class mapping
TypeIfcClass:
    'ifc_class' ':' className=IFC_CLASS;

// ============================================================================
// GEOMETRY EXPRESSIONS
// ============================================================================

GeometryExpression:
    GeometryPrimitive | GeometryBoolean | GeometryReference;

GeometryPrimitive:
    BoxGeometry | CylinderGeometry | ExtrudeGeometry | SweepGeometry;

BoxGeometry:
    'box' '(' 'width' ':' width=Expression ',' 'depth' ':' depth=Expression ',' 'height' ':' height=Expression ')';

CylinderGeometry:
    'cylinder' '(' 'radius' ':' radius=Expression ',' 'height' ':' height=Expression ')';

ExtrudeGeometry:
    'extrude' '(' 'profile' ':' profile=ProfileExpression ',' 'height' ':' height=Expression ')';

SweepGeometry:
    'sweep' '(' 'profile' ':' profile=ProfileExpression ',' 'path' ':' path=PathExpression ')';

GeometryBoolean:
    'union' '(' left=GeometryExpression ',' right=GeometryExpression ')' |
    'subtract' '(' left=GeometryExpression ',' right=GeometryExpression ')' |
    'intersect' '(' left=GeometryExpression ',' right=GeometryExpression ')';

GeometryReference:
    ref=ID ('.geometry')?;

// Profiles for extrusion
ProfileExpression:
    RectangleProfile | CircleProfile | PolygonProfile | LShapeProfile;

RectangleProfile:
    'rectangle' '(' width=Expression ',' depth=Expression ')';

CircleProfile:
    'circle' '(' 'radius' ':' radius=Expression ')';

PolygonProfile:
    'polygon' '(' '[' points+=Point2D (',' points+=Point2D)* ']' ')';

LShapeProfile:
    'l_shape' '(' 'width' ':' width=Expression ',' 'depth' ':' depth=Expression ',' 
                  'flange' ':' flange=Expression ',' 'web' ':' web=Expression ')';

PathExpression:
    LinePath | ArcPath;

LinePath:
    'line' '(' 'from' ':' start=Point3D ',' 'to' ':' end=Point3D ')';

ArcPath:
    'arc' '(' 'radius' ':' radius=Expression ',' 'start' ':' startAngle=Expression ',' 'end' ':' endAngle=Expression ')';

// ============================================================================
// BUILDING DEFINITION
// ============================================================================

Building:
    'building' name=STRING '{'
        (defaults=BuildingDefaults)?
        (site=Site)?
        levels+=Level*
    '}';

BuildingDefaults:
    'defaults' '{'
        properties+=DefaultProperty*
    '}';

DefaultProperty:
    name=DefaultPropertyName ':' value=Expression;

DefaultPropertyName returns string:
    'wall_thickness' | 'floor_thickness' | 'ceiling_height' | 'door_height' | 'window_sill';

Site:
    'site' name=STRING ('at' location=Coordinate)?;

// ============================================================================
// LEVELS
// ============================================================================

Level:
    'level' name=STRING 'at' elevation=LevelElevation (',' 'height' ':' height=Expression)? '{'
        members+=LevelMember*
    '}';

LevelElevation:
    {infer AbsoluteElevation} value=Expression |
    {infer RelativeElevation} ref=[Level:STRING] '.top';

LevelMember:
    Wall | Space | Column | Door | Window | Furniture | Slab | Grid;

// ============================================================================
// WALLS
// ============================================================================

Wall:
    'wall' name=STRING 
    (
        // Option 1: from point to point
        'from' start=Point2D 'to' end=Point2D |
        // Option 2: aligned with another wall
        'aligned_with' alignedWith=[Wall:QualifiedWallRef]
    )
    properties=WallProperties?;

QualifiedWallRef returns string:
    (ID '.')? STRING;

WallProperties:
    (',' | '{') properties+=WallPropertyItem* '}'?;

WallPropertyItem:
    WallThicknessProperty | WallHeightProperty | WallMaterialProperty;

WallThicknessProperty:
    'thickness' ':' value=Expression;

WallHeightProperty:
    'height' ':' value=Expression;

WallMaterialProperty:
    'material' ':' materialRef=[Material:ID];

// ============================================================================
// SPACES
// ============================================================================

Space:
    'space' name=STRING tags=SpaceTags? '{'
        properties+=SpaceProperty*
        elements+=SpaceElement*
    '}';

SpaceTags:
    '[' tags+=SpaceTag (',' tags+=SpaceTag)* ']';

SpaceTag returns string:
    'public' | 'private' | 'circulation' | 'service' | 'technical' |
    'reception' | 'office' | 'meeting' | 'storage' | 'restroom' |
    'kitchen' | 'dining' | 'residential' | 'retail' | 'parking' |
    ID;

SpaceProperty:
    BoundedByProperty | AreaProperty | FloorProperty | CeilingProperty | HeightProperty;

BoundedByProperty:
    'bounded_by' ':' '[' walls+=WallReference (',' walls+=WallReference)* ']';

WallReference:
    wall=[Wall:STRING] segment=WallSegment?;

WallSegment:
    '.part' '(' start=Expression ',' end=Expression ')' |
    '.reversed';

AreaProperty:
    'area' ':' value=Expression;

FloorProperty:
    'floor' ':' material=[Material:ID];

CeilingProperty:
    'ceiling' ':' material=[Material:ID];

HeightProperty:
    'height' ':' value=Expression;

SpaceElement:
    SpaceDoor | SpaceWindow | SpaceFurniture;

// ============================================================================
// DOORS
// ============================================================================

Door:
    'door' name=STRING (':' typeRef=[Type:ID])? 
    'in' wall=[Wall:STRING] 'at' position=DoorPosition
    body=DoorBody?;

SpaceDoor:
    'door' name=STRING (':' typeRef=[Type:ID])? 
    'in' wall=[Wall:STRING] 'at' position=DoorPosition
    body=DoorBody?;

DoorPosition:
    {infer AbsolutePosition} value=Expression |
    {infer CenterPosition} 'center' |
    {infer FromAnchorPosition} value=Expression 'from' anchor=PositionAnchor;

PositionAnchor returns string:
    'start' | 'end' | 'left' | 'right' | 'north' | 'south' | 'east' | 'west';

DoorBody:
    '{'
        properties+=DoorProperty*
    '}';

DoorProperty:
    DoorWidthProperty | DoorHeightProperty | DoorSwingProperty | 
    DoorConnectsProperty | DoorMaterialProperty;

DoorWidthProperty:
    'width' ':' value=Expression;

DoorHeightProperty:
    'height' ':' value=Expression;

DoorSwingProperty:
    'swing' ':' direction=SwingDirection;

SwingDirection returns string:
    'inward' | 'outward' | 'left' | 'right' | 'double' | 'sliding' | 'pivot';

DoorConnectsProperty:
    'connects' ':' from=SpaceReference '<->' to=SpaceReference;

SpaceReference:
    ref=[Space:STRING] | 'this' | 'exterior';

DoorMaterialProperty:
    'material' ':' materialRef=[Material:ID];

// ============================================================================
// WINDOWS
// ============================================================================

Window:
    'window' name=STRING (':' typeRef=[Type:ID])?
    'in' wall=[Wall:STRING] 'at' position=DoorPosition
    body=WindowBody?;

SpaceWindow:
    'window' name=STRING (':' typeRef=[Type:ID])?
    'in' wall=[Wall:STRING] 'at' position=DoorPosition
    body=WindowBody?;

WindowBody:
    '{'
        properties+=WindowProperty*
    '}';

WindowProperty:
    WindowWidthProperty | WindowHeightProperty | WindowSillProperty | WindowMaterialProperty;

WindowWidthProperty:
    'width' ':' value=Expression;

WindowHeightProperty:
    'height' ':' value=Expression;

WindowSillProperty:
    'sill' ':' value=Expression;

WindowMaterialProperty:
    'material' ':' materialRef=[Material:ID];

// ============================================================================
// COLUMNS
// ============================================================================

Column:
    'column' name=STRING (':' typeRef=[Type:ID])?
    'at' position=Point2D
    body=ColumnBody?;

ColumnBody:
    '{'
        properties+=ColumnProperty*
    '}';

ColumnProperty:
    ColumnWidthProperty | ColumnDepthProperty | ColumnHeightProperty | ColumnProfileProperty;

ColumnWidthProperty:
    'width' ':' value=Expression;

ColumnDepthProperty:
    'depth' ':' value=Expression;

ColumnHeightProperty:
    'height' ':' value=Expression;

ColumnProfileProperty:
    'profile' ':' profile=ProfileExpression;

// ============================================================================
// FURNITURE
// ============================================================================

Furniture:
    'place' typeRef=[Type:ID] (name=STRING)? 'at' position=Point2D
    body=FurnitureBody?;

SpaceFurniture:
    'place' typeRef=[Type:ID] (name=STRING)? 'at' position=Point2D
    body=FurnitureBody?;

FurnitureBody:
    ('{' properties+=FurnitureProperty* '}') |
    (',' inlineProps+=FurnitureInlineProperty)+;

FurnitureInlineProperty:
    FurnitureFacingProperty | FurnitureCountProperty | FurnitureSpacingProperty;

FurnitureProperty:
    FurnitureFacingProperty | FurnitureRotationProperty | FurnitureSizeProperty | 
    FurnitureCountProperty | FurnitureSpacingProperty;

FurnitureFacingProperty:
    'facing' direction=FacingDirection;

FacingDirection returns string:
    'north' | 'south' | 'east' | 'west';

FurnitureRotationProperty:
    'rotation' ':' angle=Expression;

FurnitureSizeProperty:
    'size' ':' '(' width=Expression ',' depth=Expression ')';

FurnitureCountProperty:
    'count' ':' count=INT;

FurnitureSpacingProperty:
    'spacing' ':' spacing=Expression;

// ============================================================================
// SLABS
// ============================================================================

Slab:
    'slab' name=STRING '{'
        properties+=SlabProperty*
    '}';

SlabProperty:
    SlabBoundaryProperty | SlabThicknessProperty | SlabMaterialProperty | SlabTypeProperty;

SlabBoundaryProperty:
    'boundary' ':' '[' points+=Point2D (',' points+=Point2D)* ']';

SlabThicknessProperty:
    'thickness' ':' value=Expression;

SlabMaterialProperty:
    'material' ':' materialRef=[Material:ID];

SlabTypeProperty:
    'type' ':' slabType=SlabType;

SlabType returns string:
    'floor' | 'roof' | 'landing';

// ============================================================================
// GRIDS
// ============================================================================

Grid:
    'grid' '{'
        axes+=GridAxis*
    '}';

GridAxis:
    'axis' name=STRING direction=GridDirection 'at' positions+=Expression (',' positions+=Expression)*;

GridDirection returns string:
    'x' | 'y';

// ============================================================================
// EXPRESSIONS
// ============================================================================

Expression:
    ConditionalExpression;

ConditionalExpression infers Expression:
    AdditiveExpression ({infer ConditionalExpression.condition=current} '?' then=Expression ':' else=Expression)?;

AdditiveExpression infers Expression:
    MultiplicativeExpression ({infer BinaryExpression.left=current} op=('+' | '-') right=MultiplicativeExpression)*;

MultiplicativeExpression infers Expression:
    UnaryExpression ({infer BinaryExpression.left=current} op=('*' | '/') right=UnaryExpression)*;

UnaryExpression infers Expression:
    {infer UnaryExpression} op='-' operand=PrimaryExpression |
    PrimaryExpression;

PrimaryExpression infers Expression:
    '(' Expression ')' |
    MeasurementLiteral |
    NumberLiteral |
    BooleanLiteral |
    StringLiteral |
    ParameterReference |
    FunctionCall;

MeasurementLiteral:
    value=NUMBER unit=Unit;

NumberLiteral:
    value=NUMBER;

BooleanLiteral:
    value=BooleanValue;

BooleanValue returns string:
    'true' | 'false';

StringLiteral:
    value=STRING;

ParameterReference:
    ref=QualifiedReference;

QualifiedReference:
    parts+=ID ('.' parts+=ID)*;

FunctionCall:
    name=ID '(' (args+=Expression (',' args+=Expression)*)? ')';

// ============================================================================
// COORDINATES
// ============================================================================

Point2D:
    '(' x=Expression ',' y=Expression ')';

Point3D:
    '(' x=Expression ',' y=Expression ',' z=Expression ')';

Coordinate:
    '(' latitude=NUMBER ',' longitude=NUMBER ')';

// ============================================================================
// UNITS
// ============================================================================

Unit returns string:
    LengthUnit | AreaUnit | AngleUnit;

LengthUnit returns string:
    'm' | 'cm' | 'mm' | 'ft' | 'in';

AreaUnit returns string:
    'm²' | 'ft²' | 'sqm' | 'sqft';

AngleUnit returns string:
    'deg' | 'rad';

// ============================================================================
// TERMINALS
// ============================================================================

// IFC_CLASS must come before ID to match "IfcDoor", "IfcWindow", etc.
terminal IFC_CLASS: /Ifc[A-Z][a-zA-Z]*/;
terminal ID: /[a-zA-Z_][a-zA-Z0-9_]*/;
terminal STRING: /"[^"]*"/;
terminal NUMBER returns number: /-?[0-9]+(\.[0-9]+)?/;
terminal INT returns number: /[0-9]+/;
terminal HEX_COLOR: /#[0-9A-Fa-f]{6}/;

hidden terminal WS: /\s+/;
hidden terminal ML_COMMENT: /\/\*[\s\S]*?\*\//;
hidden terminal SL_COMMENT: /\/\/[^\n\r]*/ | /#[^\n\r]*/;
