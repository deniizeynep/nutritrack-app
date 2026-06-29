import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
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
};

type GoalState = {
  goal: GoalData | null;
  setGoal: (goal: GoalData) => void;
  clearGoal: () => void;
};

export const useGoalStore = create<GoalState>()(
  persist(
    (set) => ({
      goal: null,

      setGoal: (goal) => set({ goal }),

      clearGoal: () => set({ goal: null }),
    }),
    {
      name: "nutritrack-goal-storage",
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
