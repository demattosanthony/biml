# biml

DSL for BIM model generation.

## Quick Start

```bash
# Compile .biml directly to IFC
bun ./bin/cli.ts compile test/fixtures/simple.biml -o model.ifc

# Also output intermediate JSON IR
bun ./bin/cli.ts compile test/fixtures/simple.biml -o model.ifc --ir

# Or just parse to JSON IR (without IFC generation)
bun ./bin/cli.ts parse test/fixtures/simple.biml -o output.json
```

## Example .biml File

```biml
# Define parametric door types
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

# Define building hierarchy
project "Office Building" {
  site "Main Site" {
    building "Building A" {
      level "Ground" {
        elevation: 0m
        height: 3.5m

        space "Lobby" {
          position: [0, 0]
          area: 100m²
          door "D1": SingleFlush
        }

        space "Hallway" {
          position: [0, 1]
          width: 2m
          length: 15m
        }
      }

      level "Level1" {
        elevation: 3.5m
        height: 3m

        space "Office" {
          position: [0, 0]
          area: 25m²
        }
      }
    }
  }
}
```

## Run Tests

```bash
bun test
```
