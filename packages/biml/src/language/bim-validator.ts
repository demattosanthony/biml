import type { ValidationAcceptor, ValidationChecks } from "langium";
import type {
  BimLangAstType,
  Model,
  Library,
  Type,
  Building,
  Level,
  Wall,
  Space,
  Door,
  SpaceDoor,
  Window,
  SpaceWindow,
  DoorConnectsProperty,
  BoundedByProperty,
} from "../generated/ast.js";

/**
 * BIML v2 Semantic Validator
 *
 * Validates semantic correctness of BIML models:
 * - Type references resolve correctly
 * - No duplicate names within scope
 * - Wall references in bounded_by exist
 * - Door/window wall references exist
 * - Connects references valid spaces
 */

export function registerValidationChecks(checks: ValidationChecks<BimLangAstType>) {
  // Type system validations
  checks.Type = [checkTypeBaseReference];

  // Door/Window validations
  checks.Door = [checkDoorWallReference, checkDoorTypeReference];
  checks.SpaceDoor = [checkSpaceDoorWallReference, checkSpaceDoorTypeReference, checkDoorConnectsReference];
  checks.Window = [checkWindowWallReference, checkWindowTypeReference];
  checks.SpaceWindow = [checkSpaceWindowWallReference, checkSpaceWindowTypeReference];

  // Space validations
  checks.Space = [checkSpaceBoundedBy];

  // Duplicate name validations
  checks.Library = [checkDuplicateFamilyNames, checkDuplicateTypeNames, checkDuplicateMaterialNames];
  checks.Level = [checkDuplicateWallNames, checkDuplicateSpaceNames];
  checks.Building = [checkDuplicateLevelNames];
}

// ============================================================================
// Type System Validations
// ============================================================================

function checkTypeBaseReference(type: Type, accept: ValidationAcceptor): void {
  if (type.baseFamily && !type.baseFamily.ref) {
    accept("error", `Family '${type.baseFamily.$refText}' not found.`, {
      node: type,
      property: "baseFamily",
    });
  }

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

function checkDoorWallReference(door: Door, accept: ValidationAcceptor): void {
  if (!door.wall.ref) {
    accept("error", `Wall '${door.wall.$refText}' not found on this level.`, {
      node: door,
      property: "wall",
    });
  }
}

function checkDoorTypeReference(door: Door, accept: ValidationAcceptor): void {
  if (door.typeRef && !door.typeRef.ref) {
    accept("error", `Door type '${door.typeRef.$refText}' not found in any library.`, {
      node: door,
      property: "typeRef",
    });
  }
}

function checkSpaceDoorWallReference(door: SpaceDoor, accept: ValidationAcceptor): void {
  if (!door.wall.ref) {
    accept("error", `Wall '${door.wall.$refText}' not found on this level.`, {
      node: door,
      property: "wall",
    });
  }
}

function checkSpaceDoorTypeReference(door: SpaceDoor, accept: ValidationAcceptor): void {
  if (door.typeRef && !door.typeRef.ref) {
    accept("error", `Door type '${door.typeRef.$refText}' not found in any library.`, {
      node: door,
      property: "typeRef",
    });
  }
}

function checkDoorConnectsReference(door: SpaceDoor, accept: ValidationAcceptor): void {
  if (!door.body) return;

  const connectsProperty = door.body.properties.find(
    (p) => p.$type === "DoorConnectsProperty"
  ) as DoorConnectsProperty | undefined;

  if (!connectsProperty) return;

  // Check 'from' reference
  if (connectsProperty.from && !connectsProperty.from.ref) {
    const refText = (connectsProperty.from as unknown as { $refText?: string }).$refText;
    if (refText && refText !== "this" && refText !== "exterior") {
      accept("error", `Space '${refText}' not found on this level.`, {
        node: connectsProperty,
        property: "from",
      });
    }
  }

  // Check 'to' reference
  if (connectsProperty.to && !connectsProperty.to.ref) {
    const refText = (connectsProperty.to as unknown as { $refText?: string }).$refText;
    if (refText && refText !== "this" && refText !== "exterior") {
      accept("error", `Space '${refText}' not found on this level.`, {
        node: connectsProperty,
        property: "to",
      });
    }
  }
}

// ============================================================================
// Window Validations
// ============================================================================

function checkWindowWallReference(window: Window, accept: ValidationAcceptor): void {
  if (!window.wall.ref) {
    accept("error", `Wall '${window.wall.$refText}' not found on this level.`, {
      node: window,
      property: "wall",
    });
  }
}

function checkWindowTypeReference(window: Window, accept: ValidationAcceptor): void {
  if (window.typeRef && !window.typeRef.ref) {
    accept("error", `Window type '${window.typeRef.$refText}' not found in any library.`, {
      node: window,
      property: "typeRef",
    });
  }
}

function checkSpaceWindowWallReference(window: SpaceWindow, accept: ValidationAcceptor): void {
  if (!window.wall.ref) {
    accept("error", `Wall '${window.wall.$refText}' not found on this level.`, {
      node: window,
      property: "wall",
    });
  }
}

function checkSpaceWindowTypeReference(window: SpaceWindow, accept: ValidationAcceptor): void {
  if (window.typeRef && !window.typeRef.ref) {
    accept("error", `Window type '${window.typeRef.$refText}' not found in any library.`, {
      node: window,
      property: "typeRef",
    });
  }
}

// ============================================================================
// Space Validations
// ============================================================================

function checkSpaceBoundedBy(space: Space, accept: ValidationAcceptor): void {
  const boundedByProp = space.properties.find(
    (p) => p.$type === "BoundedByProperty"
  ) as BoundedByProperty | undefined;

  if (!boundedByProp) return;

  for (const wallRef of boundedByProp.walls) {
    if (!wallRef.wall.ref) {
      accept("error", `Wall '${wallRef.wall.$refText}' not found on this level.`, {
        node: wallRef,
        property: "wall",
      });
    }
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

function checkDuplicateMaterialNames(library: Library, accept: ValidationAcceptor): void {
  const seen = new Set<string>();
  for (const material of library.materials) {
    if (seen.has(material.name)) {
      accept("error", `Duplicate material name '${material.name}'.`, {
        node: material,
        property: "name",
      });
    }
    seen.add(material.name);
  }
}

function checkDuplicateWallNames(level: Level, accept: ValidationAcceptor): void {
  const seen = new Set<string>();
  for (const member of level.members) {
    if (member.$type === "Wall") {
      const wall = member as Wall;
      const name = cleanName(wall.name);
      if (seen.has(name)) {
        accept("error", `Duplicate wall name '${name}' on level '${cleanName(level.name)}'.`, {
          node: wall,
          property: "name",
        });
      }
      seen.add(name);
    }
  }
}

function checkDuplicateSpaceNames(level: Level, accept: ValidationAcceptor): void {
  const seen = new Set<string>();
  for (const member of level.members) {
    if (member.$type === "Space") {
      const space = member as Space;
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

// ============================================================================
// Helpers
// ============================================================================

function cleanName(name: string): string {
  if (name.startsWith('"') && name.endsWith('"')) {
    return name.slice(1, -1);
  }
  return name;
}
