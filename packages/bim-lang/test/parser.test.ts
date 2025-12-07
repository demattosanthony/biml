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

  it("parses empty project", async () => {
    const { model, errors } = await parseText('project "Empty" {}');

    expect(errors).toHaveLength(0);
    expect(model.projects).toHaveLength(1);
    expect(model.projects[0].name).toBe("Empty");
  });

  it("parses project with single floor", async () => {
    const { model, errors } = await parseText(`
            project "Building" {
                floor "Level 1" {}
            }
        `);

    expect(errors).toHaveLength(0);
    expect(model.projects[0].floors).toHaveLength(1);
    expect(model.projects[0].floors[0].name).toBe("Level 1");
  });

  it("parses floor with elevation and height", async () => {
    const { model, errors } = await parseText(`
            project "Building" {
                floor "Level 1" {
                    elevation: 0m
                    height: 3.5m
                }
            }
        `);

    expect(errors).toHaveLength(0);
    const floor = model.projects[0].floors[0];
    expect(floor.properties).toHaveLength(2);
  });

  it("parses room with area", async () => {
    const { model, errors } = await parseText(`
            project "Building" {
                floor "Level 1" {
                    room "Office" {
                        area: 25m²
                    }
                }
            }
        `);

    expect(errors).toHaveLength(0);
    const room = model.projects[0].floors[0].rooms[0];
    expect(room.name).toBe("Office");
    expect(room.properties).toHaveLength(1);
  });

  it("parses room with width and length", async () => {
    const { model, errors } = await parseText(`
            project "Building" {
                floor "Level 1" {
                    room "Hallway" {
                        width: 2m
                        length: 10m
                    }
                }
            }
        `);

    expect(errors).toHaveLength(0);
    const room = model.projects[0].floors[0].rooms[0];
    expect(room.properties).toHaveLength(2);
  });

  it("parses door with target room", async () => {
    const { model, errors } = await parseText(`
            project "Building" {
                floor "Level 1" {
                    room "Office" {
                        doors: [
                            door to "Hallway" { width: 0.9m }
                        ]
                    }
                }
            }
        `);

    expect(errors).toHaveLength(0);
    const room = model.projects[0].floors[0].rooms[0];
    expect(room.doors).toHaveLength(1);
    expect(room.doors[0].doors[0].target).toBe("Hallway");
  });

  it("parses simple.biml fixture", async () => {
    const { model, errors } = await parseFile("simple.biml");

    expect(errors).toHaveLength(0);
    expect(model.projects).toHaveLength(1);
    expect(model.projects[0].floors).toHaveLength(1);
    expect(model.projects[0].floors[0].rooms).toHaveLength(2);
  });

  it("rejects invalid syntax", async () => {
    const { errors } = await parseFile("invalid.biml");

    expect(errors.length).toBeGreaterThan(0);
  });
});
