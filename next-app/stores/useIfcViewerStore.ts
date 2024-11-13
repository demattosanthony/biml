import { FragmentsGroup } from "@thatopen/fragments";
import { create } from "zustand";
import * as OBC from "@thatopen/components";
import * as OBCF from "@thatopen/components-front";

export interface EntityNode {
  expressID: number;
  ifcClass: string; // Updated to store the IFC class
  name: string;
  children: EntityNode[];
}

interface IFCModel {
  name: string;
  content: File;
  fragmentsGroup: FragmentsGroup;
  tree: EntityNode | null;
}

interface IFCViewerState {
  loadingModels: boolean;
  world: OBC.World | null;
  fragments: OBC.FragmentsManager | null;
  culler: OBC.MeshCullerRenderer | null;
  highlighter: OBCF.Highlighter | null;
  plans: OBCF.Plans | null;
  models: IFCModel[];
  hider: OBC.Hider | null;
  selectedElement: EntityNode | null;
  actions: {
    setLoadingModels: (loading: boolean) => void;
    setWorld: (world: OBC.World) => void;
    setFragments: (fragments: OBC.FragmentsManager) => void;
    setCuller: (culler: OBC.MeshCullerRenderer) => void;
    setHighlighter: (highlighter: OBCF.Highlighter) => void;
    setPlans: (plans: OBCF.Plans) => void;
    addModel: (model: IFCModel) => void;
    clearModels: () => void;
    setHider: (hider: OBC.Hider) => void;
    setSelectedElement: (element: EntityNode | null) => void;
  };
}

const useIfcViewerStore = create<IFCViewerState>((set) => ({
  loadingModels: false,
  world: null,
  fragments: null,
  culler: null,
  highlighter: null,
  plans: null,
  ifcFiles: [],
  models: [],
  hider: null,
  selectedElement: null,
  actions: {
    setLoadingModels: (loading) => set({ loadingModels: loading }),
    setWorld: (world) => set({ world }),
    setFragments: (fragments) => set({ fragments }),
    setCuller: (culler) => set({ culler }),
    setHighlighter: (highlighter) => set({ highlighter }),
    setPlans: (plans) => set({ plans }),
    addModel: (model) => {
      set((state) => {
        return {
          ...state,
          models: [...state.models, model],
        };
      });
    },
    clearModels: () => set({ models: [] }),
    setHider: (hider) => set({ hider }),
    setSelectedElement: (element) => set({ selectedElement: element }),
  },
}));

export default useIfcViewerStore;
