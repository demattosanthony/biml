import * as THREE from "three";
import * as OBC from "@thatopen/components";

export class OrientationGizmo extends OBC.Component implements OBC.Disposable {
  static readonly uuid = "8f7e3f91-6314-4f57-9478-c95c2a137d44";

  readonly onDisposed = new OBC.Event();
  enabled = true;

  private gizmoMesh: THREE.Object3D;
  private camera!: OBC.OrthoPerspectiveCamera;
  private scene!: OBC.SimpleScene;
  private size = 100;
  private padding = 10;
  private isDragging = false;
  private previousMousePosition = { x: 0, y: 0 };
  private gizmoContainer: HTMLDivElement | null = null;
  private gizmoRenderer: THREE.WebGLRenderer | null = null;
  private gizmoCamera: THREE.OrthographicCamera | null = null;
  private gizmoScene: THREE.Scene | null = null;
  private rotationSpeed = 5;

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
    this.scene = world.scene;
    this.camera = world.camera;

    // Create a separate scene for the gizmo
    this.gizmoScene = new THREE.Scene();
    this.gizmoScene.add(this.gizmoMesh);

    // Create an orthographic camera for the gizmo
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

    // Setup renderer for the gizmo
    const container = world.renderer.container.parentElement;
    if (!container) return;

    this.gizmoRenderer = new THREE.WebGLRenderer({ alpha: true });
    this.gizmoRenderer.setSize(
      this.size + this.padding * 2,
      this.size + this.padding * 2
    );
    this.gizmoRenderer.setPixelRatio(window.devicePixelRatio);

    // Style and position the gizmo container
    this.gizmoContainer = document.createElement("div");
    this.gizmoContainer.style.position = "absolute";
    this.gizmoContainer.style.bottom = "20px";
    this.gizmoContainer.style.right = "20px";
    this.gizmoContainer.style.zIndex = "1000";
    this.gizmoContainer.style.cursor = "grab";
    this.gizmoContainer.appendChild(this.gizmoRenderer.domElement);
    container.appendChild(this.gizmoContainer);

    // Add event listeners for interaction
    this.setupInteraction();

    // Animation loop
    const animate = () => {
      if (
        !this.enabled ||
        !this.gizmoRenderer ||
        !this.gizmoScene ||
        !this.gizmoCamera
      )
        return;

      if (!this.isDragging) {
        // Only update gizmo rotation when not being dragged
        this.gizmoMesh.quaternion.copy(this.camera.controls.camera.quaternion);
      }

      // Render gizmo
      this.gizmoRenderer.render(this.gizmoScene, this.gizmoCamera);
      requestAnimationFrame(animate);
    };

    animate();

