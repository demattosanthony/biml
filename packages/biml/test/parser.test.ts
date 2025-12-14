import { describe, it, expect, beforeAll } from "bun:test";
import { NodeFileSystem } from "langium/node";
import { URI } from "langium";
import * as path from "node:path";
import * as url from "node:url";
import { createBimServices } from "../src/language/bim-module";
import type { Model, SpaceDoor, DoorOffsetAbsolute, DoorOffsetCenter } from "../src/generated/ast";

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

  // ============================================================================
  // Basic Parsing Tests
  // ============================================================================

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

  // ============================================================================
  // v0.4.0 New Features: Type Extends Type
  // ============================================================================

  it("parses type extending another type", async () => {
    const { model, errors } = await parseText(`
      library "Doors" {
        family Door {
          parameter width: Length = 900mm
          parameter height: Length = 2100mm
        }

        type StandardDoor extends Door { }
        type FireDoor : StandardDoor {
          width = 1000mm
        }
      }
    `);

    expect(errors).toHaveLength(0);
    const lib = model.libraries[0];
    expect(lib.types).toHaveLength(2);
    expect(lib.types[1].name).toBe("FireDoor");
    expect(lib.types[1].baseType?.ref?.name).toBe("StandardDoor");
  });

  // ============================================================================
  // v0.4.0 New Features: Boolean and String Literals
  // ============================================================================

  it("parses boolean parameter default", async () => {
    const { model, errors } = await parseText(`
      library "Test" {
        family Door {
          parameter isFireRated: Boolean = true
          parameter hasWindow: Boolean = false
        }
      }
    `);

    expect(errors).toHaveLength(0);
    const family = model.libraries[0].families[0];
    expect(family.parameters[0].defaultValue?.$type).toBe("BooleanLiteral");
    expect(family.parameters[1].defaultValue?.$type).toBe("BooleanLiteral");
  });

  it("parses string parameter default", async () => {
    const { model, errors } = await parseText(`
      library "Test" {
        family Door {
          parameter material: String = "Wood"
        }
      }
    `);

    expect(errors).toHaveLength(0);
    const family = model.libraries[0].families[0];
    expect(family.parameters[0].defaultValue?.$type).toBe("StringLiteral");
  });

  // ============================================================================
  // Project Hierarchy Tests
  // ============================================================================

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

  // ============================================================================
  // v0.4.0 New Features: Slab Thickness
  // ============================================================================

  it("parses level with slab thickness", async () => {
    const { model, errors } = await parseText(`
      project "Test" {
        site "Site" {
          building "Bldg" {
            level "Ground" {
              elevation: 0m
              height: 3.5m
              slab_thickness: 200mm
            }
          }
        }
      }
    `);

    expect(errors).toHaveLength(0);
    const level = model.projects[0].sites[0].buildings[0].levels[0];
    expect(level.properties).toHaveLength(3);
    const slabProp = level.properties.find(p => p.$type === "SlabThicknessProperty");
    expect(slabProp).toBeDefined();
  });

  // ============================================================================
  // Space Tests
  // ============================================================================

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

  // ============================================================================
  // v0.4.0 New Features: Aspect Ratio
  // ============================================================================

  it("parses space with aspect ratio", async () => {
    const { model, errors } = await parseText(`
      project "Test" {
        site "Site" {
          building "Bldg" {
            level "L1" {
              elevation: 0m
              height: 3m
              space "Corridor" {
                position: [0, 0]
                area: 50m²
                aspect: 5:1
              }
            }
          }
        }
      }
    `);

    expect(errors).toHaveLength(0);
    const space = model.projects[0].sites[0].buildings[0].levels[0].spaces[0];
    const aspectProp = space.properties.find(p => p.$type === "AspectProperty");
    expect(aspectProp).toBeDefined();
    if (aspectProp?.$type === "AspectProperty") {
      expect(aspectProp.widthRatio).toBe(5);
      expect(aspectProp.lengthRatio).toBe(1);
    }
  });

  // ============================================================================
  // Door Tests
  // ============================================================================

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

  it("parses inline door without type", async () => {
    const { model, errors } = await parseText(`
      project "Test" {
        site "Site" {
          building "Bldg" {
            level "L1" {
              elevation: 0m
              height: 3m
              space "Room" {
                position: [0, 0]
                area: 25m²
                door "D1" {
                  width: 900mm
                  height: 2100mm
                  wall: south
                }
              }
            }
          }
        }
      }
    `);

    expect(errors).toHaveLength(0);
    const space = model.projects[0].sites[0].buildings[0].levels[0].spaces[0];
    expect(space.elements).toHaveLength(1);
    const door = space.elements[0] as SpaceDoor;
    expect(door.typeRef).toBeUndefined();
    expect(door.overrides).toHaveLength(3);
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

  // ============================================================================
  // v0.4.0 New Features: Door Offset Variations
  // ============================================================================

  it("parses door with normalized offset", async () => {
    const { model, errors } = await parseText(`
      project "Test" {
        site "Site" {
          building "Bldg" {
            level "L1" {
              height: 3m
              space "Room" {
                position: [0, 0]
                area: 25m²
                door "D1" {
                  wall: south
                  offset: 0.3
                }
              }
            }
          }
        }
      }
    `);

    expect(errors).toHaveLength(0);
    const door = model.projects[0].sites[0].buildings[0].levels[0].spaces[0].elements[0] as SpaceDoor;
    const offsetProp = door.overrides.find(o => o.$type === "DoorOffsetNormalized");
    expect(offsetProp).toBeDefined();
  });

  it("parses door with center offset", async () => {
    const { model, errors } = await parseText(`
      project "Test" {
        site "Site" {
          building "Bldg" {
            level "L1" {
              height: 3m
              space "Room" {
                position: [0, 0]
                area: 25m²
                door "D1" {
                  wall: south
                  offset: center
                }
              }
            }
          }
        }
      }
    `);

    expect(errors).toHaveLength(0);
    const door = model.projects[0].sites[0].buildings[0].levels[0].spaces[0].elements[0] as SpaceDoor;
    const offsetProp = door.overrides.find(o => o.$type === "DoorOffsetCenter") as DoorOffsetCenter | undefined;
    expect(offsetProp).toBeDefined();
  });

  it("parses door with absolute offset", async () => {
    const { model, errors } = await parseText(`
      project "Test" {
        site "Site" {
          building "Bldg" {
            level "L1" {
              height: 3m
              space "Room" {
                position: [0, 0]
                area: 25m²
                door "D1" {
                  wall: south
                  offset: 2m from left
                }
              }
            }
          }
        }
      }
    `);

    expect(errors).toHaveLength(0);
    const door = model.projects[0].sites[0].buildings[0].levels[0].spaces[0].elements[0] as SpaceDoor;
    const offsetProp = door.overrides.find(o => o.$type === "DoorOffsetAbsolute") as DoorOffsetAbsolute | undefined;
    expect(offsetProp).toBeDefined();
    expect(offsetProp?.distance.value).toBe(2);
    expect(offsetProp?.anchor).toBe("left");
  });

  // ============================================================================
  // v0.4.0 New Features: Door Swing
  // ============================================================================

  it("parses door with swing direction", async () => {
    const { model, errors } = await parseText(`
      project "Test" {
        site "Site" {
          building "Bldg" {
            level "L1" {
              height: 3m
              space "Room" {
                position: [0, 0]
                area: 25m²
                door "D1" {
                  wall: south
                  swing: in-left
                }
              }
            }
          }
        }
      }
    `);

    expect(errors).toHaveLength(0);
    const door = model.projects[0].sites[0].buildings[0].levels[0].spaces[0].elements[0] as SpaceDoor;
    const swingProp = door.overrides.find(o => o.$type === "DoorSwingProperty");
    expect(swingProp).toBeDefined();
  });

  // ============================================================================
  // v0.4.0 New Features: Interior Doors (connects)
  // ============================================================================

  it("parses door with connects (interior door)", async () => {
    const { model, errors } = await parseText(`
      project "Test" {
        site "Site" {
          building "Bldg" {
            level "L1" {
              height: 3m
              space "Lobby" {
                position: [0, 0]
                area: 25m²
                door "D1" {
                  wall: east
                  connects: "Hallway"
                }
              }
              space "Hallway" {
                position: [0, 1]
                width: 2m
                length: 5m
              }
            }
          }
        }
      }
    `);

    expect(errors).toHaveLength(0);
    const door = model.projects[0].sites[0].buildings[0].levels[0].spaces[0].elements[0] as SpaceDoor;
    const connectsProp = door.overrides.find(o => o.$type === "DoorConnectsProperty");
    expect(connectsProp).toBeDefined();
  });

  // ============================================================================
  // v0.5.0 New Features: Materials
  // ============================================================================

  it("parses material with rgb color", async () => {
    const { model, errors } = await parseText(`
      library "Test" {
        material WarmWood {
          color: rgb(0.6, 0.4, 0.2)
        }
      }
    `);

    expect(errors).toHaveLength(0);
    expect(model.libraries[0].materials).toHaveLength(1);
    expect(model.libraries[0].materials[0].name).toBe("WarmWood");
  });

  it("parses material with named color", async () => {
    const { model, errors } = await parseText(`
      library "Test" {
        material OakFinish {
          color: oak
        }
      }
    `);

    expect(errors).toHaveLength(0);
    expect(model.libraries[0].materials).toHaveLength(1);
    const colorProp = model.libraries[0].materials[0].properties[0];
    expect(colorProp.$type).toBe("NamedColor");
  });

  it("parses material with hex color", async () => {
    const { model, errors } = await parseText(`
      library "Test" {
        material CustomBrown {
          color: #8B4513
        }
      }
    `);

    expect(errors).toHaveLength(0);
    expect(model.libraries[0].materials).toHaveLength(1);
    const colorProp = model.libraries[0].materials[0].properties[0];
    expect(colorProp.$type).toBe("HexColor");
  });

  it("parses material with transparency", async () => {
    const { model, errors } = await parseText(`
      library "Test" {
        material FrostedGlass {
          color: glass
          transparency: 0.5
        }
      }
    `);

    expect(errors).toHaveLength(0);
    expect(model.libraries[0].materials).toHaveLength(1);
    expect(model.libraries[0].materials[0].properties).toHaveLength(2);
  });

  it("parses type with material assignment", async () => {
    const { model, errors } = await parseText(`
      library "Test" {
        material WarmWood {
          color: wood
        }

        family Door {
          parameter width: Length = 900mm
        }

        type WoodenDoor extends Door {
          material: WarmWood
        }
      }
    `);

    expect(errors).toHaveLength(0);
    expect(model.libraries[0].types[0].materialAssignment).toBeDefined();
    expect(model.libraries[0].types[0].materialAssignment?.materialRef?.ref?.name).toBe("WarmWood");
  });

  it("parses door material syntax", async () => {
    // Note: Cross-scope material references require a custom scope provider.
    // This test verifies the syntax parses correctly (parse errors only).
    const { model, errors } = await parseText(`
      library "Test" {
        material CherryWood {
          color: rgb(0.5, 0.2, 0.1)
        }
      }

      project "Test" {
        site "Site" {
          building "Bldg" {
            level "L1" {
              height: 3m
              space "Room" {
                position: [0, 0]
                area: 25m²
                door "D1" {
                  wall: south
                  material: CherryWood
                }
              }
            }
          }
        }
      }
    `);

    // Parser test only checks parse errors, not linking/validation errors
    expect(errors).toHaveLength(0);
    const door = model.projects[0].sites[0].buildings[0].levels[0].spaces[0].elements[0] as SpaceDoor;
    const materialProp = door.overrides.find(o => o.$type === "DoorMaterialProperty");
    expect(materialProp).toBeDefined();
  });

  // ============================================================================
  // File Tests
  // ============================================================================

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

  // ============================================================================
  // Comments
  // ============================================================================

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

  it("supports // comments", async () => {
    const { model, errors } = await parseText(`
      // C-style comment
      library "Test" {
        family Door {
          parameter width: Length = 900mm  // inline comment
        }
      }
    `);

    expect(errors).toHaveLength(0);
    expect(model.libraries).toHaveLength(1);
  });

  it("supports /* */ block comments", async () => {
    const { model, errors } = await parseText(`
      /* Block comment
         spanning multiple lines */
      library "Test" {
        family Door {
          parameter width: Length = 900mm
        }
      }
    `);

    expect(errors).toHaveLength(0);
    expect(model.libraries).toHaveLength(1);
  });
});
