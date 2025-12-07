grammar Bim

entry Model:
    projects+=Project*;

Project:
    'project' name=STRING '{'
        floors+=Floor*
    '}';

Floor:
    'floor' name=STRING '{'
        properties+=FloorProperty*
        rooms+=Room*
    '}';

FloorProperty:
    ElevationProperty | HeightProperty;

ElevationProperty:
    'elevation' ':' value=Measurement;

HeightProperty:
    'height' ':' value=Measurement;

Room:
    'room' name=STRING '{'
        properties+=RoomProperty*
        doors+=DoorDeclaration*
    '}';

RoomProperty:
    AreaProperty | WidthProperty | LengthProperty;

AreaProperty:
    'area' ':' value=AreaMeasurement;

WidthProperty:
    'width' ':' value=Measurement;

LengthProperty:
    'length' ':' value=Measurement;

DoorDeclaration:
    'doors' ':' '[' doors+=Door (',' doors+=Door)* ']';

Door:
    'door' 'to' target=STRING ('{'
        properties+=DoorProperty*
    '}')?;

DoorProperty:
    DoorWidthProperty;

DoorWidthProperty:
    'width' ':' value=Measurement;

Measurement:
    value=NUMBER unit=LengthUnit;

AreaMeasurement:
    value=NUMBER unit=AreaUnit;

LengthUnit returns string:
    'm' | 'cm' | 'mm' | 'ft' | 'in';

AreaUnit returns string:
    'm²' | 'ft²';

hidden terminal WS: /\s+/;
terminal STRING: /"[^"]*"/;
terminal NUMBER returns number: /[0-9]+(\.[0-9]+)?/;
hidden terminal ML_COMMENT: /\/\*[\s\S]*?\*\//;
hidden terminal SL_COMMENT: /\/\/[^\n\r]*/;
