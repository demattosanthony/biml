import {
  useEffect,
  useRef,
  useCallback,
  forwardRef,
  useImperativeHandle,
} from "react";
import { IFCEngine } from "../core/IFCEngine";
import { IFCViewerProvider, useIFCViewerContext } from "../context/IFCViewerContext";
import type { IFCViewerProps, ViewerActions, IFCModel } from "../types";

/**
 * Handle exposed by IFCViewer ref
 */
export interface IFCViewerHandle extends ViewerActions {
  /** Get the underlying engine instance */
  getEngine: () => IFCEngine | null;
}

/**
 * Internal viewer component that renders inside the provider
 */
interface InternalViewerProps extends IFCViewerProps {
  onEngineReady?: (engine: IFCEngine) => void;
}

const InternalViewer = forwardRef<IFCViewerHandle, InternalViewerProps>(
  function InternalViewer(
    {
      src,
      config,
      className,
      style,
      children,
      onModelLoaded,
      onModelUnloaded,
      onSelect,
      onHover,
      onCameraChange,
      onProgress,
      onError,
      onReady,
      onEngineReady,
    },
    ref
  ) {
    const containerRef = useRef<HTMLDivElement>(null);
    const engineRef = useRef<IFCEngine | null>(null);
    const initRef = useRef(false);
    const { actions } = useIFCViewerContext();

    // Initialize engine
    useEffect(() => {
      if (!containerRef.current || initRef.current) return;
      initRef.current = true;

      const engine = new IFCEngine(config);
      engineRef.current = engine;

      // Set up event handlers
      engine.setEventHandlers({
        onModelLoaded,
        onModelUnloaded,
        onSelect,
        onHover,
        onCameraChange,
        onProgress,
        onError,
        onReady: () => {
          onReady?.();
          onEngineReady?.(engine);
        },
      });

      // Initialize engine
      engine.init(containerRef.current).catch((error) => {
        onError?.(error instanceof Error ? error : new Error(String(error)));
      });

      return () => {
        engine.dispose();
        engineRef.current = null;
      };
    }, []); // Only run once

    // Update event handlers when they change
    useEffect(() => {
      engineRef.current?.setEventHandlers({
        onModelLoaded,
        onModelUnloaded,
        onSelect,
        onHover,
        onCameraChange,
        onProgress,
        onError,
      });
    }, [
      onModelLoaded,
      onModelUnloaded,
      onSelect,
      onHover,
      onCameraChange,
      onProgress,
      onError,
    ]);

    // Load initial model
    useEffect(() => {
      if (!src || !engineRef.current?.initialized) return;

      engineRef.current.loadModel(src).then((model) => {
        engineRef.current?.fitToView();
        onModelLoaded?.(model);
      }).catch((error) => {
        onError?.(error instanceof Error ? error : new Error(String(error)));
      });
    }, [src]);

    // Expose imperative handle
    useImperativeHandle(
      ref,
      () => ({
        ...actions,
        loadModel: async (source: string | File, name?: string): Promise<IFCModel> => {
          if (!engineRef.current) {
            throw new Error("Engine not initialized");
          }
          return engineRef.current.loadModel(source, name);
        },
        getEngine: () => engineRef.current,
      }),
      [actions]
    );

    return (
      <div
        ref={containerRef}
        className={className}
        style={{
          width: "100%",
          height: "100%",
          position: "relative",
          overflow: "hidden",
          ...style,
        }}
      >
        {children}
      </div>
    );
  }
);

/**
 * IFCViewer component for rendering IFC 3D models
 *
 * @example Basic usage
 * ```tsx
 * import { IFCViewer } from '@biml/ifc-viewer';
 *
 * function App() {
 *   return (
 *     <div style={{ width: '100vw', height: '100vh' }}>
 *       <IFCViewer src="/model.ifc" />
 *     </div>
 *   );
 * }
 * ```
 *
 * @example With ref for programmatic control
 * ```tsx
 * import { IFCViewer, IFCViewerHandle } from '@biml/ifc-viewer';
 * import { useRef } from 'react';
 *
 * function App() {
 *   const viewerRef = useRef<IFCViewerHandle>(null);
 *
 *   const handleScreenshot = async () => {
 *     const blob = await viewerRef.current?.screenshot();
 *     // Download or display the screenshot
 *   };
 *
 *   return (
 *     <div style={{ width: '100vw', height: '100vh' }}>
 *       <IFCViewer
 *         ref={viewerRef}
 *         src="/model.ifc"
 *         onModelLoaded={(model) => console.log('Loaded:', model.name)}
 *       />
 *       <button onClick={handleScreenshot}>Screenshot</button>
 *     </div>
 *   );
 * }
 * ```
 *
 * @example With custom configuration
 * ```tsx
 * <IFCViewer
 *   src="/model.ifc"
 *   config={{
 *     backgroundColor: '#1a1a1a',
 *     showGrid: true,
 *     selectionColor: '#ff0000',
 *   }}
 *   onSelect={(ids) => console.log('Selected:', ids)}
 * />
 * ```
 */
export const IFCViewer = forwardRef<IFCViewerHandle, IFCViewerProps>(
  function IFCViewer(props, ref) {
    return (
      <IFCViewerProvider config={props.config}>
        <InternalViewer {...props} ref={ref} />
      </IFCViewerProvider>
    );
  }
);

/**
 * Standalone viewer without the context provider
 * Use this when you want to manage the provider yourself
 */
export const IFCViewerCanvas = InternalViewer;
