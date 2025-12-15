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
  DoorOffsetProperty,
  Material,
  MaterialColorProperty,
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
  kind: "literal" | "measurement" | "reference" | "binary" | "boolean" | "string";
  value?: number;
  unit?: string;
  ref?: string;
  op?: "+" | "-" | "*" | "/";
  left?: ExpressionIR;
  right?: ExpressionIR;
  boolValue?: boolean;
  stringValue?: string;
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
  value: MeasurementIR | number | boolean | string;
}

// ============================================================================
// IR Types - Materials
// ============================================================================

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

// ============================================================================
// IR Types - Type System (Updated)
// ============================================================================

export interface TypeIR {
  name: string;
  family: string;
  baseType?: string;
  parameters: ResolvedParameterIR[];
  material?: string; // Reference to material name
}

export interface LibraryIR {
  name: string;
  families: FamilyIR[];
  types: TypeIR[];
  materials: MaterialIR[];
}

// ============================================================================
// IR Types - Project Hierarchy
// ============================================================================

// Door offset can be normalized (0-1), center, or absolute
export type DoorOffsetIR =
  | { kind: "normalized"; value: number }
  | { kind: "center" }
  | { kind: "absolute"; distance: MeasurementIR; anchor: string };

export interface SpaceDoorIR {
  name: string;
  typeRef?: string;
  width?: MeasurementIR;
  height?: MeasurementIR;
  wall?: "north" | "south" | "east" | "west";
  offset?: DoorOffsetIR;
  swing?: string;
  connects?: string;
  material?: string; // Material override
}

export interface SpaceIR {
  name: string;
  position?: { row: number; col: number };
  area?: MeasurementIR;
  width?: MeasurementIR;
  length?: MeasurementIR;
  aspect?: { widthRatio: number; lengthRatio: number };
  doors: SpaceDoorIR[];
}

export interface LevelIR {
  name: string;
  elevation?: MeasurementIR;
  height?: MeasurementIR;
  slabThickness?: MeasurementIR;
  ceilingThickness?: MeasurementIR;
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
// Named Colors Lookup
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
  wood: { red: 0.65, green: 0.45, blue: 0.25 }, // Warm wood brown
  oak: { red: 0.76, green: 0.60, blue: 0.42 },
  walnut: { red: 0.40, green: 0.26, blue: 0.13 },
  mahogany: { red: 0.50, green: 0.22, blue: 0.17 },
  steel: { red: 0.70, green: 0.72, blue: 0.75 },
  silver: { red: 0.75, green: 0.75, blue: 0.75 },
  gold: { red: 0.85, green: 0.65, blue: 0.13 },
  bronze: { red: 0.80, green: 0.50, blue: 0.20 },
  copper: { red: 0.72, green: 0.45, blue: 0.20 },
  glass: { red: 0.80, green: 0.90, blue: 1.0 },
};

// ============================================================================
// Helpers
// ============================================================================

function measurement(m: Measurement | AreaMeasurement): MeasurementIR {
  return { value: m.value, unit: m.unit };
}

function cleanName(name: string): string {
  if (name.startsWith('"') && name.endsWith('"')) {
    return name.slice(1, -1);
  }
  return name;
}

