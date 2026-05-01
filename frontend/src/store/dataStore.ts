// frontend/src/store/dataStore.ts
import { create } from "zustand";
import { api } from "@/services/api";

interface Column {
  name: string;
  type: string;
}

interface Dataset {
  _id: string;
  userId: string;
  fileName: string;
  rowCount: number;
  columns: Column[];
  schema: Record<string, string>;
  stats: Record<string, any>;
  createdAt: string;
}

interface DataState {
  datasets: Dataset[];
  currentDataset: Dataset | null;
  loading: boolean;
  uploadDataset: (file: File, onProgress?: (percent: number) => void) => Promise<any>;
  fetchDatasets: () => Promise<void>;
  fetchDataset: (id: string) => Promise<void>;
  deleteDataset: (id: string) => Promise<void>; // <-- ADDED THIS
}

export const useDataStore = create<DataState>((set) => ({
  datasets: [],
  currentDataset: null,
  loading: false,

  uploadDataset: async (file: File, onProgress?: (percent: number) => void) => {
    const formData = new FormData();
    formData.append("file", file);

    const res = await api.post("/data/upload", formData, {
      onUploadProgress: (progressEvent) => {
        if (progressEvent.total && onProgress) {
          const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(percent);
        }
      },
    });

    return res.data.data;
  },

  fetchDatasets: async () => {
    set({ loading: true });
    try {
      const res = await api.get("/data");
      set({ datasets: res.data.data.datasets });
    } catch (error) {
      console.error("Failed to fetch datasets", error);
    } finally {
      set({ loading: false });
    }
  },

  fetchDataset: async (id: string) => {
    set({ loading: true, currentDataset: null });
    try {
      const res = await api.get(`/data/${id}`);
      set({ currentDataset: res.data.data.dataset });
    } catch (error) {
      console.error("Failed to fetch dataset", error);
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  // <-- ADDED THIS FUNCTION
  deleteDataset: async (id: string) => {
    try {
      await api.delete(`/data/${id}`);
      set((state) => ({
        datasets: state.datasets.filter((d) => d._id !== id),
      }));
    } catch (error) {
      console.error("Failed to delete dataset", error);
      throw error;
    }
  },
}));