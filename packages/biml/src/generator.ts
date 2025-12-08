import type {
  Model,
  Measurement,
  AreaMeasurement,
  Library,
  Family,
  FamilyParameter,
  Type,
  Expression,
  Project,
  Site,
  Building,
  Level,
  Space,
  SpaceDoor,
} from "./generated/ast.js";

// ============================================================================
// IR Types - Shared
// ============================================================================

export interface MeasurementIR {
  value: number;
  unit: string;
}

// ============================================================================
// IR Types - Library & Type System
// ============================================================================

export interface ExpressionIR {
  kind: "literal" | "measurement" | "reference" | "binary";
  value?: number;
  unit?: string;
  ref?: string;
  op?: "+" | "-" | "*" | "/";
  left?: ExpressionIR;
  right?: ExpressionIR;
}

export interface ParameterIR {
  name: string;
  paramType: string;
  defaultValue?: ExpressionIR;
}

export interface FamilyIR {
  name: string;
  parameters: ParameterIR[];
}

export interface ResolvedParameterIR {
  name: string;
  value: MeasurementIR | number;
}

export interface TypeIR {
  name: string;
  family: string;
  parameters: ResolvedParameterIR[];
}

export interface LibraryIR {
  name: string;
  families: FamilyIR[];
  types: TypeIR[];
}

// ============================================================================
// IR Types - Project Hierarchy
// ============================================================================

export interface SpaceDoorIR {
  name: string;
  typeRef?: string;
  width?: MeasurementIR;
  height?: MeasurementIR;
  wall?: "north" | "south" | "east" | "west";
  offset?: number;
}

export interface SpaceIR {
  name: string;
  position?: { row: number; col: number };
  area?: MeasurementIR;
  width?: MeasurementIR;
  length?: MeasurementIR;
  doors: SpaceDoorIR[];
}

export interface LevelIR {
  name: string;
  elevation?: MeasurementIR;
  height?: MeasurementIR;
  spaces: SpaceIR[];
}

export interface BuildingIR {
  name: string;
  levels: LevelIR[];
}

export interface SiteIR {
  name: string;
  buildings: BuildingIR[];
}

export interface ProjectIR {
  name: string;
  sites: SiteIR[];
}

// ============================================================================
// Top-level IR
// ============================================================================