function hexToRgb(hex: string): ColorIR {
  // Remove # prefix if present
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
    case "NumberLiteral":
      return { kind: "literal", value: expr.value };
    case "MeasurementLiteral":
      return { kind: "measurement", value: expr.value, unit: expr.unit };
    case "BooleanLiteral":
      return { kind: "boolean", boolValue: expr.value === "true" };
    case "StringLiteral":
      return { kind: "string", stringValue: cleanName(expr.value) };
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

type EvaluatedValue = MeasurementIR | number | boolean | string;

function evaluateExpression(
  expr: ExpressionIR,
  context: Map<string, EvaluatedValue>
): EvaluatedValue {
  switch (expr.kind) {
    case "literal":
      return expr.value!;
    case "measurement":
      return { value: expr.value!, unit: expr.unit! };
    case "boolean":
      return expr.boolValue!;
    case "string":
      return expr.stringValue!;
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

      const leftVal = typeof left === "number" ? left : (left as MeasurementIR).value;
      const rightVal = typeof right === "number" ? right : (right as MeasurementIR).value;
      const leftUnit = typeof left === "number" ? undefined : (left as MeasurementIR).unit;

      let result: number;
      switch (expr.op) {
        case "+": result = leftVal + rightVal; break;
        case "-": result = leftVal - rightVal; break;
        case "*": result = leftVal * rightVal; break;
        case "/": result = leftVal / rightVal; break;
        default: throw new Error(`Unknown operator: ${expr.op}`);
      }

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
// Material Generator
// ============================================================================

function generateMaterialColor(colorProp: MaterialColorProperty): ColorIR {
  switch (colorProp.$type) {
    case "RgbColor":
      return {
        red: colorProp.red,
        green: colorProp.green,
        blue: colorProp.blue,
      };
    case "HexColor":
      return hexToRgb(colorProp.value);
    case "NamedColor":
      return NAMED_COLORS[colorProp.name] ?? NAMED_COLORS.grey;
    default:
      return NAMED_COLORS.grey;
  }
}

function generateMaterial(material: Material): MaterialIR {
  const ir: MaterialIR = {
    name: material.name,
  };

  for (const prop of material.properties) {
    switch (prop.$type) {
      case "RgbColor":
      case "HexColor":
      case "NamedColor":
        ir.color = generateMaterialColor(prop as MaterialColorProperty);
        break;
      case "MaterialTransparencyProperty":
        ir.transparency = prop.value;
        break;
    }
  }

  return ir;
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

function generateType(
  type: Type,
  families: Map<string, FamilyIR>,
  types: Map<string, TypeIR>
): TypeIR {
  const context = new Map<string, EvaluatedValue>();
  const resolvedParams: ResolvedParameterIR[] = [];

  let familyName = "";
  let baseTypeName: string | undefined;
  let material: string | undefined;

  // Handle type-extends-family
  if (type.base?.ref) {
    familyName = type.base.ref.name;
    const family = families.get(familyName);
    if (family) {
      for (const param of family.parameters) {
        if (param.defaultValue) {
          const value = evaluateExpression(param.defaultValue, context);
          context.set(param.name, value);
          resolvedParams.push({ name: param.name, value });
        }
      }
    }
  }

  // Handle type-extends-type (chain inheritance)
  if (type.baseType?.ref) {
    baseTypeName = type.baseType.ref.name;
    const baseType = types.get(baseTypeName);
    if (baseType) {
      familyName = baseType.family;
      // Inherit all parameters from base type
      for (const param of baseType.parameters) {
        context.set(param.name, param.value);
        resolvedParams.push({ name: param.name, value: param.value });
      }
      // Inherit material from base type
      if (baseType.material) {
        material = baseType.material;
      }
    }
  }

  // Apply type overrides
  for (const override of type.overrides) {
    const exprIR = generateExpression(override.value);
    const value = evaluateExpression(exprIR, context);
    context.set(override.name, value);

    const existing = resolvedParams.find(p => p.name === override.name);
    if (existing) {
      existing.value = value;
    } else {
      resolvedParams.push({ name: override.name, value });
    }
  }

  // Handle material assignment
  if (type.materialAssignment?.materialRef?.ref) {
    material = type.materialAssignment.materialRef.ref.name;
  }

  const ir: TypeIR = {
    name: type.name,
    family: familyName,
    parameters: resolvedParams,
  };

  if (baseTypeName) {
    ir.baseType = baseTypeName;
  }

  if (material) {
    ir.material = material;
  }

  return ir;
}

function generateLibrary(library: Library): LibraryIR {
  // Generate materials first
  const materialIRs = library.materials.map(generateMaterial);

  // Generate families
  const familyIRs = library.families.map(generateFamily);
  const familyMap = new Map(familyIRs.map(f => [f.name, f]));

  // Generate types
  const typeMap = new Map<string, TypeIR>();
  const typeIRs: TypeIR[] = [];

  for (const t of library.types) {
    const typeIR = generateType(t, familyMap, typeMap);
    typeMap.set(typeIR.name, typeIR);
    typeIRs.push(typeIR);
  }

  return {
    name: cleanName(library.name),
    families: familyIRs,
    types: typeIRs,
    materials: materialIRs,
  };
}

// ============================================================================
// Project Hierarchy Generators
// ============================================================================

function generateDoorOffset(offset: DoorOffsetProperty): DoorOffsetIR {
  switch (offset.$type) {
    case "DoorOffsetNormalized":
      return { kind: "normalized", value: offset.value };
    case "DoorOffsetCenter":
      return { kind: "center" };
    case "DoorOffsetAbsolute":
      return {
        kind: "absolute",
        distance: measurement(offset.distance),
        anchor: offset.anchor,
      };
    default:
      throw new Error(`Unknown offset type: ${(offset as DoorOffsetProperty).$type}`);
  }
}

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
      case "DoorOffsetNormalized":
      case "DoorOffsetCenter":
      case "DoorOffsetAbsolute":
        ir.offset = generateDoorOffset(override as DoorOffsetProperty);
        break;
      case "DoorSwingProperty":
        ir.swing = override.direction;
        break;
      case "DoorConnectsProperty":
        ir.connects = cleanName(override.targetSpace);
        break;
      case "DoorMaterialProperty":
        if (override.materialRef?.ref) {
          ir.material = override.materialRef.ref.name;
        }
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
      case "AspectProperty":
        ir.aspect = { widthRatio: prop.widthRatio, lengthRatio: prop.lengthRatio };
        break;
    }
  }

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
      case "SlabThicknessProperty":
        ir.slabThickness = measurement(prop.value);
        break;
      case "CeilingThicknessProperty":
        ir.ceilingThickness = measurement(prop.value);
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
    version: "0.6.0",
  };

  if (model.libraries.length > 0) {
    ir.libraries = model.libraries.map(generateLibrary);
  }

  if (model.projects.length > 0) {
    ir.projects = model.projects.map(generateProject);
  }

  return ir;
}
