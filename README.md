# davinci

AI-powered BIM generation using a domain-specific language.

## Architecture

```
.bim file → bim-lang (parse) → JSON IR → compiler → .ifc file
```

## Packages

| Package    | Language   | Description                      |
| ---------- | ---------- | -------------------------------- |
| `bim-lang` | TypeScript | DSL parser built with Langium    |
| `compiler` | Python     | IFC generator using IfcOpenShell |

## Quick Start

```bash
# Parse .bim to JSON IR
bun packages/bim-lang/bin/cli.ts parse file.bim

# Full pipeline: .bim → .ifc
bun packages/bim-lang/bin/cli.ts parse file.bim | \
  (cd packages/compiler && uv run bim-compile - -o output.ifc)
```

## Example

```
project "Office Building" {
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
}
```

## Development

```bash
bun install              # Install dependencies
bun run test             # Run all tests
bun run build            # Build bim-lang
```
