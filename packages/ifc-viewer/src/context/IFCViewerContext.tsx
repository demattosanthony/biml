import {
  createContext,
  useContext,
  useReducer,
  useCallback,
  useRef,
  useMemo,
  type ReactNode,
} from "react";
import { IFCEngine } from "../core/IFCEngine";
import {
  type ViewerState,
  type ViewerActions,
  type IFCViewerContextValue,
  type IFCModel,
  type CameraView,
  type ViewerConfig,
  INITIAL_STATE,
} from "../types";

// Action types
type ViewerAction =
  | { type: "SET_INITIALIZED"; payload: boolean }
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "SET_PROGRESS"; payload: number }
  | { type: "SET_ERROR"; payload: string | null }
  | { type: "ADD_MODEL"; payload: IFCModel }
  | { type: "REMOVE_MODEL"; payload: string }
  | { type: "CLEAR_MODELS" }
  | { type: "UPDATE_MODEL"; payload: { id: string; updates: Partial<IFCModel> } }
  | { type: "SET_SELECTION"; payload: number[] }
  | { type: "CLEAR_SELECTION" }
  | { type: "SET_HOVERED"; payload: number | null };

// Reducer
function viewerReducer(state: ViewerState, action: ViewerAction): ViewerState {
  switch (action.type) {
    case "SET_INITIALIZED":
      return { ...state, initialized: action.payload };

    case "SET_LOADING":
      return { ...state, loading: action.payload };

    case "SET_PROGRESS":
      return { ...state, loadingProgress: action.payload };

    case "SET_ERROR":
      return { ...state, error: action.payload };

    case "ADD_MODEL": {
      const newModels = new Map(state.models);
      newModels.set(action.payload.id, action.payload);
      return { ...state, models: newModels };
    }

    case "REMOVE_MODEL": {
      const newModels = new Map(state.models);
      newModels.delete(action.payload);
      return { ...state, models: newModels };
    }

    case "CLEAR_MODELS":
      return { ...state, models: new Map() };

    case "UPDATE_MODEL": {
      const model = state.models.get(action.payload.id);
      if (!model) return state;
      const newModels = new Map(state.models);
      newModels.set(action.payload.id, { ...model, ...action.payload.updates });
      return { ...state, models: newModels };
    }

    case "SET_SELECTION":
      return {
        ...state,
        selection: {
          ...state.selection,
          selectedIds: new Set(action.payload),
        },
      };

    case "CLEAR_SELECTION":
      return {
        ...state,
        selection: {
          ...state.selection,
          selectedIds: new Set(),
        },
      };

    case "SET_HOVERED":
      return {
        ...state,
        selection: {
          ...state.selection,
          hoveredId: action.payload,
        },
      };

    default:
      return state;
  }
}

// Context
const IFCViewerContext = createContext<IFCViewerContextValue | null>(null);

// Provider props
interface IFCViewerProviderProps {
  children: ReactNode;
  config?: ViewerConfig;
}

/**
 * Provider component for IFC Viewer context
 */
