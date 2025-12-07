# davinci

AI-powered BIM generation using a domain-specific language.

## Architecture

```
.biml file → bim-lang (parse) → JSON IR → compiler → .ifc file
```

## Packages

| Package    | Language   | Description                      |
| ---------- | ---------- | -------------------------------- |
| `bim-lang` | TypeScript | DSL parser built with Langium    |
| `compiler` | Python     | IFC generator using IfcOpenShell |

## Quick Start

```bash
# Parse .biml to JSON IR
bun packages/bim-lang/bin/cli.ts parse file.biml

# Full pipeline: .biml → .ifc
bun packages/bim-lang/bin/cli.ts parse file.biml | \
  (cd packages/compiler && uv run bim-compile - -o output.ifc)
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
bun run build            # Build bim-lang
```
