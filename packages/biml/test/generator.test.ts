import { describe, it, expect, beforeAll } from "bun:test";
import { NodeFileSystem } from "langium/node";
import { URI } from "langium";
import * as path from "node:path";
import * as url from "node:url";
import { createBimServices } from "../src/language/bim-module";
import { generateJsonIR, type JsonIR } from "../src/generator";
import type { Model } from "../src/generated/ast";

const __dirname = url.fileURLToPath(new URL(".", import.meta.url));

describe("JSON IR Generator", () => {
  let services: ReturnType<typeof createBimServices>;

  beforeAll(() => {
    services = createBimServices(NodeFileSystem);
  });

  async function parseAndGenerate(text: string): Promise<JsonIR> {
    const uri = URI.parse("memory://test.biml");
    const document =
      services.shared.workspace.LangiumDocumentFactory.fromString(text, uri);

    await services.shared.workspace.DocumentBuilder.build([document], {
      validation: true,
    });

    const model = document.parseResult.value as Model;
    return generateJsonIR(model);
  }

  async function parseFileAndGenerate(filename: string): Promise<JsonIR> {
    const filePath = path.join(__dirname, "fixtures", filename);
    const uri = URI.file(filePath);
    const document =
      await services.shared.workspace.LangiumDocumentFactory.fromUri(uri);

    await services.shared.workspace.DocumentBuilder.build([document], {
      validation: true,
    });

    const model = document.parseResult.value as Model;
    return generateJsonIR(model);
  }

  it("generates correct JSON IR structure for empty model", async () => {
    const ir = await parseAndGenerate("");

    expect(ir.version).toBe("0.3.0");
    expect(ir.libraries).toBeUndefined();
    expect(ir.projects).toBeUndefined();
  });

  it("generates library with family and parameters", async () => {
    const ir = await parseAndGenerate(`
      library "TestLib" {
        family Door {
          parameter width: Length = 900mm
          parameter height: Length = 2100mm
        }
      }
    `);

    expect(ir.version).toBe("0.3.0");
    expect(ir.libraries).toHaveLength(1);

    const lib = ir.libraries![0];
    expect(lib.name).toBe("TestLib");
    expect(lib.families).toHaveLength(1);
    expect(lib.families[0].name).toBe("Door");
    expect(lib.families[0].parameters).toHaveLength(2);
    expect(lib.families[0].parameters[0].name).toBe("width");
    expect(lib.families[0].parameters[0].paramType).toBe("Length");
    expect(lib.families[0].parameters[0].defaultValue).toEqual({
      kind: "measurement",
      value: 900,
      unit: "mm",
    });
  });

  it("generates types that extend families", async () => {
    const ir = await parseAndGenerate(`
      library "Doors" {
        family Door {
          parameter width: Length = 900mm
          parameter height: Length = 2100mm
        }

        type SingleFlush extends Door { }
        type DoubleDoor extends Door {
          width = 1800mm
        }
      }
    `);

    const lib = ir.libraries![0];
    expect(lib.types).toHaveLength(2);

    // SingleFlush inherits defaults
    expect(lib.types[0].name).toBe("SingleFlush");
    expect(lib.types[0].family).toBe("Door");
    expect(lib.types[0].parameters).toHaveLength(2);

    // DoubleDoor overrides width
    expect(lib.types[1].name).toBe("DoubleDoor");
    const doubleDoorWidth = lib.types[1].parameters.find(p => p.name === "width");
    expect(doubleDoorWidth?.value).toEqual({ value: 1800, unit: "mm" });
  });

  it("generates project hierarchy", async () => {
    const ir = await parseAndGenerate(`
      project "Test Project" {
        site "Main Site" {
          building "Building A" {
            level "Ground" {
              elevation: 0m
              height: 3.5m

              space "Lobby" {
                position: [0, 0]
                area: 100m²
              }
            }
          }
        }
      }
    `);

    expect(ir.projects).toHaveLength(1);
    const project = ir.projects![0];
    expect(project.name).toBe("Test Project");
    expect(project.sites).toHaveLength(1);

    const site = project.sites[0];
    expect(site.name).toBe("Main Site");
    expect(site.buildings).toHaveLength(1);

    const building = site.buildings[0];
    expect(building.name).toBe("Building A");
    expect(building.levels).toHaveLength(1);

    const level = building.levels[0];
    expect(level.name).toBe("Ground");
    expect(level.elevation).toEqual({ value: 0, unit: "m" });
    expect(level.height).toEqual({ value: 3.5, unit: "m" });
    expect(level.spaces).toHaveLength(1);

    const space = level.spaces[0];
    expect(space.name).toBe("Lobby");
    expect(space.position).toEqual({ row: 0, col: 0 });
    expect(space.area).toEqual({ value: 100, unit: "m²" });
  });

  it("generates spaces with doors referencing types", async () => {
    const ir = await parseAndGenerate(`
      library "Doors" {
        family Door {
          parameter width: Length = 900mm
        }
        type SingleFlush extends Door { }
      }

      project "Test" {
        site "Site" {
          building "Bldg" {
            level "L1" {
              elevation: 0m
              height: 3m
              space "Room1" {
                position: [0, 0]
                area: 25m²
                door "D1": SingleFlush {
                  wall: south
                }
              }
            }
          }
        }
      }
    `);

    const space = ir.projects![0].sites[0].buildings[0].levels[0].spaces[0];
    expect(space.doors).toHaveLength(1);
    expect(space.doors[0].name).toBe("D1");
    expect(space.doors[0].typeRef).toBe("SingleFlush");
    expect(space.doors[0].wall).toBe("south");
  });

  it("generates spaces with width and length instead of area", async () => {
    const ir = await parseAndGenerate(`
      project "Test" {
        site "Site" {
          building "Bldg" {
            level "L1" {
              elevation: 0m
              height: 3m
              space "Hallway" {
                position: [0, 1]
                width: 2.5m
                length: 15m
              }
            }
          }
        }
      }
    `);

    const space = ir.projects![0].sites[0].buildings[0].levels[0].spaces[0];
    expect(space.name).toBe("Hallway");
    expect(space.width).toEqual({ value: 2.5, unit: "m" });
    expect(space.length).toEqual({ value: 15, unit: "m" });
  });

  it("generates correct IR from hierarchical.biml fixture", async () => {
    const ir = await parseFileAndGenerate("hierarchical.biml");

    // Should use v0.3.0 format
    expect(ir.version).toBe("0.3.0");

    // Check libraries
    expect(ir.libraries).toHaveLength(1);
    const lib = ir.libraries![0];
    expect(lib.name).toBe("Doors");
    expect(lib.families).toHaveLength(1);
    expect(lib.families[0].name).toBe("Door");
    expect(lib.families[0].parameters).toHaveLength(2);
    expect(lib.families[0].parameters[0].name).toBe("width");
    expect(lib.families[0].parameters[0].paramType).toBe("Length");

    // Check types
    expect(lib.types).toHaveLength(3);
    expect(lib.types[0].name).toBe("SingleFlush");
    expect(lib.types[0].family).toBe("Door");
    // SingleFlush inherits defaults from Door
    expect(lib.types[0].parameters).toHaveLength(2);

    expect(lib.types[1].name).toBe("Corridor90");
    expect(lib.types[2].name).toBe("DoubleDoor");
    // DoubleDoor overrides width
    const doubleDoorWidth = lib.types[2].parameters.find(p => p.name === "width");
    expect(doubleDoorWidth?.value).toEqual({ value: 1800, unit: "mm" });

    // Check projects
    expect(ir.projects).toHaveLength(1);
    const project = ir.projects![0];
    expect(project.name).toBe("Test Building");
    expect(project.sites).toHaveLength(1);
    expect(project.sites[0].name).toBe("Site A");
    expect(project.sites[0].buildings).toHaveLength(1);

    const building = project.sites[0].buildings[0];
    expect(building.name).toBe("Building 1");
    expect(building.levels).toHaveLength(2);

    // Check ground level
    const ground = building.levels[0];
    expect(ground.name).toBe("Ground");
    expect(ground.elevation).toEqual({ value: 0, unit: "m" });
    expect(ground.height).toEqual({ value: 3.5, unit: "m" });
    expect(ground.spaces).toHaveLength(2);

    // Check Lobby space
    const lobby = ground.spaces[0];
    expect(lobby.name).toBe("Lobby");
    expect(lobby.position).toEqual({ row: 0, col: 0 });
    expect(lobby.area).toEqual({ value: 50, unit: "m²" });
    expect(lobby.doors).toHaveLength(1);
    expect(lobby.doors[0].name).toBe("D1");
    expect(lobby.doors[0].typeRef).toBe("SingleFlush");

    // Check Office 101 space with door override
    const office = ground.spaces[1];
    expect(office.name).toBe("Office 101");
    expect(office.doors[0].name).toBe("D2");
    expect(office.doors[0].typeRef).toBe("Corridor90");
    expect(office.doors[0].wall).toBe("north");
  });
});
