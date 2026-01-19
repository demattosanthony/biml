/**
 * Parser tests for BIML
 */

import { describe, test, expect } from "bun:test";
import { NodeFileSystem } from "langium/node";
import { URI } from "langium";
import * as fs from "node:fs";
import * as path from "node:path";
import { createBimServices } from "../src/language/bim-module";
import { generateJsonIR } from "../src/generator";
import type { Model } from "../src/generated/ast";

const FIXTURES = path.resolve(__dirname, "fixtures");

function loadWithImports(filePath: string): string {
  const visited = new Set<string>();

  const loadFile = (currentPath: string): string => {
    const absolutePath = path.resolve(currentPath);
    if (visited.has(absolutePath)) {
      return "";
    }
    visited.add(absolutePath);

    const raw = fs.readFileSync(absolutePath, "utf-8");
    const lines = raw.split(/\r?\n/);
    const outputLines: string[] = [];

    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed.startsWith("param ") && trimmed.includes(" in ")) {
        outputLines.push(line.replace(/\s+in\s+.+$/, ""));
        continue;
      }
      if (trimmed.startsWith("import")) {
        const match = trimmed.match(/^import\s+"([^"]+)"\s*$/);
        if (!match) {
          throw new Error(`Unsupported import syntax: ${line}`);
        }
        const importPath = match[1];
        const resolved = importPath.startsWith("stdlib/")
          ? path.resolve(__dirname, "..", "stdlib", importPath.slice("stdlib/".length))
          : path.resolve(path.dirname(absolutePath), importPath);
        outputLines.push(loadFile(resolved));
        continue;
      }
      outputLines.push(line);
    }

    return outputLines.join("\n");
  };

  return loadFile(filePath);
}

async function parseFile(filePath: string): Promise<{
  model: Model | null;
  errors: string[];
}> {
  const services = createBimServices(NodeFileSystem);
  const uri = URI.file(filePath);
  const text = loadWithImports(filePath);
  const document = await services.shared.workspace.LangiumDocumentFactory.fromString(
    text,
    uri
  );
  await services.shared.workspace.DocumentBuilder.build([document], {
    validation: true,
  });

  const { lexerErrors, parserErrors } = document.parseResult;
  const allErrors = [
    ...lexerErrors.map((e) => e.message),
    ...parserErrors.map((e) => e.message),
  ];

  if (lexerErrors.length || parserErrors.length) {
    return { model: null, errors: allErrors };
  }

  return {
    model: document.parseResult.value as Model,
    errors: [],
  };
}

describe("BIML Parser", () => {
  describe("Simple fixture", () => {
    test("parses without syntax errors", async () => {
      const { model, errors } = await parseFile(path.join(FIXTURES, "simple.biml"));
      expect(errors).toEqual([]);
      expect(model).not.toBeNull();
    });

    test("parses library with materials and types (no families)", async () => {
      const { model } = await parseFile(path.join(FIXTURES, "simple.biml"));
      expect(model).not.toBeNull();
      expect(model!.libraries.length).toBe(3);
      
      const lib = model!.libraries[0];
      expect(lib.name).toBe("stdlib.doors");

      expect(lib.materials.length).toBeGreaterThan(0);
      expect(lib.types.length).toBeGreaterThan(0);
    });

    test("parses type with parameters", async () => {
    const { model } = await parseFile(path.join(FIXTURES, "simple.biml"));
    const lib = model!.libraries.find(l => l.name === "Doors")!;

    const doorType = lib.types.find(t => t.name === "Door");

      expect(doorType).toBeDefined();
      
      // Check that Door type has parameters
      const params = doorType!.members.filter(m => m.$type === "TypeParameter");
      expect(params.length).toBe(2); // width, height
    });

    test("parses type inheritance (: syntax)", async () => {
    const { model } = await parseFile(path.join(FIXTURES, "simple.biml"));
    const lib = model!.libraries.find(l => l.name === "Doors")!;

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
      expect(door.$type).toBe("Door");
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

    test("parses multi-level type inheritance", async () => {
      const { model } = await parseFile(path.join(FIXTURES, "comprehensive.biml"));
      const doorsLib = model!.libraries.find(l => l.name === "Doors");

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

      const windows = openOffice.elements.filter((e: any) => e.$type === "Window");
      expect(windows.length).toBe(3);
    });

    test("parses furniture placement", async () => {
      const { model } = await parseFile(path.join(FIXTURES, "comprehensive.biml"));
      const level = model!.buildings[0].levels[0];

      const spaces = level.members.filter(m => m.$type === "Space") as any[];
      const lobby = spaces.find(s => s.name === "Lobby");

      const furniture = lobby.elements.filter((e: any) => e.$type === "Furniture");
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
    test("parses invalid fixture (compiler validates later)", async () => {
      const { model, errors } = await parseFile(path.join(FIXTURES, "invalid.biml"));

      expect(errors).toEqual([]);
      expect(model).not.toBeNull();
    });
  });
});

describe("BIML Generator", () => {
  test("generates valid JSON IR from simple fixture", async () => {
    const { model } = await parseFile(path.join(FIXTURES, "simple.biml"));
    expect(model).not.toBeNull();
    
    const ir = generateJsonIR(model!);

    expect(ir.version).toBe("1.0.0");
    expect(ir.libraries.length).toBe(3);
    expect(ir.buildings.length).toBe(1);
  });

  test("IR contains library with materials and types", async () => {
    const { model } = await parseFile(path.join(FIXTURES, "simple.biml"));
    const ir = generateJsonIR(model!);
    
    const lib = ir.libraries.find(l => l.name === "Doors")!;
    expect(lib.name).toBe("Doors");
    expect(lib.materials.length).toBeGreaterThan(0);
    expect(lib.types.length).toBeGreaterThan(0);

    // Check base type Door has parameters
    const doorType = lib.types.find(t => t.name === "Door");
    expect(doorType).toBeDefined();
    expect(doorType!.parameters.length).toBeGreaterThan(0);

    // Check SingleDoor inherits from Door
    const singleDoor = lib.types.find(t => t.name === "SingleDoor");
    expect(singleDoor).toBeDefined();
    expect(singleDoor!.baseType).toBe("Door");
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
    
    expect(ir.libraries.length).toBe(8);
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
    
    const lib = ir.libraries.find(l => l.name === "Doors")!;
    const doorType = lib.types.find(t => t.name === "Door");

    // Check parameter definitions
    expect(doorType!.parameters.length).toBeGreaterThan(0);
    const widthParam = doorType!.parameters.find(p => p.name === "width");
    expect(widthParam).toBeDefined();
    expect(widthParam!.type).toBe("Length");
    expect(widthParam!.defaultValue?.kind).toBe("measurement");
  });

  test("type overrides are correctly serialized", async () => {
    const { model } = await parseFile(path.join(FIXTURES, "simple.biml"));
    const ir = generateJsonIR(model!);
    
    const lib = ir.libraries.find(l => l.name === "Doors")!;
    const interiorDoor = lib.types.find(t => t.name === "InteriorDoor");

    // Check parameter override
    expect(interiorDoor!.overrides).toHaveProperty("width");
    expect(interiorDoor!.overrides.width.kind).toBe("measurement");
    expect(interiorDoor!.overrides.width.value).toBe(800);
  });
});
