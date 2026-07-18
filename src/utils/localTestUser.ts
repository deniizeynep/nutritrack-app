import { useAuthStore } from "../stores/authStore";
import { useGoalStore, type GoalData } from "../stores/goalStore";
import { useMealStore, type Meal, type MealCategory } from "../stores/mealStore";

type MealSeed = {
  title: string;
  description: string;
  category: MealCategory;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
};

type MealSeedTuple = [
  title: string,
  description: string,
  category: MealCategory,
  calories: number,
  protein: number,
  carbs: number,
  fat: number,
];

const goal: GoalData = {
  age: 25,
  heightCm: 165,
  weightKg: 62,
  gender: "female",
  activityLevel: "light",
  goalType: "maintain",
  bmr: 1365,
  maintenanceCalories: 1877,
  targetCalories: 1877,
  targetProtein: 117,
  targetCarbs: 211,
  targetFat: 63,
};

const dailyMeals: MealSeed[][] = ([
  [
    ["Kasarli tost", "Domates ve cay ile", "breakfast", 340, 18, 32, 16],
    ["Tavuk doner wrap", "Tavuk, tortilla ve salata", "lunch", 460, 32, 38, 18],
    ["Meyve ve yogurt", "Muz, cilek ve yogurt", "snack", 210, 9, 33, 5],
    ["Izgara somon", "Sebze ve bulgur ile", "dinner", 560, 42, 47, 22],
  ],
  [
    ["Omlet", "Uc yumurta, domates ve biber", "breakfast", 280, 21, 4, 20],
    ["Lahmacun", "Iki lahmacun ve salata", "lunch", 580, 28, 52, 26],
    ["Bitter cikolata", "Iki kare", "snack", 110, 2, 12, 7],
    ["Etli nohut", "Pilav ve yogurt ile", "dinner", 510, 26, 58, 16],
  ],
  [
    ["Simit ve peynir", "Cay ile", "breakfast", 380, 14, 48, 14],
    ["Tavuk sote", "Mantar, biber ve pilav", "lunch", 490, 38, 42, 16],
    ["Havuc ve humus", "Bir kucuk porsiyon", "snack", 120, 4, 15, 5],
    ["Karniyarik", "Pilav ile", "dinner", 540, 24, 48, 28],
  ],
  [
    ["Yulaf ezmesi", "Sut, muz ve bal", "breakfast", 320, 12, 52, 7],
    ["Tavuk doner", "Ekmek ve salata", "lunch", 550, 35, 40, 25],
    ["Muz", "Bir buyuk muz", "snack", 105, 1, 27, 0],
    ["Domatesli makarna", "Peynir ile", "dinner", 480, 18, 62, 16],
  ],
  [
    ["Menemen", "Ekmek ile", "breakfast", 350, 16, 32, 18],
    ["Adana kebap", "Pilav, salata ve ayran", "lunch", 650, 42, 45, 32],
    ["Yogurt ve bal", "Bir kase", "snack", 150, 8, 18, 5],
    ["Sebze corbasi", "Tam bugday ekmegi ile", "dinner", 260, 9, 38, 8],
  ],
  [
    ["Peynirli tost", "Domates ile", "breakfast", 310, 16, 30, 14],
    ["Mercimek corbasi", "Salata ile", "lunch", 280, 15, 38, 6],
    ["Elma ve ceviz", "Bir porsiyon", "snack", 190, 4, 25, 9],
    ["Izgara levrek", "Brokoli ile", "dinner", 420, 38, 5, 26],
  ],
  [
    ["Yumurta tavada", "Iki yumurta ve ekmek", "breakfast", 300, 17, 24, 16],
    ["Tavuk salata", "Zeytinyagli mevsim salatasi", "lunch", 380, 35, 8, 22],
    ["Meyve kasesi", "Elma, muz ve ceviz", "snack", 180, 3, 28, 7],
    ["Kuru fasulye", "Pilav ve yogurt ile", "dinner", 520, 22, 65, 14],
  ],
] satisfies MealSeedTuple[][]).map((day) =>
  day.map(([title, description, category, calories, protein, carbs, fat]) => ({
    title,
    description,
    category,
    calories,
    protein,
    carbs,
    fat,
  }))
);

function createMeals(): Meal[] {
  const mealHours = [8, 13, 16, 19];

  return dailyMeals.flatMap((meals, dayIndex) =>
    meals.map((meal, mealIndex) => {
      const date = new Date();
      date.setDate(date.getDate() - dayIndex);
      date.setHours(mealHours[mealIndex], 0, 0, 0);
      const timestamp = date.toISOString();

      return {
        ...meal,
        id: `local-test-${dayIndex}-${mealIndex}`,
        createdAt: timestamp,
        loggedAt: timestamp,
      };
    })
  );
}

export function activateLocalTestUser() {
  useAuthStore.setState({
    user: {
      id: "local-test-user",
      fullName: "Test Kullanici",
      email: "testuser@gmail.com",
      emailVerified: true,
    },
    token: null,
    isAuthenticated: true,
    isLoading: false,
    hasHydrated: true,
    hasCheckedSession: true,
    pendingVerificationEmail: null,
    pendingPasswordResetEmail: null,
    pendingEmailChange: null,
    requiresEmailVerification: false,
    error: null,
  });
  useGoalStore.setState({ goal, isLoading: false, error: null });
  useMealStore.setState({ meals: createMeals(), isLoading: false, error: null });
}
