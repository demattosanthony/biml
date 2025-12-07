# davinci

AI agent system for generating BIM (Building Information Models) via a domain-specific language.

## Problem

Existing approaches to AI-driven BIM generation don't work:

**Revit**

- Prohibitive licensing and expensive APIs
- APIs don't expose what's needed for programmatic generation
- Application too complex for LLM computer-use, even as the technology matures

**IfcOpenShell (raw)**

- Scripts become unmanageably complex for real buildings
- No support for parametric design patterns
- No equivalent to Revit families (reusable, parameterized components)

## Solution

A domain-specific language (`.biml`) designed for AI agents to generate BIM models.

**Key insight:** Instead of fighting existing tools, create a language that maps cleanly to BIM concepts while being simple enough for LLMs to write correctly.

**Killer feature:** Parametric design built into the language. Change a floor height and doors, windows, and ceilings adjust automatically. The compiler handles downstream dependencies.

## Architecture

```
.biml file (DSL)
    │
    ▼
┌─────────────┐
│   Langium   │  Parse DSL, produce AST
│   (TypeScript)
└─────────────┘
    │
    ▼
  JSON IR      Intermediate representation
    │
    ▼
┌─────────────┐
│  Compiler   │  Transform IR to IFC
│  (Python +  │
│ IfcOpenShell)
└─────────────┘
    │
    ▼
  .ifc file    Industry standard BIM format
```

## DSL Example

```biml
# Flat, reference-based syntax inspired by Terraform/HCL

floor Level1 {
  elevation: 0m
  height: 3.5m
}

room Reception {
  floor: Level1
  position: [0, 0]
  area: 50m²
}

room Hallway {
  floor: Level1
  position: [0, 1]
  width: 2m
  length: 10m
}

door {
  from: Reception
  to: Hallway
  width: 1.2m
}
```

Syntax principles:

- Flat structure with references (like Terraform/HCL)
- Grid-based room positioning for automatic adjacency detection
- Shared walls generated automatically between adjacent rooms
- Doors create proper IFC openings (IfcOpeningElement + IfcRelVoidsElement)
- Units explicit in values (`m`, `m²`)

## Project Structure

```
davinci/
├── packages/
│   ├── bim-lang/           # Langium grammar + TypeScript tooling
│   │   ├── src/
│   │   │   ├── language/   # Grammar + module
│   │   │   ├── cli/        # CLI for parsing .biml files
│   │   │   └── generated/  # Langium-generated code
│   │   ├── test/           # Bun tests
│   │   └── package.json
│   │
│   └── compiler/           # Python + IfcOpenShell
│       ├── src/
│       │   └── compiler/   # JSON IR → IFC transformation
│       └── pyproject.toml
│
├── ARCHITECTURE.md
└── package.json            # Bun workspace root
```

## Roadmap

**Phase 1: DSL**

- Define Langium grammar for core BIM concepts
- Implement parser producing JSON IR
- Focus: floors, rooms, doors (minimal viable set)

**Phase 2: v0 End-to-End**

- Build Python compiler (JSON IR → IFC)
- Complete flow: `.biml` → AST → JSON IR → `.ifc`
- Validate output opens in IFC viewers