    // Add click handlers for axis alignment
    this.setupAxisClickHandlers();
  }

  private setupInteraction() {
    if (!this.gizmoContainer) return;

    const onMouseDown = (event: MouseEvent) => {
      this.isDragging = true;
      this.gizmoContainer!.style.cursor = "grabbing";
      this.previousMousePosition = {
        x: event.clientX,
        y: event.clientY,
      };
    };

    const onMouseMove = (event: MouseEvent) => {
      if (!this.isDragging) return;

      const deltaMove = {
        x: event.clientX - this.previousMousePosition.x,
        y: event.clientY - this.previousMousePosition.y,
      };

      // Convert mouse movement to rotation angles
      const deltaRotationQuaternion = new THREE.Quaternion().setFromEuler(
        new THREE.Euler(
          THREE.MathUtils.degToRad(deltaMove.y * this.rotationSpeed),
          THREE.MathUtils.degToRad(deltaMove.x * this.rotationSpeed),
          0,
          "XYZ"
        )
      );

      // Apply rotation to both gizmo and main camera
      this.gizmoMesh.quaternion.multiplyQuaternions(
        deltaRotationQuaternion,
        this.gizmoMesh.quaternion
      );

      // Update main camera position
      const distance = this.camera.controls.camera.position.length();
      const currentPosition = new THREE.Vector3();
      currentPosition.copy(this.camera.controls.camera.position);

      // Apply the same rotation to the camera position
      currentPosition.applyQuaternion(deltaRotationQuaternion);
      currentPosition.normalize().multiplyScalar(distance);

      // Update camera position and maintain look at center
      this.camera.controls.camera.position.copy(currentPosition);
      this.camera.controls.camera.lookAt(new THREE.Vector3(0, 0, 0));

      this.previousMousePosition = {
        x: event.clientX,
        y: event.clientY,
      };
    };

    const onMouseUp = () => {
      this.isDragging = false;
      this.gizmoContainer!.style.cursor = "grab";
    };

    this.gizmoContainer.addEventListener("mousedown", onMouseDown);
    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
  }

  private setupAxisClickHandlers() {
    if (!this.gizmoContainer) return;

    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    this.gizmoContainer.addEventListener("click", (event) => {
      if (!this.gizmoCamera || !this.gizmoScene) return;

      // Calculate mouse position in normalized device coordinates (-1 to +1)
      const rect = this.gizmoContainer!.getBoundingClientRect();
      mouse.x =
        ((event.clientX - rect.left) / (rect.right - rect.left)) * 2 - 1;
      mouse.y =
        -((event.clientY - rect.top) / (rect.bottom - rect.top)) * 2 + 1;

      raycaster.setFromCamera(mouse, this.gizmoCamera);
      const intersects = raycaster.intersectObjects(
        this.gizmoScene.children,
        true
      );

      // Update just the axis click detection part in setupAxisClickHandlers():

      if (intersects.length > 0) {
        const clickedObject = intersects[0].object;

        // Type guard to ensure we have a mesh with a single basic material
        if (
          clickedObject instanceof THREE.Mesh &&
          clickedObject.material instanceof THREE.MeshBasicMaterial
        ) {
          const color = clickedObject.material.color.getHex();

          switch (color) {
            case 0xff0000: // X-axis
              this.alignToAxis("x");
              break;
            case 0x00ff00: // Y-axis
              this.alignToAxis("y");
              break;
            case 0x0000ff: // Z-axis
              this.alignToAxis("z");
              break;
          }
        }
      }
    });
  }

  private alignToAxis(axis: "x" | "y" | "z") {
    const distance = this.camera.controls.camera.position.length();
    const position = new THREE.Vector3();

    switch (axis) {
      case "x":
        position.set(distance, 0, 0);
        break;
      case "y":
        position.set(0, distance, 0);
        break;
      case "z":
        position.set(0, 0, distance);
        break;
    }

    // Smoothly animate to new position
    const currentPos = this.camera.controls.camera.position.clone();
    const targetPos = position;

    const animate = () => {
      const step = 0.05;
      currentPos.lerp(targetPos, step);
      this.camera.controls.camera.position.copy(currentPos);
      this.camera.controls.camera.lookAt(new THREE.Vector3(0, 0, 0));

      if (currentPos.distanceTo(targetPos) > 0.1) {
        requestAnimationFrame(animate);
      }
    };

    animate();
  }

  private createGizmo(): THREE.Object3D {
    const gizmo = new THREE.Object3D();

    // Create axes
    const axisLength = 50;
    const axisWidth = 4;

    // X-axis (red)
    const xGeometry = new THREE.BoxGeometry(axisLength, axisWidth, axisWidth);
    const xMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
    const xAxis = new THREE.Mesh(xGeometry, xMaterial);
    xAxis.position.x = axisLength / 2;

    // Y-axis (green)
    const yGeometry = new THREE.BoxGeometry(axisWidth, axisLength, axisWidth);
    const yMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
    const yAxis = new THREE.Mesh(yGeometry, yMaterial);
    yAxis.position.y = axisLength / 2;

    // Z-axis (blue)
    const zGeometry = new THREE.BoxGeometry(axisWidth, axisWidth, axisLength);
    const zMaterial = new THREE.MeshBasicMaterial({ color: 0x0000ff });
    const zAxis = new THREE.Mesh(zGeometry, zMaterial);
    zAxis.position.z = axisLength / 2;

    // Add labels
    const createLabel = (
      text: string,
      position: THREE.Vector3,
      color: number
    ) => {
      const canvas = document.createElement("canvas");
      const context = canvas.getContext("2d");
      if (!context) return;

      canvas.width = 64;
      canvas.height = 64;

      context.fillStyle = `#${color.toString(16).padStart(6, "0")}`;
      context.font = "bold 48px Arial";
      context.textAlign = "center";
      context.textBaseline = "middle";
      context.fillText(text, 32, 32);

      const texture = new THREE.CanvasTexture(canvas);
      const spriteMaterial = new THREE.SpriteMaterial({ map: texture });
      const sprite = new THREE.Sprite(spriteMaterial);
      sprite.position.copy(position);
      sprite.scale.set(20, 20, 1);
      return sprite;
    };

    const xLabel = createLabel(
      "X",
      new THREE.Vector3(axisLength + 10, 0, 0),
      0xff0000
    );
    const yLabel = createLabel(
      "Y",
      new THREE.Vector3(0, axisLength + 10, 0),
      0x00ff00
    );
    const zLabel = createLabel(
      "Z",
      new THREE.Vector3(0, 0, axisLength + 10),
      0x0000ff
    );

    // Add all elements to gizmo
    gizmo.add(xAxis, yAxis, zAxis);
    if (xLabel) gizmo.add(xLabel);
    if (yLabel) gizmo.add(yLabel);
    if (zLabel) gizmo.add(zLabel);

    return gizmo;
  }

  dispose() {
    this.enabled = false;
    if (this.gizmoContainer) {
      this.gizmoContainer.remove();
    }
    const disposer = this.components.get(OBC.Disposer);
    disposer.destroy(this.gizmoMesh);
    this.onDisposed.trigger();
    this.onDisposed.reset();
  }
}
