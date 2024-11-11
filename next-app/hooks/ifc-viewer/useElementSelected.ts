import useIfcViewerStore from "@/stores/useIfcViewerStore";
import { useCallback } from "react";

export function useElementSelected() {
  const highlighter = useIfcViewerStore((state) => state.highlighter);
  const models = useIfcViewerStore((state) => state.models);

  const onSelection = useCallback(
    async (fragmentIdMap: { [fragmentId: string]: Set<number> }) => {
      console.log("Element selected");
      // Get the selected fragment id
      const fragmentId = Object.values(fragmentIdMap)[0]?.values().next().value;
      console.log("Selected fragment id", fragmentId);

      // Check to find the element in all models
      for (const model of models) {
        console.log("Checking model", model.name);
        const element = await model?.fragmentsGroup.getProperties(fragmentId!);
        const name = element?.Name.value;
        console.log("Selected element", name);
      }
    },
    [models, highlighter]
  );

  return { onSelection };
}
