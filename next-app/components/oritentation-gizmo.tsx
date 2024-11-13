import * as THREE from "three";
import * as OBC from "@thatopen/components";

interface GizmoSettings {
  size?: number;
  padding?: number;
  rotationSpeed?: number;
  updateInterval?: number;
}

// Utility class for sprite creation and management
class DirectionSprite {
  private static createTexture(
    color: THREE.Color,
    text: string | null = null
  ): THREE.CanvasTexture {
    const canvas = document.createElement("canvas");
    canvas.width = 128;
    canvas.height = 64;
    const context = canvas.getContext("2d")!;

    // Draw colored circle
    context.beginPath();
    context.arc(32, 32, 32, 0, 2 * Math.PI);
    context.fillStyle = color.getStyle();
    context.fill();

    // Draw white circle
    context.beginPath();
    context.arc(96, 32, 32, 0, 2 * Math.PI);
    context.fillStyle = "#FFFFFF";
    context.fill();

    if (text !== null) {
      context.font = "bold 48px Arial";
      context.textAlign = "center";
      context.fillStyle = "#000000";
      context.fillText(text.toUpperCase(), 32, 48);
      context.fillText(text.toUpperCase(), 96, 48);
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.x = 0.5;
    return texture;
  }

  static create(color: THREE.Color, text: string | null = null): THREE.Sprite {
    const material = new THREE.SpriteMaterial({
      map: DirectionSprite.createTexture(color, text),
      transparent: true,
      sizeAttenuation: false,
      depthTest: false,
      depthWrite: false,
    });

    const sprite = new THREE.Sprite(material);
    sprite.center.set(0.5, 0.5);
    return sprite;
  }
}

export class OrientationGizmo extends OBC.Component implements OBC.Disposable {
  static readonly uuid = "8f7e3f91-6314-4f57-9478-c95c2a137d44";

  readonly onDisposed = new OBC.Event();
  enabled = true;

  private readonly axesColors = [
    new THREE.Color(0xff3653), // x-axis
    new THREE.Color(0x8adb00), // y-axis
    new THREE.Color(0x2c8fff), // z-axis
  ];

  private readonly settings: Required<GizmoSettings>;
  private readonly staticDirections: THREE.Vector3[];
  private readonly cameraDirection = new THREE.Vector3();
  private readonly dotDirection = new THREE.Vector3();
  private readonly rotationStart = new THREE.Euler();
  private readonly mouseStart = new THREE.Vector2();
  private readonly mouseAngle = new THREE.Vector2();
  private readonly q1 = new THREE.Quaternion();
  private readonly lastCameraQuaternion = new THREE.Quaternion();

  private gizmoMesh: THREE.Object3D;
  private camera?: OBC.OrthoPerspectiveCamera;
  private scene?: OBC.SimpleScene;
  private isDragging = false;
  private gizmoContainer: HTMLDivElement | null = null;
  private gizmoRenderer: THREE.WebGLRenderer | null = null;
  private gizmoCamera: THREE.OrthographicCamera | null = null;
  private gizmoScene: THREE.Scene | null = null;
  private directionDots: THREE.Sprite[] = [];
  private isInitialized = false;
  private animationFrameId: number | null = null;
  private lastUpdateTime = 0;
  private radius = 0;

  constructor(components: OBC.Components, settings: GizmoSettings = {}) {
    super(components);
    components.add(OrientationGizmo.uuid, this);

    this.settings = {
      size: settings.size ?? 150,
      padding: settings.padding ?? 10,
      rotationSpeed: settings.rotationSpeed ?? 5,
      updateInterval: settings.updateInterval ?? 1000 / 30,
    };

    this.staticDirections = [
      new THREE.Vector3(1, 0, 0), // +X
      new THREE.Vector3(0, 1, 0), // +Y
      new THREE.Vector3(0, 0, 1), // +Z
      new THREE.Vector3(-1, 0, 0), // -X
      new THREE.Vector3(0, -1, 0), // -Y
      new THREE.Vector3(0, 0, -1), // -Z
    ];

    this.gizmoMesh = this.createGizmo();
  }

  async setup(world: {
    scene: OBC.SimpleScene;
    camera: OBC.OrthoPerspectiveCamera;
    renderer: OBC.SimpleRenderer;
  }): Promise<void> {
    this.cleanup();

    this.scene = world.scene;
    this.camera = world.camera;

    await this.initializeGizmo(world.renderer);
    this.createDirectionDots();
    this.setupInteraction();

    this.isInitialized = true;
    this.startAnimation();
  }

