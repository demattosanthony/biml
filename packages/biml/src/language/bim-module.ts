import {
  inject,
  createDefaultCoreModule,
  createDefaultSharedCoreModule,
  type DefaultSharedCoreModuleContext,
  type LangiumCoreServices,
  type LangiumSharedCoreServices,
} from "langium";
import {
  BimGeneratedModule,
  BimLangGeneratedSharedModule,
} from "../generated/module";

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

  return { shared, Bim };
}
