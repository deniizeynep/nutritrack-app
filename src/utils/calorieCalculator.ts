export type Gender = "female" | "male";
export type GoalType = "lose" | "maintain" | "gain";
export type ActivityLevel =
  | "sedentary"
  | "light"
  | "moderate"
  | "active"
  | "veryActive";

type CalculateCaloriesParams = {
  gender: Gender;
  age: number;
  heightCm: number;
  weightKg: number;
  activityLevel: ActivityLevel;
  goalType: GoalType;
};

const activityMultipliers: Record<ActivityLevel, number> = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  active: 1.725,
  veryActive: 1.9,
};

const goalAdjustments: Record<GoalType, number> = {
  lose: -400,
  maintain: 0,
  gain: 300,
};

export function calculateBmr({
  gender,
  age,
  heightCm,
  weightKg,
}: Omit<CalculateCaloriesParams, "activityLevel" | "goalType">) {
  const base = 10 * weightKg + 6.25 * heightCm - 5 * age;

  if (gender === "male") {
    return base + 5;
  }

  return base - 161;
}

export function calculateDailyCalories(params: CalculateCaloriesParams) {
  const bmr = calculateBmr(params);

  const maintenanceCalories = bmr * activityMultipliers[params.activityLevel];

  const targetCalories = maintenanceCalories + goalAdjustments[params.goalType];

  return {
    bmr: Math.round(bmr),
    maintenanceCalories: Math.round(maintenanceCalories),
    targetCalories: Math.round(targetCalories),
  };
}
