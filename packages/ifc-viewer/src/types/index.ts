import type { FragmentsGroup } from "@thatopen/fragments";

/**
 * Represents a loaded IFC model in the viewer
 */
export interface IFCModel {
  /** Unique identifier for the model */
  id: string;
  /** Display name of the model */
  name: string;
  /** The underlying fragments group from @thatopen/fragments */
  fragmentsGroup: FragmentsGroup;
  /** Whether the model is currently visible */
  visible: boolean;
  /** URL or path the model was loaded from */
  source: string;
}

/**
 * Camera view presets
 */
export type CameraView =
  | "front"
  | "back"
  | "left"
  | "right"
  | "top"
  | "bottom"
  | "perspective"
  | "orthographic";

/**
 * Camera state
 */
export interface CameraState {
  position: { x: number; y: number; z: number };
  target: { x: number; y: number; z: number };
  zoom: number;
}

/**
 * Selection state for IFC elements
 */
export interface SelectionState {
  /** IDs of currently selected elements */
  selectedIds: Set<number>;
  /** ID of element currently being hovered */
  hoveredId: number | null;
}

/**
 * Viewer state
 */
export interface ViewerState {
  /** Whether the viewer is initialized */
  initialized: boolean;
  /** Whether a model is currently loading */
  loading: boolean;
  /** Current loading progress (0-100) */
  loadingProgress: number;
  /** Loaded models */
  models: Map<string, IFCModel>;
  /** Selection state */
  selection: SelectionState;
  /** Current camera state */
  camera: CameraState;
  /** Error message if any */
  error: string | null;
}

/**
 * Events emitted by the viewer
 */
export interface ViewerEvents {
  /** Called when a model is loaded */
  onModelLoaded?: (model: IFCModel) => void;
  /** Called when a model is unloaded */
  onModelUnloaded?: (modelId: string) => void;
  /** Called when elements are selected */
  onSelect?: (expressIds: number[], modelId: string) => void;
  /** Called when hovering over an element */
  onHover?: (expressId: number | null, modelId: string | null) => void;
  /** Called when the camera changes */
  onCameraChange?: (camera: CameraState) => void;
  /** Called when loading progress updates */
  onProgress?: (progress: number) => void;
  /** Called when an error occurs */
  onError?: (error: Error) => void;
  /** Called when the viewer is ready */
  onReady?: () => void;
}

/**
 * Viewer configuration options
 */
export interface ViewerConfig {
  /** Background color (CSS color string or Three.js color) */
  backgroundColor?: string | number;
  /** Whether to show the grid */
  showGrid?: boolean;
  /** Whether to show axes helper */
  showAxes?: boolean;
  /** Enable selection highlighting */
  selectionEnabled?: boolean;
  /** Color for selected elements */
  selectionColor?: string | number;
  /** Color for hovered elements */
  hoverColor?: string | number;
  /** Enable orbit controls */
  orbitControls?: boolean;
  /** Enable ambient occlusion */
  ambientOcclusion?: boolean;
  /** Enable shadows */
  shadows?: boolean;
  /** Enable antialiasing */
  antialias?: boolean;
}

/**
 * Props for the IFCViewer component
 */
export interface IFCViewerProps extends ViewerEvents {
  /** URL or File to load initially */
  src?: string | File;
  /** Viewer configuration */
  config?: ViewerConfig;
  /** Custom class name */
  className?: string;
  /** Custom inline styles */
  style?: React.CSSProperties;
  /** Child components (toolbars, overlays, etc.) */
  children?: React.ReactNode;
}

/**
 * Actions available on the viewer instance
 */
export interface ViewerActions {
  /** Load an IFC model from a URL or File */
  loadModel: (source: string | File, name?: string) => Promise<IFCModel>;
  /** Unload a model by ID */
  unloadModel: (modelId: string) => void;
  /** Unload all models */
  unloadAllModels: () => void;
  /** Set model visibility */
  setModelVisibility: (modelId: string, visible: boolean) => void;
  /** Select elements by express IDs */
  select: (expressIds: number[], modelId?: string) => void;
  /** Clear selection */
  clearSelection: () => void;
  /** Set camera to a preset view */
  setCameraView: (view: CameraView) => void;
  /** Fit camera to show all models or a specific model */
  fitToView: (modelId?: string) => void;
  /** Take a screenshot of the current view */
  screenshot: (options?: { width?: number; height?: number }) => Promise<Blob>;
  /** Get properties of an element */
  getElementProperties: (
    expressId: number,
    modelId: string
  ) => Promise<Record<string, unknown> | null>;
  /** Highlight elements temporarily */
  highlight: (expressIds: number[], modelId: string) => void;
  /** Clear highlights */
  clearHighlights: () => void;
  /** Isolate elements (hide all others) */
  isolate: (expressIds: number[], modelId: string) => void;
  /** Show all elements */
  showAll: () => void;
}

/**
 * Context value provided by IFCViewerProvider
 */
export interface IFCViewerContextValue {
  state: ViewerState;
  actions: ViewerActions;
}

/**
 * Default viewer configuration
 */
export const DEFAULT_CONFIG: Required<ViewerConfig> = {
  backgroundColor: "#f0f0f0",
  showGrid: true,
  showAxes: false,
  selectionEnabled: true,
  selectionColor: "#ff9800",
  hoverColor: "#4fc3f7",
  orbitControls: true,
  ambientOcclusion: false,
  shadows: false,
  antialias: true,
};

/**
 * Default camera state
 */
export const DEFAULT_CAMERA_STATE: CameraState = {
  position: { x: 10, y: 10, z: 10 },
  target: { x: 0, y: 0, z: 0 },
  zoom: 1,
};

/**
 * Initial viewer state
 */
export const INITIAL_STATE: ViewerState = {
  initialized: false,
  loading: false,
  loadingProgress: 0,
  models: new Map(),
  selection: {
    selectedIds: new Set(),
    hoveredId: null,
  },
  camera: DEFAULT_CAMERA_STATE,
  error: null,
};
