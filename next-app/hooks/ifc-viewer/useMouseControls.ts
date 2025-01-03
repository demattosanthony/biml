import { useViewerStore } from "@/store/useViewerStore";
import { useCallback, useRef, useState } from "react";
import * as THREE from "three";

export function useMouseControls() {
  const { world } = useViewerStore();
  const [isMouseDown, setIsMouseDown] = useState(false);

  const raycasterRef = useRef(new THREE.Raycaster());
  const normalizedMouseRef = useRef(new THREE.Vector2());

  const handleMouseDown = useCallback(() => {
    setIsMouseDown(true);
  }, []);

  const handleMouseUp = useCallback(() => {
    setIsMouseDown(false);
  }, []);

  const handleMouseMove = useCallback(
    (event: MouseEvent) => {
      if (!isMouseDown && world) {
        const { renderer, camera, scene } = world;
        if (renderer && camera && scene) {
          const domElement = renderer.three.domElement;
          const elRect = domElement.getBoundingClientRect();
          const { clientX, clientY } = event;

          const canvasX = clientX - elRect.left;
          const canvasY = clientY - elRect.top;

          const normalizedMouse = normalizedMouseRef.current;
          normalizedMouse.set(
            (canvasX / elRect.width) * 2 - 1,
            -(canvasY / elRect.height) * 2 + 1
          );

          const raycaster = raycasterRef.current;
          camera.three.updateMatrixWorld();
          raycaster.setFromCamera(normalizedMouse, camera.three);

          const intersects = raycaster.intersectObjects(
            scene.three.children,
            true
          );

          if (intersects.length > 0) {
            const intersectionPoint = intersects[0].point;
            camera.controls?.setOrbitPoint(
              intersectionPoint.x,
              intersectionPoint.y,
              intersectionPoint.z
            );
          }
        }
      }
    },
    [isMouseDown, world]
  );

  // TODO: If this is on then it messed up the 2d plan view. Need to fix.
  // useEffect(() => {
  //   window.addEventListener("mousedown", handleMouseDown);
  //   window.addEventListener("mouseup", handleMouseUp);
  //   window.addEventListener("mousemove", handleMouseMove);

  //   return () => {
  //     window.removeEventListener("mousedown", handleMouseDown);
  //     window.removeEventListener("mouseup", handleMouseUp);
  //     window.removeEventListener("mousemove", handleMouseMove);
  //   };
  // }, [handleMouseDown, handleMouseUp, handleMouseMove]);

  return { handleMouseDown, handleMouseUp, handleMouseMove };
}
