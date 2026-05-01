import { create } from "zustand";

interface LoadingState {
  isLoading: boolean;
  text: string;
  startLoading: (text?: string) => void;
  stopLoading: () => void;
}

export const useLoadingStore = create<LoadingState>((set) => ({
  isLoading: false,
  text: "Processing...",
  startLoading: (text = "Processing...") => set({ isLoading: true, text }),
  stopLoading: () => set({ isLoading: false, text: "Processing..." }),
}));