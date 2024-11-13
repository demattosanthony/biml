import * as THREE from "three";
import * as OBC from "@thatopen/components";

export class OrientationGizmo extends OBC.Component implements OBC.Disposable {
  static readonly uuid = "8f7e3f91-6314-4f57-9478-c95c2a137d44";

  readonly onDisposed = new OBC.Event();
  enabled = true;

  private readonly axesColors = [
    new THREE.Color(0xff3653), // x-axis
    new THREE.Color(0x8adb00), // y-axis
    new THREE.Color(0x2c8fff), // z-axis
  ];

  private gizmoMesh: THREE.Object3D;
  private camera!: OBC.OrthoPerspectiveCamera;
  private scene!: OBC.SimpleScene;
  private size = 150;
  private padding = 10;
  private isDragging = false;
  private previousMousePosition = { x: 0, y: 0 };
  private gizmoContainer: HTMLDivElement | null = null;
  private gizmoRenderer: THREE.WebGLRenderer | null = null;
  private gizmoCamera: THREE.OrthographicCamera | null = null;
  private gizmoScene: THREE.Scene | null = null;
  private rotationSpeed = 5;
  private directionDots: THREE.Sprite[] = [];
  private isInitialized = false;
  private animationFrameId: number | null = null;

  constructor(components: OBC.Components) {
    super(components);
    components.add(OrientationGizmo.uuid, this);
    this.gizmoMesh = this.createGizmo();
  }

  async setup(world: {
    scene: OBC.SimpleScene;
    camera: OBC.OrthoPerspectiveCamera;
    renderer: OBC.SimpleRenderer;
  }) {
    // Cancel any existing animation frame
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
    }

    console.log("Setting up orientation gizmo");

    this.scene = world.scene;
    this.camera = world.camera;

    this.gizmoScene = new THREE.Scene();
    this.gizmoScene.add(this.gizmoMesh);

    this.gizmoCamera = new THREE.OrthographicCamera(
      -this.size / 2,
      this.size / 2,
      this.size / 2,
      -this.size / 2,
      0.1,
      1000
    );
    this.gizmoCamera.position.set(0, 0, 200);
    this.gizmoCamera.lookAt(0, 0, 0);

    const container = world.renderer.container.parentElement;
    if (!container) return;

    // Clean up existing renderer if any
    if (this.gizmoRenderer) {
      this.gizmoRenderer.dispose();
    }

