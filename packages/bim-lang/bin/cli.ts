#!/usr/bin/env bun
import { Command } from "commander";
import { NodeFileSystem } from "langium/node";
import { URI } from "langium";
import * as fs from "node:fs";
import * as path from "node:path";
import { createBimServices } from "../src/language/bim-module";
import { generateJsonIR } from "../src/generator";
import type { Model } from "../src/generated/ast";

function exitWithErrors(title: string, errors: { message: string }[]): never {
  console.error(title);
  errors.forEach((e) => console.error(`  ${e.message}`));
  process.exit(1);
}

async function parseAndValidate(filePath: string): Promise<Model> {
  const services = createBimServices(NodeFileSystem);
  const uri = URI.file(path.resolve(filePath));
  const document =
    await services.shared.workspace.LangiumDocumentFactory.fromUri(uri);
  await services.shared.workspace.DocumentBuilder.build([document], {
    validation: true,
  });

  const { lexerErrors, parserErrors } = document.parseResult;
  if (lexerErrors.length || parserErrors.length) {
    exitWithErrors("Parse errors:", [...lexerErrors, ...parserErrors]);
  }

  const validationErrors = (document.diagnostics ?? []).filter(
    (d) => d.severity === 1
  );
  if (validationErrors.length) {
    exitWithErrors("Validation errors:", validationErrors);
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
    console.error(`JSON IR written to ${options.output}`);
  } else {
    console.log(JSON.stringify(jsonIR, null, 2));
  }
}

const program = new Command();
program.name("bim").description("BIM DSL parser and compiler").version("0.1.0");

program
  .command("parse")
  .description("Parse a .bim file and output JSON IR")
  .argument("<file>", "Path to .bim file")
  .option("-o, --output <file>", "Output file path (defaults to stdout)")
  .action(parseAction);

program.parse();
