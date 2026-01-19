# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

BIML (Building Information Modeling Language) is a domain-specific language that compiles to IFC format. It consists of two packages in a Bun monorepo:

- **biml** (TypeScript): Langium-based DSL parser that outputs JSON IR
- **compiler** (Python): Converts JSON IR to IFC files using IfcOpenShell

## Build & Development Commands

```bash
# Install dependencies
bun install

# Build the biml package
bun run build

# TypeScript type checking
bun run typecheck

# Run all tests (TypeScript + Python)
bun run test

# Run TypeScript tests only
bun run test:biml
# Or directly: cd packages/biml && bun test

# Run a single TypeScript test file
cd packages/biml && bun test test/parser.test.ts

# Run Python tests only
bun run test:compiler
# Or directly: cd packages/compiler && uv run pytest tests/ -v

# Compile .biml to IFC
bun run bimlc <file.biml> -o output.ifc

# Parse to JSON IR only
bun run bimlc parse <file.biml> -o output.json

# Compile with IR output (saves both .ifc and .json)
bun run bimlc <file.biml> -o output.ifc --ir
```

## Architecture

```
.biml file → Langium Parser → AST → Generator → JSON IR → Python Compiler → .ifc
```

### Compilation Pipeline

1. **CLI** (`packages/biml/bin/cli.ts`): Entry point, handles imports and orchestrates compilation
2. **Langium Parser** (`packages/biml/src/language/bim.langium`): Grammar definition, auto-generates parser/AST types in `src/language/generated/`
3. **Validator** (`packages/biml/src/language/bim-validator.ts`): Semantic validation rules
4. **Scope Provider** (`packages/biml/src/language/bim-scope.ts`): Symbol resolution for type references
5. **Generator** (`packages/biml/src/generator.ts`): Converts Langium AST to JSON IR
6. **Python IR** (`packages/compiler/src/compiler/ir.py`): Dataclasses for JSON IR deserialization
7. **IFC Generator** (`packages/compiler/src/compiler/ifc.py`): Creates IFC geometry using IfcOpenShell

### Key Directories

| Path | Purpose |
|------|---------|
| `packages/biml/src/language/` | Langium grammar, validators, scope resolution |
| `packages/biml/src/language/generated/` | Auto-generated parser code (regenerate with `langium generate`) |
| `packages/biml/stdlib/` | Standard library (doors, windows, furniture, materials) |
| `packages/compiler/src/compiler/` | Python IFC generation |
| `examples/` | Complete working BIML examples |

## Language Design

BIML uses a unified **type system** where types can:
- Define parameters with defaults: `param width: Length = 900mm`
- Extend other types: `type SingleDoor : Door { ... }`
- Override inherited parameters: `width = 1000mm`
- Reference materials and IFC classes

Walls are **coordinate-based**: `wall "North" from (0, 10) to (20, 10)`

Spaces reference walls by name: `bounded_by: ["North", "East", "South", "West"]`

## Modifying the Grammar

1. Edit `packages/biml/src/language/bim.langium`
2. Run `cd packages/biml && bun run langium generate` to regenerate parser
3. Update validator (`bim-validator.ts`) and scope provider (`bim-scope.ts`) if needed
4. Update generator (`generator.ts`) to handle new AST nodes
5. Update Python IR (`ir.py`) and IFC generator (`ifc.py`) for new elements
