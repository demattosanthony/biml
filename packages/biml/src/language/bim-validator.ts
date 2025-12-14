import type { ValidationAcceptor, ValidationChecks } from "langium";
import type {
  BimLangAstType,
  Model,
  Library,
  Type,
  SpaceDoor,
  Space,
  Level,
  Building,
  Project,
  DoorConnectsProperty,
} from "../generated/ast.js";

/**
 * BIML Semantic Validator
 *
 * Validates the semantic correctness of BIML models beyond syntax:
 * - Type references resolve
 * - No duplicate names in scope
 * - Grid positions don't overlap
 * - Interior doors connect to valid spaces
 * - Required properties are present
 */

export function registerValidationChecks(checks: ValidationChecks<BimLangAstType>) {
  // Type system validations
  checks.Type = [checkTypeBaseReference];

  // Door validations
  checks.SpaceDoor = [checkDoorTypeReference, checkDoorConnectsReference];

  // Duplicate name validations
  checks.Library = [checkDuplicateFamilyNames, checkDuplicateTypeNames];
  checks.Level = [checkDuplicateSpaceNames, checkOverlappingPositions];
  checks.Building = [checkDuplicateLevelNames];
  checks.Project = [checkDuplicateSiteNames];

  // Required property validations
  checks.Space = [checkSpaceHasDimensions, checkSpaceHasPosition];
  checks.Level = [...(checks.Level || []), checkLevelHasHeight];
}

// ============================================================================
// Type System Validations
// ============================================================================

function checkTypeBaseReference(type: Type, accept: ValidationAcceptor): void {
  // Check family reference
  if (type.base && !type.base.ref) {
    accept("error", `Family '${type.base.$refText}' not found.`, {
      node: type,
      property: "base",
    });
  }

  // Check type reference (for type-extends-type)
  if (type.baseType && !type.baseType.ref) {
    accept("error", `Type '${type.baseType.$refText}' not found.`, {
      node: type,
      property: "baseType",
    });
  }
}

// ============================================================================
// Door Validations
// ============================================================================

function checkDoorTypeReference(door: SpaceDoor, accept: ValidationAcceptor): void {
  if (!door.typeRef) {
    // Check if inline dimensions are provided
    const hasWidth = door.overrides.some((o) => o.$type === "DoorWidthProperty");
    const hasHeight = door.overrides.some((o) => o.$type === "DoorHeightProperty");

    if (!hasWidth || !hasHeight) {
      accept(
        "warning",
        `Door '${cleanName(door.name)}' has no type reference and is missing ${!hasWidth ? "width" : ""} ${!hasWidth && !hasHeight ? "and " : ""} ${!hasHeight ? "height" : ""}. Default dimensions will be used.`,
        { node: door, property: "name" }
      );
    }
    return;
  }

  // Validate type reference exists
  const typeName = door.typeRef.typeName;
  const model = getModelRoot(door);
  if (!model) return;

  const typeExists = model.libraries.some((lib) =>
    lib.types.some((t) => t.name === typeName)
  );

  if (!typeExists) {
    accept("error", `Door type '${typeName}' not found in any library.`, {
      node: door.typeRef,
      property: "typeName",
    });
  }
}

function checkDoorConnectsReference(door: SpaceDoor, accept: ValidationAcceptor): void {
  const connectsOverride = door.overrides.find(
    (o) => o.$type === "DoorConnectsProperty"
  ) as DoorConnectsProperty | undefined;

  if (!connectsOverride) return;

  const targetSpaceName = cleanName(connectsOverride.targetSpace);
  const level = getLevelForDoor(door);
  if (!level) return;

  // Get the space this door is in
  const currentSpace = door.$container;
  const currentSpaceName = cleanName(currentSpace.name);

  // Check if target space exists and is different from current
  const targetExists = level.spaces.some(
    (s) => cleanName(s.name) === targetSpaceName
  );

  if (!targetExists) {
    accept(
      "error",
      `Door connects to '${targetSpaceName}' but no space with that name exists on this level.`,
      { node: connectsOverride, property: "targetSpace" }
    );
  } else if (targetSpaceName === currentSpaceName) {
    accept("error", `Door cannot connect a space to itself.`, {
      node: connectsOverride,
      property: "targetSpace",
    });
  }
}

// ============================================================================
// Duplicate Name Validations
// ============================================================================

function checkDuplicateFamilyNames(library: Library, accept: ValidationAcceptor): void {
  const seen = new Set<string>();
  for (const family of library.families) {
    if (seen.has(family.name)) {
      accept("error", `Duplicate family name '${family.name}'.`, {
        node: family,
        property: "name",
      });
    }
    seen.add(family.name);
  }
}

