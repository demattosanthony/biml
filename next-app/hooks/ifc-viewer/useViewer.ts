import { useViewerStore } from "@/store/useViewerStore";
import { useCallback } from "react";
import * as OBC from "@thatopen/components";
import {
  createWorld,
  setupCuller,
  setupFragments,
  setupHider,
  setupHighlighter,
  setupStats,
} from "@/lib/viewer";
import { OrientationGizmo } from "@/components/oritentation-gizmo";

export function useViewer(containerId: string) {
  const setWorld = useViewerStore((state) => state.setWorld);
  const setCamera = useViewerStore((state) => state.setCamera);
  const setComponents = useViewerStore((state) => state.setComponents);
  const setFragments = useViewerStore((state) => state.setFragments);
  const setCuller = useViewerStore((state) => state.setCuller);
  const setHighlighter = useViewerStore((state) => state.setHighlighter);
  const setHider = useViewerStore((state) => state.setHider);
  const setLoading = useViewerStore((state) => state.setLoading);
  const reset = useViewerStore((state) => state.reset);

  const initializeViewer = useCallback(async () => {
    const container = document.getElementById(containerId);
    if (!container) return;

    setLoading(true);

    try {
      const components = new OBC.Components();
      const world = createWorld(components, container);
      const fragments = await setupFragments(components);
      const highlighter = setupHighlighter(world, components);
      const culler = setupCuller(world, components);
      const hider = setupHider(components);
      setupStats(world, container);

      setComponents(components);
      setWorld(world);
      setFragments(fragments);
      setHighlighter(highlighter);
      setCamera(world.camera);
      setCuller(culler);
      setHider(hider);

      // Add the orientation gizmo component
      new OrientationGizmo(components, world);

      // Handlw window resize
      const handleResize = () => {
        console.log("Resizing");
        world?.renderer?.resize();
        world?.camera?.updateAspect();
      };
      window.addEventListener("resize", handleResize);

      // Handle control events
      world.camera.controls.addEventListener("controlend", () => {
        culler.needsUpdate = true;
      });

      return () => {
        world?.dispose();
        fragments?.dispose();
        highlighter?.dispose();
        components?.dispose();
        culler?.dispose();
        reset();
      };
    } catch (error) {
      console.error("Failed to initialize viewer:", error);
    } finally {
      setLoading(false);
    }
  }, [containerId]);

  return { initializeViewer };
}
