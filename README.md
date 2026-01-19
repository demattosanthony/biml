# Building Information Modeling Language (BIML)

BIML is a domain-specific language designed for BIM model generation.

- **Compiles to IFC:** Easily integrates with existing BIM tools
- **Parametric design:** Define types with parameters, extend types to inherit and override values
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
# Compile .biml to IFC (defaults to input name with .ifc)
bun run bimlc examples/office/sample-office.biml

# Compile and choose output path
bun run bimlc examples/office/sample-office.biml -o output.ifc

# Also output intermediate JSON IR (writes alongside .ifc as .json)
bun run bimlc examples/office/sample-office.biml -o output.ifc --ir

# Parse to JSON IR only (defaults to stdout)
bun run bimlc parse examples/office/sample-office.biml -o output.json
```

## Example

```biml
# Define a library with parametric door types
library "Doors" {
  material Oak {
    color: oak
  }

  # Base type with parameters
  type Door {
    param width: Length = 900mm
    param height: Length = 2100mm
    param thickness: Length = 45mm
    ifc_class: IfcDoor
  }

  # Types extend other types with `: ParentType`
  type SingleDoor : Door {
    material: Oak
  }

  type DoubleDoor : Door {
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

  site "Main Campus" at (37.7749, -122.4194)

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
      floor: Concrete
      ceiling: White

      # Doors placed in walls at specific positions
      door "Main Entry": DoubleDoor in "South" at 4m {
        swing: outward
      }

      place ReceptionDesk at (3, 5), facing north
    }

    space "Office" [private, office] {
      bounded_by: ["South", "East", "North", "Interior"]

      door "Office Door": SingleDoor in "Interior" at 5m {
        swing: inward
        connects: "Lobby" <-> "Office"
      }

      window "W1": CasementWindow in "East" at 3m
    }

    column "C1" at (8, 5) {
      width: 400mm
      depth: 400mm
    }
  }

  level "Level 1" at "Ground".top, height: 3m {
    wall "North" from (0, 10) to (15, 10)
    wall "East" from (15, 10) to (15, 0)
    wall "South" from (15, 0) to (0, 0)
    wall "West" from (0, 0) to (0, 10)

    space "Upper Office" [office] {
      bounded_by: ["South", "East", "North", "West"]
    }
  }
}
```

## Syntax Overview

### Type Libraries

Libraries define materials and types. Types are unified - they can define parameters AND extend other types:

```biml
library "MyLibrary" {
  # Materials with named colors
  material Wood {
    color: oak
  }

  # Materials with hex colors
  material CustomGray {
    color: #808080
  }

  # Materials with transparency
  material Glass {
    color: glass
    transparency: 0.2
  }

  # Base type with parameters
  type Door {
    param width: Length = 900mm
    param height: Length = 2100mm
    param thickness: Length = 45mm
    ifc_class: IfcDoor
  }

  # Types extend other types with `: ParentType`
  type SingleDoor : Door {
    material: Wood
  }

  # Types can override inherited parameters
  type FireDoor : SingleDoor {
    width = 1000mm
  }
}
```

Available named colors: `white`, `black`, `red`, `green`, `blue`, `grey`, `gray`, `brown`, `wood`, `steel`, `glass`, `oak`, `walnut`, `mahogany`, `silver`, `gold`, `bronze`, `copper`, `concrete`, `brick`

Parameter types: `Length`, `Area`, `Number`, `Boolean`, `String`

Units: `m`, `cm`, `mm`, `ft`, `in` (length), `m²`, `ft²`, `sqm`, `sqft` (area)

### Buildings and Levels

```biml
building "Building Name" {
  defaults {
    wall_thickness: 200mm
    floor_thickness: 200mm
    ceiling_height: 2700mm
    door_height: 2100mm
    window_sill: 900mm
  }

  site "Site Name" at (lat, long)

  level "Level Name" at 0m, height: 3.5m {
    # Walls, spaces, doors, windows, columns, furniture
  }

  level "Next Level" at "Level Name".top, height: 3m {
    # Relative elevation using previous level
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
space "Room Name" [public, office] {
  bounded_by: ["Wall1", "Wall2", "Wall3", "Wall4"]

  # Optional properties
  floor: ConcreteMaterial
  ceiling: GypsumMaterial
  height: 3m

  # Elements within the space
  door "D1": DoorType in "Wall1" at 2m
  window "W1": WindowType in "Wall2" at center
  place DeskType at (3, 4), facing north
}
```

Available space tags: `public`, `private`, `circulation`, `service`, `technical`, `reception`, `office`, `meeting`, `storage`, `restroom`, `kitchen`, `dining`, `residential`, `retail`, `parking`

### Door Placement

Doors are placed in walls with position (distance from wall start or `center`):

```biml
# Absolute position (distance from wall start)
door "D1": SingleDoor in "South" at 5m

# Center of wall
door "D2": DoubleDoor in "North" at center

# With properties
door "D3": SingleDoor in "West" at 3m {
  swing: inward
  connects: "Lobby" <-> "Office"
}
```

Swing directions: `inward`, `outward`, `left`, `right`, `double`, `sliding`, `pivot`

### Window Placement

```biml
window "W1": FixedWindow in "North" at 3m
window "W2": CasementWindow in "East" at center {
  sill: 900mm
}
```

### Furniture Placement

```biml
# Basic placement
place DeskType at (3, 4)

# With optional name
place DeskType "My Desk" at (3, 4)

# Inline facing direction
place ChairType at (3, 5), facing north

# Block syntax with facing
place TableType at (5, 5) {
  facing south
}
```

Facing directions: `north`, `south`, `east`, `west`

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
│   ├── doors.biml       # SingleDoor, DoubleDoor, FireDoor, SlidingDoor
│   └── windows.biml     # FixedWindow, PictureWindow, ClerestoryWindow
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
