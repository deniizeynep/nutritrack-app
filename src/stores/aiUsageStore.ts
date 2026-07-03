import { create } from "zustand";
import {
  aiUsageApi,
  type AiUsageItem,
  type AiUsageSummary,
} from "../services/aiUsageApi";

type AiUsageState = {
  items: AiUsageItem[];
  summary: AiUsageSummary;
  isLoading: boolean;
  error: string | null;
  fetchMyAiUsage: (token?: string | null) => Promise<void>;
  clearAiUsage: () => void;
  clearError: () => void;
};

const emptySummary: AiUsageSummary = {
  total: 0,
  success: 0,
  failed: 0,
};

export const useAiUsageStore = create<AiUsageState>()((set) => ({
  items: [],
  summary: emptySummary,
  isLoading: false,
  error: null,

  fetchMyAiUsage: async (token) => {
    if (!token) {
      return;
    }

    try {
      set({
        isLoading: true,
        error: null,
      });

      const response = await aiUsageApi.getMyAiUsage(token);

      set({
        items: response.items,
        summary: response.summary,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      set({
        isLoading: false,
        error:
          error instanceof Error ? error.message : "AI kullanımı alınamadı.",
      });
    }
  },

  clearAiUsage: () =>
    set({
      items: [],
      summary: emptySummary,
      isLoading: false,
      error: null,
    }),

  clearError: () =>
    set({
      error: null,
    }),
}));
