grammar Bim

// Entry point: hierarchical syntax with libraries and projects
entry Model:
    (libraries+=Library | projects+=Project)*;

// ============================================================================
// LIBRARY & TYPE SYSTEM
// ============================================================================

Library:
    'library' name=STRING '{'
        (families+=Family | types+=Type | materials+=Material)*
    '}';

Family:
    'family' name=ID '{'
        parameters+=FamilyParameter*
    '}';

FamilyParameter:
    'parameter' name=ParameterName ':' paramType=ParameterType ('=' defaultValue=Expression)?;

ParameterType returns string:
    'Length' | 'Area' | 'Number' | 'Boolean' | 'String';

// Types extend families. Use ':' for type inheritance (type-from-type)
// Example: type SingleDoor extends Door { }
// Example: type FireDoor : SingleDoor { }  (inherits from SingleDoor type)
Type:
    'type' name=ID (('extends' base=[Family:ID]) | (':' baseType=[Type:ID]))? '{'
        overrides+=ParameterOverride*
        (materialAssignment=TypeMaterialAssignment)?
    '}';

ParameterOverride:
    name=ParameterName '=' value=Expression;

// Material assignment on types: material: MaterialName
TypeMaterialAssignment:
    'material' ':' materialRef=[Material:ID];

// Allow keywords to be used as parameter names
ParameterName returns string:
    ID | 'width' | 'height' | 'area' | 'length' | 'offset' | 'wall' | 'position' | 'elevation' | 'floor' | 'swing' | 'connects' | 'aspect' | 'color' | 'transparency' | 'material';

// ============================================================================
// MATERIALS
// ============================================================================

// Material definition with color and optional properties
// Example: material Wood { color: rgb(0.6, 0.4, 0.2) }
Material:
    'material' name=ID '{'
        properties+=MaterialProperty*
    '}';

MaterialProperty:
    MaterialColorProperty | MaterialTransparencyProperty;

// Color using rgb() or hex
// rgb(0.6, 0.4, 0.2) - values 0-1
// #8B4513 - hex color
MaterialColorProperty:
    'color' ':' (
        {infer RgbColor} 'rgb' '(' red=NUMBER ',' green=NUMBER ',' blue=NUMBER ')' |
        {infer HexColor} value=HEX_COLOR |
        {infer NamedColor} name=ColorName
    );

// Transparency: 0 = opaque, 1 = fully transparent
MaterialTransparencyProperty:
    'transparency' ':' value=NUMBER;

// Common color names for convenience
ColorName returns string:
    'white' | 'black' | 'red' | 'green' | 'blue' | 'grey' | 'gray' |
    'brown' | 'wood' | 'steel' | 'glass' | 'oak' | 'walnut' | 'mahogany' |
    'silver' | 'gold' | 'bronze' | 'copper';

// ============================================================================
// EXPRESSIONS (Arithmetic + Literals)
// ============================================================================

Expression:
    AdditiveExpression;

AdditiveExpression infers Expression:
    MultiplicativeExpression ({infer BinaryExpression.left=current} op=('+' | '-') right=MultiplicativeExpression)*;

MultiplicativeExpression infers Expression:
    PrimaryExpression ({infer BinaryExpression.left=current} op=('*' | '/') right=PrimaryExpression)*;

PrimaryExpression infers Expression:
    '(' Expression ')' |
    {infer MeasurementLiteral} value=NUMBER unit=LengthUnit |
    {infer NumberLiteral} value=NUMBER |
    {infer BooleanLiteral} value=BooleanValue |
    {infer StringLiteral} value=STRING |
    {infer ParameterRef} ref=[FamilyParameter:ParameterName];

BooleanValue returns string:
    'true' | 'false';

// ============================================================================
// PROJECT HIERARCHY
// ============================================================================

Project:
    'project' name=STRING '{'
        sites+=Site*
    '}';

Site:
    'site' name=STRING '{'
        buildings+=Building*
    '}';

Building:
    'building' name=STRING '{'
        levels+=Level*
    '}';

Level:
    'level' name=STRING '{'
        properties+=LevelProperty*
        spaces+=Space*
    '}';

LevelProperty:
    ElevationProperty | HeightProperty | SlabThicknessProperty | CeilingThicknessProperty;

