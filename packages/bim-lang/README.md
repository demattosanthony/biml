# bim-lang

DSL for BIM model generation.

## Quick Start

```bash
# Parse a .bim file to JSON IR
bun ./bin/cli.ts parse test/fixtures/simple.bim

# Save to file
bun ./bin/cli.ts parse test/fixtures/simple.bim -o output.json

# Pipe to compiler (generates IFC)
bun ./bin/cli.ts parse test/fixtures/simple.bim | (cd ../compiler && uv run bim-compile - -o model.ifc)
```

## Example .bim File

```
project "My Building" {
    floor "Ground Floor" {
        elevation: 0m
        height: 3.5m

        room "Lobby" {
            area: 100m²
            doors: [
                door to "Hallway" { width: 1.2m }
            ]
        }

        room "Hallway" {
            width: 2m
            length: 15m
        }
    }

    floor "Level 1" {
        elevation: 3.5m
        height: 3m

        room "Office" {
            area: 25m²
        }
    }
}
```

## Run Tests

```bash
bun test
```
