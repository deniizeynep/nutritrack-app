import { create } from "zustand";
import type { GoalType } from "../utils/calorieCalculator";

type OnboardingState = {
  currentStep: number;
  selectedGoal: GoalType | null;
  setSelectedGoal: (goal: GoalType) => void;
  setCurrentStep: (step: number) => void;
  reset: () => void;
};

export const useOnboardingStore = create<OnboardingState>()((set) => ({
  currentStep: 1,
  selectedGoal: null,
  setSelectedGoal: (goal) => set({ selectedGoal: goal }),
  setCurrentStep: (step) => set({ currentStep: step }),
  reset: () => set({ currentStep: 1, selectedGoal: null }),
}));
