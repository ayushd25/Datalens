import { create } from "zustand";
import { api } from "@/services/api";

interface User {
  id: string;
  name: string;
  email: string;
  plan: string;
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  loading: boolean;
  initialized: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  fetchMe: () => Promise<void>;
  updateProfile: (data: any) => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  accessToken: null,
  loading: false,
  initialized: false,

  login: async (email, password) => {
    const res = await api.post("/auth/login", { email, password });
    const { user, accessToken } = res.data.data;
    set({ user, accessToken, initialized: true });
  },

  signup: async (name, email, password) => {
    const res = await api.post("/auth/signup", { name, email, password });
    const { user, accessToken } = res.data.data;
    set({ user, accessToken, initialized: true });
  },

  logout: async () => {
    try {
      await api.post("/auth/logout");
    } catch {
      // Ignore errors — clear local state regardless
    }
    set({ user: null, accessToken: null, initialized: true });
  },

  fetchMe: async () => {
    try {
      const res = await api.get("/auth/me");
      set({ user: res.data.data.user, initialized: true });
    } catch {
      set({ user: null, accessToken: null, initialized: true });
    }
  },

  updateProfile: async (data) => {
    const res = await api.put("/auth/profile", data);
    set({ user: res.data.data.user });
  },
}));