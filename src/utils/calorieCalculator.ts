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

export type MacroTargets = {
  protein: number;
  carbs: number;
  fat: number;
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

const macroRatios: Record<
  GoalType,
  {
    protein: number;
    carbs: number;
    fat: number;
  }
> = {
  lose: {
    protein: 0.3,
    carbs: 0.4,
    fat: 0.3,
  },
  maintain: {
    protein: 0.25,
    carbs: 0.45,
    fat: 0.3,
  },
  gain: {
    protein: 0.25,
    carbs: 0.5,
    fat: 0.25,
  },
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

export function calculateMacroTargets(
  calories: number,
  goalType: GoalType,
): MacroTargets {
  const ratios = macroRatios[goalType];

  return {
    protein: Math.round((calories * ratios.protein) / 4),
    carbs: Math.round((calories * ratios.carbs) / 4),
    fat: Math.round((calories * ratios.fat) / 9),
  };
}
