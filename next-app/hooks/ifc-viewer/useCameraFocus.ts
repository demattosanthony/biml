import { useViewerStore } from "@/store/useViewerStore";
import { useCallback } from "react";
import * as THREE from "three";
import * as OBC from "@thatopen/components";

export function useCameraFocus() {
  const { world, models, components } = useViewerStore();

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
