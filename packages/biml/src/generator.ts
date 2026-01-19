/**
 * BIML Generator
 * Converts the Langium AST to JSON IR for the Python compiler.
 */

import type {
  Model,
  Library,
  Material,
  Type,
  TypeMember,
  Building,
  Level,
  Wall,
  Space,
  Door,
  Window,
  Column,
  Furniture,
  Slab,
  Expression,
  MeasurementLiteral,
  NumberLiteral,
  BooleanLiteral,
  StringLiteral,
  Point2D,
  DoorPosition,
  WallReference,
  MaterialColorProperty,
} from "./generated/ast";

// ============================================================================
// IR Types
// ============================================================================

export interface MeasurementIR {
  value: number;
  unit: string;
}

export interface Point2DIR {
  x: number;
  y: number;
}


export interface ColorIR {
  red: number;
  green: number;
  blue: number;
}

export interface MaterialIR {
  name: string;
  color?: ColorIR;
  transparency?: number;
}

export interface ParameterIR {
  name: string;
  type: string;
  defaultValue?: ExpressionIR;
  min?: ExpressionIR;
  max?: ExpressionIR;
}

// Unified Type IR - contains both parameter definitions and overrides
export interface TypeIR {
  name: string;
  baseType?: string;           // Optional inheritance
  parameters: ParameterIR[];   // Parameter definitions (param name: Type = default)
  overrides: Record<string, ExpressionIR>;  // Parameter overrides (name = value)
  material?: string;
  ifcClass?: string;
}

export interface LibraryIR {
  name: string;
  materials: MaterialIR[];
  types: TypeIR[];
}

export interface ExpressionIR {
  kind: "literal" | "measurement" | "boolean" | "string";
  value?: number;
  unit?: string;
  boolValue?: boolean;
  stringValue?: string;
}

export interface WallIR {
  name: string;
  start: Point2DIR;
  end: Point2DIR;
  thickness?: MeasurementIR;
  height?: MeasurementIR;
  material?: string;
}

export interface DoorPositionIR {
  kind: "absolute" | "center";
  value?: MeasurementIR;
}

export interface DoorIR {
  name: string;
  wall: string;
  position: DoorPositionIR;
  typeRef?: string;
  width?: MeasurementIR;
  height?: MeasurementIR;
  swing?: string;
  connects?: {
    from: string;
    to: string;
  };
  material?: string;
}

export interface WindowIR {
  name: string;
  wall: string;
  position: DoorPositionIR;
  typeRef?: string;
  width?: MeasurementIR;
  height?: MeasurementIR;
  sill?: MeasurementIR;
  material?: string;
}

export interface ColumnIR {
  name: string;
  position: Point2DIR;
  typeRef?: string;
  width?: MeasurementIR;
  depth?: MeasurementIR;
  height?: MeasurementIR;
}

export interface FurnitureIR {
  name?: string;
  typeRef: string;
  position: Point2DIR;
  facing?: string;
  size?: { width: MeasurementIR; depth: MeasurementIR };
}

export interface SlabIR {
  name: string;
  boundary: Point2DIR[];
  thickness?: MeasurementIR;
  material?: string;
  type?: string;
}

export interface WallReferenceIR {
  wall: string;
}

export interface SpaceIR {
  name: string;
  tags: string[];
  boundedBy?: WallReferenceIR[];
  area?: MeasurementIR;
  height?: MeasurementIR;
  floor?: string;
  ceiling?: string;
  doors: DoorIR[];
  windows: WindowIR[];
  furniture: FurnitureIR[];
}

export interface LevelIR {
  name: string;
  elevation: MeasurementIR | { ref: string };
  height?: MeasurementIR;
  walls: WallIR[];
  spaces: SpaceIR[];
  doors: DoorIR[];
  windows: WindowIR[];
  columns: ColumnIR[];
  furniture: FurnitureIR[];
  slabs: SlabIR[];
}

export interface BuildingDefaultsIR {
  wallThickness?: MeasurementIR;
  floorThickness?: MeasurementIR;
  ceilingHeight?: MeasurementIR;
  doorHeight?: MeasurementIR;
  windowSill?: MeasurementIR;
}

export interface SiteIR {
  name: string;
  location?: { latitude: number; longitude: number };
}

export interface BuildingIR {
  name: string;
  defaults?: BuildingDefaultsIR;
  site?: SiteIR;
  levels: LevelIR[];
}

export interface JsonIR {
  version: string;
  libraries: LibraryIR[];
  buildings: BuildingIR[];
}

// ============================================================================
// Named Colors
// ============================================================================

