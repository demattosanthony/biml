import { useState, useRef, useCallback } from "react";
import { IFCViewer, type IFCViewerHandle, type IFCModel } from "@biml/ifc-viewer";

function App() {
  const [model, setModel] = useState<IFCModel | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const viewerRef = useRef<IFCViewerHandle>(null);

  const handleFileChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      setLoading(true);
      setError(null);

      try {
        const loadedModel = await viewerRef.current?.loadModel(file);
        if (loadedModel) {
          setModel(loadedModel);
          viewerRef.current?.fitToView();
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load model");
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const handleFitView = () => viewerRef.current?.fitToView();
  const handleTopView = () => viewerRef.current?.setCameraView("top");
  const handleFrontView = () => viewerRef.current?.setCameraView("front");
  const handlePerspective = () => viewerRef.current?.setCameraView("perspective");

  const handleScreenshot = async () => {
    const blob = await viewerRef.current?.screenshot();
    if (blob) {
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "screenshot.png";
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  return (
    <div className="app">
      <header className="header">
        <h1>IFC Viewer Playground</h1>
        <div className="controls">
          <label className="upload-btn">
            {loading ? "Loading..." : "Upload IFC"}
            <input
              type="file"
              accept=".ifc"
              onChange={handleFileChange}
              disabled={loading}
            />
          </label>
          {model && (
            <>
              <button onClick={handleFitView}>Fit View</button>
              <button onClick={handleTopView}>Top</button>
              <button onClick={handleFrontView}>Front</button>
              <button onClick={handlePerspective}>3D</button>
              <button onClick={handleScreenshot}>Screenshot</button>
            </>
          )}
        </div>
      </header>

      {error && <div className="error">{error}</div>}

      <div className="viewer-container">
        {!model && !loading && (
          <div className="placeholder">
            <p>Upload an IFC file to get started</p>
          </div>
        )}
        <IFCViewer
          ref={viewerRef}
          config={{
            backgroundColor: "#1e1e1e",
            showGrid: true,
          }}
          onReady={() => console.log("Viewer ready")}
          onError={(err) => setError(err.message)}
          onProgress={(p) => console.log("Progress:", p)}
        />
      </div>

      {model && (
        <div className="model-info">
          <span>Model: {model.name}</span>
        </div>
      )}
    </div>
  );
}

export default App;
