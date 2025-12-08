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

export function createBimServices(context: DefaultSharedCoreModuleContext): {
  shared: LangiumSharedCoreServices;
  Bim: LangiumCoreServices;
} {
  const shared = inject(
    createDefaultSharedCoreModule(context),
    BimLangGeneratedSharedModule
  );

  const Bim = inject(createDefaultCoreModule({ shared }), BimGeneratedModule);

  shared.ServiceRegistry.register(Bim);

  return { shared, Bim };
}
