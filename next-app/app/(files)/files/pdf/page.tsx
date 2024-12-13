"use client";

import { Viewer } from "@react-pdf-viewer/core";
import { zoomPlugin } from "@react-pdf-viewer/zoom";
import { pageNavigationPlugin } from "@react-pdf-viewer/page-navigation";

import "@react-pdf-viewer/zoom/lib/styles/index.css";
import "@react-pdf-viewer/core/lib/styles/index.css";
import "@react-pdf-viewer/page-navigation/lib/styles/index.css";

export default function PdfViewer() {
  const zoomPluginInstance = zoomPlugin({ enableShortcuts: true });
  const pageNavigationPluginInstance = pageNavigationPlugin();

  //   useEffect(() => {
  //     setPdfPlugins(zoomPluginInstance, pageNavigationPluginInstance);

  //     return () => {
  //       setPdfPlugins(null, null);
  //     };
  //   }, []);

  return (
    <Viewer
      fileUrl={"/arch_set_setty-office.pdf"}
      plugins={[zoomPluginInstance, pageNavigationPluginInstance]}
      //   renderLoader={(_: number) => <MyRingLoader />}
    />
  );
}
