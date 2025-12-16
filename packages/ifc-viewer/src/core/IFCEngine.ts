import * as OBC from "@thatopen/components";
import * as THREE from "three";
import {
  type IFCModel,
  type ViewerConfig,
  type CameraView,
  type CameraState,
  DEFAULT_CONFIG,
} from "../types";

type ViewerEventHandler = {
  onModelLoaded?: (model: IFCModel) => void;
  onModelUnloaded?: (modelId: string) => void;
  onSelect?: (expressIds: number[], modelId: string) => void;
  onHover?: (expressId: number | null, modelId: string | null) => void;
  onCameraChange?: (camera: CameraState) => void;
  onProgress?: (progress: number) => void;
  onError?: (error: Error) => void;
  onReady?: () => void;
};

/**
 * Core IFC rendering engine wrapping @thatopen/components
 */
export class IFCEngine {
  private components: OBC.Components | null = null;
  private world: OBC.SimpleWorld<
    OBC.SimpleScene,
    OBC.SimpleCamera,
    OBC.SimpleRenderer
  > | null = null;
  private fragmentsManager: OBC.FragmentsManager | null = null;
  private ifcLoader: OBC.IfcLoader | null = null;
  private container: HTMLElement | null = null;
  private config: Required<ViewerConfig>;
  private models: Map<string, IFCModel> = new Map();
  private eventHandlers: ViewerEventHandler = {};
  private resizeObserver: ResizeObserver | null = null;
  private isDisposed = false;
  private grid: OBC.Grids | null = null;

