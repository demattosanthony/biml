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
    expect(model.floors).toHaveLength(0);
    expect(model.rooms).toHaveLength(0);
    expect(model.doors).toHaveLength(0);
  });

  it("parses single floor", async () => {
    const { model, errors } = await parseText(`
      floor Ground {}
    `);

    expect(errors).toHaveLength(0);
    expect(model.floors).toHaveLength(1);
    expect(model.floors[0].name).toBe("Ground");
  });

  it("parses floor with elevation and height", async () => {
    const { model, errors } = await parseText(`
      floor Ground {
        elevation: 0m
        height: 3.5m
      }
    `);

    expect(errors).toHaveLength(0);
    const floor = model.floors[0];
    expect(floor.properties).toHaveLength(2);
  });

  it("parses room with floor reference and position", async () => {
    const { model, errors } = await parseText(`
      floor Ground {}

      room Office {
        floor: Ground
        position: [0, 0]
        area: 25m²
      }
    `);

    expect(errors).toHaveLength(0);
    expect(model.rooms).toHaveLength(1);
    const room = model.rooms[0];
    expect(room.name).toBe("Office");
    expect(room.properties).toHaveLength(3);
  });

  it("parses room with width and length", async () => {
    const { model, errors } = await parseText(`
      floor Ground {}

      room Hallway {
        floor: Ground
        position: [0, 1]
        width: 2m
        length: 10m
      }
    `);

    expect(errors).toHaveLength(0);
    const room = model.rooms[0];
    expect(room.properties).toHaveLength(4);
  });

  it("parses room with quoted name", async () => {
    const { model, errors } = await parseText(`
      floor Ground {}

      room "Conference Room" {
        floor: Ground
        position: [1, 0]
        area: 40m²
      }
    `);

    expect(errors).toHaveLength(0);
    // Langium strips quotes from STRING terminals
    expect(model.rooms[0].name).toBe("Conference Room");
  });

  it("parses door between rooms", async () => {
    const { model, errors } = await parseText(`
      floor Ground {}

      room Lobby {
        floor: Ground
        position: [0, 0]
      }

      room Office {
        floor: Ground
        position: [0, 1]
      }

      door {
        from: Lobby
        to: Office
        width: 0.9m
      }
    `);

    expect(errors).toHaveLength(0);
    expect(model.doors).toHaveLength(1);
    // Door properties are in properties array
    expect(model.doors[0].properties.length).toBeGreaterThan(0);
  });

  it("parses exterior door", async () => {
    const { model, errors } = await parseText(`
      floor Ground {}

      room Lobby {
        floor: Ground
        position: [0, 0]
      }

      door {
        from: Lobby
        to: exterior
        wall: south
        width: 1.0m
      }
    `);

    expect(errors).toHaveLength(0);
    expect(model.doors).toHaveLength(1);
  });

  it("parses simple.biml fixture", async () => {
    const { model, errors } = await parseFile("simple.biml");

    expect(errors).toHaveLength(0);
    expect(model.floors).toHaveLength(1);
    expect(model.rooms).toHaveLength(2);
    expect(model.doors).toHaveLength(1);
  });

  it("rejects invalid syntax", async () => {
    const { errors } = await parseFile("invalid.biml");

    expect(errors.length).toBeGreaterThan(0);
  });

  it("supports # comments", async () => {
    const { model, errors } = await parseText(`
      # This is a comment
      floor Ground {
        elevation: 0m  # inline comment
      }
    `);

    expect(errors).toHaveLength(0);
    expect(model.floors).toHaveLength(1);
  });
});
