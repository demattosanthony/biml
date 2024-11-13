import useIfcViewerStore from "@/stores/useIfcViewerStore";
import { useCallback } from "react";
import * as OBC from "@thatopen/components";

export function useElementSelected() {
  const highlighter = useIfcViewerStore((state) => state.highlighter);
  const models = useIfcViewerStore((state) => state.models);
  const setSelectedElement = useIfcViewerStore(
    (state) => state.actions.setSelectedElement
  );

  const onSelection = useCallback(
    async (fragmentIdMap: { [fragmentId: string]: Set<number> }) => {
      console.log("Element selected");
      // Get the selected fragment id
      const fragmentId = Object.values(fragmentIdMap)[0]?.values().next().value;
      console.log("Selected fragment id", fragmentId);

      // Check to find the element in all models
      for (const model of models) {
        console.log("Checking model", model.name);

        const entityAttrs = await model.fragmentsGroup.getProperties(
          fragmentId
        );

        if (!entityAttrs) return null;

        const { type, Name } = entityAttrs;

        setSelectedElement({
          expressID: fragmentId!,
          name: Name?.value || "",
          ifcClass: OBC.IfcCategoryMap[type],
          children: [],
        });
      }
    },
    [models, highlighter]
  );

  const onDeselection = useCallback(() => {
    setSelectedElement(null);
  }, [models, highlighter]);

  return { onSelection, onDeselection };
}
