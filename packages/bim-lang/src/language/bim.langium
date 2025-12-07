grammar Bim

// Flat structure: floors, rooms, and doors are top-level entities
entry Model:
    (floors+=Floor | rooms+=Room | doors+=Door)*;

// ============================================================================
// FLOOR
// ============================================================================

Floor:
    'floor' name=ID '{'
        properties+=FloorProperty*
    '}';

FloorProperty:
    ElevationProperty | HeightProperty;

ElevationProperty:
    'elevation' ':' value=Measurement;

HeightProperty:
    'height' ':' value=Measurement;

// ============================================================================
// ROOM
// ============================================================================

Room:
    'room' name=(ID | STRING) '{'
        properties+=RoomProperty*
    '}';

RoomProperty:
    FloorRefProperty | PositionProperty | AreaProperty | WidthProperty | LengthProperty;

// Reference to which floor this room is on
FloorRefProperty:
    'floor' ':' floor=[Floor:ID];

// Grid position [row, col]
PositionProperty:
    'position' ':' '[' row=NUMBER ',' col=NUMBER ']';

AreaProperty:
    'area' ':' value=AreaMeasurement;

WidthProperty:
    'width' ':' value=Measurement;

LengthProperty:
    'length' ':' value=Measurement;

// ============================================================================
// DOOR
// ============================================================================

Door:
    'door' '{'
        properties+=DoorProperty*
    '}';

DoorProperty:
    DoorFromProperty | DoorToProperty | DoorWidthProperty | DoorHeightProperty | DoorWallProperty | DoorOffsetProperty;

// Source room (reference by name)
DoorFromProperty:
    'from' ':' from=[Room:RoomRef];

// Target: either a room reference or 'exterior' keyword
DoorToProperty:
    'to' ':' (to=[Room:RoomRef] | exterior?='exterior');

// Room reference can be ID or STRING
RoomRef returns string:
    ID | STRING;

DoorWidthProperty:
    'width' ':' value=Measurement;

DoorHeightProperty:
    'height' ':' value=Measurement;

// Which wall (required for exterior doors, optional for room-to-room)
DoorWallProperty:
    'wall' ':' direction=WallDirection;

// Position along wall (0.0 = start, 0.5 = center, 1.0 = end)
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