function checkDuplicateTypeNames(library: Library, accept: ValidationAcceptor): void {
  const seen = new Set<string>();
  for (const type of library.types) {
    if (seen.has(type.name)) {
      accept("error", `Duplicate type name '${type.name}'.`, {
        node: type,
        property: "name",
      });
    }
    seen.add(type.name);
  }
}

function checkDuplicateSpaceNames(level: Level, accept: ValidationAcceptor): void {
  const seen = new Set<string>();
  for (const space of level.spaces) {
    const name = cleanName(space.name);
    if (seen.has(name)) {
      accept("error", `Duplicate space name '${name}' on level '${cleanName(level.name)}'.`, {
        node: space,
        property: "name",
      });
    }
    seen.add(name);
  }
}

function checkDuplicateLevelNames(building: Building, accept: ValidationAcceptor): void {
  const seen = new Set<string>();
  for (const level of building.levels) {
    const name = cleanName(level.name);
    if (seen.has(name)) {
      accept("error", `Duplicate level name '${name}'.`, {
        node: level,
        property: "name",
      });
    }
    seen.add(name);
  }
}

function checkDuplicateSiteNames(project: Project, accept: ValidationAcceptor): void {
  const seen = new Set<string>();
  for (const site of project.sites) {
    const name = cleanName(site.name);
    if (seen.has(name)) {
      accept("error", `Duplicate site name '${name}'.`, {
        node: site,
        property: "name",
      });
    }
    seen.add(name);
  }
}

// ============================================================================
// Position Validations
// ============================================================================

function checkOverlappingPositions(level: Level, accept: ValidationAcceptor): void {
  const positions = new Map<string, Space>();

  for (const space of level.spaces) {
    const positionProp = space.properties.find((p) => p.$type === "PositionProperty");
    if (!positionProp || positionProp.$type !== "PositionProperty") continue;

    const key = `${positionProp.row},${positionProp.col}`;
    const existing = positions.get(key);

    if (existing) {
      accept(
        "warning",
        `Space '${cleanName(space.name)}' overlaps with '${cleanName(existing.name)}' at position [${positionProp.row}, ${positionProp.col}].`,
        { node: positionProp }
      );
    } else {
      positions.set(key, space);
    }
  }
}

// ============================================================================
// Required Property Validations
// ============================================================================

function checkSpaceHasDimensions(space: Space, accept: ValidationAcceptor): void {
  const hasArea = space.properties.some((p) => p.$type === "AreaProperty");
  const hasWidth = space.properties.some((p) => p.$type === "WidthProperty");
  const hasLength = space.properties.some((p) => p.$type === "LengthProperty");

  if (!hasArea && !(hasWidth && hasLength)) {
    accept(
      "warning",
      `Space '${cleanName(space.name)}' has no dimensions specified. Provide 'area' or both 'width' and 'length'. Default size will be used.`,
      { node: space, property: "name" }
    );
  }

  // Check for incomplete width/length
  if ((hasWidth && !hasLength) || (!hasWidth && hasLength)) {
    accept(
      "warning",
      `Space '${cleanName(space.name)}' has ${hasWidth ? "width" : "length"} but not ${hasWidth ? "length" : "width"}. Both are required for explicit dimensions.`,
      { node: space, property: "name" }
    );
  }
}

function checkSpaceHasPosition(space: Space, accept: ValidationAcceptor): void {
  const hasPosition = space.properties.some((p) => p.$type === "PositionProperty");

  if (!hasPosition) {
    accept(
      "warning",
      `Space '${cleanName(space.name)}' has no position. It will be placed at [0, 0] which may overlap with other spaces.`,
      { node: space, property: "name" }
    );
  }
}

function checkLevelHasHeight(level: Level, accept: ValidationAcceptor): void {
  const hasHeight = level.properties.some((p) => p.$type === "HeightProperty");

  if (!hasHeight) {
    accept(
      "info",
      `Level '${cleanName(level.name)}' has no height specified. Default height of 3m will be used.`,
      { node: level, property: "name" }
    );
  }
}

// ============================================================================
// Helpers
// ============================================================================

function cleanName(name: string): string {
  if (name.startsWith('"') && name.endsWith('"')) {
    return name.slice(1, -1);
  }
  return name;
}

function getModelRoot(node: unknown): Model | undefined {
  let current = node as { $container?: unknown };
  while (current.$container) {
    current = current.$container as { $container?: unknown };
  }
  return current as Model | undefined;
}

function getLevelForDoor(door: SpaceDoor): Level | undefined {
  // door -> Space -> Level
  const space = door.$container;
  if (!space) return undefined;
  return space.$container as Level | undefined;
}
