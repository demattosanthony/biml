import type {
  Model,
  Floor,
  Room,
  Door,
  Measurement,
  AreaMeasurement,
} from "./generated/ast.js";

// ============================================================================
// IR Types (flat structure)
// ============================================================================

export interface JsonIR {
  version: string;
  floors: FloorIR[];
  rooms: RoomIR[];
  doors: DoorIR[];
}

export interface FloorIR {
  name: string;
  elevation?: MeasurementIR;
  height?: MeasurementIR;
}

export interface RoomIR {
  name: string;
  floor: string;
  position: { row: number; col: number };
  area?: MeasurementIR;
  width?: MeasurementIR;
  length?: MeasurementIR;
}

export interface DoorIR {
  from: string;
  to: string;  // Room name or "exterior"
  width?: MeasurementIR;
  height?: MeasurementIR;
  wall?: "north" | "south" | "east" | "west";
  offset?: number;
}

export interface MeasurementIR {
  value: number;
  unit: string;
}

// ============================================================================
// Helpers
// ============================================================================

function measurement(m: Measurement | AreaMeasurement): MeasurementIR {
  return { value: m.value, unit: m.unit };
}

function cleanName(name: string): string {
  // Remove quotes from STRING tokens if present
  if (name.startsWith('"') && name.endsWith('"')) {
    return name.slice(1, -1);
  }
  return name;
}

// ============================================================================
// Generators
// ============================================================================

function generateFloor(floor: Floor): FloorIR {
  const ir: FloorIR = { name: floor.name };

  for (const p of floor.properties) {
    if (p.$type === "ElevationProperty") {
      ir.elevation = measurement(p.value);
    } else if (p.$type === "HeightProperty") {
      ir.height = measurement(p.value);
    }
  }

  return ir;
}

function generateRoom(room: Room): RoomIR {
  const name = cleanName(room.name);

  // Default position if not specified
  let floorRef = "";
  let position = { row: 0, col: 0 };

  const ir: RoomIR = { name, floor: floorRef, position };

  for (const p of room.properties) {
    switch (p.$type) {
      case "FloorRefProperty":
        // Reference to floor - get the name from the referenced floor
        ir.floor = p.floor.ref?.name ?? p.floor.$refText;
        break;
      case "PositionProperty":
        ir.position = { row: Math.floor(p.row), col: Math.floor(p.col) };
        break;
      case "AreaProperty":
        ir.area = measurement(p.value);
        break;
      case "WidthProperty":
        ir.width = measurement(p.value);
        break;
      case "LengthProperty":
        ir.length = measurement(p.value);
        break;
    }
  }

  return ir;
}

function generateDoor(door: Door): DoorIR {
  let from = "";
  let to: string = "";
  const ir: DoorIR = { from, to };

  for (const p of door.properties) {
    switch (p.$type) {
      case "DoorFromProperty":
        // Reference to room
        ir.from = cleanName(p.from.ref?.name ?? p.from.$refText);
        break;
      case "DoorToProperty":
        if (p.exterior) {
          ir.to = "exterior";
        } else if (p.to) {
          ir.to = cleanName(p.to.ref?.name ?? p.to.$refText);
        }
        break;
      case "DoorWidthProperty":
        ir.width = measurement(p.value);
        break;
      case "DoorHeightProperty":
        ir.height = measurement(p.value);
        break;
      case "DoorWallProperty":
        ir.wall = p.direction as "north" | "south" | "east" | "west";
        break;
      case "DoorOffsetProperty":
        ir.offset = p.value;
        break;
    }
  }

  return ir;
}

// ============================================================================
// Main Generator
// ============================================================================

export function generateJsonIR(model: Model): JsonIR {
  return {
    version: "0.2.0",
    floors: model.floors.map(generateFloor),
    rooms: model.rooms.map(generateRoom),
    doors: model.doors.map(generateDoor),
  };
}
