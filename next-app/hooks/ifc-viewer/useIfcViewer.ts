// useIfcViewer.ts
import { useCallback } from "react";
import { atom, useAtom } from "jotai";
import * as OBC from "@thatopen/components";
import * as OBCF from "@thatopen/components-front";
import { IFCModel, IFCCategory, EntityNode } from "@/types/ifc";

const uploadedFilesAtom = atom<File[]>([]);
const loadingModelsAtom = atom<boolean>(false);
const worldAtom = atom<OBC.World | null>(null);
const cameraAtom = atom<OBC.OrthoPerspectiveCamera | null>(null);
const componentsAtom = atom<OBC.Components | null>(null);
const fragmentsAtom = atom<OBC.FragmentsManager | null>(null);
const cullerAtom = atom<OBC.MeshCullerRenderer | null>(null);
const highlighterAtom = atom<OBCF.Highlighter | null>(null);
const plansAtom = atom<OBCF.Plans | null>(null);
const modelsAtom = atom<IFCModel[]>([]);
const categoriesAtom = atom<Record<string, IFCCategory>>({});
export const hiderAtom = atom<OBC.Hider | null>(null);
const selectedElementAtom = atom<EntityNode | null>(null);
const aiModeAtom = atom<boolean>(false);

export function useIfcViewer() {
  const [uploadedFiles, setUploadedFiles] = useAtom(uploadedFilesAtom);
  const [loadingModels, setLoadingModels] = useAtom(loadingModelsAtom);
  const [world, setWorld] = useAtom(worldAtom);
  const [camera, setCamera] = useAtom(cameraAtom);
  const [components, setComponents] = useAtom(componentsAtom);
  const [fragments, setFragments] = useAtom(fragmentsAtom);
  const [culler, setCuller] = useAtom(cullerAtom);
  const [highlighter, setHighlighter] = useAtom(highlighterAtom);
  const [plans, setPlans] = useAtom(plansAtom);
  const [models, setModels] = useAtom(modelsAtom);
  const [categories, setCategories] = useAtom(categoriesAtom);
  const [hider, setHider] = useAtom(hiderAtom);
  const [selectedElement, setSelectedElement] = useAtom(selectedElementAtom);
  const [aiMode, setAiMode] = useAtom(aiModeAtom);

  const addModel = useCallback(
    (model: IFCModel) => {
      setModels((prevModels) => [...prevModels, model]);
    },
    [setModels]
  );

  const clearModels = useCallback(() => {
    setModels([]);
  }, [setModels]);

  const useIfcViewerFunctions = useCallback(
    () => ({
      setUploadedFiles,
      setLoadingModels,
      setWorld,
      setCamera,
      setComponents,
      setFragments,
      setCuller,
      setHighlighter,
      setPlans,
      setCategories,
      setHider,
      setSelectedElement,
      setAiMode,
      addModel,
      clearModels,
      setModels,
      loadingModels,
      world,
      camera,
      components,
      fragments,
      culler,
      highlighter,
      plans,
      models,
      categories,
      hider,
      selectedElement,
      aiMode,
      uploadedFiles,
    }),
    [
      setUploadedFiles,
      setLoadingModels,
      setWorld,
      setCamera,
      setComponents,
      setFragments,
      setCuller,
      setHighlighter,
      setPlans,
      setCategories,
      setHider,
      setSelectedElement,
      setAiMode,
      addModel,
      clearModels,
      setModels,
      loadingModels,
      world,
      camera,
      components,
      fragments,
      culler,
      highlighter,
      plans,
      models,
      categories,
      hider,
      selectedElement,
      aiMode,
      uploadedFiles,
    ]
  );

  return useIfcViewerFunctions();
}
