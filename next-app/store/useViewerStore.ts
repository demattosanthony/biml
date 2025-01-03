import { create } from "zustand";
import * as OBC from "@thatopen/components";
import * as OBCF from "@thatopen/components-front";
import { EntityNode, IFCCategory, IFCModel } from "@/types/ifc";

interface ViewerState {
  world: OBC.World | null;
  camera: OBC.OrthoPerspectiveCamera | null;
  components: OBC.Components | null;
  fragments: OBC.FragmentsManager | null;
  highlighter: OBCF.Highlighter | null;
  culler: OBC.MeshCullerRenderer | null;
  models: IFCModel[];
  categories: Record<string, IFCCategory>;
  selectedElement: EntityNode | null;
  isLoading: boolean;
  plans: OBCF.Plans | null;
  hider: OBC.Hider | null;
  aiMode: boolean;

  setWorld: (world: OBC.World | null) => void;
  setCamera: (camera: OBC.OrthoPerspectiveCamera | null) => void;
  setComponents: (components: OBC.Components | null) => void;
  setFragments: (fragments: OBC.FragmentsManager | null) => void;
  setHighlighter: (highlighter: OBCF.Highlighter | null) => void;
  addModel: (model: IFCModel) => void;
  clearModels: () => void;
  setCategories: (categories: Record<string, IFCCategory>) => void;
  setSelectedElement: (element: EntityNode | null) => void;
  setLoading: (isLoading: boolean) => void;
  reset: () => void;
  setPlans: (plans: OBCF.Plans | null) => void;
  setHider: (hider: OBC.Hider | null) => void;
  setAiMode: (aiMode: boolean) => void;
  setCuller: (culler: OBC.MeshCullerRenderer | null) => void;
}

const initialState = {
  world: null,
  camera: null,
  components: null,
  fragments: null,
  highlighter: null,
  models: [],
  categories: {},
  selectedElement: null,
  isLoading: false,
  plans: null,
  hider: null,
  culler: null,
  aiMode: false,
};

export const useViewerStore = create<ViewerState>((set) => ({
  ...initialState,

  setWorld: (world) => set({ world }),
  setCamera: (camera) => set({ camera }),
  setComponents: (components) => set({ components }),
  setFragments: (fragments) => set({ fragments }),
  setHighlighter: (highlighter) => set({ highlighter }),
  addModel: (model) =>
    set((state) => ({
      models: [...state.models.map((m) => ({ ...m })), { ...model }],
    })),
  clearModels: () => set({ models: [] }),
  setCategories: (categories) => set({ categories }),
  setSelectedElement: (element) => set({ selectedElement: element }),
  setLoading: (isLoading) => set({ isLoading }),
  setPlans: (plans) => set({ plans }),
  setHider: (hider) => set({ hider }),
  setCuller: (culler) => set({ culler }),
  setAiMode: (aiMode) => set({ aiMode }),
  reset: () => set(initialState),
}));
