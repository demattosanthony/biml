# bim-lang

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
