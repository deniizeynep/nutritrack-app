import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import {
  mealApi,
  type CreateMealPayload,
  type UpdateMealPayload,
} from "../services/mealApi";

export type MealCategory = "breakfast" | "lunch" | "dinner" | "snack";

export type Meal = {
  id: string;
  title: string;
  description: string;
  category: MealCategory;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  createdAt: string;
  loggedAt?: string;
  updatedAt?: string;
};

export type NewMeal = {
  title: string;
  description: string;
  category: MealCategory;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  loggedAt?: string;
};

type MealUpdate = Partial<Omit<Meal, "id" | "createdAt">>;

type MealState = {
  meals: Meal[];
  isLoading: boolean;
  error: string | null;

  setMeals: (meals: Meal[]) => void;

  fetchMeals: (token?: string | null) => Promise<void>;
  addMeal: (meal: NewMeal, token?: string | null) => Promise<void>;
  updateMeal: (
    id: string,
    updates: MealUpdate,
    token?: string | null,
  ) => Promise<void>;
  deleteMeal: (id: string, token?: string | null) => Promise<void>;
  clearMeals: (token?: string | null) => Promise<void>;
  clearError: () => void;
};

export const useMealStore = create<MealState>()(
  persist(
    (set, get) => ({
      meals: [],
      isLoading: false,
      error: null,

      setMeals: (meals) =>
        set({
          meals,
        }),

      fetchMeals: async (token) => {
        if (!token) {
          return;
        }

        try {
          set({
            isLoading: true,
            error: null,
          });

          const meals = await mealApi.getMeals(token);

          set({
            meals,
            isLoading: false,
            error: null,
          });
        } catch (error) {
          set({
            isLoading: false,
            error:
              error instanceof Error ? error.message : "Öğünler alınamadı.",
          });
        }
      },

      addMeal: async (meal, token) => {
        if (!token) {
          set((state) => ({
            meals: [
              {
                ...meal,
                id: Date.now().toString(),
                createdAt: new Date().toISOString(),
                loggedAt: meal.loggedAt ?? new Date().toISOString(),
              },
              ...state.meals,
            ],
          }));

          return;
        }

        try {
          set({
            isLoading: true,
            error: null,
          });

          const createdMeal = await mealApi.createMeal(
            meal as CreateMealPayload,
            token,
          );

          set((state) => ({
            meals: [createdMeal, ...state.meals],
            isLoading: false,
            error: null,
          }));
        } catch (error) {
          set({
            isLoading: false,
            error:
              error instanceof Error ? error.message : "Öğün oluşturulamadı.",
          });

          throw error;
        }
      },

      updateMeal: async (id, updates, token) => {
        const previousMeals = get().meals;

        set((state) => ({
          meals: state.meals.map((meal) =>
            meal.id === id
              ? {
                  ...meal,
                  ...updates,
                }
              : meal,
          ),
        }));

        if (!token) {
          return;
        }

        try {
          await mealApi.updateMeal(id, updates as UpdateMealPayload, token);
        } catch (error) {
          set({
            meals: previousMeals,
            error:
              error instanceof Error ? error.message : "Öğün güncellenemedi.",
          });

          throw error;
        }
      },

      deleteMeal: async (id, token) => {
        const previousMeals = get().meals;

        set((state) => ({
          meals: state.meals.filter((meal) => meal.id !== id),
        }));

        if (!token) {
          return;
        }

        try {
          await mealApi.deleteMeal(id, token);
        } catch (error) {
          set({
            meals: previousMeals,
            error: error instanceof Error ? error.message : "Öğün silinemedi.",
          });

          throw error;
        }
      },

      clearMeals: async (token) => {
        const previousMeals = get().meals;

        set({
          meals: [],
        });

        if (!token) {
          return;
        }

        try {
          await mealApi.clearMeals(token);
        } catch (error) {
          set({
            meals: previousMeals,
            error:
              error instanceof Error ? error.message : "Öğünler temizlenemedi.",
          });

          throw error;
        }
      },

      clearError: () =>
        set({
          error: null,
        }),
    }),
    {
      name: "nutritrack-meal-storage",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        meals: state.meals,
      }),
    },
  ),
);
