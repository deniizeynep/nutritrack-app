import { create } from "zustand";
import type { GoalType } from "../utils/calorieCalculator";

export type OnboardingGender = "male" | "female" | "other";

type OnboardingState = {
  currentStep: number;
  selectedGoal: GoalType | null;
  gender: OnboardingGender | null;
  age: number | null;
  setSelectedGoal: (goal: GoalType) => void;
  setGender: (gender: OnboardingGender) => void;
  setAge: (age: number) => void;
  setCurrentStep: (step: number) => void;
  reset: () => void;
};

const initialState = {
  currentStep: 1,
  selectedGoal: null as GoalType | null,
  gender: null as OnboardingGender | null,
  age: null as number | null,
};

export const useOnboardingStore = create<OnboardingState>()((set) => ({
  ...initialState,
  setSelectedGoal: (goal) => set({ selectedGoal: goal }),
  setGender: (gender) => set({ gender }),
  setAge: (age) => set({ age }),
  setCurrentStep: (step) => set({ currentStep: step }),
  reset: () => set(initialState),
}));
