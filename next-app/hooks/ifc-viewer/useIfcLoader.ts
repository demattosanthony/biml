import { useCallback, useState } from "react";
import * as OBC from "@thatopen/components";
import * as OBCF from "@thatopen/components-front";
import useIfcViewerStore from "@/stores/useIfcViewerStore";

export function useIfcLoader() {
  const [loadingModel, setLoadingModel] = useState(false);
  const addModel = useIfcViewerStore((state) => state.actions.addModel);
  const setPlans = useIfcViewerStore((state) => state.actions.setPlans);

  const loadIfcFile = useCallback(
    async (
      world: OBC.World | null,
      file: File,
      fragmentIfcLoader: OBC.IfcLoader,
      components: OBC.Components
    ) => {
      if (!world || !fragmentIfcLoader)
        throw new Error("World or loader not set");

      setLoadingModel(true);
      try {
        const data = await file.arrayBuffer();
        const buffer = new Uint8Array(data);
        const model = await fragmentIfcLoader.load(buffer);
        model.name = file.name;

        world.scene.three.add(model);
        addModel({ fragmentsGroup: model, name: file.name, content: file });

        const fragmentBbox = components.get(OBC.BoundingBoxer);
        fragmentBbox.add(model);
        const bbox = fragmentBbox.getMesh();
        fragmentBbox.reset();
        world.camera.controls?.fitToSphere(bbox, true);

        const indexer = components.get(OBC.IfcRelationsIndexer);
        await indexer.process(model);

        const plans = components.get(OBCF.Plans);
        plans.world = world;
        await plans.generate(model);
        setPlans(plans);
      } catch (error) {
        console.error("Error loading IFC file:", error);
      } finally {
        setLoadingModel(false);
      }
    },
    [addModel]
  );

  return { loadIfcFile, loadingModel };
}

// Load IFC model
// async function loadIfc(
//   world: OBC.World,
//   components: OBC.Components,
//   fragments: OBC.FragmentsManager,
//   fragmentIfcLoader: OBC.IfcLoader,
//   culler: OBC.MeshCullerRenderer
// ) {
//   setLoadingModel(true);
//   // Loading Fragments
//   const fragFile = await fetch(
//     "https://syystorage.blob.core.windows.net/test/small.frag"
//   );
//   const fragData = await fragFile.arrayBuffer();
//   const fragBuffer = new Uint8Array(fragData);
//   const model = fragments.load(fragBuffer);
//   world.scene.three.add(model);
//   addModel({ fragmentsGroup: model, name: modelName, content: });

//   // const propsFile = await fetch(
//   //   "https://syystorage.blob.core.windows.net/test/small.json"
//   // );
//   // const propsData = await propsFile.json();
//   // model.setLocalProperties(propsData);

//   for (const child of model.children) {
//     if (child instanceof THREE.InstancedMesh) {
//       culler.add(child);
//     }
//   }
//   culler.needsUpdate = true;

//   setLoadingModel(false);

//   // const propsFile = await fetch(
//   //   // "https://syystorage.blob.core.windows.net/test/dunbar-plumb-small.json"
//   //   "https://syystorage.blob.core.windows.net/test/small.json"
//   //   // "https://thatopen.github.io/engine_components/resources/small.json"
//   // );
//   // const propsData = await propsFile.json();
//   // model.setLocalProperties(propsData);
//   // setModel(model);

//   // Loading plain ifc file
//   // const file = await fetch(
//   //   // "https://thatopen.github.io/engine_components/resources/small.ifc"
//   //   // "https://syystorage.blob.core.windows.net/test/Dunbar_High_School_Mechanical.ifc"
//   //   "https://syystorage.blob.core.windows.net/test/Dunbar_High_School_Plumbing.ifc"
//   // );
//   try {
//   } catch (err) {
//     console.error(err);
//     setLoadingModel(false);
//   }
// }