export interface JsonIR {
  version: string;
  libraries?: LibraryIR[];
  projects?: ProjectIR[];
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
// Expression Generator
// ============================================================================

function generateExpression(expr: Expression): ExpressionIR {
  switch (expr.$type) {
    case "NumberLiteral":
      return { kind: "literal", value: expr.value };
    case "MeasurementLiteral":
      return { kind: "measurement", value: expr.value, unit: expr.unit };
    case "ParameterRef":
      return { kind: "reference", ref: expr.ref.ref?.name ?? expr.ref.$refText };
    case "BinaryExpression":
      return {
        kind: "binary",
        op: expr.op as "+" | "-" | "*" | "/",
        left: generateExpression(expr.left),
        right: generateExpression(expr.right),
      };
    default:
      throw new Error(`Unknown expression type: ${(expr as Expression).$type}`);
  }
}

// ============================================================================
// Expression Evaluator (for resolving type parameters)
// ============================================================================

function evaluateExpression(
  expr: ExpressionIR,
  context: Map<string, MeasurementIR | number>
): MeasurementIR | number {
  switch (expr.kind) {
    case "literal":
      return expr.value!;
    case "measurement":
      return { value: expr.value!, unit: expr.unit! };
    case "reference": {
      const value = context.get(expr.ref!);
      if (value === undefined) {
        throw new Error(`Unknown parameter reference: ${expr.ref}`);
      }
      return value;
    }
    case "binary": {
      const left = evaluateExpression(expr.left!, context);
      const right = evaluateExpression(expr.right!, context);

      // For now, simple numeric operations
      const leftVal = typeof left === "number" ? left : left.value;
      const rightVal = typeof right === "number" ? right : right.value;
      const leftUnit = typeof left === "number" ? undefined : left.unit;

      let result: number;
      switch (expr.op) {
        case "+": result = leftVal + rightVal; break;
        case "-": result = leftVal - rightVal; break;
        case "*": result = leftVal * rightVal; break;
        case "/": result = leftVal / rightVal; break;
        default: throw new Error(`Unknown operator: ${expr.op}`);
      }

      // If left has a unit, preserve it
      if (leftUnit) {
        return { value: result, unit: leftUnit };
      }
      return result;
    }
    default:
      throw new Error(`Unknown expression kind: ${expr.kind}`);
  }
}

// ============================================================================
// Library & Type Generators
// ============================================================================

function generateFamilyParameter(param: FamilyParameter): ParameterIR {
  const ir: ParameterIR = {
    name: param.name,
    paramType: param.paramType,
  };

  if (param.defaultValue) {
    ir.defaultValue = generateExpression(param.defaultValue);
  }

  return ir;
}

function generateFamily(family: Family): FamilyIR {
  return {
    name: family.name,
    parameters: family.parameters.map(generateFamilyParameter),
  };
}

function generateType(type: Type, families: Map<string, FamilyIR>): TypeIR {
  const familyName = type.base?.ref?.name ?? type.base?.$refText ?? "";
  const family = families.get(familyName);

  // Build parameter context from family defaults
  const context = new Map<string, MeasurementIR | number>();
  const resolvedParams: ResolvedParameterIR[] = [];

  if (family) {
    for (const param of family.parameters) {
      if (param.defaultValue) {
        const value = evaluateExpression(param.defaultValue, context);
        context.set(param.name, value);
        resolvedParams.push({ name: param.name, value });
      }
    }
  }

  // Apply type overrides
  for (const override of type.overrides) {
    const exprIR = generateExpression(override.value);
    const value = evaluateExpression(exprIR, context);
    context.set(override.name, value);

    // Update or add the parameter
    const existing = resolvedParams.find(p => p.name === override.name);
    if (existing) {
      existing.value = value;
    } else {
      resolvedParams.push({ name: override.name, value });
    }
  }

  return {
    name: type.name,
    family: familyName,
    parameters: resolvedParams,
  };
}

function generateLibrary(library: Library): LibraryIR {
  // First generate all families
  const familyIRs = library.families.map(generateFamily);
  const familyMap = new Map(familyIRs.map(f => [f.name, f]));

  // Then generate types with family context
  const typeIRs = library.types.map(t => generateType(t, familyMap));

  return {
    name: cleanName(library.name),
    families: familyIRs,
    types: typeIRs,
  };
}

// ============================================================================
// Project Hierarchy Generators
// ============================================================================

function generateSpaceDoor(door: SpaceDoor): SpaceDoorIR {
  const ir: SpaceDoorIR = {
    name: cleanName(door.name),
  };

  if (door.typeRef) {
    ir.typeRef = door.typeRef.typeName;
  }

  for (const override of door.overrides) {
    switch (override.$type) {
      case "DoorWidthProperty":
        ir.width = measurement(override.value);
        break;
      case "DoorHeightProperty":
        ir.height = measurement(override.value);
        break;
      case "DoorWallProperty":
        ir.wall = override.direction as "north" | "south" | "east" | "west";
        break;
      case "DoorOffsetProperty":
        ir.offset = override.value;
        break;
    }
  }

  return ir;
}

function generateSpace(space: Space): SpaceIR {
  const ir: SpaceIR = {
    name: cleanName(space.name),
    doors: [],
  };

  for (const prop of space.properties) {
    switch (prop.$type) {
      case "PositionProperty":
        ir.position = { row: Math.floor(prop.row), col: Math.floor(prop.col) };
        break;
      case "AreaProperty":
        ir.area = measurement(prop.value);
        break;
      case "WidthProperty":
        ir.width = measurement(prop.value);
        break;
      case "LengthProperty":
        ir.length = measurement(prop.value);
        break;
    }
  }

  // Generate doors
  for (const element of space.elements) {
    if (element.$type === "SpaceDoor") {
      ir.doors.push(generateSpaceDoor(element));
    }
  }

  return ir;
}

function generateLevel(level: Level): LevelIR {
  const ir: LevelIR = {
    name: cleanName(level.name),
    spaces: [],
  };

  for (const prop of level.properties) {
    switch (prop.$type) {
      case "ElevationProperty":
        ir.elevation = measurement(prop.value);
        break;
      case "HeightProperty":
        ir.height = measurement(prop.value);
        break;
    }
  }

  ir.spaces = level.spaces.map(generateSpace);

  return ir;
}

function generateBuilding(building: Building): BuildingIR {
  return {
    name: cleanName(building.name),
    levels: building.levels.map(generateLevel),
  };
}

function generateSite(site: Site): SiteIR {
  return {
    name: cleanName(site.name),
    buildings: site.buildings.map(generateBuilding),
  };
}

function generateProject(project: Project): ProjectIR {
  return {
    name: cleanName(project.name),
    sites: project.sites.map(generateSite),
  };
}

// ============================================================================
// Main Generator
// ============================================================================

export function generateJsonIR(model: Model): JsonIR {
  const ir: JsonIR = {
    version: "0.3.0",
  };

  if (model.libraries.length > 0) {
    ir.libraries = model.libraries.map(generateLibrary);
  }

  if (model.projects.length > 0) {
    ir.projects = model.projects.map(generateProject);
  }

  return ir;
}
