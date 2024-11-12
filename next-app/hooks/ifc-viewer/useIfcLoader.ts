import { useCallback, useState } from "react";
import * as OBC from "@thatopen/components";
import * as WEBIFC from "web-ifc";
import * as OBCF from "@thatopen/components-front";
import useIfcViewerStore from "@/stores/useIfcViewerStore";
import { FragmentsGroup } from "@thatopen/fragments";

interface EntityNode {
  expressID: number;
  ifcClass: string; // Updated to store the IFC class
  name: string;
  children: EntityNode[];
}

export function useIfcLoader() {
  const [loadingModel, setLoadingModel] = useState(false);
  const addModel = useIfcViewerStore((state) => state.actions.addModel);
  const setPlans = useIfcViewerStore((state) => state.actions.setPlans);

  // Helper function to recursively build the decomposition tree
  const getDecompositionTree = useCallback(
    async (
      components: OBC.Components,
      model: FragmentsGroup,
      expressID: number,
      inverseAttributes: OBC.InverseAttribute[]
    ): Promise<EntityNode | null> => {
      const indexer = components.get(OBC.IfcRelationsIndexer);

      const entityAttrs = await model.getProperties(expressID);

      if (!entityAttrs) return null;

      const { type, Name } = entityAttrs;
      const entityNode: EntityNode = {
        expressID,
        ifcClass: OBC.IfcCategoryMap[type], // Store the IFC class here
        name: Name?.value || "",
        children: [],
      };

      for (const attrName of inverseAttributes) {
        const relations = indexer.getEntityRelations(
          model,
          expressID,
          attrName
        );
        if (!relations) continue;

        for (const id of relations) {
          const childNode = await getDecompositionTree(
            components,
            model,
            id,
            inverseAttributes
          );
          if (childNode) {
            entityNode.children.push(childNode);
          }
        }
      }

      return entityNode;
    },
    []
  );

  // Function to compute the model tree starting from the root element
  const computeModelTree = useCallback(
    async (
      components: OBC.Components,
      model: FragmentsGroup,
      inverseAttributes: OBC.InverseAttribute[],
      expressID?: number
    ): Promise<EntityNode | null> => {
      let rootExpressID = expressID;

      if (rootExpressID === undefined) {
        // Get the root element, usually IFCPROJECT
        const projectAttrs = await model.getAllPropertiesOfType(
          WEBIFC.IFCPROJECT
        );
        if (!projectAttrs) return null;
        const projectValues = Object.values(projectAttrs);
        if (projectValues.length === 0) return null;
        rootExpressID = projectValues[0].expressID;
      }

      const tree = await getDecompositionTree(
        components,
        model,
        rootExpressID!,
        inverseAttributes
      );

      return tree;
    },
    [getDecompositionTree]
  );

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

        // Define the inverse attributes to traverse
        const inverseAttributes: OBC.InverseAttribute[] = [
          "IsDecomposedBy",
          "ContainsElements",
        ];

        // Compute the model tree
        const modelTree = await computeModelTree(
          components,
          model,
          inverseAttributes
        );

        console.log("Model tree:", modelTree);

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
