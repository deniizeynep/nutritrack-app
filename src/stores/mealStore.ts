import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

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
};

type NewMeal = Omit<Meal, "id" | "createdAt">;

type MealUpdate = Partial<Omit<Meal, "id" | "createdAt">>;

type MealState = {
  meals: Meal[];
  addMeal: (meal: NewMeal) => void;
  updateMeal: (id: string, updates: MealUpdate) => void;
  deleteMeal: (id: string) => void;
  clearMeals: () => void;
};

export const useMealStore = create<MealState>()(
  persist(
    (set) => ({
      meals: [],

      addMeal: (meal) =>
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
        })),

      updateMeal: (id, updates) =>
        set((state) => ({
          meals: state.meals.map((meal) =>
            meal.id === id
              ? {
                  ...meal,
                  ...updates,
                }
              : meal,
          ),
        })),

      deleteMeal: (id) =>
        set((state) => ({
          meals: state.meals.filter((meal) => meal.id !== id),
        })),

      clearMeals: () => set({ meals: [] }),
    }),
    {
      name: "nutritrack-meal-storage",
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
