// Main component
export { IFCViewer, IFCViewerCanvas, type IFCViewerHandle } from "./components";

// Context and Provider
export { IFCViewerProvider, IFCViewerContext, useIFCViewerContext } from "./context";

// Hooks
export {
  useIFCViewer,
  useViewerState,
  useViewerActions,
  useModels,
  useSelection,
  useLoading,
} from "./hooks";

// Core engine (for advanced use)
export { IFCEngine, createIFCEngine } from "./core";

// Types
export type {
  IFCModel,
  CameraView,
  CameraState,
  SelectionState,
  ViewerState,
  ViewerEvents,
  ViewerConfig,
  IFCViewerProps,
  ViewerActions,
  IFCViewerContextValue,
} from "./types";

// Constants
export { DEFAULT_CONFIG, DEFAULT_CAMERA_STATE, INITIAL_STATE } from "./types";
