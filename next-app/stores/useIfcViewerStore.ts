import { FragmentsGroup } from "@thatopen/fragments";
import { create } from "zustand";
import * as OBC from "@thatopen/components";
import * as OBCF from "@thatopen/components-front";

interface IFCModel {
  name: string;
  content: File;
  fragmentsGroup: FragmentsGroup;
}

interface IFCViewerState {
  world: OBC.World | null;
  fragments: OBC.FragmentsManager | null;
  culler: OBC.MeshCullerRenderer | null;
  highlighter: OBCF.Highlighter | null;
  models: IFCModel[];
  hider: OBC.Hider | null;
  actions: {
    setWorld: (world: OBC.World) => void;
    setFragments: (fragments: OBC.FragmentsManager) => void;
    setCuller: (culler: OBC.MeshCullerRenderer) => void;
    setHighlighter: (highlighter: OBCF.Highlighter) => void;
    addModel: (model: IFCModel) => void;
    clearModels: () => void;
    setHider: (hider: OBC.Hider) => void;
  };
}

const useIfcViewerStore = create<IFCViewerState>((set) => ({
  world: null,
  fragments: null,
  culler: null,
  highlighter: null,
  ifcFiles: [],
  models: [],
  hider: null,
  actions: {
    setWorld: (world) => set({ world }),
    setFragments: (fragments) => set({ fragments }),
    setCuller: (culler) => set({ culler }),
    setHighlighter: (highlighter) => set({ highlighter }),
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
  },
}));

export default useIfcViewerStore;