  private async initializeGizmo(renderer: OBC.SimpleRenderer): Promise<void> {
    this.gizmoScene = new THREE.Scene();
    this.gizmoScene.add(this.gizmoMesh);

    this.gizmoCamera = new THREE.OrthographicCamera(
      -this.settings.size / 2,
      this.settings.size / 2,
      this.settings.size / 2,
      -this.settings.size / 2,
      0.1,
      1000
    );
    this.gizmoCamera.position.set(0, 0, 200);
    this.gizmoCamera.lookAt(0, 0, 0);

    const container = renderer.container.parentElement;
    if (!container) {
      throw new Error("No container element found for renderer");
    }

    this.gizmoRenderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
    });
    this.gizmoRenderer.setSize(
      this.settings.size + this.settings.padding * 2,
      this.settings.size + this.settings.padding * 2
    );
    this.gizmoRenderer.setPixelRatio(window.devicePixelRatio);

    this.gizmoContainer = this.createGizmoContainer();
    this.gizmoContainer.appendChild(this.gizmoRenderer.domElement);
    container.appendChild(this.gizmoContainer);

    // Wait for next frame to ensure initialization
    await new Promise(requestAnimationFrame);

    // Show container with fade
    requestAnimationFrame(() => {
      if (this.gizmoContainer) {
        this.gizmoContainer.style.transition = "opacity 0.3s ease-in";
        this.gizmoContainer.style.opacity = "1";
      }
    });
  }

  private createGizmoContainer(): HTMLDivElement {
    const container = document.createElement("div");
    container.style.position = "absolute";
    container.style.top = "10px";
    container.style.right = "10px";
    container.style.zIndex = "9";
    container.style.cursor = "grab";
    container.style.opacity = "0";
    return container;
  }

  private createGizmo(): THREE.Object3D {
    const gizmo = new THREE.Object3D();
    const axisLength = 50;

    const createAxis = (color: THREE.Color, direction: THREE.Vector3) => {
      const geometry = new THREE.BufferGeometry();
      geometry.setAttribute(
        "position",
        new THREE.Float32BufferAttribute(
          [
            0,
            0,
            0,
            direction.x * axisLength,
            direction.y * axisLength,
            direction.z * axisLength,
          ],
          3
        )
      );

      return new THREE.Line(
        geometry,
        new THREE.LineBasicMaterial({ color, linewidth: 3 })
      );
    };

    const axes = this.staticDirections
      .slice(0, 3)
      .map((dir, i) => createAxis(this.axesColors[i], dir));

    gizmo.add(...axes);
    return gizmo;
  }

  private createDirectionDots(): void {
    if (!this.gizmoScene) return;

    const dotsContainer = new THREE.Object3D();
    this.gizmoScene.add(dotsContainer);

    const axes = ["x", "y", "z"];
    const positions = this.staticDirections.map((dir) =>
      dir.multiplyScalar(60)
    );

    this.directionDots = positions.map((pos, i) => {
      const isPositive = i < 3;
      const sprite = DirectionSprite.create(
        this.axesColors[i % 3],
        isPositive ? axes[i % 3] : null
      );
      sprite.position.copy(pos);
      sprite.scale.setScalar(isPositive ? 30 : 20);
      dotsContainer.add(sprite);
      return sprite;
    });

    this.gizmoMesh.add(dotsContainer);
  }

  private startAnimation(): void {
    const animate = () => {
      if (
        !this.enabled ||
        !this.gizmoRenderer ||
        !this.gizmoScene ||
        !this.gizmoCamera
      ) {
        this.animationFrameId = null;
        return;
      }

      if (!this.isDragging && this.isInitialized && this.camera) {
        this.gizmoMesh.quaternion.copy(this.camera.controls.camera.quaternion);

        if (this.hasOrientationChanged()) {
          this.updateDotsOpacity();
          this.lastCameraQuaternion.copy(
            this.camera.controls.camera.quaternion
          );
        }
      }

      this.gizmoRenderer.render(this.gizmoScene, this.gizmoCamera);
      this.animationFrameId = requestAnimationFrame(animate);
    };

    animate();
  }

  private hasOrientationChanged(): boolean {
    if (!this.camera) return false;

    const threshold = 0.0001;
    const quatDifference = this.lastCameraQuaternion.angleTo(
      this.camera.controls.camera.quaternion
    );

    return quatDifference > threshold;
  }

  private updateDotsOpacity(): void {
    if (!this.camera || this.directionDots.length !== 6) return;

    const currentTime = performance.now();
    if (currentTime - this.lastUpdateTime < this.settings.updateInterval)
      return;
    this.lastUpdateTime = currentTime;

    this.cameraDirection
      .set(0, 0, -1)
      .applyQuaternion(this.camera.controls.camera.quaternion)
      .normalize();

    this.directionDots.forEach((dot, i) => {
      this.dotDirection
        .copy(this.staticDirections[i])
        .applyQuaternion(this.gizmoMesh.quaternion)
        .normalize();

      const dotProduct = this.dotDirection.dot(this.cameraDirection);
      const targetOpacity = dotProduct >= -0.1 ? 1 : 0.3;

      dot.material.opacity = THREE.MathUtils.lerp(
        dot.material.opacity,
        targetOpacity,
        0.3
      );

      if (!this.isDragging && this.camera) {
        dot.quaternion.copy(this.camera.controls.camera.quaternion);
      }
    });
  }

  private setupInteraction(): void {
    if (!this.gizmoContainer) return;

    this.gizmoContainer.addEventListener("pointerdown", this.handlePointerDown);
    this.gizmoContainer.addEventListener("pointermove", this.handlePointerMove);
    this.gizmoContainer.addEventListener(
      "pointerleave",
      this.handlePointerLeave
    );
  }

  private handlePointerDown = (e: PointerEvent): void => {
    if (!this.enabled) return;
    e.preventDefault();

    this.isDragging = false;
    this.mouseStart.set(e.clientX, e.clientY);
    this.rotationStart.copy(this.gizmoMesh.rotation);
    this.updateRadius();

    document.addEventListener("pointermove", this.handleDrag);
    document.addEventListener("pointerup", this.handleDragEnd);
  };

  private handleDrag = (e: PointerEvent): void => {
    if (!this.isDragging && this.isClick(e)) return;

    if (!this.isDragging) {
      this.resetDirectionDots();
      this.isDragging = true;
    }

    this.updateRotation(e);
  };

  private handleDragEnd = (e: PointerEvent): void => {
    document.removeEventListener("pointermove", this.handleDrag);
    document.removeEventListener("pointerup", this.handleDragEnd);

    if (!this.isDragging) {
      this.handleClick(e);
      return;
    }

    this.isDragging = false;
  };

  private handlePointerMove = (e: PointerEvent): void => {
    if (this.isDragging) return;
    this.handleHover(e);
  };

  private handlePointerLeave = (): void => {
    if (this.isDragging) return;
    this.resetDirectionDots();
    if (this.gizmoContainer) {
      this.gizmoContainer.style.cursor = "";
    }
  };

  private updateRotation(e: PointerEvent): void {
    if (!this.camera) return;

    this.mouseAngle
      .set(e.clientX, e.clientY)
      .sub(this.mouseStart)
      .multiplyScalar((1 / this.settings.size) * Math.PI);

    this.gizmoMesh.rotation.x = this.clamp(
      this.rotationStart.x + this.mouseAngle.y,
      Math.PI / -2 + 0.001,
      Math.PI / 2 - 0.001
    );
    this.gizmoMesh.rotation.y = this.rotationStart.y + this.mouseAngle.x;
    this.gizmoMesh.updateMatrixWorld();

    this.q1.copy(this.gizmoMesh.quaternion).invert();

    const target = new THREE.Vector3();
    const position = new THREE.Vector3(0, 0, 1)
      .applyQuaternion(this.q1)
      .multiplyScalar(this.radius)
      .add(target);

    this.camera.controls.setLookAt(
      position.x,
      position.y,
      position.z,
      target.x,
      target.y,
      target.z,
      true
    );

    this.updateDotsOpacity();
  }

  private updateRadius(): void {
    if (!this.camera) return;
    const cameraPosition = this.camera.controls.camera.position;
    const target = new THREE.Vector3();
    this.radius = cameraPosition.distanceTo(target);
  }

  private resetDirectionDots(): void {
    this.directionDots.forEach((sprite, i) => {
      const scale = i < 3 ? 30 : 20;
      sprite.scale.setScalar(scale);
      if (sprite.material.map) {
        sprite.material.map.offset.x = 1;
      }
    });
  }

  private handleClick(e: PointerEvent): void {
    if (!this.gizmoCamera || !this.gizmoContainer || !this.camera) return;

    const rect = this.gizmoContainer.getBoundingClientRect();
    const mouse = new THREE.Vector2(
      ((e.clientX - rect.left) / rect.width) * 2 - 1,
      -((e.clientY - rect.top) / rect.height) * 2 + 1
    );

    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(mouse, this.gizmoCamera);
    const intersects = raycaster.intersectObjects(this.directionDots, true);

    if (intersects.length > 0) {
      const dotIndex = this.directionDots.indexOf(
        intersects[0].object as THREE.Sprite
      );
      const axis = ["x", "y", "z"][dotIndex % 3] as "x" | "y" | "z";
      const positive = dotIndex < 3;
      this.alignToAxis(axis, positive);
    }
  }

  private handleHover(e: PointerEvent): void {
    if (!this.gizmoCamera || !this.gizmoContainer) return;

    const rect = this.gizmoContainer.getBoundingClientRect();
    const mouse = new THREE.Vector2(
      ((e.clientX - rect.left) / rect.width) * 2 - 1,
      -((e.clientY - rect.top) / rect.height) * 2 + 1
    );

    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(mouse, this.gizmoCamera);
    const intersects = raycaster.intersectObjects(this.directionDots, true);

    this.resetDirectionDots();

    if (intersects.length === 0) {
      this.gizmoContainer.style.cursor = "";
    } else {
      const sprite = intersects[0].object as THREE.Sprite;
      if (sprite.material.map) {
        sprite.material.map.offset.x = 0.5;
      }
      sprite.scale.multiplyScalar(1.2);
      this.gizmoContainer.style.cursor = "pointer";
    }
  }

  private alignToAxis(axis: "x" | "y" | "z", positive: boolean): void {
    if (!this.camera) return;

    const distance = this.camera.controls.camera.position.length();
    const position = new THREE.Vector3();
    const target = new THREE.Vector3(0, 0, 0);

    switch (axis) {
      case "x":
        position.set(positive ? distance : -distance, 0, 0);
        break;
      case "y":
        position.set(0, positive ? distance : -distance, 0);
        break;
      case "z":
        position.set(0, 0, positive ? distance : -distance);
        break;
    }

    this.camera.controls.setLookAt(
      position.x,
      position.y,
      position.z,
      target.x,
      target.y,
      target.z,
      true
    );

    this.gizmoMesh.quaternion.copy(this.camera.controls.camera.quaternion);
  }

  private isClick(e: PointerEvent, threshold = 10): boolean {
    return (
      Math.abs(e.clientX - this.mouseStart.x) < threshold &&
      Math.abs(e.clientY - this.mouseStart.y) < threshold
    );
  }

  private clamp(num: number, min: number, max: number): number {
    return Math.min(Math.max(num, min), max);
  }

  private cleanup(): void {
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }

    if (this.gizmoContainer) {
      this.gizmoContainer.removeEventListener(
        "pointerdown",
        this.handlePointerDown
      );
      this.gizmoContainer.removeEventListener(
        "pointermove",
        this.handlePointerMove
      );
      this.gizmoContainer.removeEventListener(
        "pointerleave",
        this.handlePointerLeave
      );
    }

    if (this.gizmoRenderer) {
      this.gizmoRenderer.dispose();
      this.gizmoRenderer = null;
    }

    this.gizmoContainer?.remove();
    this.gizmoContainer = null;
    this.gizmoScene = null;
    this.gizmoCamera = null;
  }

  dispose(): void {
    this.enabled = false;

    // Cancel animation frame if active
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }

    // Fade out container
    if (this.gizmoContainer) {
      this.gizmoContainer.style.transition = "opacity 0.3s ease-out";
      this.gizmoContainer.style.opacity = "0";

      // Remove container after fade
      setTimeout(() => {
        this.cleanup();
      }, 300);
    } else {
      this.cleanup();
    }

    // Clean up Three.js objects
    const disposer = this.components.get(OBC.Disposer);
    disposer.destroy(this.gizmoMesh);

    // Clean up direction dots
    this.directionDots.forEach((dot) => {
      if (dot.material.map) {
        dot.material.map.dispose();
      }
      dot.material.dispose();
    });
    this.directionDots = [];

    this.isInitialized = false;

    // Trigger disposal event
    this.onDisposed.trigger();
    this.onDisposed.reset();
  }
}