const NAMED_COLORS: Record<string, ColorIR> = {
  white: { red: 1.0, green: 1.0, blue: 1.0 },
  black: { red: 0.0, green: 0.0, blue: 0.0 },
  red: { red: 1.0, green: 0.0, blue: 0.0 },
  green: { red: 0.0, green: 0.5, blue: 0.0 },
  blue: { red: 0.0, green: 0.0, blue: 1.0 },
  grey: { red: 0.5, green: 0.5, blue: 0.5 },
  gray: { red: 0.5, green: 0.5, blue: 0.5 },
  brown: { red: 0.55, green: 0.27, blue: 0.07 },
  wood: { red: 0.65, green: 0.45, blue: 0.25 },
  oak: { red: 0.76, green: 0.60, blue: 0.42 },
  walnut: { red: 0.40, green: 0.26, blue: 0.13 },
  mahogany: { red: 0.50, green: 0.22, blue: 0.17 },
  steel: { red: 0.70, green: 0.72, blue: 0.75 },
  silver: { red: 0.75, green: 0.75, blue: 0.75 },
  gold: { red: 0.85, green: 0.65, blue: 0.13 },
  bronze: { red: 0.80, green: 0.50, blue: 0.20 },
  copper: { red: 0.72, green: 0.45, blue: 0.20 },
  glass: { red: 0.80, green: 0.90, blue: 1.0 },
  concrete: { red: 0.75, green: 0.75, blue: 0.73 },
  brick: { red: 0.70, green: 0.35, blue: 0.25 },
};

// ============================================================================
// Helpers
// ============================================================================

function cleanName(name: string | undefined): string {
  if (!name) return "";
  if (name.startsWith('"') && name.endsWith('"')) {
    return name.slice(1, -1);
  }
  return name;
}

