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

  it("generates correct JSON IR structure", async () => {
    const ir = await parseAndGenerate("");

    expect(ir.version).toBe("0.2.0");
    expect(ir.floors).toHaveLength(0);
    expect(ir.rooms).toHaveLength(0);
    expect(ir.doors).toHaveLength(0);
  });

  it("includes all floor properties", async () => {
    const ir = await parseAndGenerate(`
      floor Ground {
        elevation: 0m
        height: 4m
      }
    `);

    const floor = ir.floors[0];
    expect(floor.name).toBe("Ground");
    expect(floor.elevation).toEqual({ value: 0, unit: "m" });
    expect(floor.height).toEqual({ value: 4, unit: "m" });
  });

  it("includes all room properties", async () => {
    const ir = await parseAndGenerate(`
      floor Ground {}

      room Office {
        floor: Ground
        position: [0, 0]
        area: 30m²
      }

      room Hallway {
        floor: Ground
        position: [0, 1]
        width: 2.5m
        length: 15m
      }
    `);

    const rooms = ir.rooms;

    expect(rooms[0].name).toBe("Office");
    expect(rooms[0].floor).toBe("Ground");
    expect(rooms[0].position).toEqual({ row: 0, col: 0 });
    expect(rooms[0].area).toEqual({ value: 30, unit: "m²" });

    expect(rooms[1].name).toBe("Hallway");
    expect(rooms[1].position).toEqual({ row: 0, col: 1 });
    expect(rooms[1].width).toEqual({ value: 2.5, unit: "m" });
    expect(rooms[1].length).toEqual({ value: 15, unit: "m" });
  });

  it("includes door properties", async () => {
    const ir = await parseAndGenerate(`
      floor Ground {}

      room Office {
        floor: Ground
        position: [0, 0]
      }

      room Hallway {
        floor: Ground
        position: [0, 1]
      }

      door {
        from: Office
        to: Hallway
        width: 0.9m
        height: 2.1m
      }

      door {
        from: Office
        to: exterior
        wall: south
        width: 1.0m
      }
    `);

    const doors = ir.doors;

    expect(doors).toHaveLength(2);
    expect(doors[0].from).toBe("Office");
    expect(doors[0].to).toBe("Hallway");
    expect(doors[0].width).toEqual({ value: 0.9, unit: "m" });
    expect(doors[0].height).toEqual({ value: 2.1, unit: "m" });

    expect(doors[1].from).toBe("Office");
    expect(doors[1].to).toBe("exterior");
    expect(doors[1].wall).toBe("south");
  });

  it("generates correct IR from simple.biml fixture", async () => {
    const ir = await parseFileAndGenerate("simple.biml");

    expect(ir.version).toBe("0.2.0");
    expect(ir.floors).toHaveLength(1);
    expect(ir.floors[0].name).toBe("Ground");
    expect(ir.floors[0].elevation).toEqual({ value: 0, unit: "m" });
    expect(ir.floors[0].height).toEqual({ value: 3.5, unit: "m" });

    expect(ir.rooms).toHaveLength(2);
    expect(ir.rooms[0].name).toBe("Reception");
    expect(ir.rooms[0].floor).toBe("Ground");
    expect(ir.rooms[0].area).toEqual({ value: 50, unit: "m²" });

    expect(ir.rooms[1].name).toBe("Hallway");
    expect(ir.rooms[1].width).toEqual({ value: 2, unit: "m" });

    expect(ir.doors).toHaveLength(1);
    expect(ir.doors[0].from).toBe("Reception");
    expect(ir.doors[0].to).toBe("Hallway");
  });
});
