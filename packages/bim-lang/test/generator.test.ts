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
    const uri = URI.parse("memory://test.bim");
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

  it("generates correct JSON IR structure", async () => {
    const ir = await parseAndGenerate('project "Test" {}');

    expect(ir.version).toBe("0.1.0");
    expect(ir.projects).toHaveLength(1);
    expect(ir.projects[0].name).toBe("Test");
    expect(ir.projects[0].floors).toHaveLength(0);
  });

  it("includes all floor properties", async () => {
    const ir = await parseAndGenerate(`
            project "Building" {
                floor "Ground" {
                    elevation: 0m
                    height: 4m
                }
            }
        `);

    const floor = ir.projects[0].floors[0];
    expect(floor.name).toBe("Ground");
    expect(floor.elevation).toEqual({ value: 0, unit: "m" });
    expect(floor.height).toEqual({ value: 4, unit: "m" });
  });

  it("includes all room properties", async () => {
    const ir = await parseAndGenerate(`
            project "Building" {
                floor "Level 1" {
                    room "Office" {
                        area: 30m²
                    }
                    room "Hallway" {
                        width: 2.5m
                        length: 15m
                    }
                }
            }
        `);

    const rooms = ir.projects[0].floors[0].rooms;

    expect(rooms[0].name).toBe("Office");
    expect(rooms[0].area).toEqual({ value: 30, unit: "m²" });

    expect(rooms[1].name).toBe("Hallway");
    expect(rooms[1].width).toEqual({ value: 2.5, unit: "m" });
    expect(rooms[1].length).toEqual({ value: 15, unit: "m" });
  });

  it("includes door references", async () => {
    const ir = await parseAndGenerate(`
            project "Building" {
                floor "Level 1" {
                    room "Office" {
                        doors: [
                            door to "Hallway" { width: 0.9m },
                            door to "Storage" { width: 0.8m }
                        ]
                    }
                }
            }
        `);

    const doors = ir.projects[0].floors[0].rooms[0].doors;

    expect(doors).toHaveLength(2);
    expect(doors[0].target).toBe("Hallway");
    expect(doors[0].width).toEqual({ value: 0.9, unit: "m" });
    expect(doors[1].target).toBe("Storage");
  });

  it("generates correct IR from simple.bim fixture", async () => {
    const ir = await parseFileAndGenerate("simple.bim");

    expect(ir.projects[0].name).toBe("Test Building");
    expect(ir.projects[0].floors[0].name).toBe("Level 1");
    expect(ir.projects[0].floors[0].elevation).toEqual({ value: 0, unit: "m" });
    expect(ir.projects[0].floors[0].height).toEqual({ value: 3.5, unit: "m" });

    const rooms = ir.projects[0].floors[0].rooms;
    expect(rooms).toHaveLength(2);
    expect(rooms[0].name).toBe("Reception");
    expect(rooms[0].area).toEqual({ value: 50, unit: "m²" });
    expect(rooms[0].doors[0].target).toBe("Hallway");
  });
});
