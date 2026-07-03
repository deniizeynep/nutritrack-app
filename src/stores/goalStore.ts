import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { goalApi } from "../services/goalApi";
import type {
  ActivityLevel,
  Gender,
  GoalType,
} from "../utils/calorieCalculator";

export type GoalData = {
  age: number;
  heightCm: number;
  weightKg: number;
  gender: Gender;
  activityLevel: ActivityLevel;
  goalType: GoalType;
  bmr: number;
  maintenanceCalories: number;
  targetCalories: number;
  targetProtein?: number;
  targetCarbs?: number;
  targetFat?: number;
};

type GoalState = {
  goal: GoalData | null;
  isLoading: boolean;
  error: string | null;
  fetchGoal: (token?: string | null) => Promise<void>;
  setGoal: (goal: GoalData, token?: string | null) => Promise<void>;
  clearGoal: (token?: string | null) => Promise<void>;
  clearError: () => void;
};

export const useGoalStore = create<GoalState>()(
  persist(
    (set, get) => ({
      goal: null,
      isLoading: false,
      error: null,

      fetchGoal: async (token) => {
        if (!token) {
          return;
        }

        try {
          set({ isLoading: true, error: null });

          const response = await goalApi.getGoal(token);

          set({
            goal: response.goal,
            isLoading: false,
            error: null,
          });
        } catch (error) {
          set({
            isLoading: false,
            error:
              error instanceof Error ? error.message : "Hedef bilgisi alınamadı.",
          });
        }
      },

      setGoal: async (goal, token) => {
        if (!token) {
          set({ goal });
          return;
        }

        try {
          set({ isLoading: true, error: null });

          const response = await goalApi.saveGoal(goal, token);

          set({
            goal: response.goal,
            isLoading: false,
            error: null,
          });
        } catch (error) {
          set({
            isLoading: false,
            error:
              error instanceof Error ? error.message : "Hedef kaydedilemedi.",
          });

          throw error;
        }
      },

      clearGoal: async (token) => {
        const previousGoal = get().goal;

        set({ goal: null });

        if (!token) {
          return;
        }

        try {
          await goalApi.deleteGoal(token);
        } catch (error) {
          set({
            goal: previousGoal,
            error:
              error instanceof Error ? error.message : "Hedef silinemedi.",
          });

          throw error;
        }
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: "nutritrack-goal-storage",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        goal: state.goal,
      }),
    },
  ),
);