    this.gizmoRenderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true, // Add antialiasing
    });
    this.gizmoRenderer.setSize(
      this.size + this.padding * 2,
      this.size + this.padding * 2
    );
    this.gizmoRenderer.setPixelRatio(window.devicePixelRatio);

    // Remove existing container if any
    if (this.gizmoContainer && this.gizmoContainer.parentElement) {
      this.gizmoContainer.remove();
    }

    this.gizmoContainer = document.createElement("div");
    this.gizmoContainer.style.position = "absolute";
    this.gizmoContainer.style.top = "10px";
    this.gizmoContainer.style.right = "10px";
    this.gizmoContainer.style.zIndex = "9";
    this.gizmoContainer.style.cursor = "grab";

    // Hide container initially
    this.gizmoContainer.style.opacity = "0";

    this.gizmoContainer.appendChild(this.gizmoRenderer.domElement);
    container.appendChild(this.gizmoContainer);

    // Create direction dots before starting animation
    this.createDirectionDots();

    // Set up interaction after dots are created
    this.setupInteraction();
    this.setupAxisClickHandlers();

    // Ensure initial state is correct
    this.gizmoMesh.quaternion.copy(this.camera.controls.camera.quaternion);
    this.updateDotsOpacity();

    // Wait for next frame to ensure everything is initialized
    await new Promise((resolve) => requestAnimationFrame(resolve));

    this.isInitialized = true;

    // Show container with a fade
    requestAnimationFrame(() => {
      if (this.gizmoContainer) {
        console.log("Showing gizmo container");
        this.gizmoContainer.style.transition = "opacity 0.3s ease-in";
        this.gizmoContainer.style.opacity = "1";
      }
    });

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

      if (!this.isDragging && this.isInitialized) {
        // Synchronize gizmo rotation with camera before updating dots
        this.gizmoMesh.quaternion.copy(this.camera.controls.camera.quaternion);

        // Only update dots when camera or gizmo has actually moved
        if (this.hasOrientationChanged()) {
          this.updateDotsOpacity();
          this.lastCameraQuaternion?.copy(
            this.camera.controls.camera.quaternion
          );
        }
      }

      this.gizmoRenderer.render(this.gizmoScene, this.gizmoCamera);
      this.animationFrameId = requestAnimationFrame(animate);
    };

    animate();
  }

  private lastCameraQuaternion = new THREE.Quaternion();

  private hasOrientationChanged(): boolean {
    const threshold = 0.0001; // Small enough to catch real changes, large enough to ignore floating point errors

    if (!this.lastCameraQuaternion) {
      this.lastCameraQuaternion =
        this.camera.controls.camera.quaternion.clone();
      return true;
    }

    // Compare current camera quaternion with last stored quaternion
    const quatDifference = this.lastCameraQuaternion.angleTo(
      this.camera.controls.camera.quaternion
    );

    return quatDifference > threshold;
  }

  private createDirectionDots() {
    if (!this.gizmoScene) return;

    const axes = ["x", "y", "z"];

    // Create a container for all dots
    const dotsContainer = new THREE.Object3D();
    this.gizmoScene.add(dotsContainer);

    const positions = [
      [1.2, 0, 0],
      [0, 1.2, 0],
      [0, 0, 1.2],
      [-1.2, 0, 0],
      [0, -1.2, 0],
      [0, 0, -1.2],
    ];

    this.directionDots = positions.map((pos, i) => {
      const isPositive = i < 3;
      const color = this.axesColors[i % 3];
      const sprite = this.createDirectionSprite(
        color,
        isPositive ? axes[i % 3] : null
      );
      sprite.position.set(pos[0] * 50, pos[1] * 50, pos[2] * 50);
      sprite.scale.setScalar(isPositive ? 30 : 20);
      sprite.center.set(0.5, 0.5); // Ensure sprite rotates around its center
      dotsContainer.add(sprite);
      return sprite;
    });

    // Store reference to dots container
    this.gizmoMesh.add(dotsContainer);
  }

  private createDirectionSprite(
    color: THREE.Color,
    text: string | null = null
  ): THREE.Sprite {
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

    const material = new THREE.SpriteMaterial({
      map: texture,
      transparent: true,
      sizeAttenuation: false, // Add this to prevent size scaling issues
      depthTest: false, // Add this to ensure consistent rendering
      depthWrite: false, // Add this to prevent z-fighting
    });

    return new THREE.Sprite(material);
  }

  private readonly staticDirections = [
    new THREE.Vector3(1, 0, 0), // +X
    new THREE.Vector3(0, 1, 0), // +Y
    new THREE.Vector3(0, 0, 1), // +Z
    new THREE.Vector3(-1, 0, 0), // -X
    new THREE.Vector3(0, -1, 0), // -Y
    new THREE.Vector3(0, 0, -1), // -Z
  ];

  private readonly cameraDirection = new THREE.Vector3();
  private readonly dotDirection = new THREE.Vector3();
  private lastUpdateTime = 0;
  private readonly updateInterval = 1000 / 30; // Limit updates to 30fps

  private updateDotsOpacity() {
    if (!this.camera || this.directionDots.length !== 6) return;

    // Throttle updates to prevent flickering
    const currentTime = performance.now();
    if (currentTime - this.lastUpdateTime < this.updateInterval) return;
    this.lastUpdateTime = currentTime;

    // Get camera direction in world space
    this.cameraDirection
      .set(0, 0, -1)
      .applyQuaternion(this.camera.controls.camera.quaternion)
      .normalize();

    // Calculate all dot visibilities at once using static directions
    for (let i = 0; i < 6; i++) {
      // Reuse vector to prevent garbage collection
      this.dotDirection
        .copy(this.staticDirections[i])
        .applyQuaternion(this.gizmoMesh.quaternion)
        .normalize();

      // Dot product tells us if this direction is facing camera
      const dotProduct = this.dotDirection.dot(this.cameraDirection);

      // Add hysteresis to prevent flickering at threshold
      const currentOpacity = this.directionDots[i].material.opacity;
      const targetOpacity = dotProduct >= -0.1 ? 1 : 0.3; // Added small threshold

      // Smooth transition between opacity values
      const newOpacity = THREE.MathUtils.lerp(
        currentOpacity,
        targetOpacity,
        0.3 // Adjust this value to control transition speed
      );

      this.directionDots[i].material.opacity = newOpacity;

      // Keep sprite aligned with camera without affecting opacity
      if (!this.isDragging) {
        this.directionDots[i].quaternion.copy(
          this.camera.controls.camera.quaternion
        );
      }
    }
  }

  private createGizmo(): THREE.Object3D {
    const gizmo = new THREE.Object3D();
    const axisLength = 50;
    const axisWidth = 4;

    // Create axes as lines instead of boxes for better visibility
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

      const material = new THREE.LineBasicMaterial({
        color: color,
        linewidth: 3,
      });

      return new THREE.Line(geometry, material);
    };

    // Create the three axes
    const xAxis = createAxis(this.axesColors[0], new THREE.Vector3(1, 0, 0));
    const yAxis = createAxis(this.axesColors[1], new THREE.Vector3(0, 1, 0));
    const zAxis = createAxis(this.axesColors[2], new THREE.Vector3(0, 0, 1));

    gizmo.add(xAxis, yAxis, zAxis);

    return gizmo;
  }

  private alignToAxis(axis: "x" | "y" | "z", positive: boolean = true) {
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

  private setupAxisClickHandlers() {
    if (!this.gizmoContainer) return;

    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    this.gizmoContainer.addEventListener("click", (event) => {
      if (!this.gizmoCamera || !this.gizmoScene || this.isDragging) return;

      const rect = this.gizmoContainer!.getBoundingClientRect();
      mouse.x =
        ((event.clientX - rect.left) / (rect.right - rect.left)) * 2 - 1;
      mouse.y =
        -((event.clientY - rect.top) / (rect.bottom - rect.top)) * 2 + 1;

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
    });
  }

  private rotationStart = new THREE.Euler();
  private mouseStart = new THREE.Vector2();
  private mouseAngle = new THREE.Vector2();
  private q1 = new THREE.Quaternion();
  private q2 = new THREE.Quaternion();
  private dummy = new THREE.Object3D();
  private radius = 0;

  private setupInteraction() {
    if (!this.gizmoContainer) return;

    const onPointerDown = (e: PointerEvent) => {
      if (!this.enabled) return;
      e.preventDefault();

      this.isDragging = false;
      this.mouseStart.set(e.clientX, e.clientY);
      this.rotationStart.copy(this.gizmoMesh.rotation);
      this.setRadius();

      const drag = (e: PointerEvent) => {
        // Check if it's a small movement that shouldn't trigger drag
        if (!this.isDragging && this.isClick(e)) return;

        if (!this.isDragging) {
          this.resetDirectionDots();
          this.isDragging = true;
        }

        // Calculate angle based on mouse movement
        this.mouseAngle
          .set(e.clientX, e.clientY)
          .sub(this.mouseStart)
          .multiplyScalar((1 / this.size) * Math.PI);

        // Update gizmo rotation
        this.gizmoMesh.rotation.x = this.clamp(
          this.rotationStart.x + this.mouseAngle.y,
          Math.PI / -2 + 0.001,
          Math.PI / 2 - 0.001
        );
        this.gizmoMesh.rotation.y = this.rotationStart.y + this.mouseAngle.x;
        this.gizmoMesh.updateMatrixWorld();

        // Calculate new camera position
        this.q1.copy(this.gizmoMesh.quaternion).invert();

        const target = new THREE.Vector3();
        const position = new THREE.Vector3(0, 0, 1)
          .applyQuaternion(this.q1)
          .multiplyScalar(this.radius)
          .add(target);

        // Update camera position and rotation
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
      };

      const endDrag = () => {
        document.removeEventListener("pointermove", drag);
        document.removeEventListener("pointerup", endDrag);

        if (!this.isDragging) {
          this.handleClick(e);
          return;
        }

        this.isDragging = false;
      };

      document.addEventListener("pointermove", drag);
      document.addEventListener("pointerup", endDrag);
    };

    this.gizmoContainer.addEventListener("pointerdown", onPointerDown);

    // Add hover handling
    this.gizmoContainer.addEventListener("pointermove", (e: PointerEvent) => {
      if (this.isDragging) return;
      this.handleHover(e);
    });

    this.gizmoContainer.addEventListener("pointerleave", () => {
      if (this.isDragging) return;
      this.resetDirectionDots();
      if (this.gizmoContainer) {
        this.gizmoContainer.style.cursor = "";
      }
    });
  }

  private setRadius() {
    const cameraPosition = this.camera.controls.camera.position;
    const target = new THREE.Vector3();
    this.radius = cameraPosition.distanceTo(target);
  }

  private resetDirectionDots() {
    this.directionDots.forEach((sprite, i) => {
      const scale = i < 3 ? 30 : 20;
      sprite.scale.setScalar(scale);
      if (sprite.material.map) {
        sprite.material.map.offset.x = 1;
      }
    });
  }

  private handleClick(e: PointerEvent) {
    if (!this.gizmoCamera || !this.gizmoScene) return;

    const rect = this.gizmoContainer!.getBoundingClientRect();
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

  private handleHover(e: PointerEvent) {
    if (!this.gizmoCamera || !this.gizmoScene || !this.gizmoContainer) return;

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

  private isClick(e: PointerEvent, threshold = 10): boolean {
    return (
      Math.abs(e.clientX - this.mouseStart.x) < threshold &&
      Math.abs(e.clientY - this.mouseStart.y) < threshold
    );
  }

  private clamp(num: number, min: number, max: number): number {
    return Math.min(Math.max(num, min), max);
  }

  dispose() {
    console.log("Disposing orientation gizmo");
    this.enabled = false;

    // Cancel animation frame if active
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }

    // Remove container with fade out
    if (this.gizmoContainer) {
      this.gizmoContainer.style.transition = "opacity 0.3s ease-out";
      this.gizmoContainer.style.opacity = "0";
      setTimeout(() => {
        if (this.gizmoContainer) {
          this.gizmoContainer.remove();
        }
      }, 300);
    }

    // Clean up renderer
    if (this.gizmoRenderer) {
      this.gizmoRenderer.dispose();
      this.gizmoRenderer = null;
    }

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

    this.onDisposed.trigger();
    this.onDisposed.reset();
  }
}
