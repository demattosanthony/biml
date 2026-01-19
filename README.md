# Building Information Modeling Language (BIML) v2

BIML is a domain-specific language designed for BIM model generation.

- **Compiles to IFC:** Easily integrates with existing BIM tools
- **Parametric design:** Define families with parameters, create types that inherit and override values
- **Coordinate-based:** Walls defined by explicit coordinates, not grids
- **AI-friendly:** Designed for AI agents to generate BIM models
- **Standard library:** Curated types for doors, windows, furniture, and structure

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
  material Oak {
    color: oak
  }

  family Door {
    param width: Length = 900mm
    param height: Length = 2100mm
  }

  type SingleDoor extends Door {
    material: Oak
  }

  type DoubleDoor extends Door {
    width = 1800mm
    material: Oak
  }
}

# Define building with coordinate-based walls
building "Office Building" {
  defaults {
    wall_thickness: 200mm
    ceiling_height: 2700mm
  }

  level "Ground" at 0m, height: 3.5m {
    # Walls defined by start/end coordinates
    wall "North" from (0, 10) to (15, 10)
    wall "East" from (15, 10) to (15, 0)
    wall "South" from (15, 0) to (0, 0)
    wall "West" from (0, 0) to (0, 10)
    wall "Interior" from (8, 0) to (8, 10)

    # Spaces bounded by walls
    space "Lobby" [public, reception] {
      bounded_by: ["South", "Interior", "North", "West"]

      # Doors placed in walls at specific positions
      door "Main Entry": DoubleDoor in "South" at 4m {
        swing: outward
      }
    }

    space "Office" [private] {
      bounded_by: ["South", "East", "North", "Interior"]

      door "Office Door": SingleDoor in "Interior" at 5m {
        swing: inward
        connects: "Lobby" <-> "Office"
      }

      window "W1": CasementWindow in "East" at 3m
    }
  }

  level "Level 1" at "Ground".top, height: 3m {
    # Walls can align with lower level
    wall "North" from (0, 10) to (15, 10)
    # ... more walls
  }
}
```

## Syntax Overview

### Type Libraries

Libraries define parametric families, types, and materials:

```biml
library "MyLibrary" {
  # Materials with colors
  material Wood {
    color: oak
  }

  material Glass {
    color: glass
    transparency: 0.2
  }

  # Families define parameters with defaults and constraints
  family Door {
    param width: Length = 900mm in 600mm..1200mm
    param height: Length = 2100mm
  }

  # Types extend families with specific values
  type SingleDoor extends Door {
    material: Wood
  }

  # Types can extend other types
  type FireDoor : SingleDoor {
    width = 1000mm
  }
}
```

### Buildings and Levels

```biml
building "Building Name" {
  defaults {
    wall_thickness: 200mm
    ceiling_height: 2700mm
  }

  site "Site Name" at (lat, long)

  level "Level Name" at 0m, height: 3.5m {
    # Walls, spaces, doors, windows, columns, furniture
  }

  level "Next Level" at "Level Name".top, height: 3m {
    # Relative elevation
  }
}
```

### Walls

Walls are defined by coordinate pairs:

```biml
wall "North" from (0, 10) to (20, 10)
wall "East" from (20, 10) to (20, 0)

# Walls can have properties
wall "Thick" from (0, 0) to (10, 0), thickness: 300mm
```

### Spaces

Spaces are bounded by wall references:

```biml
space "Room Name" [tags] {
  bounded_by: ["Wall1", "Wall2", "Wall3", "Wall4"]
  
  # Optional properties
  area: 50m²
  height: 3m
  floor: Concrete
  ceiling: Gypsum
  
  # Elements within the space
  door "D1": DoorType in "Wall1" at 2m
  window "W1": WindowType in "Wall2" at center
  place DeskType at (3, 4), facing north
}
```

### Door Placement

Doors are placed in walls with position:

```biml
# Absolute position (distance from wall start)
door "D1": SingleDoor in "South" at 5m

# Center of wall
door "D2": DoubleDoor in "North" at center

# From an anchor point
door "D3": FireDoor in "East" at 2m from start

# With properties
door "D4": SingleDoor in "West" at 3m {
  swing: inward
  connects: "Lobby" <-> "Office"
}
```

### Window Placement

```biml
window "W1": FixedWindow in "North" at 3m
window "W2": CasementWindow in "East" at center {
  sill: 900mm
}
```

### Furniture Placement

```biml
place DeskType "My Desk" at (3, 4)
place ChairType at (3, 5), facing north
place TableType at (5, 5) {
  rotation: 45deg
  count: 4
  spacing: 2m
}
```

### Columns

```biml
column "C1" at (5, 5) {
  width: 400mm
  depth: 400mm
}
```

## Standard Library

BIML includes a standard library with common types:

```
stdlib/
├── materials/
│   └── common.biml      # Wood, metal, glass, masonry materials
├── elements/
│   ├── doors.biml       # 20+ door types
│   └── windows.biml     # 20+ window types
├── furniture/
│   └── office.biml      # Desks, chairs, tables, storage
└── structure/
    └── columns.biml     # Column and beam types
```

## Development

```bash
bun install              # Install dependencies
bun run test             # Run all tests
bun run build            # Build biml
```

## Running Tests

```bash
# TypeScript tests
cd packages/biml && bun test

# Python tests
cd packages/compiler && uv run pytest tests/ -v
```
