import { useCallback, useEffect, useRef } from "react";
import * as OBC from "@thatopen/components";
import * as WEBIFC from "web-ifc";
import * as OBCF from "@thatopen/components-front";
import * as THREE from "three";
import { FragmentsGroup } from "@thatopen/fragments";
import { EntityNode, IFCCategory } from "@/types/ifc";
import { useViewerStore } from "@/store/useViewerStore";
import { setupHighlighter } from "@/lib/viewer";
import { useElementSelected } from "./useElementSelected";
import { useCameraFocus } from "./useCameraFocus";

// Define a type for the memoization cache
type DecompositionCache = Map<number, EntityNode>;

export function useIfcLoader() {
  const setLoading = useViewerStore((state) => state.setLoading);
  const world = useViewerStore((state) => state.world);
  const components = useViewerStore((state) => state.components);
  const culler = useViewerStore((state) => state.culler);
  const setPlans = useViewerStore((state) => state.setPlans);
  const addModel = useViewerStore((state) => state.addModel);
  const categories = useViewerStore((state) => state.categories);
  const setCategories = useViewerStore((state) => state.setCategories);
  const models = useViewerStore((state) => state.models);
  const clearModels = useViewerStore((state) => state.clearModels);
  const highlighter = useViewerStore((state) => state.highlighter);
  const plans = useViewerStore((state) => state.plans);
  const setHighlighter = useViewerStore((state) => state.setHighlighter);

  const { onSelection, onDeselection } = useElementSelected();
  const { focusOnModels } = useCameraFocus();

  // Use a ref to store the cache to persist across re-renders without causing re-renders
  const decompositionCache = useRef<DecompositionCache>(new Map());

  /**
   * Recursively builds the decomposition tree for a given expressID.
   * Utilizes memoization to cache and reuse already processed nodes.
   */
  const getDecompositionTree = useCallback(
    async (
      components: OBC.Components,
      model: FragmentsGroup,
      expressID: number,
      inverseAttributes: OBC.InverseAttribute[]
    ): Promise<EntityNode | null> => {
      // Check if the node is already cached
      if (decompositionCache.current.has(expressID)) {
        return decompositionCache.current.get(expressID)!;
      }

      const indexer = components.get(OBC.IfcRelationsIndexer);

      const entityAttrs = await model.getProperties(expressID);
      if (!entityAttrs) return null;

      const { type, Name } = entityAttrs;
      const entityNode: EntityNode = {
        expressID,
        ifcClass: OBC.IfcCategoryMap[type], // Store the IFC class
        name: Name?.value || "",
        children: [],
      };

      // Cache the current node to prevent redundant processing
      decompositionCache.current.set(expressID, entityNode);

      // Collect all relations for parallel processing
      const relationPromises = inverseAttributes.map(async (attrName) => {
        const relations = indexer.getEntityRelations(
          model,
          expressID,
          attrName
        );
        if (!relations) return [];

        // Group children by their IFC class
        const entityGroups: Record<string, EntityNode[]> = {};

        // Initiate parallel processing of child nodes
        const childNodes = await Promise.all(
          relations.map(async (childId) => {
            const childNode = await getDecompositionTree(
              components,
              model,
              childId,
              inverseAttributes
            );
            return childNode;
          })
        );

        // Organize children by their IFC class
        childNodes.forEach((childNode) => {
          if (childNode) {
            const entity = childNode.ifcClass;
            if (!entityGroups[entity]) {
              entityGroups[entity] = [];
            }
            entityGroups[entity].push(childNode);
          }
        });

        return entityGroups;
      });

      // Wait for all relation promises to resolve
      const allEntityGroups = await Promise.all(relationPromises);

      // Merge all grouped children into the current node
      allEntityGroups.forEach((entityGroups) => {
        for (const [entity, children] of Object.entries(entityGroups)) {
          entityNode.children.push(...children);
        }
      });

      return entityNode;
    },
    []
  );

  /**
   * Computes the model tree starting from the root element.
   */
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

      // Reset the cache before building a new tree
      decompositionCache.current.clear();

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

  /**
   * Loads an IFC file, processes it, and adds it to the scene.
   */
  const loadIfcFile = useCallback(
    async (file: File): Promise<FragmentsGroup | null> => {
      if (!world || !components) {
        console.error("World or components not initialized.");
        return null;
      }
      const fragmentIfcLoader = components.get(OBC.IfcLoader);

      setLoading(true);
      try {
        const data = await file.arrayBuffer();
        const buffer = new Uint8Array(data);
        const model = await fragmentIfcLoader.load(buffer);
        model.name = file.name;

        world.scene.three.add(model);

        model.position.set(0, 0, 0);

        // Add instanced meshes to the culler if necessary
        const FILE_SIZE_THRESHOLD_FOR_CULLING = 100 * 1024 * 1024; // 100MB
        const fileSizeInBytes = file.size;
        if (culler && fileSizeInBytes > FILE_SIZE_THRESHOLD_FOR_CULLING) {
          model.traverse((child) => {
            if (child instanceof THREE.InstancedMesh) {
              culler.add(child);
            }
          });
        }

        const fragmentBbox = components.get(OBC.BoundingBoxer);
        fragmentBbox.add(model);
        const bbox = fragmentBbox.getMesh();
        fragmentBbox.reset();
        world.camera.controls?.fitToSphere(bbox, true);

        const indexer = components.get(OBC.IfcRelationsIndexer);
        if (model.hasProperties) {
          await indexer.process(model);
        }

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

        if (modelTree) {
          addModel({
            fragmentsGroup: model,
            name: file.name,
            content: file,
            tree: modelTree,
          });
        }

        // Generate floor plans
        const plans = components.get(OBCF.Plans);
        if (plans) {
          // Clear existing plans
          plans.dispose();
          // Reinitialize the plans with the new world
          plans.world = world;
          try {
            await plans.generate(model);
            setPlans(plans);
          } catch (error) {
            console.error("Error generating floor plans:", error);
            setPlans(null);
          }
        }

        // Extract all the categories
        const classifier = components.get(OBC.Classifier);

        // Save all ifc categories
        classifier.byEntity(model);
        const entities = classifier.list["entities"];

        const newCategories: Record<string, IFCCategory> = {
          ...categories,
        };

        // Iterate through each entity group
        Object.entries(entities).forEach(([groupName, entityData]) => {
          const categoryName = entityData.name;

          // If category doesn't exist, create it
          if (!newCategories[categoryName]) {
            newCategories[categoryName] = {
              name: categoryName,
              fragIds: {},
            };
          }

          // Update fragment IDs for this category
          // The map property from entities contains the fragment IDs for the current model
          newCategories[categoryName].fragIds[model.id] = entityData.map;
        });
        setCategories(newCategories);

        return model;
      } catch (error) {
        console.error("Error loading IFC file:", error);
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [
      addModel,
      computeModelTree,
      setPlans,
      world,
      components,
      culler,
      highlighter,
      setupHighlighter,
    ]
  );

  /**
   * Completely unload and clear all IFC models from scene and store.
   */
  const unloadAllIfcFiles = useCallback(async () => {
    if (!world || !components) return;

    setLoading(true);

    try {
      if (plans) {
        plans.dispose();
        setPlans(null);
      }

      const fragments = components.get(OBC.FragmentsManager);

      // 4. Remove models from scene and dispose
      for (const { fragmentsGroup } of models) {
        fragments.disposeGroup(fragmentsGroup);

        // Remove from culler first
        if (culler) {
          fragmentsGroup.traverse((child) => {
            if (child instanceof THREE.InstancedMesh) {
              culler.remove(child);
            }
          });
        }
        // Remove from scene
        world.scene?.three.remove(fragmentsGroup);

        fragmentsGroup.traverse((child) => {
          if (child instanceof THREE.Mesh) {
            if (child.geometry) child.geometry.dispose();
            if (child.material) {
              if (Array.isArray(child.material)) {
                child.material.forEach((material) => material.dispose());
              } else {
                child.material.dispose();
              }
            }
          }
        });
      }

      clearModels();
    } catch (error) {
      console.error("Failed to unload IFC models:", error);
    } finally {
      setLoading(false);
    }
  }, [world, components, models, culler, highlighter, plans]);

  //   Highlighter and on select element event
  useEffect(() => {
    if (!highlighter) return;

    console.log("Setting up highlighter events");

    highlighter?.events.select?.onHighlight.add(onSelection);
    highlighter?.events.select?.onClear.add(onDeselection);

    return () => {
      highlighter?.events.select?.onHighlight.remove(onSelection);
      highlighter?.events.select?.onClear.remove(onDeselection);
    };
  }, [onSelection, highlighter, onDeselection]);

  useEffect(() => {
    focusOnModels();
  }, [models]);

  return { loadIfcFile, unloadAllIfcFiles };
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
