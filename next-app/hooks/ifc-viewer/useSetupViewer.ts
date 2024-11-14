import { useEffect, useCallback, useRef } from "react";
import * as OBC from "@thatopen/components";
import * as OBCF from "@thatopen/components-front";
import * as WEBIFC from "web-ifc";
import * as THREE from "three";
import useIfcViewerStore from "@/stores/useIfcViewerStore";
import { useIfcLoader } from "./useIfcLoader";
import { useElementSelected } from "./useElementSelected";
import { useMouseControls } from "./useMouseControls";
import Stats from "stats.js";
import { OrientationGizmo } from "@/components/oritentation-gizmo";

// This hook sets up the IFC viewer with the given files
// It loads the world, fragments, highlighter, culler, and other components
// It sets up the callback events for element selection
export function useSetup(files: File[]) {
  const { loadIfcFile } = useIfcLoader();
  const setWorld = useIfcViewerStore((state) => state.actions.setWorld);
  const setFragments = useIfcViewerStore((state) => state.actions.setFragments);
  const setHighlighter = useIfcViewerStore(
    (state) => state.actions.setHighlighter
  );
  const setHider = useIfcViewerStore((state) => state.actions.setHider);
  const setLoadingModels = useIfcViewerStore(
    (state) => state.actions.setLoadingModels
  );
  const highlighter = useIfcViewerStore((state) => state.highlighter);
  const setComponents = useIfcViewerStore(
    (state) => state.actions.setComponents
  );
  const setCamera = useIfcViewerStore((state) => state.actions.setCamera);
  const { onSelection, onDeselection } = useElementSelected();

  const { handleMouseDown, handleMouseUp, handleMouseMove } =
    useMouseControls();
  const { focusOnModels } = useCameraFocus();

  // Add refs to track component instances
  const componentsRef = useRef<OBC.Components | null>(null);
  const worldRef = useRef<any>(null);

  const setupWorld = useCallback(async () => {
    console.log("Setting up world");
    const container = document.getElementById("ifc-viewer");
    if (!container) {
      return;
    }

    setLoadingModels(true);

    // Create new components instance if it doesn't exist
    if (!componentsRef.current) {
      componentsRef.current = new OBC.Components();
    }
    const components = componentsRef.current;
    setComponents(components);

    const worlds = components.get(OBC.Worlds);
    const world = worlds.create<
      OBC.SimpleScene,
      OBC.OrthoPerspectiveCamera,
      OBC.SimpleRenderer
    >();

    // Configure the world and add it to Zustand state
    world.scene = new OBC.SimpleScene(components);
    world.renderer = new OBC.SimpleRenderer(components, container);
    world.camera = new OBC.OrthoPerspectiveCamera(components);
    setWorld(world);

    setCamera(world.camera);

    // world.renderer.postproduction.enabled = true;
    // world.renderer.postproduction.customEffects.outlineEnabled = true;

    components.init();
    world.camera.controls.setLookAt(12, 6, 8, 0, 0, -10);
    world.scene.setup();

    // const grids = components.get(OBC.Grids);
    // // grids.config.color.setHex(0x666666);
    // const grid = grids.create(world);
    // grid.three.position.y -= 5;
    // world.renderer.postproduction.customEffects.excludedMeshes.push(grid.three);

    world.scene.three.background = null;

    // Configure excluded categories for the loader
    const fragments = components.get(OBC.FragmentsManager);
    const fragmentIfcLoader = components.get(OBC.IfcLoader);
    await fragmentIfcLoader.setup();
    const excludedCats = [
      WEBIFC.IFCTENDONANCHOR,
      WEBIFC.IFCREINFORCINGBAR,
      WEBIFC.IFCREINFORCINGELEMENT,
      WEBIFC.IFCSPACE,
    ];
    for (const cat of excludedCats) {
      fragmentIfcLoader.settings.excludedCategories.add(cat);
    }
    fragmentIfcLoader.settings.webIfc.COORDINATE_TO_ORIGIN = true;

    // Add fragments manager and set in Zustand state
    setFragments(fragments);

    // Highligher
    const highlighter = components.get(OBCF.Highlighter);
    highlighter.setup({
      world,
      hoverColor: new THREE.Color(0x0b99ff),
      selectionColor: new THREE.Color(0x0b99ff),
    });
    highlighter.zoomToSelection = true;
    setHighlighter(highlighter);

    const hider = components.get(OBC.Hider);
    setHider(hider);

    // Culler
    const cullers = components.get(OBC.Cullers);
    const culler = cullers.create(world);
    culler.config.threshold = 10;

    // Load each IFC file
    for (const file of files) {
      await loadIfcFile(world, file, fragmentIfcLoader, components, culler);
    }

    culler.needsUpdate = true;
    world.camera.controls.addEventListener("controlend", () => {
      culler.needsUpdate = true;
    });

    setLoadingModels(false);

    focusOnModels();

    const stats = new Stats();
    stats.showPanel(2);
    if (container) {
      container.append(stats.dom);
      stats.dom.style.position = "absolute"; // Ensure absolute positioning
      stats.dom.style.top = "0px"; // Adjust top position
      stats.dom.style.left = "0px"; // Adjust left position
      stats.dom.style.zIndex = "10"; // Ensure it is above other elements
    }
    world.renderer.onBeforeUpdate.add(() => stats.begin());
    world.renderer.onAfterUpdate.add(() => stats.end());

    // Add the orientation gizmo component
    new OrientationGizmo(components, world);

    // Handlw window resize
    const handleResize = () => {
      console.log("Resizing");
      world?.renderer?.resize();
      world?.camera?.updateAspect();
    };

    window.addEventListener("resize", handleResize);
  }, [files, loadIfcFile, setWorld, setFragments]);

  // Highlighter and on select element event
  useEffect(() => {
    if (!highlighter) return;

    highlighter?.events.select.onHighlight.add(onSelection);
    highlighter?.events.select.onClear.add(onDeselection);

    return () => {
      highlighter?.events.select.onHighlight.remove(onSelection);
      highlighter?.events.select.onClear.remove(onDeselection);
    };
  }, [onSelection]);

  // Run setup on component mount
  useEffect(() => {
    setupWorld();

    return () => {
      console.log("Cleanup");
      // Proper cleanup
      if (worldRef.current) {
        const world = worldRef.current;
        world.scene?.dispose();
        world.renderer?.dispose();
        world.camera?.dispose();
      }

      const fragments = useIfcViewerStore.getState().fragments;
      if (fragments) {
        fragments.dispose();
      }

      const highlighter = useIfcViewerStore.getState().highlighter;
      if (highlighter) {
        highlighter.events.select.onHighlight.remove(onSelection);
        highlighter.events.select.onClear.remove(onDeselection);
      }

      // Clear the store
      useIfcViewerStore.getState().actions.clearModels();
    };
  }, [files, setupWorld]);
}

