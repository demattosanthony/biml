# Building Information Modeling Language (BIML)

biml is a domain specific language designed for BIM model generation.

- **Compiles to IFC:** Easily integrates with existing BIM tools
- **Parametric design:** Define families with parameters, create types that inherit and override values. The compiler handles downstream dependencies.
- **Easy to use:** Simple, declarative hierarchical syntax
- **AI-friendly:** Designed for AI agents to generate BIM models

## Architecture

```
.biml file → bimlc (parse) → JSON IR → compiler → .ifc file
```

## Packages

| Package    | Language   | Description                      |
| ---------- | ---------- | -------------------------------- |
| `biml`     | TypeScript | DSL parser built with Langium    |
| `compiler` | Python     | IFC generator using IfcOpenShell |

## Quick Start

### Prerequisites

- [Bun](https://bun.sh/) (v1.0+)
- [Python](https://www.python.org/) (3.11+)
- [uv](https://docs.astral.sh/uv/) (recommended) or pip

### Installation

```bash
git clone https://github.com/demattosanthony/biml.git
cd biml
bun install
```

### Usage

```bash
# Compile .biml directly to IFC
bun run bimlc packages/biml/test/fixtures/simple.biml -o output.ifc

# Also output intermediate JSON IR
bun run bimlc packages/biml/test/fixtures/simple.biml -o output.ifc --ir

# Or just parse to JSON IR (without IFC generation)
bun run bimlc parse packages/biml/test/fixtures/simple.biml -o output.json
```

## Example

```biml
# Define a library with parametric door types
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
  site "Main Campus" {
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

      level "Level 1" {
        elevation: 3.5m
        height: 3m

        space "Conference Room" {
          position: [0, 0]
          area: 40m²
          door "D2": DoubleDoor
        }
      }
    }
  }
}
```

## Syntax Overview

### Libraries and Types

Libraries define parametric families and types:

```biml
library "MyLibrary" {
  family Door {
    parameter width: Length = 900mm
    parameter height: Length = 2100mm
  }

  type StandardDoor extends Door { }
  type WideDoor extends Door {
    width = 1200mm
  }
}
```

### Project Hierarchy

Projects follow the IFC spatial hierarchy:

```biml
project "Project Name" {
  site "Site Name" {
    building "Building Name" {
      level "Level Name" {
        elevation: 0m
        height: 3m

        space "Space Name" {
          position: [row, col]
          area: 50m²
          door "DoorName": TypeName
        }
      }
    }
  }
}
```

### Space Dimensions

Spaces can be defined by area or explicit dimensions:

```biml
# By area (creates square space)
space "Office" {
  position: [0, 0]
  area: 25m²
}

# By width and length
space "Corridor" {
  position: [0, 1]
  width: 2m
  length: 10m
}
```

### Door Placement

Doors reference types from libraries and can specify wall placement:

```biml
space "Room" {
  position: [0, 0]
  area: 30m²

  door "D1": SingleFlush           # Default wall placement
  door "D2": DoubleDoor {          # Explicit wall
    wall: north
  }
}
```

## Development

```bash
bun install              # Install dependencies
bun run test             # Run all tests
bun run build            # Build biml
```
