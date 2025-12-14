grammar Bim

interface SpaceElement {}
interface SpaceDoor extends SpaceElement {
    name: string
    typeRef?: TypeReference
    overrides: SpaceDoorOverride[]
}
interface SpaceCeiling extends SpaceElement {}

// Entry point: hierarchical syntax with libraries and projects
entry Model:
    (libraries+=Library | projects+=Project)*;

// ============================================================================
// LIBRARY & TYPE SYSTEM
// ============================================================================

Library:
    'library' name=STRING '{'
        (families+=Family | types+=Type)*
    '}';

Family:
    'family' name=ID '{'
        parameters+=FamilyParameter*
    '}';

FamilyParameter:
    'parameter' name=ParameterName ':' paramType=ParameterType ('=' defaultValue=Expression)?;

ParameterType returns string:
    'Length' | 'Area' | 'Number' | 'Boolean' | 'String';

Type:
    'type' name=ID ('extends' base=[Family:ID])? '{'
        overrides+=ParameterOverride*
    '}';

ParameterOverride:
    name=ParameterName '=' value=Expression;

// Allow keywords to be used as parameter names
ParameterName returns string:
    ID | 'width' | 'height' | 'area' | 'length' | 'offset' | 'wall' | 'position' | 'elevation' | 'floor';

// ============================================================================
// EXPRESSIONS (Simple Arithmetic)
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
    {infer ParameterRef} ref=[FamilyParameter:ParameterName];

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
    ElevationProperty | HeightProperty;

Space:
    'space' name=STRING '{'
        properties+=SpaceProperty*
        elements+=SpaceElement*
    '}';

SpaceProperty:
    AreaProperty | WidthProperty | LengthProperty | PositionProperty;

SpaceElement returns SpaceElement:
    SpaceDoor | SpaceCeiling;

SpaceCeiling returns SpaceCeiling:
    {SpaceCeiling} 'ceiling';

SpaceDoor returns SpaceDoor:
    'door' name=STRING (':' typeRef=TypeReference)? ('{'
        overrides+=SpaceDoorOverride*
    '}')?;

SpaceDoorOverride:
    DoorWidthProperty | DoorHeightProperty | DoorWallProperty | DoorOffsetProperty;

TypeReference:
    typeName=ID;

// ============================================================================
// SHARED PROPERTY RULES
// ============================================================================

ElevationProperty:
    'elevation' ':' value=Measurement;

HeightProperty:
    'height' ':' value=Measurement;

// Grid position [row, col]
PositionProperty:
    'position' ':' '[' row=NUMBER ',' col=NUMBER ']';

AreaProperty:
    'area' ':' value=AreaMeasurement;

WidthProperty:
    'width' ':' value=Measurement;

LengthProperty:
    'length' ':' value=Measurement;

DoorWidthProperty:
    'width' ':' value=Measurement;

DoorHeightProperty:
    'height' ':' value=Measurement;

DoorWallProperty:
    'wall' ':' direction=WallDirection;

DoorOffsetProperty:
    'offset' ':' value=NUMBER;

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

hidden terminal WS: /\s+/;
hidden terminal ML_COMMENT: /\/\*[\s\S]*?\*\//;
hidden terminal SL_COMMENT: /\/\/[^\n\r]*/ | /#[^\n\r]*/;
