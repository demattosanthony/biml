# bim-lang

DSL for BIM model generation.

## Quick Start

```bash
# Parse a .biml file to JSON IR
bun ./bin/cli.ts parse test/fixtures/simple.biml

# Save to file
bun ./bin/cli.ts parse test/fixtures/simple.biml -o output.json

# Pipe to compiler (generates IFC)
bun ./bin/cli.ts parse test/fixtures/simple.biml | (cd ../compiler && uv run bim-compile - -o model.ifc)
```

## Example .biml File

```biml
# Multi-floor building with rooms and doors

floor Ground {
  elevation: 0m
  height: 3.5m
}

floor Level1 {
  elevation: 3.5m
  height: 3m
}

room Lobby {
  floor: Ground
  position: [0, 0]
  area: 100m²
}

room Hallway {
  floor: Ground
  position: [0, 1]
  width: 2m
  length: 15m
}

room Office {
  floor: Level1
  position: [0, 0]
  area: 25m²
}

door {
  from: Lobby
  to: Hallway
  width: 1.2m
}
```

## Run Tests

```bash
bun test
```