function hexToRgb(hex: string): ColorIR {
  const cleanHex = hex.replace(/^#/, "");
  const bigint = parseInt(cleanHex, 16);
  return {
    red: ((bigint >> 16) & 255) / 255,
    green: ((bigint >> 8) & 255) / 255,
    blue: (bigint & 255) / 255,
  };
}

// ============================================================================
// Expression Generator
// ============================================================================

function generateExpression(expr: Expression): ExpressionIR {
  switch (expr.$type) {
    case "MeasurementLiteral": {
      const m = expr as MeasurementLiteral;
      return { kind: "measurement", value: m.value, unit: m.unit };
    }
    case "NumberLiteral": {
      const n = expr as NumberLiteral;
      return { kind: "literal", value: n.value };
    }
    case "BooleanLiteral": {
      const b = expr as BooleanLiteral;
      return { kind: "boolean", boolValue: b.value === "true" };
    }
    case "StringLiteral": {
      const s = expr as StringLiteral;
      return { kind: "string", stringValue: cleanName(s.value) };
    }
    default:
      throw new Error(`Unknown expression type: ${(expr as Expression).$type}`);
  }
}

function evaluateMeasurement(expr: Expression): MeasurementIR | undefined {
  if (expr.$type === "MeasurementLiteral") {
    const m = expr as MeasurementLiteral;
    return { value: m.value, unit: m.unit };
  }
  if (expr.$type === "NumberLiteral") {
    const n = expr as NumberLiteral;
    return { value: n.value, unit: "m" };
  }
  return undefined;
}

function evaluateNumber(expr: Expression): number | undefined {
  if (expr.$type === "NumberLiteral") {
    return (expr as NumberLiteral).value;
  }
  if (expr.$type === "MeasurementLiteral") {
    return (expr as MeasurementLiteral).value;
  }
  if (expr.$type === "BooleanLiteral") {
    return (expr as BooleanLiteral).value === "true" ? 1 : 0;
  }
  return undefined;
}


// ============================================================================
// Material Generator
// ============================================================================

function generateMaterialColor(colorProp: MaterialColorProperty): ColorIR {
  switch (colorProp.$type) {
    case "RgbColor": {
      const rgb = colorProp as { red: number; green: number; blue: number };
      return { red: rgb.red, green: rgb.green, blue: rgb.blue };
    }
    case "HexColor": {
      const hex = colorProp as { value: string };
      return hexToRgb(hex.value);
    }
    case "NamedColor": {
      const named = colorProp as { name: string };
      return NAMED_COLORS[named.name] ?? NAMED_COLORS.grey;
    }
    default:
      return NAMED_COLORS.grey;
  }
}

function generateMaterial(material: Material): MaterialIR {
  const ir: MaterialIR = { name: material.name };

  for (const prop of material.properties) {
    switch (prop.$type) {
      case "RgbColor":
      case "HexColor":
      case "NamedColor":
        ir.color = generateMaterialColor(prop as MaterialColorProperty);
        break;
      case "MaterialTransparencyProperty":
        ir.transparency = (prop as { value: number }).value;
        break;
    }
  }

  return ir;
}

// ============================================================================
// Type Generator (unified - handles both parameter definitions and overrides)
// ============================================================================

function generateType(type: Type): TypeIR {
  const ir: TypeIR = {
    name: type.name,
    parameters: [],
    overrides: {},
  };

  // Handle inheritance
  if (type.baseType?.ref) {
    ir.baseType = type.baseType.ref.name;
  }

  for (const member of type.members as TypeMember[]) {
    switch (member.$type) {
      case "TypeParameter": {
        const param = member as {
          name: string;
          paramType: string;
          defaultValue?: Expression;
        };
        const paramIR: ParameterIR = {
          name: param.name,
          type: param.paramType,
        };
        if (param.defaultValue) {
          paramIR.defaultValue = generateExpression(param.defaultValue);
        }
        ir.parameters.push(paramIR);
        break;
      }
      case "TypeParameterOverride": {
        // Parameter override (name = value)
        const override = member as { name: string; value: Expression };
        ir.overrides[override.name] = generateExpression(override.value);
        break;
      }
      case "TypeMaterial": {
        const mat = member as { materialRef: { ref?: { name: string } } };
        if (mat.materialRef.ref) {
          ir.material = mat.materialRef.ref.name;
        }
        break;
      }
      case "TypeIfcClass": {
        const ifc = member as { className: string };
        ir.ifcClass = ifc.className;
        break;
      }
    }
  }

  return ir;
}

function generateLibrary(library: Library): LibraryIR {
  return {
    name: cleanName(library.name),
    materials: library.materials.map(generateMaterial),
    types: library.types.map(generateType),
  };
}

// ============================================================================
// Point Generator
// ============================================================================

function generatePoint2D(point: Point2D): Point2DIR {
  return {
    x: evaluateNumber(point.x) ?? 0,
    y: evaluateNumber(point.y) ?? 0,
  };
}

// ============================================================================
// Door Position Generator
// ============================================================================

function generateDoorPosition(position: DoorPosition): DoorPositionIR {
  switch (position.$type) {
    case "AbsolutePosition": {
      const abs = position as { value: Expression };
      return {
        kind: "absolute",
        value: evaluateMeasurement(abs.value),
      };
    }
    case "CenterPosition":
      return { kind: "center" };
    default:
      return { kind: "center" };
  }
}

// ============================================================================
// Wall Generator
// ============================================================================

function generateWall(wall: Wall): WallIR {
  const ir: WallIR = {
    name: cleanName(wall.name),
    start: generatePoint2D(wall.start),
    end: generatePoint2D(wall.end),
  };

  if (wall.properties) {
    for (const prop of wall.properties.properties) {
      switch (prop.$type) {
        case "WallThicknessProperty":
          ir.thickness = evaluateMeasurement((prop as { value: Expression }).value);
          break;
        case "WallHeightProperty":
          ir.height = evaluateMeasurement((prop as { value: Expression }).value);
          break;
        case "WallMaterialProperty": {
          const mat = prop as { materialRef: { ref?: { name: string } } };
          if (mat.materialRef.ref) {
            ir.material = mat.materialRef.ref.name;
          }
          break;
        }
      }
    }
  }

  return ir;
}

// ============================================================================
// Door & Window Generators
// ============================================================================

function generateDoor(door: Door): DoorIR {
  const ir: DoorIR = {
    name: cleanName(door.name),
    wall: door.wall.ref ? cleanName(door.wall.ref.name) : (door.wall.$refText || ""),
    position: generateDoorPosition(door.position),
  };

  // typeRef is a cross-reference to a Type
  if (door.typeRef) {
    ir.typeRef = door.typeRef.ref?.name || door.typeRef.$refText;
  }

  if (door.body) {
    for (const prop of door.body.properties) {
      switch (prop.$type) {
        case "DoorWidthProperty":
          ir.width = evaluateMeasurement((prop as { value: Expression }).value);
          break;
        case "DoorHeightProperty":
          ir.height = evaluateMeasurement((prop as { value: Expression }).value);
          break;
        case "DoorSwingProperty":
          ir.swing = (prop as { direction: string }).direction;
          break;
        case "DoorConnectsProperty": {
          const connects = prop as { from: string; to: string };
          ir.connects = {
            from: cleanName(connects.from),
            to: cleanName(connects.to),
          };
          break;
        }
        case "DoorMaterialProperty": {
          const mat = prop as { materialRef: { ref?: { name: string } } };
          if (mat.materialRef.ref) {
            ir.material = mat.materialRef.ref.name;
          }
          break;
        }
      }
    }
  }

  return ir;
}

function generateWindow(window: Window): WindowIR {
  const ir: WindowIR = {
    name: cleanName(window.name),
    wall: window.wall.ref ? cleanName(window.wall.ref.name) : (window.wall.$refText || ""),
    position: generateDoorPosition(window.position),
  };

  // typeRef is a cross-reference to a Type
  if (window.typeRef) {
    ir.typeRef = window.typeRef.ref?.name || window.typeRef.$refText;
  }

  if (window.body) {
    for (const prop of window.body.properties) {
      switch (prop.$type) {
        case "WindowWidthProperty":
          ir.width = evaluateMeasurement((prop as { value: Expression }).value);
          break;
        case "WindowHeightProperty":
          ir.height = evaluateMeasurement((prop as { value: Expression }).value);
          break;
        case "WindowSillProperty":
          ir.sill = evaluateMeasurement((prop as { value: Expression }).value);
          break;
        case "WindowMaterialProperty": {
          const mat = prop as { materialRef: { ref?: { name: string } } };
          if (mat.materialRef.ref) {
            ir.material = mat.materialRef.ref.name;
          }
          break;
        }
      }
    }
  }

  return ir;
}

// ============================================================================
// Column Generator
// ============================================================================

function generateColumn(column: Column): ColumnIR {
  const ir: ColumnIR = {
    name: cleanName(column.name),
    position: generatePoint2D(column.position),
  };

  if (column.typeRef) {
    ir.typeRef = column.typeRef.ref?.name || column.typeRef.$refText;
  }

  if (column.body) {
    for (const prop of column.body.properties) {
      switch (prop.$type) {
        case "ColumnWidthProperty":
          ir.width = evaluateMeasurement((prop as { value: Expression }).value);
          break;
        case "ColumnDepthProperty":
          ir.depth = evaluateMeasurement((prop as { value: Expression }).value);
          break;
        case "ColumnHeightProperty":
          ir.height = evaluateMeasurement((prop as { value: Expression }).value);
          break;
      }
    }
  }

  return ir;
}

// ============================================================================
// Furniture Generator
// ============================================================================

function generateFurniture(furniture: Furniture): FurnitureIR {
  const ir: FurnitureIR = {
    typeRef: furniture.typeRef.ref?.name || furniture.typeRef.$refText || "",
    position: generatePoint2D(furniture.position),
  };

  if (furniture.name) {
    ir.name = cleanName(furniture.name);
  }

  if (furniture.body) {
    // Handle inline properties (from inlineProps)
    const body = furniture.body as { properties?: unknown[]; inlineProps?: unknown[] };
    const props = [...(body.properties ?? []), ...(body.inlineProps ?? [])];

    for (const prop of props) {
      const p = prop as { $type: string };
      switch (p.$type) {
        case "FurnitureFacingProperty":
          ir.facing = (prop as { direction: string }).direction;
          break;
        case "FurnitureSizeProperty": {
          const size = prop as { width: Expression; depth: Expression };
          ir.size = {
            width: evaluateMeasurement(size.width)!,
            depth: evaluateMeasurement(size.depth)!,
          };
          break;
        }
      }
    }
  }

  return ir;
}

// ============================================================================
// Slab Generator
// ============================================================================

function generateSlab(slab: Slab): SlabIR {
  const ir: SlabIR = {
    name: cleanName(slab.name),
    boundary: [],
  };

  for (const prop of slab.properties) {
    switch (prop.$type) {
      case "SlabBoundaryProperty": {
        const boundary = prop as { points: Point2D[] };
        ir.boundary = boundary.points.map(generatePoint2D);
        break;
      }
      case "SlabThicknessProperty":
        ir.thickness = evaluateMeasurement((prop as { value: Expression }).value);
        break;
      case "SlabMaterialProperty": {
        const mat = prop as { materialRef: { ref?: { name: string } } };
        if (mat.materialRef.ref) {
          ir.material = mat.materialRef.ref.name;
        }
        break;
      }
      case "SlabTypeProperty":
        ir.type = (prop as { slabType: string }).slabType;
        break;
    }
  }

  return ir;
}

// ============================================================================
// Wall Reference Generator
// ============================================================================

function generateWallReference(ref: WallReference): WallReferenceIR {
  return {
    wall: ref.wall.ref ? cleanName(ref.wall.ref.name) : "",
  };
}

// ============================================================================
// Space Generator
// ============================================================================

function generateSpace(space: Space): SpaceIR {
  const ir: SpaceIR = {
    name: cleanName(space.name),
    tags: space.tags?.tags ?? [],
    doors: [],
    windows: [],
    furniture: [],
  };

  for (const prop of space.properties) {
    switch (prop.$type) {
      case "BoundedByProperty": {
        const bounded = prop as { walls: WallReference[] };
        ir.boundedBy = bounded.walls.map(generateWallReference);
        break;
      }
      case "AreaProperty":
        ir.area = evaluateMeasurement((prop as { value: Expression }).value);
        break;
      case "HeightProperty":
        ir.height = evaluateMeasurement((prop as { value: Expression }).value);
        break;
      case "FloorProperty": {
        const floor = prop as { material: { ref?: { name: string } } };
        if (floor.material.ref) {
          ir.floor = floor.material.ref.name;
        }
        break;
      }
      case "CeilingProperty": {
        const ceiling = prop as { material: { ref?: { name: string } } };
        if (ceiling.material.ref) {
          ir.ceiling = ceiling.material.ref.name;
        }
        break;
      }
    }
  }

  for (const element of space.elements) {
    switch (element.$type) {
      case "Door":
        ir.doors.push(generateDoor(element as Door));
        break;
      case "Window":
        ir.windows.push(generateWindow(element as Window));
        break;
      case "Furniture":
        ir.furniture.push(generateFurniture(element as Furniture));
        break;
    }
  }

  return ir;
}

// ============================================================================
// Level Generator
// ============================================================================

function generateLevel(level: Level): LevelIR {
  const ir: LevelIR = {
    name: cleanName(level.name),
    elevation: { value: 0, unit: "m" },
    walls: [],
    spaces: [],
    doors: [],
    windows: [],
    columns: [],
    furniture: [],
    slabs: [],
  };

  // Handle elevation
  switch (level.elevation.$type) {
    case "AbsoluteElevation": {
      const abs = level.elevation as { value: Expression };
      ir.elevation = evaluateMeasurement(abs.value) ?? { value: 0, unit: "m" };
      break;
    }
    case "RelativeElevation": {
      const rel = level.elevation as { ref: { ref?: { name: string } } };
      if (rel.ref.ref) {
        ir.elevation = { ref: cleanName(rel.ref.ref.name) };
      }
      break;
    }
  }

  // Handle height
  if (level.height) {
    ir.height = evaluateMeasurement(level.height);
  }

  // Process level members
  for (const member of level.members) {
    switch (member.$type) {
      case "Wall":
        ir.walls.push(generateWall(member as Wall));
        break;
      case "Space":
        ir.spaces.push(generateSpace(member as Space));
        break;
      case "Door":
        ir.doors.push(generateDoor(member as Door));
        break;
      case "Window":
        ir.windows.push(generateWindow(member as Window));
        break;
      case "Column":
        ir.columns.push(generateColumn(member as Column));
        break;
      case "Furniture":
        ir.furniture.push(generateFurniture(member as Furniture));
        break;
      case "Slab":
        ir.slabs.push(generateSlab(member as Slab));
        break;
    }
  }

  return ir;
}

// ============================================================================
// Building Generator
// ============================================================================

function generateBuilding(building: Building): BuildingIR {
  const ir: BuildingIR = {
    name: cleanName(building.name),
    levels: building.levels.map(generateLevel),
  };

  if (building.defaults) {
    ir.defaults = {};
    for (const prop of building.defaults.properties) {
      switch (prop.name) {
        case "wall_thickness":
          ir.defaults.wallThickness = evaluateMeasurement(prop.value);
          break;
        case "floor_thickness":
          ir.defaults.floorThickness = evaluateMeasurement(prop.value);
          break;
        case "ceiling_height":
          ir.defaults.ceilingHeight = evaluateMeasurement(prop.value);
          break;
        case "door_height":
          ir.defaults.doorHeight = evaluateMeasurement(prop.value);
          break;
        case "window_sill":
          ir.defaults.windowSill = evaluateMeasurement(prop.value);
          break;
      }
    }
  }

  if (building.site) {
    ir.site = {
      name: cleanName(building.site.name),
    };
    if (building.site.location) {
      ir.site.location = {
        latitude: building.site.location.latitude,
        longitude: building.site.location.longitude,
      };
    }
  }

  return ir;
}

// ============================================================================
// Main Generator
// ============================================================================

export function generateJsonIR(model: Model): JsonIR {
  return {
    version: "1.0.0",
    libraries: model.libraries.map(generateLibrary),
    buildings: model.buildings.map(generateBuilding),
  };
}
