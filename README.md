# Building Information Modeling Language (BIML)

biml is a domain specific language designed for BIM model generation.

- **Compiles to IFC:** Easily integrates with existing BIM tools
- **Parametric design:** Change a floor height and doors, windows, and ceilings adjust automatically. The compiler handles downstream dependencies.
- **Easy to use:** Simple, declarative syntax
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
# Simple two-room office with connecting door

floor Ground {
  elevation: 0m
  height: 3.5m
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

door {
  from: Lobby
  to: Hallway
  width: 1.2m
}
```

## Development

```bash
bun install              # Install dependencies
bun run test             # Run all tests
bun run build            # Build biml
```
