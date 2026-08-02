import { create } from "zustand";
import type { ActivityLevel, GoalType } from "../utils/calorieCalculator";

export type OnboardingGender = "male" | "female" | "other";

type OnboardingState = {
  currentStep: number;
  selectedGoal: GoalType | null;
  gender: OnboardingGender | null;
  age: number | null;
  height: number | null;
  weight: number | null;
  activityLevel: ActivityLevel | null;
  setSelectedGoal: (goal: GoalType) => void;
  setGender: (gender: OnboardingGender) => void;
  setAge: (age: number) => void;
  setHeight: (height: number | null) => void;
  setWeight: (weight: number | null) => void;
  setActivityLevel: (level: ActivityLevel) => void;
  setCurrentStep: (step: number) => void;
  reset: () => void;
};

const initialState = {
  currentStep: 1,
  selectedGoal: null as GoalType | null,
  gender: null as OnboardingGender | null,
  age: 18 as number | null,
  height: null as number | null,
  weight: null as number | null,
  activityLevel: null as ActivityLevel | null,
};

export const useOnboardingStore = create<OnboardingState>()((set) => ({
  ...initialState,
  setSelectedGoal: (goal) => set({ selectedGoal: goal }),
  setGender: (gender) => set({ gender }),
  setAge: (age) => set({ age }),
  setHeight: (height) => set({ height }),
  setWeight: (weight) => set({ weight }),
  setActivityLevel: (activityLevel) => set({ activityLevel }),
  setCurrentStep: (step) => set({ currentStep: step }),
  reset: () => set(initialState),
}));
