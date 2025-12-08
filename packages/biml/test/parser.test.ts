import { describe, it, expect, beforeAll } from "bun:test";
import { NodeFileSystem } from "langium/node";
import { URI } from "langium";
import * as path from "node:path";
import * as url from "node:url";
import { createBimServices } from "../src/language/bim-module";
import type { Model } from "../src/generated/ast";

const __dirname = url.fileURLToPath(new URL(".", import.meta.url));

describe("BIM Parser", () => {
  let services: ReturnType<typeof createBimServices>;

  beforeAll(() => {
    services = createBimServices(NodeFileSystem);
  });

  async function parseFile(
    filename: string
  ): Promise<{ model: Model; errors: string[] }> {
    const filePath = path.join(__dirname, "fixtures", filename);
    const uri = URI.file(filePath);
    const document =
      await services.shared.workspace.LangiumDocumentFactory.fromUri(uri);

    await services.shared.workspace.DocumentBuilder.build([document], {
      validation: true,
    });

    const model = document.parseResult.value as Model;
    const errors = [
      ...document.parseResult.lexerErrors.map((e) => e.message),
      ...document.parseResult.parserErrors.map((e) => e.message),
    ];

    return { model, errors };
  }

  async function parseText(
    text: string
  ): Promise<{ model: Model; errors: string[] }> {
    const uri = URI.parse("memory://test.biml");
    const document =
      services.shared.workspace.LangiumDocumentFactory.fromString(text, uri);

    await services.shared.workspace.DocumentBuilder.build([document], {
      validation: true,
    });

    const model = document.parseResult.value as Model;
    const errors = [
      ...document.parseResult.lexerErrors.map((e) => e.message),
      ...document.parseResult.parserErrors.map((e) => e.message),
    ];

    return { model, errors };
  }

  it("parses empty model", async () => {
    const { model, errors } = await parseText("");

    expect(errors).toHaveLength(0);
    expect(model.libraries).toHaveLength(0);
    expect(model.projects).toHaveLength(0);
  });

  it("parses library with family", async () => {
    const { model, errors } = await parseText(`
      library "TestLib" {
        family Door {
          parameter width: Length = 900mm
        }
      }
    `);

    expect(errors).toHaveLength(0);
    expect(model.libraries).toHaveLength(1);
    expect(model.libraries[0].name).toBe("TestLib");
    expect(model.libraries[0].families).toHaveLength(1);
    expect(model.libraries[0].families[0].name).toBe("Door");
  });

  it("parses family parameters", async () => {
    const { model, errors } = await parseText(`
      library "Doors" {
        family Door {
          parameter width: Length = 900mm
          parameter height: Length = 2100mm
        }
      }
    `);

    expect(errors).toHaveLength(0);
    const family = model.libraries[0].families[0];
    expect(family.parameters).toHaveLength(2);
    expect(family.parameters[0].name).toBe("width");
    expect(family.parameters[0].paramType).toBe("Length");
    expect(family.parameters[1].name).toBe("height");
  });

  it("parses type extending family", async () => {
    const { model, errors } = await parseText(`
      library "Doors" {
        family Door {
          parameter width: Length = 900mm
        }

        type SingleFlush extends Door { }
        type DoubleDoor extends Door {
          width = 1800mm
        }
      }
    `);

    expect(errors).toHaveLength(0);
    const lib = model.libraries[0];
    expect(lib.types).toHaveLength(2);
    expect(lib.types[0].name).toBe("SingleFlush");
    expect(lib.types[1].name).toBe("DoubleDoor");
    expect(lib.types[1].overrides).toHaveLength(1);
  });

  it("parses project with site and building", async () => {
    const { model, errors } = await parseText(`
      project "Test Project" {
        site "Main Site" {
          building "Building A" {
          }
        }
      }
    `);

    expect(errors).toHaveLength(0);
    expect(model.projects).toHaveLength(1);
    expect(model.projects[0].name).toBe("Test Project");
    expect(model.projects[0].sites).toHaveLength(1);
    expect(model.projects[0].sites[0].buildings).toHaveLength(1);
  });

  it("parses level with properties", async () => {
    const { model, errors } = await parseText(`
      project "Test" {
        site "Site" {
          building "Bldg" {
            level "Ground" {
              elevation: 0m
              height: 3.5m
            }
          }
        }
      }
    `);

    expect(errors).toHaveLength(0);
    const level = model.projects[0].sites[0].buildings[0].levels[0];
    expect(level.name).toBe("Ground");
    expect(level.properties).toHaveLength(2);
  });

  it("parses space with area", async () => {
    const { model, errors } = await parseText(`
      project "Test" {
        site "Site" {
          building "Bldg" {
            level "L1" {
              elevation: 0m
              height: 3m
              space "Office" {
                position: [0, 0]
                area: 25m²
              }
            }
          }
        }
      }
    `);

    expect(errors).toHaveLength(0);
    const space = model.projects[0].sites[0].buildings[0].levels[0].spaces[0];
    expect(space.name).toBe("Office");
    expect(space.properties).toHaveLength(2);
  });

  it("parses space with width and length", async () => {
    const { model, errors } = await parseText(`
      project "Test" {
        site "Site" {
          building "Bldg" {
            level "L1" {
              elevation: 0m
              height: 3m
              space "Hallway" {
                position: [0, 1]
                width: 2m
                length: 10m
              }
            }
          }
        }
      }
    `);

    expect(errors).toHaveLength(0);
    const space = model.projects[0].sites[0].buildings[0].levels[0].spaces[0];
    expect(space.properties).toHaveLength(3);
  });

  it("parses space with door", async () => {
    const { model, errors } = await parseText(`
      library "Doors" {
        family Door { }
        type StandardDoor extends Door { }
      }

      project "Test" {
        site "Site" {
          building "Bldg" {
            level "L1" {
              elevation: 0m
              height: 3m
              space "Room" {
                position: [0, 0]
                area: 25m²
                door "D1": StandardDoor
              }
            }
          }
        }
      }
    `);

    expect(errors).toHaveLength(0);
    const space = model.projects[0].sites[0].buildings[0].levels[0].spaces[0];
    expect(space.elements).toHaveLength(1);
    expect(space.elements[0].$type).toBe("SpaceDoor");
  });

  it("parses door with wall override", async () => {
    const { model, errors } = await parseText(`
      library "Doors" {
        family Door { }
        type StandardDoor extends Door { }
      }

      project "Test" {
        site "Site" {
          building "Bldg" {
            level "L1" {
              elevation: 0m
              height: 3m
              space "Room" {
                position: [0, 0]
                area: 25m²
                door "D1": StandardDoor {
                  wall: north
                }
              }
            }
          }
        }
      }
    `);

    expect(errors).toHaveLength(0);
    const door = model.projects[0].sites[0].buildings[0].levels[0].spaces[0].elements[0];
    expect(door.$type).toBe("SpaceDoor");
    if (door.$type === "SpaceDoor") {
      expect(door.overrides).toHaveLength(1);
    }
  });

  it("parses simple.biml fixture", async () => {
    const { model, errors } = await parseFile("simple.biml");

    expect(errors).toHaveLength(0);
    expect(model.libraries).toHaveLength(1);
    expect(model.projects).toHaveLength(1);
  });

  it("rejects invalid syntax", async () => {
    const { errors } = await parseFile("invalid.biml");

    expect(errors.length).toBeGreaterThan(0);
  });

  it("supports # comments", async () => {
    const { model, errors } = await parseText(`
      # This is a comment
      library "Test" {
        family Door {
          parameter width: Length = 900mm  # inline comment
        }
      }
    `);

    expect(errors).toHaveLength(0);
    expect(model.libraries).toHaveLength(1);
  });
});
