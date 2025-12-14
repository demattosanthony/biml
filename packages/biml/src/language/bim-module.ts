import {
  inject,
  createDefaultCoreModule,
  createDefaultSharedCoreModule,
  type DefaultSharedCoreModuleContext,
  type LangiumCoreServices,
  type LangiumSharedCoreServices,
  type ValidationChecks,
} from "langium";
import {
  BimGeneratedModule,
  BimLangGeneratedSharedModule,
} from "../generated/module.js";
import { registerValidationChecks } from "./bim-validator.js";
import type { BimLangAstType } from "../generated/ast.js";

/**
 * Combined services type for BIML.
 */
export type BimServices = LangiumCoreServices;

export function createBimServices(context: DefaultSharedCoreModuleContext): {
  shared: LangiumSharedCoreServices;
  Bim: BimServices;
} {
  const shared = inject(
    createDefaultSharedCoreModule(context),
    BimLangGeneratedSharedModule
  );

  const Bim = inject(
    createDefaultCoreModule({ shared }),
    BimGeneratedModule
  );

  shared.ServiceRegistry.register(Bim);

  // Register validation checks
  const checks: ValidationChecks<BimLangAstType> = {};
  registerValidationChecks(checks);
  Bim.validation.ValidationRegistry.register(checks);

  return { shared, Bim };
}
