import { useIFCViewerContext } from "../context/IFCViewerContext";
import type { ViewerActions, ViewerState } from "../types";

/**
 * Hook to access IFC Viewer state and actions
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { state, actions } = useIFCViewer();
 *
 *   const handleLoadModel = async () => {
 *     await actions.loadModel('/model.ifc');
 *     actions.fitToView();
 *   };
 *
 *   return (
 *     <div>
 *       {state.loading && <p>Loading...</p>}
 *       <button onClick={handleLoadModel}>Load Model</button>
 *     </div>
 *   );
 * }
 * ```
 */
export function useIFCViewer(): { state: ViewerState; actions: ViewerActions } {
  return useIFCViewerContext();
}

/**
 * Hook to access only the viewer state
 *
 * @example
 * ```tsx
 * function LoadingIndicator() {
 *   const { loading, loadingProgress } = useViewerState();
 *
 *   if (!loading) return null;
 *
 *   return <div>Loading: {loadingProgress}%</div>;
 * }
 * ```
 */
export function useViewerState(): ViewerState {
  const { state } = useIFCViewerContext();
  return state;
}

/**
 * Hook to access only the viewer actions
 *
 * @example
 * ```tsx
 * function Toolbar() {
 *   const actions = useViewerActions();
 *
 *   return (
 *     <div>
 *       <button onClick={() => actions.fitToView()}>Fit View</button>
 *       <button onClick={() => actions.setCameraView('top')}>Top View</button>
 *     </div>
 *   );
 * }
 * ```
 */
export function useViewerActions(): ViewerActions {
  const { actions } = useIFCViewerContext();
  return actions;
}

/**
 * Hook to access loaded models
 *
 * @example
 * ```tsx
 * function ModelList() {
 *   const models = useModels();
 *
 *   return (
 *     <ul>
 *       {Array.from(models.values()).map(model => (
 *         <li key={model.id}>{model.name}</li>
 *       ))}
 *     </ul>
 *   );
 * }
 * ```
 */
export function useModels() {
  const { state } = useIFCViewerContext();
  return state.models;
}

/**
 * Hook to access selection state
 *
 * @example
 * ```tsx
 * function SelectionInfo() {
 *   const { selectedIds, hoveredId } = useSelection();
 *
 *   return (
 *     <div>
 *       <p>Selected: {selectedIds.size} elements</p>
 *       <p>Hovered: {hoveredId ?? 'None'}</p>
 *     </div>
 *   );
 * }
 * ```
 */
export function useSelection() {
  const { state } = useIFCViewerContext();
  return state.selection;
}

/**
 * Hook to access loading state
 *
 * @example
 * ```tsx
 * function LoadingOverlay() {
 *   const { loading, progress } = useLoading();
 *
 *   if (!loading) return null;
 *
 *   return (
 *     <div className="loading-overlay">
 *       <progress value={progress} max={100} />
 *     </div>
 *   );
 * }
 * ```
 */
export function useLoading() {
  const { state } = useIFCViewerContext();
  return {
    loading: state.loading,
    progress: state.loadingProgress,
  };
}
