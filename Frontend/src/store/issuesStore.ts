import { create } from "zustand";
import debounce from "lodash.debounce";
import api from "../utils/api";
import type { Issue } from "../types/index";

type IssuesState = {
  issues: Issue[];
  currentIssue: Issue | null;
  statusCounts: Record<string, number>;
  loading: boolean;
  totalPages: number;
  currentPage: number;
  fetchIssues: (filters?: {
    title?: string;
    status?: string;
    priority?: string;
    page?: number;
  }) => void;
  fetchIssue: (id: string) => Promise<void>;
  createIssue: (data: Partial<Issue>) => Promise<void>;
  updateIssue: (id: string, data: Partial<Issue>) => Promise<void>;
  deleteIssue: (id: string) => Promise<void>;
};

export const useIssueStore = create<IssuesState>((set, get) => ({
  issues: [],
  currentIssue: null,
  statusCounts: {},
  loading: false,
  totalPages: 1,
  currentPage: 1,
  // debounce to avoid hammering the API on every keystroke
  fetchIssues: debounce(async (filters = {}) => {
    set({ loading: true });
    try {
      const { data } = await api.get("/issues", { params: filters });
      set({
        issues: data.issues || [],
        statusCounts: data.statusCounts || {},
        totalPages: data.totalPages || 1,
        currentPage: filters.page || 1,
        loading: false,
      });
    } catch {
      set({ loading: false });
    }
  }, 400),
  fetchIssue: async (id: string) => {
    set({ loading: true, currentIssue: null });
    try {
      const { data } = await api.get(`/issues/${id}`);
      set({ currentIssue: data, loading: false });
    } catch {
      set({ loading: false });
    }
  },
  createIssue: async (data) => {
    await api.post("/issues", data);
    get().fetchIssues();
  },

  updateIssue: async (id, data) => {
    await api.put(`/issues/${id}`, data);
    get().fetchIssues();
  },

  deleteIssue: async (id) => {
    await api.delete(`/issues/${id}`);
    get().fetchIssues();
  },
}));