export function IFCViewerProvider({
  children,
  config,
}: IFCViewerProviderProps) {
  const [state, dispatch] = useReducer(viewerReducer, INITIAL_STATE);
  const engineRef = useRef<IFCEngine | null>(null);

  // Get or create engine
  const getEngine = useCallback(() => {
    if (!engineRef.current) {
      engineRef.current = new IFCEngine(config);
    }
    return engineRef.current;
  }, [config]);

  // Actions
  const loadModel = useCallback(
    async (source: string | File, name?: string): Promise<IFCModel> => {
      const engine = getEngine();
      dispatch({ type: "SET_LOADING", payload: true });
      dispatch({ type: "SET_ERROR", payload: null });

      try {
        const model = await engine.loadModel(source, name);
        dispatch({ type: "ADD_MODEL", payload: model });
        return model;
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Failed to load model";
        dispatch({ type: "SET_ERROR", payload: message });
        throw error;
      } finally {
        dispatch({ type: "SET_LOADING", payload: false });
        dispatch({ type: "SET_PROGRESS", payload: 0 });
      }
    },
    [getEngine]
  );

  const unloadModel = useCallback(
    (modelId: string) => {
      const engine = getEngine();
      engine.unloadModel(modelId);
      dispatch({ type: "REMOVE_MODEL", payload: modelId });
    },
    [getEngine]
  );

  const unloadAllModels = useCallback(() => {
    const engine = getEngine();
    engine.unloadAllModels();
    dispatch({ type: "CLEAR_MODELS" });
  }, [getEngine]);

  const setModelVisibility = useCallback(
    (modelId: string, visible: boolean) => {
      const engine = getEngine();
      engine.setModelVisibility(modelId, visible);
      dispatch({ type: "UPDATE_MODEL", payload: { id: modelId, updates: { visible } } });
    },
    [getEngine]
  );

  const select = useCallback(
    (expressIds: number[], _modelId?: string) => {
      dispatch({ type: "SET_SELECTION", payload: expressIds });
    },
    []
  );

  const clearSelection = useCallback(() => {
    dispatch({ type: "CLEAR_SELECTION" });
  }, []);

  const setCameraView = useCallback(
    (view: CameraView) => {
      const engine = getEngine();
      engine.setCameraView(view);
    },
    [getEngine]
  );

  const fitToView = useCallback(
    (modelId?: string) => {
      const engine = getEngine();
      engine.fitToView(modelId);
    },
    [getEngine]
  );

  const screenshot = useCallback(
    async (options?: { width?: number; height?: number }): Promise<Blob> => {
      const engine = getEngine();
      return engine.screenshot(options);
    },
    [getEngine]
  );

  const getElementProperties = useCallback(
    async (
      _expressId: number,
      _modelId: string
    ): Promise<Record<string, unknown> | null> => {
      // TODO: Implement property extraction
      return null;
    },
    []
  );

  const highlight = useCallback(
    (_expressIds: number[], _modelId: string) => {
      // TODO: Implement highlighting
    },
    []
  );

  const clearHighlights = useCallback(() => {
    // TODO: Implement clear highlights
  }, []);

  const isolate = useCallback(
    (_expressIds: number[], _modelId: string) => {
      // TODO: Implement isolation
    },
    []
  );

  const showAll = useCallback(() => {
    // TODO: Implement show all
  }, []);

  const actions: ViewerActions = useMemo(
    () => ({
      loadModel,
      unloadModel,
      unloadAllModels,
      setModelVisibility,
      select,
      clearSelection,
      setCameraView,
      fitToView,
      screenshot,
      getElementProperties,
      highlight,
      clearHighlights,
      isolate,
      showAll,
    }),
    [
      loadModel,
      unloadModel,
      unloadAllModels,
      setModelVisibility,
      select,
      clearSelection,
      setCameraView,
      fitToView,
      screenshot,
      getElementProperties,
      highlight,
      clearHighlights,
      isolate,
      showAll,
    ]
  );

  const contextValue: IFCViewerContextValue = useMemo(
    () => ({ state, actions }),
    [state, actions]
  );

  return (
    <IFCViewerContext.Provider value={contextValue}>
      {children}
    </IFCViewerContext.Provider>
  );
}

/**
 * Hook to access the IFC Viewer context
 */
export function useIFCViewerContext(): IFCViewerContextValue {
  const context = useContext(IFCViewerContext);
  if (!context) {
    throw new Error(
      "useIFCViewerContext must be used within an IFCViewerProvider"
    );
  }
  return context;
}

/**
 * Internal hook to access the engine ref
 */
export function useEngineRef(): React.MutableRefObject<IFCEngine | null> {
  const engineRef = useRef<IFCEngine | null>(null);
  return engineRef;
}

// Export context for advanced use cases
export { IFCViewerContext };
