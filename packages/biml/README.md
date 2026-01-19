# BIML

DSL for BIM model generation with coordinate-based wall definitions.

## Quick Start

```bash
# Compile .biml directly to IFC
bun ./bin/cli.ts test/fixtures/simple.biml -o model.ifc

# Also output intermediate JSON IR
bun ./bin/cli.ts test/fixtures/simple.biml -o model.ifc --ir

# Or just parse to JSON IR (without IFC generation)
bun ./bin/cli.ts parse test/fixtures/simple.biml -o output.json
```

## Example .biml File

```biml
# Define type library
library "Doors" {
  material Oak {
    color: oak
  }

  # Base door type with parameters
  type Door {
    param width: Length = 900mm
    param height: Length = 2100mm
    ifc_class: IfcDoor
  }

  # Inherits from Door, adds material
  type SingleDoor : Door {
    material: Oak
  }

  # Overrides inherited width
  type WideDoor : Door {
    width = 1200mm
    material: Oak
  }
}

# Define building with coordinate-based walls
building "Office Building" {
  level "Ground" at 0m, height: 3.5m {
    # Walls defined by coordinates
    wall "North" from (0, 10) to (15, 10)
    wall "East" from (15, 10) to (15, 0)
    wall "South" from (15, 0) to (0, 0)
    wall "West" from (0, 0) to (0, 10)

    # Space bounded by walls
    space "Lobby" [public] {
      bounded_by: ["South", "East", "North", "West"]

      # Door placed in wall
      door "Main Entry": SingleDoor in "South" at 7.5m {
        swing: outward
      }
    }
  }
}
```

## Key Features

### Type System

Types can define parameters, inherit, and override:

```biml
# Base type with parameters
type Door {
  param width: Length = 900mm in 600mm..1200mm
  param height: Length = 2100mm
  ifc_class: IfcDoor
}

# Single inheritance with : syntax
type SingleDoor : Door {
  material: WarmOak
}

# Override inherited parameter
type FireDoor : SingleDoor {
  width = 1000mm
  material: SteelGray
}
```

### Coordinate-Based Walls

Walls are defined by explicit start/end coordinates:

```biml
wall "Name" from (x1, y1) to (x2, y2)
```

### Explicit Space Boundaries

Spaces reference walls that bound them:

```biml
space "Room" {
  bounded_by: ["Wall1", "Wall2", "Wall3", "Wall4"]
}
```

### Element Placement in Walls

Doors and windows are placed in specific walls at positions:

```biml
door "D1": DoorType in "WallName" at 5m
window "W1": WindowType in "WallName" at center
```

## Type Hierarchy

```
Libraries → Types → Building Elements
```

- **Libraries**: Contain materials and types
- **Types**: Define parameters and can inherit from other types
- **Building Elements**: Reference types (doors, windows, furniture)

## Run Tests

```bash
# TypeScript tests
bun test

# Python compiler tests
cd ../compiler && uv run pytest
```

## Standard Library

Import stdlib files by path:

- `stdlib/elements/doors.biml`
- `stdlib/elements/windows.biml`
- `stdlib/furniture/office.biml`
- `stdlib/structure/columns.biml`
- `stdlib/materials/common.biml`