Space:
    'space' name=STRING '{'
        properties+=SpaceProperty*
        elements+=SpaceElement*
    '}';

SpaceProperty:
    AreaProperty | WidthProperty | LengthProperty | PositionProperty | AspectProperty;

SpaceElement:
    SpaceDoor;

// Door can have optional type reference, and optional body with overrides
// Supports: door "D1": TypeName { ... } OR door "D1" { ... } (inline)
SpaceDoor:
    'door' name=STRING (':' typeRef=TypeReference)? ('{'
        overrides+=SpaceDoorOverride*
    '}')?;

SpaceDoorOverride:
    DoorWidthProperty | DoorHeightProperty | DoorWallProperty | DoorOffsetProperty |
    DoorSwingProperty | DoorConnectsProperty | DoorMaterialProperty;

TypeReference:
    typeName=ID;

// ============================================================================
// LEVEL PROPERTY RULES
// ============================================================================

ElevationProperty:
    'elevation' ':' value=Measurement;

HeightProperty:
    'height' ':' value=Measurement;

SlabThicknessProperty:
    'slab_thickness' ':' value=Measurement;

CeilingThicknessProperty:
    'ceiling_thickness' ':' value=Measurement;

// ============================================================================
// SPACE PROPERTY RULES
// ============================================================================

// Grid position [row, col]
PositionProperty:
    'position' ':' '[' row=NUMBER ',' col=NUMBER ']';

AreaProperty:
    'area' ':' value=AreaMeasurement;

WidthProperty:
    'width' ':' value=Measurement;

LengthProperty:
    'length' ':' value=Measurement;

// Aspect ratio for non-square rooms: aspect: 2:1 means width is 2x length
AspectProperty:
    'aspect' ':' widthRatio=NUMBER ':' lengthRatio=NUMBER;

// ============================================================================
// DOOR PROPERTY RULES
// ============================================================================

DoorWidthProperty:
    'width' ':' value=Measurement;

DoorHeightProperty:
    'height' ':' value=Measurement;

DoorWallProperty:
    'wall' ':' direction=WallDirection;

// Enhanced offset: supports multiple formats
// - offset: 0.5 (normalized 0-1)
// - offset: center
// - offset: 2m from west (absolute from anchor)
DoorOffsetProperty:
    'offset' ':' (
        {infer DoorOffsetNormalized} value=NUMBER |
        {infer DoorOffsetCenter} 'center' |
        {infer DoorOffsetAbsolute} distance=Measurement 'from' anchor=OffsetAnchor
    );

OffsetAnchor returns string:
    'left' | 'right' | 'start' | 'end' | 'north' | 'south' | 'east' | 'west';

// Door swing direction: swing: in | out | in-left | in-right | out-left | out-right
DoorSwingProperty:
    'swing' ':' direction=SwingDirection;

SwingDirection returns string:
    'in' | 'out' | 'in-left' | 'in-right' | 'out-left' | 'out-right' | 'double';

// Interior door connection: connects: "RoomName"
DoorConnectsProperty:
    'connects' ':' targetSpace=STRING;

// Material override on individual doors: material: MaterialName
DoorMaterialProperty:
    'material' ':' materialRef=[Material:ID];

WallDirection returns string:
    'north' | 'south' | 'east' | 'west';

// ============================================================================
// MEASUREMENTS
// ============================================================================

Measurement:
    value=NUMBER unit=LengthUnit;

AreaMeasurement:
    value=NUMBER unit=AreaUnit;

LengthUnit returns string:
    'm' | 'cm' | 'mm' | 'ft' | 'in';

AreaUnit returns string:
    'm²' | 'ft²';

// ============================================================================
// TERMINALS
// ============================================================================

terminal ID: /[a-zA-Z_][a-zA-Z0-9_]*/;
terminal STRING: /"[^"]*"/;
terminal NUMBER returns number: /[0-9]+(\.[0-9]+)?/;
terminal HEX_COLOR: /#[0-9A-Fa-f]{6}/;

hidden terminal WS: /\s+/;
hidden terminal ML_COMMENT: /\/\*[\s\S]*?\*\//;
hidden terminal SL_COMMENT: /\/\/[^\n\r]*/ | /#[^\n\r]*/;
