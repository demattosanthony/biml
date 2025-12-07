import type {
  Model,
  Project,
  Floor,
  Room,
  Door,
  Measurement,
  AreaMeasurement,
} from "./generated/ast.js";

// IR Types
export interface JsonIR {
  version: string;
  projects: ProjectIR[];
}

export interface ProjectIR {
  name: string;
  floors: FloorIR[];
}

export interface FloorIR {
  name: string;
  elevation?: MeasurementIR;
  height?: MeasurementIR;
  rooms: RoomIR[];
}

export interface RoomIR {
  name: string;
  area?: MeasurementIR;
  width?: MeasurementIR;
  length?: MeasurementIR;
  doors: DoorIR[];
}

export interface DoorIR {
  target: string;
  width?: MeasurementIR;
}

export interface MeasurementIR {
  value: number;
  unit: string;
}

// Helpers
const measurement = (m: Measurement | AreaMeasurement): MeasurementIR => ({
  value: m.value,
  unit: m.unit,
});

// Generators
function generateDoor(door: Door): DoorIR {
  const ir: DoorIR = { target: door.target };
  for (const p of door.properties) {
    if (p.$type === "DoorWidthProperty") ir.width = measurement(p.value);
  }
  return ir;
}

function generateRoom(room: Room): RoomIR {
  const ir: RoomIR = { name: room.name, doors: [] };

  for (const p of room.properties) {
    if (p.$type === "AreaProperty") ir.area = measurement(p.value);
    if (p.$type === "WidthProperty") ir.width = measurement(p.value);
    if (p.$type === "LengthProperty") ir.length = measurement(p.value);
  }

  ir.doors = room.doors.flatMap((d) => d.doors.map(generateDoor));
  return ir;
}

function generateFloor(floor: Floor): FloorIR {
  const ir: FloorIR = { name: floor.name, rooms: [] };

  for (const p of floor.properties) {
    if (p.$type === "ElevationProperty") ir.elevation = measurement(p.value);
    if (p.$type === "HeightProperty") ir.height = measurement(p.value);
  }

  ir.rooms = floor.rooms.map(generateRoom);
  return ir;
}

export function generateJsonIR(model: Model): JsonIR {
  return {
    version: "0.1.0",
    projects: model.projects.map((p) => ({
      name: p.name,
      floors: p.floors.map(generateFloor),
    })),
  };
}
