import { create } from "zustand";
import api from "../utils/api";
import toast from "react-hot-toast";

type AuthState = {
  isAuthenticated: boolean;
  initialized: boolean;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  register: (email: string, password: string) => Promise<boolean>;
};

export const useAuthStore = create<AuthState>((set) => ({
  isAuthenticated: false,
  initialized: false,
  loading: false,
  error: null,
  login: async (email, password) => {
    set({ loading: true, error: null });
    try {
      await api.post("/auth/login", { email, password });
      set({ isAuthenticated: true, loading: false, error: null });

      toast.success("Login Successful");
      return true;
    } catch {
      set({ loading: false, error: "Invalid email or password" });
      toast.error("Invalid email or password");

      return false;
    }
  },
  logout: async () => {
    set({ loading: true });
    try {
      await api.post("/auth/logout");
      set({ isAuthenticated: false, loading: false });
    } catch {
      set({ loading: false });
    }
  },

  checkAuth: async () => {
    set({ loading: true });
    try {
      const { data } = await api.get("/auth/check");
      if (data.isAuthenticated) {
        set({ isAuthenticated: true, initialized: true, loading: false });
      } else {
        throw new Error("Not authenticated");
      }
    } catch {
      set({ isAuthenticated: false, initialized: true, loading: false });
    }
  },

  register: async (email, password) => {
    set({ loading: true, error: null });
    try {
      await api.post("/auth/register", { email, password });
      set({ loading: false, error: null });
      toast.success("Account created! Please sign in.");
      return true;
    } catch (err: any) {
      const msg =
        err.response?.data?.message ||
        err.response?.data?.errors?.[0]?.msg ||
        "Registration failed";
      set({ loading: false, error: msg });
      toast.error(msg);
      return false;
    }
  },
}));
