import { useEffect, useCallback } from "react";
import * as OBC from "@thatopen/components";
import * as OBCF from "@thatopen/components-front";
import * as WEBIFC from "web-ifc";
import * as THREE from "three";
import useIfcViewerStore from "@/stores/useIfcViewerStore";
import { useIfcLoader } from "./useIfcLoader";
import { useElementSelected } from "./useElementSelected";
import { useMouseControls } from "./useMouseControls";

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
  const { onSelection, onDeselection } = useElementSelected();

  const { handleMouseDown, handleMouseUp, handleMouseMove } =
    useMouseControls();

  const setupWorld = useCallback(async () => {
    const container = document.getElementById("ifc-viewer");
    if (!container) {
      return;
    }

    setLoadingModels(true);

    const components = new OBC.Components();
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
      hoverColor: new THREE.Color(0xff0000), // Red for hover
      selectionColor: new THREE.Color(0x00ff00), // Green for selection
    });
    highlighter.zoomToSelection = true;
    setHighlighter(highlighter);

    const hider = components.get(OBC.Hider);
    setHider(hider);

    // Load each IFC file
    for (const file of files) {
      await loadIfcFile(world, file, fragmentIfcLoader, components);
    }

    world.camera.updateAspect();
    setLoadingModels(false);
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
      // Clean up models or other resources if necessary
      const fragments = useIfcViewerStore.getState().fragments;
      fragments?.dispose();
      useIfcViewerStore.getState().actions.clearModels();
      useIfcViewerStore
        .getState()
        .highlighter?.events.select.onHighlight.remove(onSelection);
    };
  }, [files]);
}
