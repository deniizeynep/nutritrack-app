import type { Meal, MealCategory } from "../stores/mealStore";
import { apiRequest } from "./apiClient";

export type CreateMealPayload = {
  title: string;
  description: string;
  category: MealCategory;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  loggedAt?: string;
};

export type UpdateMealPayload = Partial<CreateMealPayload>;

export const mealApi = {
  getMeals: (token: string) => {
    return apiRequest<Meal[]>("/meals", {
      token,
    });
  },

  createMeal: (payload: CreateMealPayload, token: string) => {
    return apiRequest<Meal>("/meals", {
      method: "POST",
      body: payload,
      token,
    });
  },

  updateMeal: (id: string, payload: UpdateMealPayload, token: string) => {
    return apiRequest<Meal>(`/meals/${id}`, {
      method: "PATCH",
      body: payload,
      token,
    });
  },

  deleteMeal: (id: string, token: string) => {
    return apiRequest<{ message: string }>(`/meals/${id}`, {
      method: "DELETE",
      token,
    });
  },

  clearMeals: (token: string) => {
    return apiRequest<{ message: string }>("/meals", {
      method: "DELETE",
      token,
    });
  },
};
