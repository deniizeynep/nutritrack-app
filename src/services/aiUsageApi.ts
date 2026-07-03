import { apiRequest } from "./apiClient";

export type AiUsageItem = {
  id?: string;
  appName?: string;
  feature: string;
  provider: string;
  model?: string | null;
  inputType: string;
  status: string;
  durationMs?: number | null;
  errorCode?: string | null;
  errorMessage?: string | null;
  createdAt?: string;
};

export type AiUsageSummary = {
  total: number;
  success: number;
  failed: number;
};

export type AiUsageResponse = {
  items: AiUsageItem[];
  summary: AiUsageSummary;
};

export const aiUsageApi = {
  getMyAiUsage: (token: string) => {
    return apiRequest<AiUsageResponse>("/ai/usage/me", {
      token,
    });
  },
};