  constructor(config: ViewerConfig = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config } as Required<ViewerConfig>;
  }

  /**
   * Initialize the engine with a container element
   */
  async init(container: HTMLElement): Promise<void> {
    if (this.isDisposed) {
      throw new Error("Engine has been disposed");
    }

    this.container = container;

    // Initialize components
    this.components = new OBC.Components();

    // Create worlds manager and world
    const worlds = this.components.get(OBC.Worlds);
    this.world = worlds.create<
      OBC.SimpleScene,
      OBC.SimpleCamera,
      OBC.SimpleRenderer
    >();

    // Setup renderer
    this.world.renderer = new OBC.SimpleRenderer(this.components, container);
    this.world.renderer.three.setPixelRatio(window.devicePixelRatio);

    // Setup scene
    this.world.scene = new OBC.SimpleScene(this.components);
    this.world.scene.setup();

    // Set background color
    const bgColor =
      typeof this.config.backgroundColor === "string"
        ? new THREE.Color(this.config.backgroundColor)
        : new THREE.Color(this.config.backgroundColor);
    this.world.scene.three.background = bgColor;

    // Setup camera
    this.world.camera = new OBC.SimpleCamera(this.components);
    this.world.camera.controls.setLookAt(10, 10, 10, 0, 0, 0);

    // Enable camera controls
    if (this.config.orbitControls) {
      this.world.camera.controls.enabled = true;
    }

    // Initialize components
    this.components.init();

    // Setup grid
    if (this.config.showGrid) {
      this.grid = this.components.get(OBC.Grids);
      this.grid.create(this.world);
    }

    // Setup fragments manager
    this.fragmentsManager = this.components.get(OBC.FragmentsManager);

    // Setup IFC loader
    this.ifcLoader = this.components.get(OBC.IfcLoader);
    await this.ifcLoader.setup();

    // Setup resize observer
    this.resizeObserver = new ResizeObserver(() => {
      this.handleResize();
    });
    this.resizeObserver.observe(container);

    // Initial resize
    this.handleResize();

    // Notify ready
    this.eventHandlers.onReady?.();
  }

  /**
   * Set event handlers
   */
  setEventHandlers(handlers: ViewerEventHandler): void {
    this.eventHandlers = { ...this.eventHandlers, ...handlers };
  }

  /**
   * Load an IFC model
   */
  async loadModel(source: string | File, name?: string): Promise<IFCModel> {
    if (!this.ifcLoader || !this.world) {
      throw new Error("Engine not initialized");
    }

    try {
      let buffer: Uint8Array;
      let sourcePath: string;

      if (source instanceof File) {
        buffer = new Uint8Array(await source.arrayBuffer());
        sourcePath = source.name;
        name = name || source.name;
      } else {
        this.eventHandlers.onProgress?.(0);
        const response = await fetch(source);

        if (!response.ok) {
          throw new Error(`Failed to fetch model: ${response.statusText}`);
        }

        const contentLength = response.headers.get("content-length");
        const total = contentLength ? parseInt(contentLength, 10) : 0;

        if (total && response.body) {
          const reader = response.body.getReader();
          const chunks: Uint8Array[] = [];
          let loaded = 0;

          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            chunks.push(value);
            loaded += value.length;
            this.eventHandlers.onProgress?.(
              Math.round((loaded / total) * 100)
            );
          }

          buffer = new Uint8Array(loaded);
          let offset = 0;
          for (const chunk of chunks) {
            buffer.set(chunk, offset);
            offset += chunk.length;
          }
        } else {
          buffer = new Uint8Array(await response.arrayBuffer());
        }

        sourcePath = source;
        name = name || source.split("/").pop() || "model";
      }

      this.eventHandlers.onProgress?.(100);

      // Load the model
      const fragmentsGroup = await this.ifcLoader.load(buffer);

      // Add to scene
      this.world.scene.three.add(fragmentsGroup);

      // Generate unique ID
      const id = crypto.randomUUID();

      const model: IFCModel = {
        id,
        name: name.replace(/\.ifc$/i, ""),
        fragmentsGroup,
        visible: true,
        source: sourcePath,
      };

      this.models.set(id, model);
      this.eventHandlers.onModelLoaded?.(model);

      return model;
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      this.eventHandlers.onError?.(err);
      throw err;
    }
  }

  /**
   * Unload a model
   */
  unloadModel(modelId: string): void {
    const model = this.models.get(modelId);
    if (!model || !this.fragmentsManager) return;

    this.fragmentsManager.disposeGroup(model.fragmentsGroup);
    this.models.delete(modelId);
    this.eventHandlers.onModelUnloaded?.(modelId);
  }

  /**
   * Unload all models
   */
  unloadAllModels(): void {
    for (const modelId of this.models.keys()) {
      this.unloadModel(modelId);
    }
  }

  /**
   * Set model visibility
   */
  setModelVisibility(modelId: string, visible: boolean): void {
    const model = this.models.get(modelId);
    if (!model) return;

    model.fragmentsGroup.visible = visible;
    model.visible = visible;
  }

  /**
   * Get all loaded models
   */
  getModels(): Map<string, IFCModel> {
    return new Map(this.models);
  }

  /**
   * Set camera to a preset view
   */
  setCameraView(view: CameraView): void {
    if (!this.world?.camera) return;

    const distance = 20;
    const positions: Record<CameraView, [number, number, number]> = {
      front: [0, 0, distance],
      back: [0, 0, -distance],
      left: [-distance, 0, 0],
      right: [distance, 0, 0],
      top: [0, distance, 0],
      bottom: [0, -distance, 0],
      perspective: [distance, distance, distance],
      orthographic: [distance, distance, distance],
    };

    const [x, y, z] = positions[view];
    this.world.camera.controls.setLookAt(x, y, z, 0, 0, 0, true);
  }

  /**
   * Fit view to show all models or a specific model
   */
  fitToView(modelId?: string): void {
    if (!this.world?.camera) return;

    const box = new THREE.Box3();

    if (modelId) {
      const model = this.models.get(modelId);
      if (model) {
        box.expandByObject(model.fragmentsGroup);
      }
    } else {
      for (const model of this.models.values()) {
        if (model.visible) {
          box.expandByObject(model.fragmentsGroup);
        }
      }
    }

    if (box.isEmpty()) return;

    const center = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3());
    const maxDim = Math.max(size.x, size.y, size.z);
    const distance = maxDim * 2;

    this.world.camera.controls.setLookAt(
      center.x + distance,
      center.y + distance,
      center.z + distance,
      center.x,
      center.y,
      center.z,
      true
    );
  }

  /**
   * Take a screenshot
   */
  async screenshot(options?: {
    width?: number;
    height?: number;
  }): Promise<Blob> {
    if (!this.world?.renderer) {
      throw new Error("Engine not initialized");
    }

    const renderer = this.world.renderer.three;
    const canvas = renderer.domElement;

    return new Promise((resolve, reject) => {
      try {
        // If custom dimensions, resize temporarily
        const originalSize = renderer.getSize(new THREE.Vector2());
        if (options?.width || options?.height) {
          renderer.setSize(
            options.width || originalSize.x,
            options.height || originalSize.y
          );
          renderer.render(
            this.world!.scene.three,
            this.world!.camera.three
          );
        }

        canvas.toBlob(
          (blob) => {
            // Restore original size
            if (options?.width || options?.height) {
              renderer.setSize(originalSize.x, originalSize.y);
            }

            if (blob) {
              resolve(blob);
            } else {
              reject(new Error("Failed to create screenshot"));
            }
          },
          "image/png",
          1.0
        );
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Get current camera state
   */
  getCameraState(): CameraState {
    if (!this.world?.camera) {
      return {
        position: { x: 0, y: 0, z: 0 },
        target: { x: 0, y: 0, z: 0 },
        zoom: 1,
      };
    }

    const position = this.world.camera.three.position;
    const target = this.world.camera.controls.getTarget(new THREE.Vector3());

    return {
      position: { x: position.x, y: position.y, z: position.z },
      target: { x: target.x, y: target.y, z: target.z },
      zoom: this.world.camera.three.zoom,
    };
  }

  /**
   * Handle container resize
   */
  private handleResize(): void {
    if (!this.container || !this.world?.renderer || !this.world?.camera) return;

    const { width, height } = this.container.getBoundingClientRect();
    this.world.renderer.three.setSize(width, height);

    if (this.world.camera.three instanceof THREE.PerspectiveCamera) {
      this.world.camera.three.aspect = width / height;
      this.world.camera.three.updateProjectionMatrix();
    }
  }

  /**
   * Update configuration
   */
  updateConfig(config: Partial<ViewerConfig>): void {
    this.config = { ...this.config, ...config };

    if (this.world?.scene && config.backgroundColor !== undefined) {
      const bgColor =
        typeof config.backgroundColor === "string"
          ? new THREE.Color(config.backgroundColor)
          : new THREE.Color(config.backgroundColor);
      this.world.scene.three.background = bgColor;
    }

    if (config.showGrid !== undefined && this.world && this.components) {
      if (config.showGrid && !this.grid) {
        this.grid = this.components.get(OBC.Grids);
        this.grid.create(this.world);
      } else if (!config.showGrid && this.grid) {
        this.grid.dispose();
        this.grid = null;
      }
    }
  }

  /**
   * Dispose of the engine and release resources
   */
  dispose(): void {
    if (this.isDisposed) return;

    this.isDisposed = true;

    // Stop observing resize
    this.resizeObserver?.disconnect();
    this.resizeObserver = null;

    // Unload all models
    this.unloadAllModels();

    // Dispose components
    this.components?.dispose();
    this.components = null;
    this.world = null;
    this.fragmentsManager = null;
    this.ifcLoader = null;
    this.container = null;
    this.grid = null;
  }

  /**
   * Check if engine is initialized
   */
  get initialized(): boolean {
    return this.components !== null && !this.isDisposed;
  }
}

/**
 * Create a standalone IFC engine instance
 */
export function createIFCEngine(config?: ViewerConfig): IFCEngine {
  return new IFCEngine(config);
}
