/**
 * Parser tests for BIML v2.1 (types-only model)
 */

import { describe, test, expect, beforeAll } from "bun:test";
import { NodeFileSystem } from "langium/node";
import { URI } from "langium";
import * as path from "node:path";
import { createBimServices } from "../src/language/bim-module";
import { generateJsonIR } from "../src/generator";
import type { Model } from "../src/generated/ast";

const FIXTURES = path.resolve(__dirname, "fixtures");

async function parseFile(filePath: string): Promise<{
  model: Model | null;
  errors: string[];
  validationErrors: string[];
}> {
  const services = createBimServices(NodeFileSystem);
  const uri = URI.file(filePath);
  const document = await services.shared.workspace.LangiumDocumentFactory.fromUri(uri);
  await services.shared.workspace.DocumentBuilder.build([document], {
    validation: true,
  });

  const { lexerErrors, parserErrors } = document.parseResult;
  const allErrors = [
    ...lexerErrors.map(e => e.message),
    ...parserErrors.map(e => e.message),
  ];

  if (lexerErrors.length || parserErrors.length) {
    return { model: null, errors: allErrors, validationErrors: [] };
  }

  const validationErrors = (document.diagnostics ?? [])
    .filter(d => d.severity === 1)
    .map(d => d.message);

  return {
    model: document.parseResult.value as Model,
    errors: [],
    validationErrors,
  };
}

