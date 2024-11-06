import { FragmentsGroup } from "@thatopen/fragments";
import { create } from "zustand";
import * as OBC from "@thatopen/components";

interface IFCModel {
  // file: File;
  name: string;
  fragmentsGroup: FragmentsGroup;
}

interface IFCState {
  ifcFiles: File[];
  models: IFCModel[];
  hider: OBC.Hider | null;
  actions: {
    setIFCFiles: (file: File[]) => void;
    addModel: (model: IFCModel) => void;
    clearModels: () => void;
    setHider: (hider: OBC.Hider) => void;
  };
}

const useIfcStore = create<IFCState>((set) => ({
  ifcFiles: [],
  models: [],
  hider: null,
  actions: {
    setIFCFiles: (files) => set({ ifcFiles: files }),
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

export default useIfcStore;