export function useCameraFocus() {
  const world = useIfcViewerStore((state) => state.world);
  const models = useIfcViewerStore((state) => state.models);
  const components = useIfcViewerStore((state) => state.components);

  const focusOnModels = useCallback(() => {
    if (!world || !components || models.length === 0) return;

    // Create a new bounding box to encompass all models
    const combinedBBox = new THREE.Box3();
    const fragmentBbox = components.get(OBC.BoundingBoxer);

    // Add each model to the bounding box
    models.forEach(({ fragmentsGroup }) => {
      fragmentBbox.add(fragmentsGroup);
      // Get the mesh and compute its bounding box
      const boxMesh = fragmentBbox.getMesh();
      const modelBBox = new THREE.Box3().setFromObject(boxMesh);
      combinedBBox.union(modelBBox);
      fragmentBbox.reset();
    });

    // Calculate the center and size of the bounding box
    const center = new THREE.Vector3();
    combinedBBox.getCenter(center);

    // Calculate the bounding sphere
    const sphere = new THREE.Sphere();
    combinedBBox.getBoundingSphere(sphere);

    // Add a padding factor to give some space around the models
    const padding = 1.2;

    // Focus camera on the bounding sphere
    world.camera.controls?.fitToSphere(sphere, true);

    // Get current camera position
    const currentPosition = new THREE.Vector3();
    world.camera.controls?.getPosition(currentPosition, true);

    // Adjust the camera position to get a better view
    currentPosition.multiplyScalar(padding);
    world.camera.controls?.setPosition(
      currentPosition.x,
      currentPosition.y,
      currentPosition.z
    );

    // Look at the center of all models
    world.camera.controls?.setLookAt(
      currentPosition.x,
      currentPosition.y,
      currentPosition.z,
      center.x,
      center.y,
      center.z,
      true // Enable transition
    );
  }, [world, models, components]);

  return { focusOnModels };
}