describe("BIML v2.1 Parser (types-only)", () => {
  describe("Simple fixture", () => {
    test("parses without syntax errors", async () => {
      const { model, errors } = await parseFile(path.join(FIXTURES, "simple.biml"));
      expect(errors).toEqual([]);
      expect(model).not.toBeNull();
    });

    test("parses library with materials and types (no families)", async () => {
      const { model } = await parseFile(path.join(FIXTURES, "simple.biml"));
      expect(model).not.toBeNull();
      expect(model!.libraries.length).toBe(1);
      
      const lib = model!.libraries[0];
      expect(lib.name).toBe("Doors");
      expect(lib.materials.length).toBe(2);
      // Types-only: no families, only types
      expect(lib.types.length).toBe(3); // Door, SingleDoor, InteriorDoor
    });

    test("parses type with parameters", async () => {
      const { model } = await parseFile(path.join(FIXTURES, "simple.biml"));
      const lib = model!.libraries[0];
      
      const doorType = lib.types.find(t => t.name === "Door");
      expect(doorType).toBeDefined();
      
      // Check that Door type has parameters
      const params = doorType!.members.filter(m => m.$type === "TypeParameter");
      expect(params.length).toBe(2); // width, height
    });

    test("parses type inheritance (: syntax)", async () => {
      const { model } = await parseFile(path.join(FIXTURES, "simple.biml"));
      const lib = model!.libraries[0];
      
      const singleDoor = lib.types.find(t => t.name === "SingleDoor");
      expect(singleDoor).toBeDefined();
      expect(singleDoor!.baseType?.$refText).toBe("Door");
    });

    test("parses building with level and walls", async () => {
      const { model } = await parseFile(path.join(FIXTURES, "simple.biml"));
      expect(model).not.toBeNull();
      expect(model!.buildings.length).toBe(1);
      
      const building = model!.buildings[0];
      expect(building.name).toBe("Simple Office");
      expect(building.levels.length).toBe(1);
      
      const level = building.levels[0];
      expect(level.name).toBe("Ground");
      
      // Count walls
      const walls = level.members.filter(m => m.$type === "Wall");
      expect(walls.length).toBe(5);
    });

    test("parses spaces with bounded_by", async () => {
      const { model } = await parseFile(path.join(FIXTURES, "simple.biml"));
      const level = model!.buildings[0].levels[0];
      
      const spaces = level.members.filter(m => m.$type === "Space");
      expect(spaces.length).toBe(2);
      
      const reception = spaces[0] as any;
      expect(reception.name).toBe("Reception");
      expect(reception.tags?.tags).toContain("public");
    });

    test("parses doors with wall reference and position", async () => {
      const { model } = await parseFile(path.join(FIXTURES, "simple.biml"));
      const level = model!.buildings[0].levels[0];
      
      const spaces = level.members.filter(m => m.$type === "Space") as any[];
      const reception = spaces[0];
      
      expect(reception.elements.length).toBe(1);
      const door = reception.elements[0];
      expect(door.$type).toBe("SpaceDoor");
      expect(door.name).toBe("Main Entry");
      // typeRef is a cross-reference, so we access the ref text
      expect(door.typeRef?.$refText).toBe("SingleDoor");
    });
  });

  describe("Comprehensive fixture", () => {
    test("parses without syntax errors", async () => {
      const { model, errors } = await parseFile(path.join(FIXTURES, "comprehensive.biml"));
      expect(errors).toEqual([]);
      expect(model).not.toBeNull();
    });

    test("parses multiple libraries", async () => {
      const { model } = await parseFile(path.join(FIXTURES, "comprehensive.biml"));
      expect(model!.libraries.length).toBe(4);
      
      const libNames = model!.libraries.map(l => l.name);
      expect(libNames).toContain("Materials");
      expect(libNames).toContain("Doors");
      expect(libNames).toContain("Windows");
      expect(libNames).toContain("Furniture");
    });

    test("parses multi-level type inheritance", async () => {
      const { model } = await parseFile(path.join(FIXTURES, "comprehensive.biml"));
      const doorsLib = model!.libraries.find(l => l.name === "Doors");
      
      // FireDoor : SingleDoor : Door (multi-level inheritance)
      const fireDoor = doorsLib!.types.find(t => t.name === "FireDoor");
      expect(fireDoor).toBeDefined();
      expect(fireDoor!.baseType?.$refText).toBe("SingleDoor");
      
      const singleDoor = doorsLib!.types.find(t => t.name === "SingleDoor");
      expect(singleDoor!.baseType?.$refText).toBe("Door");
    });

    test("parses building with site", async () => {
      const { model } = await parseFile(path.join(FIXTURES, "comprehensive.biml"));
      const building = model!.buildings[0];
      
      expect(building.site).toBeDefined();
      expect(building.site!.name).toBe("Downtown Campus");
    });

    test("parses building defaults", async () => {
      const { model } = await parseFile(path.join(FIXTURES, "comprehensive.biml"));
      const building = model!.buildings[0];
      
      expect(building.defaults).toBeDefined();
      expect(building.defaults!.properties.length).toBeGreaterThan(0);
    });

    test("parses multiple levels with relative elevation", async () => {
      const { model } = await parseFile(path.join(FIXTURES, "comprehensive.biml"));
      const building = model!.buildings[0];
      
      expect(building.levels.length).toBe(2);
      
      const level1 = building.levels[1];
      expect(level1.elevation.$type).toBe("RelativeElevation");
    });

    test("parses windows", async () => {
      const { model } = await parseFile(path.join(FIXTURES, "comprehensive.biml"));
      const level = model!.buildings[0].levels[0];
      
      const spaces = level.members.filter(m => m.$type === "Space") as any[];
      const openOffice = spaces.find(s => s.name === "Open Office");
      
      const windows = openOffice.elements.filter((e: any) => e.$type === "SpaceWindow");
      expect(windows.length).toBe(3);
    });

    test("parses furniture placement", async () => {
      const { model } = await parseFile(path.join(FIXTURES, "comprehensive.biml"));
      const level = model!.buildings[0].levels[0];
      
      const spaces = level.members.filter(m => m.$type === "Space") as any[];
      const lobby = spaces.find(s => s.name === "Lobby");
      
      const furniture = lobby.elements.filter((e: any) => e.$type === "SpaceFurniture");
      expect(furniture.length).toBe(2);
    });

    test("parses columns", async () => {
      const { model } = await parseFile(path.join(FIXTURES, "comprehensive.biml"));
      const level = model!.buildings[0].levels[0];
      
      const columns = level.members.filter(m => m.$type === "Column");
      expect(columns.length).toBe(1);
    });
  });

  describe("Invalid fixture", () => {
    test("parses but has validation errors", async () => {
      const { model, errors, validationErrors } = await parseFile(path.join(FIXTURES, "invalid.biml"));
      
      // Should parse without syntax errors
      expect(errors).toEqual([]);
      expect(model).not.toBeNull();
      
      // Should have validation errors for invalid references
      expect(validationErrors.length).toBeGreaterThan(0);
    });
  });
});

