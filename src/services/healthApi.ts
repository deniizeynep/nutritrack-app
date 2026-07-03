import { apiRequest } from "./apiClient";

export type HealthResponse = {
  status: string;
  message: string;
  database?: string;
};

export const healthApi = {
  checkHealth: () => {
    return apiRequest<HealthResponse>("/health");
  },
};
