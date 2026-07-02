import type { GoalData } from "../stores/goalStore";
import { apiRequest } from "./apiClient";

export type GoalPayload = GoalData;

type GoalResponse = {
  goal: GoalData | null;
};

export const goalApi = {
  getGoal: (token: string) => {
    return apiRequest<GoalResponse>("/goal", {
      token,
    });
  },

  saveGoal: (payload: GoalPayload, token: string) => {
    return apiRequest<GoalResponse>("/goal", {
      method: "PUT",
      body: payload,
      token,
    });
  },

  deleteGoal: (token: string) => {
    return apiRequest<{ message: string }>("/goal", {
      method: "DELETE",
      token,
    });
  },
};