describe("BIML v2.1 Generator (types-only)", () => {
  test("generates valid JSON IR from simple fixture", async () => {
    const { model } = await parseFile(path.join(FIXTURES, "simple.biml"));
    expect(model).not.toBeNull();
    
    const ir = generateJsonIR(model!);
    
    expect(ir.version).toBe("2.1.0");
    expect(ir.libraries.length).toBe(1);
    expect(ir.buildings.length).toBe(1);
  });

  test("IR contains library with materials and types", async () => {
    const { model } = await parseFile(path.join(FIXTURES, "simple.biml"));
    const ir = generateJsonIR(model!);
    
    const lib = ir.libraries[0];
    expect(lib.name).toBe("Doors");
    expect(lib.materials.length).toBe(2);
    expect(lib.types.length).toBe(3); // Door, SingleDoor, InteriorDoor
    
    // Check base type Door has parameters
    const doorType = lib.types.find(t => t.name === "Door");
    expect(doorType).toBeDefined();
    expect(doorType!.parameters.length).toBe(2); // width, height
    
    // Check SingleDoor inherits from Door
    const singleDoor = lib.types.find(t => t.name === "SingleDoor");
    expect(singleDoor).toBeDefined();
    expect(singleDoor!.baseType).toBe("Door");
    expect(singleDoor!.material).toBe("WarmOak");
  });

  test("IR contains building with walls", async () => {
    const { model } = await parseFile(path.join(FIXTURES, "simple.biml"));
    const ir = generateJsonIR(model!);
    
    const building = ir.buildings[0];
    expect(building.name).toBe("Simple Office");
    
    const level = building.levels[0];
    expect(level.walls.length).toBe(5);
    
    const northWall = level.walls.find(w => w.name === "North");
    expect(northWall).toBeDefined();
    expect(northWall!.start.x).toBe(0);
    expect(northWall!.start.y).toBe(10);
    expect(northWall!.end.x).toBe(15);
    expect(northWall!.end.y).toBe(10);
  });

  test("IR contains spaces with doors", async () => {
    const { model } = await parseFile(path.join(FIXTURES, "simple.biml"));
    const ir = generateJsonIR(model!);
    
    const level = ir.buildings[0].levels[0];
    expect(level.spaces.length).toBe(2);
    
    const reception = level.spaces.find(s => s.name === "Reception");
    expect(reception).toBeDefined();
    expect(reception!.tags).toContain("public");
    expect(reception!.doors.length).toBe(1);
    
    const mainEntry = reception!.doors[0];
    expect(mainEntry.name).toBe("Main Entry");
    expect(mainEntry.typeRef).toBe("SingleDoor");
    expect(mainEntry.wall).toBe("South");
    expect(mainEntry.position.kind).toBe("absolute");
  });

  test("generates comprehensive IR with all features", async () => {
    const { model } = await parseFile(path.join(FIXTURES, "comprehensive.biml"));
    const ir = generateJsonIR(model!);
    
    expect(ir.libraries.length).toBe(4);
    expect(ir.buildings.length).toBe(1);
    
    const building = ir.buildings[0];
    expect(building.defaults).toBeDefined();
    expect(building.site).toBeDefined();
    expect(building.levels.length).toBe(2);
    
    // Check relative elevation
    const level1 = building.levels[1];
    expect(level1.elevation).toHaveProperty("ref");
  });

  test("type parameters are correctly serialized", async () => {
    const { model } = await parseFile(path.join(FIXTURES, "simple.biml"));
    const ir = generateJsonIR(model!);
    
    const lib = ir.libraries[0];
    const doorType = lib.types.find(t => t.name === "Door");
    
    // Check parameter definitions
    expect(doorType!.parameters.length).toBe(2);
    const widthParam = doorType!.parameters.find(p => p.name === "width");
    expect(widthParam).toBeDefined();
    expect(widthParam!.type).toBe("Length");
    expect(widthParam!.defaultValue?.kind).toBe("measurement");
  });

  test("type overrides are correctly serialized", async () => {
    const { model } = await parseFile(path.join(FIXTURES, "simple.biml"));
    const ir = generateJsonIR(model!);
    
    const lib = ir.libraries[0];
    const interiorDoor = lib.types.find(t => t.name === "InteriorDoor");
    
    // Check parameter override
    expect(interiorDoor!.overrides).toHaveProperty("width");
    expect(interiorDoor!.overrides.width.kind).toBe("measurement");
    expect(interiorDoor!.overrides.width.value).toBe(800);
  });
});
