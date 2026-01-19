#!/usr/bin/env bun
import { Command } from "commander";
import { NodeFileSystem } from "langium/node";
import { URI } from "langium";
import * as fs from "node:fs";
import * as path from "node:path";
import { spawn } from "bun";
import { createBimServices } from "../src/language/bim-module";
import { generateJsonIR } from "../src/generator";
import type { Model } from "../src/generated/ast";

function exitWithErrors(title: string, errors: { message: string }[]): never {
  console.error(title);
  errors.forEach((e) => console.error(`  ${e.message}`));
  process.exit(1);
}

type ImportResolver = (importPath: string, fromPath: string) => string;

type ImportResult = {
  text: string;
  files: string[];
};

function resolveImportPath(importPath: string, fromPath: string): string {
  if (importPath.startsWith("stdlib/")) {
    const stdlibPath = path.resolve(__dirname, "../stdlib", importPath.slice("stdlib/".length));
    return stdlibPath;
  }
  if (path.isAbsolute(importPath)) {
    return importPath;
  }
  return path.resolve(path.dirname(fromPath), importPath);
}

function parseImportLine(line: string): string | null {
  const trimmed = line.trim();
  if (!trimmed.startsWith("import")) {
    return null;
  }
  const match = trimmed.match(/^import\s+"([^"]+)"\s*$/);
  if (!match) {
    throw new Error(`Unsupported import syntax: ${line}`);
  }
  return match[1];
}

function loadWithImports(entryPath: string, resolveImport: ImportResolver = resolveImportPath): ImportResult {
  const visited = new Set<string>();
  const orderedFiles: string[] = [];

  const loadFile = (filePath: string): string => {
    const absolutePath = path.resolve(filePath);
    if (visited.has(absolutePath)) {
      return "";
    }
    if (!fs.existsSync(absolutePath)) {
      throw new Error(`Import file not found: ${absolutePath}`);
    }
    visited.add(absolutePath);
    orderedFiles.push(absolutePath);

    const raw = fs.readFileSync(absolutePath, "utf-8");
    const lines = raw.split(/\r?\n/);
    const outputLines: string[] = [];

    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed.startsWith("param ") && trimmed.includes(" in ")) {
        outputLines.push(line.replace(/\s+in\s+.+$/, ""));
        continue;
      }
      const importPath = parseImportLine(line);
      if (importPath) {
        const resolved = resolveImport(importPath, absolutePath);
        outputLines.push(loadFile(resolved));
      } else {
        outputLines.push(line);
      }
    }

    return outputLines.join("\n");
  };

  const text = loadFile(entryPath);
  return { text, files: orderedFiles };
}

async function parseAndValidate(filePath: string): Promise<Model> {
  const services = createBimServices(NodeFileSystem);
  const { text } = loadWithImports(filePath);
  const uri = URI.file(path.resolve(filePath));
  const document = await services.shared.workspace.LangiumDocumentFactory.fromString(
    text,
    uri
  );
  await services.shared.workspace.DocumentBuilder.build([document], {
    validation: true,
  });

  const { lexerErrors, parserErrors } = document.parseResult;
  if (lexerErrors.length || parserErrors.length) {
    exitWithErrors("Parse errors:", [...lexerErrors, ...parserErrors]);
  }

  return document.parseResult.value as Model;
}

async function parseAction(
  filePath: string,
  options: { output?: string }
): Promise<void> {
  const absolutePath = path.resolve(filePath);
  if (!fs.existsSync(absolutePath)) {
    console.error(`File not found: ${absolutePath}`);
    process.exit(1);
  }

  const jsonIR = generateJsonIR(await parseAndValidate(absolutePath));

  if (options.output) {
    fs.writeFileSync(options.output, JSON.stringify(jsonIR, null, 2));
    console.log(`JSON IR written to ${options.output}`);
  } else {
    console.log(JSON.stringify(jsonIR, null, 2));
  }
}

async function compileAction(
  filePath: string,
  options: { output?: string; ir?: boolean }
): Promise<void> {
  const absolutePath = path.resolve(filePath);
  if (!fs.existsSync(absolutePath)) {
    console.error(`File not found: ${absolutePath}`);
    process.exit(1);
  }

  // Default output path: same name as input with .ifc extension
  // Resolve to absolute path so it works regardless of subprocess cwd
  const outputPath = path.resolve(
    options.output ?? absolutePath.replace(/\.biml$/, ".ifc")
  );

  // Parse and generate JSON IR
  const jsonIR = generateJsonIR(await parseAndValidate(absolutePath));

  // Optionally write IR file
  if (options.ir) {
    const irPath = outputPath.replace(/\.ifc$/, ".json");
    fs.writeFileSync(irPath, JSON.stringify(jsonIR, null, 2));
    console.log(`JSON IR written to ${irPath}`);
  }

  // Call Python compiler via subprocess, passing JSON IR via stdin
  // Use uv run from the compiler package directory, "-" tells it to read from stdin
  const compilerDir = path.resolve(__dirname, "../../compiler");
  const proc = spawn(["uv", "run", "bim-compile", "-", "-o", outputPath], {
    cwd: compilerDir,
    stdin: new Response(JSON.stringify(jsonIR)).body,
    stdout: "pipe", // Suppress Python's "Wrote ..." message, we print our own
    stderr: "inherit",
  });

  const exitCode = await proc.exited;
  if (exitCode !== 0) {
    console.error(`IFC compilation failed with exit code ${exitCode}`);
    process.exit(exitCode);
  }

  console.log(`IFC written to ${outputPath}`);
}

const program = new Command();
program
  .name("bimlc")
  .description("BIML compiler - compile .biml files to IFC")
  .version("0.1.0")
  .argument("<file>", "Path to .biml file")
  .option(
    "-o, --output <file>",
    "Output IFC file path (defaults to input name with .ifc)"
  )
  .option("--ir", "Also output the intermediate JSON IR")
  .action(compileAction);

program
  .command("parse <file>")
  .description("Parse a .biml file and output JSON IR (for debugging)")
  .option("-o, --output <file>", "Output file path (defaults to stdout)")
  .action(parseAction);

program.parse();
