/**
 * Generator tests for BIML
 * Tests the JSON IR generation from parsed BIML models
 */

import { describe, test, expect } from "bun:test";
import { NodeFileSystem } from "langium/node";
import { URI } from "langium";
import { createBimServices } from "../src/language/bim-module";
import { generateJsonIR, type JsonIR } from "../src/generator";
import type { Model } from "../src/generated/ast";

// ============================================================================
// Test Helpers
// ============================================================================

async function parseAndGenerate(text: string): Promise<JsonIR> {
  const services = createBimServices(NodeFileSystem);
  const uri = URI.parse("memory://test.biml");
  const document = services.shared.workspace.LangiumDocumentFactory.fromString(
    text,
    uri
  );

  await services.shared.workspace.DocumentBuilder.build([document], {
    validation: true,
  });

  const model = document.parseResult.value as Model;
  return generateJsonIR(model);
}

// ============================================================================
// Empty Model Tests
// ============================================================================

describe("BIML Generator", () => {
  describe("Empty Model", () => {
    test("generates correct IR structure for empty model", async () => {
      const ir = await parseAndGenerate("");

      expect(ir.version).toBe("1.0.0");
      expect(ir.libraries).toEqual([]);
      expect(ir.buildings).toEqual([]);
    });
  });

  // ==========================================================================
  // Library Generation Tests
  // ==========================================================================

  describe("Library Generation", () => {
    test("generates library with name", async () => {
      const ir = await parseAndGenerate(`
        library "TestLib" { }
      `);

      expect(ir.libraries).toHaveLength(1);
      expect(ir.libraries[0].name).toBe("TestLib");
      expect(ir.libraries[0].materials).toEqual([]);
      expect(ir.libraries[0].types).toEqual([]);
    });

    test("generates multiple libraries", async () => {
      const ir = await parseAndGenerate(`
        library "Lib1" { }
        library "Lib2" { }
      `);

      expect(ir.libraries).toHaveLength(2);
      expect(ir.libraries[0].name).toBe("Lib1");
      expect(ir.libraries[1].name).toBe("Lib2");
    });
  });

  // ==========================================================================
  // Material Generation Tests
  // ==========================================================================

  describe("Material Generation", () => {
    test("generates material with named color", async () => {
      const ir = await parseAndGenerate(`
        library "Materials" {
          material Oak {
            color: oak
          }
        }
      `);

      expect(ir.libraries[0].materials).toHaveLength(1);
      const mat = ir.libraries[0].materials[0];
      expect(mat.name).toBe("Oak");
      expect(mat.color).toEqual({ red: 0.76, green: 0.60, blue: 0.42 });
    });

    test("generates material with RGB color", async () => {
      const ir = await parseAndGenerate(`
        library "Materials" {
          material Custom {
            color: rgb(0.5, 0.5, 0.5)
          }
        }
      `);

      const mat = ir.libraries[0].materials[0];
      expect(mat.color).toEqual({ red: 0.5, green: 0.5, blue: 0.5 });
    });

    test("generates material with hex color", async () => {
      const ir = await parseAndGenerate(`
        library "Materials" {
          material Custom {
            color: #FF5500
          }
        }
      `);

      const mat = ir.libraries[0].materials[0];
      expect(mat.color).toEqual({ red: 1, green: 0.3333333333333333, blue: 0 });
    });

    test("generates material with transparency", async () => {
      const ir = await parseAndGenerate(`
        library "Materials" {
          material Glass {
            color: glass
            transparency: 0.3
          }
        }
      `);

      const mat = ir.libraries[0].materials[0];
      expect(mat.transparency).toBe(0.3);
    });

    test("generates multiple materials", async () => {
      const ir = await parseAndGenerate(`
        library "Materials" {
          material Oak { color: oak }
          material Steel { color: steel }
          material Concrete { color: concrete }
        }
      `);

      expect(ir.libraries[0].materials).toHaveLength(3);
      expect(ir.libraries[0].materials.map(m => m.name)).toEqual([
        "Oak",
        "Steel",
        "Concrete",
      ]);
    });
  });

  // ==========================================================================
  // Type Generation Tests
  // ==========================================================================

  describe("Type Generation", () => {
    test("generates type with parameters", async () => {
      const ir = await parseAndGenerate(`
        library "Doors" {
          type Door {
            param width: Length = 900mm
            param height: Length = 2100mm
          }
        }
      `);

      expect(ir.libraries[0].types).toHaveLength(1);
      const doorType = ir.libraries[0].types[0];
      expect(doorType.name).toBe("Door");
      expect(doorType.parameters).toHaveLength(2);

      expect(doorType.parameters[0].name).toBe("width");
      expect(doorType.parameters[0].type).toBe("Length");
      expect(doorType.parameters[0].defaultValue).toEqual({
        kind: "measurement",
        value: 900,
        unit: "mm",
      });

      expect(doorType.parameters[1].name).toBe("height");
      expect(doorType.parameters[1].type).toBe("Length");
      expect(doorType.parameters[1].defaultValue).toEqual({
        kind: "measurement",
        value: 2100,
        unit: "mm",
      });
    });

    test("generates type with inheritance", async () => {
      const ir = await parseAndGenerate(`
        library "Doors" {
          type Door {
            param width: Length = 900mm
          }
          type SingleDoor : Door { }
        }
      `);

      expect(ir.libraries[0].types).toHaveLength(2);
      const singleDoor = ir.libraries[0].types[1];
      expect(singleDoor.name).toBe("SingleDoor");
      expect(singleDoor.baseType).toBe("Door");
    });

    test("generates type with parameter overrides", async () => {
      const ir = await parseAndGenerate(`
        library "Doors" {
          type Door {
            param width: Length = 900mm
          }
          type DoubleDoor : Door {
            width = 1800mm
          }
        }
      `);

      const doubleDoor = ir.libraries[0].types[1];
      expect(doubleDoor.baseType).toBe("Door");
      expect(doubleDoor.overrides).toEqual({
        width: { kind: "measurement", value: 1800, unit: "mm" },
      });
    });

    test("generates type with material reference", async () => {
      const ir = await parseAndGenerate(`
        library "Doors" {
          material WoodOak { color: oak }
          type SingleDoor {
            material: WoodOak
          }
        }
      `);

      const doorType = ir.libraries[0].types[0];
      expect(doorType.material).toBe("WoodOak");
    });

    test("generates type with export_class", async () => {
      const ir = await parseAndGenerate(`
        library "Doors" {
          type Door {
            export_class: Door
          }
        }
      `);

      const doorType = ir.libraries[0].types[0];
      expect(doorType.exportClass).toBe("Door");
    });

    test("generates type with all members", async () => {
      const ir = await parseAndGenerate(`
        library "Doors" {
          material WoodOak { color: oak }
          type Door {
            param width: Length = 900mm
            param height: Length = 2100mm
            export_class: Door
          }
          type SingleDoor : Door {
            width = 850mm
            material: WoodOak
          }
        }
      `);

      const singleDoor = ir.libraries[0].types[1];
      expect(singleDoor.name).toBe("SingleDoor");
      expect(singleDoor.baseType).toBe("Door");
      expect(singleDoor.overrides).toEqual({
        width: { kind: "measurement", value: 850, unit: "mm" },
      });
      expect(singleDoor.material).toBe("WoodOak");
    });
  });

  // ==========================================================================
  // Building Generation Tests
  // ==========================================================================

  describe("Building Generation", () => {
    test("generates building with name", async () => {
      const ir = await parseAndGenerate(`
        building "Test Building" {
          level "L1" at 0m { }
        }
      `);

      expect(ir.buildings).toHaveLength(1);
      expect(ir.buildings[0].name).toBe("Test Building");
    });

    test("generates building with defaults", async () => {
      const ir = await parseAndGenerate(`
        building "Test Building" {
          defaults {
            wall_thickness: 200mm
            floor_thickness: 150mm
            ceiling_height: 2700mm
            door_height: 2100mm
            window_sill: 900mm
          }
          level "L1" at 0m { }
        }
      `);

      const defaults = ir.buildings[0].defaults;
      expect(defaults).toBeDefined();
      expect(defaults?.wallThickness).toEqual({ value: 200, unit: "mm" });
      expect(defaults?.floorThickness).toEqual({ value: 150, unit: "mm" });
      expect(defaults?.ceilingHeight).toEqual({ value: 2700, unit: "mm" });
      expect(defaults?.doorHeight).toEqual({ value: 2100, unit: "mm" });
      expect(defaults?.windowSill).toEqual({ value: 900, unit: "mm" });
    });

    test("generates building with site", async () => {
      const ir = await parseAndGenerate(`
        building "Test Building" {
          site "Campus" at (37.7749, -122.4194)
          level "L1" at 0m { }
        }
      `);

      expect(ir.buildings[0].site).toBeDefined();
      expect(ir.buildings[0].site?.name).toBe("Campus");
      expect(ir.buildings[0].site?.location).toEqual({
        latitude: 37.7749,
        longitude: -122.4194,
      });
    });
  });

  // ==========================================================================
  // Level Generation Tests
  // ==========================================================================

  describe("Level Generation", () => {
    test("generates level with absolute elevation", async () => {
      const ir = await parseAndGenerate(`
        building "B" {
          level "Ground" at 0m { }
        }
      `);

      const level = ir.buildings[0].levels[0];
      expect(level.name).toBe("Ground");
      expect(level.elevation).toEqual({ value: 0, unit: "m" });
    });

    test("generates level with height", async () => {
      const ir = await parseAndGenerate(`
        building "B" {
          level "Ground" at 0m, height: 3.5m { }
        }
      `);

      const level = ir.buildings[0].levels[0];
      expect(level.height).toEqual({ value: 3.5, unit: "m" });
    });

    test("generates multiple levels", async () => {
      const ir = await parseAndGenerate(`
        building "B" {
          level "Ground" at 0m, height: 4m { }
          level "First" at 4m, height: 3.5m { }
          level "Second" at 7.5m, height: 3.5m { }
        }
      `);

      expect(ir.buildings[0].levels).toHaveLength(3);
      expect(ir.buildings[0].levels.map(l => l.name)).toEqual([
        "Ground",
        "First",
        "Second",
      ]);
    });
  });

  // ==========================================================================
  // Wall Generation Tests
  // ==========================================================================

  describe("Wall Generation", () => {
    test("generates wall with coordinates", async () => {
      const ir = await parseAndGenerate(`
        building "B" {
          level "L1" at 0m {
            wall "North" from (0, 10) to (15, 10)
          }
        }
      `);

      const level = ir.buildings[0].levels[0];
      expect(level.walls).toHaveLength(1);
      const wall = level.walls[0];
      expect(wall.name).toBe("North");
      expect(wall.start).toEqual({ x: 0, y: 10 });
      expect(wall.end).toEqual({ x: 15, y: 10 });
    });

    test("generates multiple walls", async () => {
      const ir = await parseAndGenerate(`
        building "B" {
          level "L1" at 0m {
            wall "North" from (0, 10) to (15, 10)
            wall "East" from (15, 10) to (15, 0)
            wall "South" from (15, 0) to (0, 0)
            wall "West" from (0, 0) to (0, 10)
          }
        }
      `);

      const level = ir.buildings[0].levels[0];
      expect(level.walls).toHaveLength(4);
      expect(level.walls.map(w => w.name)).toEqual([
        "North",
        "East",
        "South",
        "West",
      ]);
    });

    test("generates wall with properties", async () => {
      const ir = await parseAndGenerate(`
        building "B" {
          level "L1" at 0m {
            wall "North" from (0, 10) to (15, 10) {
              thickness: 300mm
              height: 3m
            }
          }
        }
      `);

      const wall = ir.buildings[0].levels[0].walls[0];
      expect(wall.thickness).toEqual({ value: 300, unit: "mm" });
      expect(wall.height).toEqual({ value: 3, unit: "m" });
    });
  });

  // ==========================================================================
  // Space Generation Tests
  // ==========================================================================

  describe("Space Generation", () => {
    test("generates space with name and tags", async () => {
      const ir = await parseAndGenerate(`
        building "B" {
          level "L1" at 0m {
            wall "W1" from (0, 10) to (10, 10)
            space "Reception" [public, reception] {
              bounded_by: ["W1"]
            }
          }
        }
      `);

      const space = ir.buildings[0].levels[0].spaces[0];
      expect(space.name).toBe("Reception");
      expect(space.tags).toEqual(["public", "reception"]);
    });

    test("generates space with bounded_by", async () => {
      const ir = await parseAndGenerate(`
        building "B" {
          level "L1" at 0m {
            wall "North" from (0, 10) to (10, 10)
            wall "East" from (10, 10) to (10, 0)
            wall "South" from (10, 0) to (0, 0)
            wall "West" from (0, 0) to (0, 10)
            space "Room" [office] {
              bounded_by: ["North", "East", "South", "West"]
            }
          }
        }
      `);

      const space = ir.buildings[0].levels[0].spaces[0];
      expect(space.boundedBy).toHaveLength(4);
      expect(space.boundedBy?.map(b => b.wall)).toEqual([
        "North",
        "East",
        "South",
        "West",
      ]);
    });

    test("generates space without floor and ceiling (basic)", async () => {
      const ir = await parseAndGenerate(`
        building "B" {
          level "L1" at 0m {
            wall "W" from (0, 0) to (10, 0)
            space "Room" [office] {
              bounded_by: ["W"]
            }
          }
        }
      `);

      const space = ir.buildings[0].levels[0].spaces[0];
      expect(space.floor).toBeUndefined();
      expect(space.ceiling).toBeUndefined();
    });
  });

  // ==========================================================================
  // Door Generation Tests
  // ==========================================================================

  describe("Door Generation", () => {
    test("generates door with type reference and position", async () => {
      const ir = await parseAndGenerate(`
        library "Doors" {
          type SingleDoor {
            param width: Length = 900mm
          }
        }
        building "B" {
          level "L1" at 0m {
            wall "South" from (0, 0) to (10, 0)
            space "Room" [] {
              bounded_by: ["South"]
              door "D1": SingleDoor in "South" at 5m { }
            }
          }
        }
      `);

      const space = ir.buildings[0].levels[0].spaces[0];
      expect(space.doors).toHaveLength(1);
      const door = space.doors[0];
      expect(door.name).toBe("D1");
      expect(door.typeRef).toBe("SingleDoor");
      expect(door.wall).toBe("South");
      expect(door.position).toEqual({
        kind: "absolute",
        value: { value: 5, unit: "m" },
      });
    });

    test("generates door with center position", async () => {
      const ir = await parseAndGenerate(`
        library "Doors" {
          type SingleDoor { }
        }
        building "B" {
          level "L1" at 0m {
            wall "South" from (0, 0) to (10, 0)
            space "Room" [] {
              bounded_by: ["South"]
              door "D1": SingleDoor in "South" at center { }
            }
          }
        }
      `);

      const door = ir.buildings[0].levels[0].spaces[0].doors[0];
      expect(door.position).toEqual({ kind: "center" });
    });

    test("generates door with properties", async () => {
      const ir = await parseAndGenerate(`
        library "Doors" {
          type SingleDoor { }
        }
        building "B" {
          level "L1" at 0m {
            wall "South" from (0, 0) to (10, 0)
            space "Room1" [] { bounded_by: ["South"] }
            space "Room2" [] { bounded_by: ["South"] }
            door "D1": SingleDoor in "South" at 5m {
              width: 1000mm
              height: 2200mm
              swing: inward
              connects: "Room1" <-> "Room2"
            }
          }
        }
      `);

      const door = ir.buildings[0].levels[0].doors[0];
      expect(door.width).toEqual({ value: 1000, unit: "mm" });
      expect(door.height).toEqual({ value: 2200, unit: "mm" });
      expect(door.swing).toBe("inward");
      expect(door.connects).toEqual({ from: "Room1", to: "Room2" });
    });
  });

  // ==========================================================================
  // Window Generation Tests
  // ==========================================================================

  describe("Window Generation", () => {
    test("generates window with type reference and position", async () => {
      const ir = await parseAndGenerate(`
        library "Windows" {
          type FixedWindow { }
        }
        building "B" {
          level "L1" at 0m {
            wall "South" from (0, 0) to (10, 0)
            space "Room" [] {
              bounded_by: ["South"]
              window "W1": FixedWindow in "South" at 2m { }
            }
          }
        }
      `);

      const space = ir.buildings[0].levels[0].spaces[0];
      expect(space.windows).toHaveLength(1);
      const window = space.windows[0];
      expect(window.name).toBe("W1");
      expect(window.typeRef).toBe("FixedWindow");
      expect(window.wall).toBe("South");
      expect(window.position).toEqual({
        kind: "absolute",
        value: { value: 2, unit: "m" },
      });
    });

    test("generates window with properties", async () => {
      const ir = await parseAndGenerate(`
        library "Windows" {
          type FixedWindow { }
        }
        building "B" {
          level "L1" at 0m {
            wall "South" from (0, 0) to (10, 0)
            window "W1": FixedWindow in "South" at 2m {
              width: 1500mm
              height: 1200mm
              sill: 1000mm
            }
          }
        }
      `);

      const window = ir.buildings[0].levels[0].windows[0];
      expect(window.width).toEqual({ value: 1500, unit: "mm" });
      expect(window.height).toEqual({ value: 1200, unit: "mm" });
      expect(window.sill).toEqual({ value: 1000, unit: "mm" });
    });
  });

  // ==========================================================================
  // Column Generation Tests
  // ==========================================================================

  describe("Column Generation", () => {
    test("generates column with position", async () => {
      const ir = await parseAndGenerate(`
        library "Columns" {
          type SteelColumn { }
        }
        building "B" {
          level "L1" at 0m {
            column "C1": SteelColumn at (5, 5) { }
          }
        }
      `);

      const column = ir.buildings[0].levels[0].columns[0];
      expect(column.name).toBe("C1");
      expect(column.typeRef).toBe("SteelColumn");
      expect(column.position).toEqual({ x: 5, y: 5 });
    });

    test("generates column with dimensions", async () => {
      const ir = await parseAndGenerate(`
        library "Columns" {
          type SteelColumn { }
        }
        building "B" {
          level "L1" at 0m {
            column "C1": SteelColumn at (5, 5) {
              width: 400mm
              depth: 400mm
              height: 3m
            }
          }
        }
      `);

      const column = ir.buildings[0].levels[0].columns[0];
      expect(column.width).toEqual({ value: 400, unit: "mm" });
      expect(column.depth).toEqual({ value: 400, unit: "mm" });
      expect(column.height).toEqual({ value: 3, unit: "m" });
    });
  });

  // ==========================================================================
  // Furniture Generation Tests
  // ==========================================================================

  describe("Furniture Generation", () => {
    test("generates furniture placement", async () => {
      const ir = await parseAndGenerate(`
        library "Furniture" {
          type Desk { }
        }
        building "B" {
          level "L1" at 0m {
            wall "W" from (0, 0) to (10, 0)
            space "Office" [] {
              bounded_by: ["W"]
              place Desk at (3, 5)
            }
          }
        }
      `);

      const space = ir.buildings[0].levels[0].spaces[0];
      expect(space.furniture).toHaveLength(1);
      const furniture = space.furniture[0];
      expect(furniture.typeRef).toBe("Desk");
      expect(furniture.position).toEqual({ x: 3, y: 5 });
    });

    test("generates furniture with name and facing", async () => {
      const ir = await parseAndGenerate(`
        library "Furniture" {
          type Desk { }
        }
        building "B" {
          level "L1" at 0m {
            wall "W" from (0, 0) to (10, 0)
            space "Office" [] {
              bounded_by: ["W"]
              place Desk "My Desk" at (3, 5), facing north
            }
          }
        }
      `);

      const furniture = ir.buildings[0].levels[0].spaces[0].furniture[0];
      expect(furniture.name).toBe("My Desk");
      expect(furniture.facing).toBe("north");
    });
  });

  // ==========================================================================
  // Slab Generation Tests
  // ==========================================================================

  describe("Slab Generation", () => {
    test("generates slab with boundary", async () => {
      const ir = await parseAndGenerate(`
        building "B" {
          level "L1" at 0m {
            slab "Floor" {
              boundary: [(0, 0), (10, 0), (10, 10), (0, 10)]
              thickness: 200mm
              type: floor
            }
          }
        }
      `);

      const slab = ir.buildings[0].levels[0].slabs[0];
      expect(slab.name).toBe("Floor");
      expect(slab.boundary).toEqual([
        { x: 0, y: 0 },
        { x: 10, y: 0 },
        { x: 10, y: 10 },
        { x: 0, y: 10 },
      ]);
      expect(slab.thickness).toEqual({ value: 200, unit: "mm" });
      expect(slab.type).toBe("floor");
    });

    test("generates slab with roof type", async () => {
      const ir = await parseAndGenerate(`
        building "B" {
          level "L1" at 0m {
            slab "Roof" {
              boundary: [(0, 0), (10, 0), (10, 10), (0, 10)]
              thickness: 150mm
              type: roof
            }
          }
        }
      `);

      const slab = ir.buildings[0].levels[0].slabs[0];
      expect(slab.name).toBe("Roof");
      expect(slab.type).toBe("roof");
    });
  });

  // ==========================================================================
  // Integration Tests
  // ==========================================================================

  describe("Integration", () => {
    test("generates complete office layout", async () => {
      const ir = await parseAndGenerate(`
        library "Doors" {
          material Oak { color: oak }
          type Door {
            param width: Length = 900mm
            param height: Length = 2100mm
          }
          type SingleDoor : Door {
            material: Oak
          }
        }
        building "Office" {
          defaults {
            wall_thickness: 200mm
          }
          level "Ground" at 0m, height: 3.5m {
            wall "North" from (0, 10) to (15, 10)
            wall "East" from (15, 10) to (15, 0)
            wall "South" from (15, 0) to (0, 0)
            wall "West" from (0, 0) to (0, 10)
            wall "Interior" from (8, 0) to (8, 10)

            space "Reception" [public] {
              bounded_by: ["South", "Interior", "North", "West"]

              door "Entry": SingleDoor in "South" at 4m {
                swing: outward
              }
            }

            space "Office" [private] {
              bounded_by: ["Interior", "East", "North", "South"]
            }
          }
        }
      `);

      // Verify overall structure
      expect(ir.version).toBe("1.0.0");
      expect(ir.libraries).toHaveLength(1);
      expect(ir.buildings).toHaveLength(1);

      // Verify building
      const building = ir.buildings[0];
      expect(building.name).toBe("Office");
      expect(building.defaults?.wallThickness).toEqual({ value: 200, unit: "mm" });

      // Verify level
      const level = building.levels[0];
      expect(level.name).toBe("Ground");
      expect(level.elevation).toEqual({ value: 0, unit: "m" });
      expect(level.height).toEqual({ value: 3.5, unit: "m" });
      expect(level.walls).toHaveLength(5);
      expect(level.spaces).toHaveLength(2);

      // Verify spaces
      const reception = level.spaces[0];
      expect(reception.name).toBe("Reception");
      expect(reception.tags).toEqual(["public"]);
      expect(reception.doors).toHaveLength(1);

      // Verify door
      const entryDoor = reception.doors[0];
      expect(entryDoor.name).toBe("Entry");
      expect(entryDoor.typeRef).toBe("SingleDoor");
      expect(entryDoor.swing).toBe("outward");

      const office = level.spaces[1];
      expect(office.name).toBe("Office");
      expect(office.tags).toEqual(["private"]);
    });
  });
});
