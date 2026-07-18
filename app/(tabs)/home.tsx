import { Ionicons } from "@expo/vector-icons";
import { router, type Href } from "expo-router";
import { useEffect, useMemo } from "react";
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { MacroProgress } from "../../src/components/MacroProgress";
import { MealCard } from "../../src/components/MealCard";
import { Screen } from "../../src/components/Screen";
import { translate } from "../../src/i18n/translations";
import { useAppStore } from "../../src/stores/appStore";
import { useAuthStore } from "../../src/stores/authStore";
import { useGoalStore } from "../../src/stores/goalStore";
import {
  useMealStore,
  type Meal,
  type MealCategory,
} from "../../src/stores/mealStore";
import { getTheme } from "../../src/theme/theme";
import { calculateMacroTargets } from "../../src/utils/calorieCalculator";

function getTodayKey(): string {
  return new Date().toISOString().slice(0, 10);
}

type DayStats = {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
};

function computeDayStats(dayMeals: Meal[]): DayStats {
  return {
    calories: dayMeals.reduce((t, m) => t + m.calories, 0),
    protein: dayMeals.reduce((t, m) => t + m.protein, 0),
    carbs: dayMeals.reduce((t, m) => t + m.carbs, 0),
    fat: dayMeals.reduce((t, m) => t + m.fat, 0),
  };
}

export default function HomeScreen() {
  const themeMode = useAppStore((s) => s.themeMode);
  const language = useAppStore((s) => s.language);

  const theme = getTheme(themeMode);
  const token = useAuthStore((s) => s.token);
  const goal = useGoalStore((s) => s.goal);
  const fetchGoal = useGoalStore((s) => s.fetchGoal);
  const meals = useMealStore((s) => s.meals);
  const fetchMeals = useMealStore((s) => s.fetchMeals);
  const deleteMeal = useMealStore((s) => s.deleteMeal);

  useEffect(() => {
    fetchMeals(token);
    fetchGoal(token);
  }, [fetchGoal, fetchMeals, token]);

  const todayKey = useMemo(() => getTodayKey(), []);

  const todayMeals = useMemo(
    () =>
      meals.filter((meal) => {
        const d = meal.loggedAt ?? meal.createdAt;
        return d.slice(0, 10) === todayKey;
      }),
    [meals, todayKey],
  );

  const stats = useMemo(() => computeDayStats(todayMeals), [todayMeals]);

  const targetCalories = goal?.targetCalories ?? 2000;
  const fallbackMacros = calculateMacroTargets(
    goal?.targetCalories ?? 2000,
    goal?.goalType ?? "maintain",
  );
  const targetProtein = goal?.targetProtein || fallbackMacros.protein;
  const targetCarbs = goal?.targetCarbs || fallbackMacros.carbs;
  const targetFat = goal?.targetFat || fallbackMacros.fat;

  const remaining = targetCalories - stats.calories;

  const confirmDeleteMeal = (mealId: string) => {
    Alert.alert(
      translate("confirmDeleteMeal", language),
      translate("confirmDeleteMealMessage", language),
      [
        { text: translate("cancel", language), style: "cancel" },
        {
          text: translate("deleteMeal", language),
          style: "destructive",
          onPress: () => deleteMeal(mealId, token),
        },
      ],
    );
  };

  return (
    <Screen>
      <View
        style={[styles.outer, { backgroundColor: theme.colors.background }]}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.headerTitle, { color: theme.colors.text }]}>
            {translate("today", language)}
          </Text>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Hero: Calorie Ring */}
          <View style={styles.heroSection}>
            {(() => {
              const RING_SIZE = 256;
              const progress = Math.min(
                Math.max(stats.calories / targetCalories, 0),
                1,
              );
              const angle = progress * 360;
              const rightRot = angle <= 180 ? angle - 180 : 0;
              const leftRot = angle > 180 ? 360 - angle : 180;
              const showLeft = angle > 180;

              return (
                <View
                  style={{ width: RING_SIZE, height: RING_SIZE }}
                >
                  <View
                    style={[
                      styles.ringTrackBg,
                      { backgroundColor: theme.colors.cardSoft },
                    ]}
                  />

                  <View style={styles.ringClipRight}>
                    <View
                      style={[
                        styles.ringHalfRight,
                        {
                          backgroundColor: theme.colors.primary,
                          transform: [{ rotate: `${rightRot}deg` }],
                        },
                      ]}
                    />
                  </View>

                  {showLeft ? (
                    <View style={styles.ringClipLeft}>
                      <View
                        style={[
                          styles.ringHalfLeft,
                          {
                            backgroundColor: theme.colors.primary,
                            transform: [{ rotate: `${leftRot}deg` }],
                          },
                        ]}
                      />
                    </View>
                  ) : null}

                  <View
                    style={[
                      styles.ringInner,
                      { backgroundColor: theme.colors.background },
                    ]}
                  />

                  <View style={styles.ringCenter}>
                    <Text
                      style={[
                        styles.calorieNumber,
                        { color: theme.colors.text },
                      ]}
                    >
                      {stats.calories.toLocaleString("tr-TR")}
                    </Text>
                    <Text
                      style={[
                        styles.calorieTarget,
                        { color: theme.colors.mutedText },
                      ]}
                    >
                      / {targetCalories.toLocaleString("tr-TR")} kcal
                    </Text>
                    <Text
                      style={[
                        styles.remaining,
                        { color: theme.colors.primary },
                      ]}
                    >
                      {translate("remaining", language)} {remaining} kcal
                    </Text>
                  </View>
                </View>
              );
            })()}
          </View>

          {/* Nutrient Progress Bars */}
          <View style={styles.nutrientSection}>
            <MacroProgress
              label={translate("protein", language)}
              current={stats.protein}
              target={targetProtein}
              color={theme.colors.protein}
            />
            <MacroProgress
              label={translate("carbs", language)}
              current={stats.carbs}
              target={targetCarbs}
              color={theme.colors.carbs}
            />
            <MacroProgress
              label={translate("fat", language)}
              current={stats.fat}
              target={targetFat}
              color={theme.colors.fat}
            />
          </View>

          {/* Quick Actions */}
          <View style={styles.quickActions}>
            <Pressable
              onPress={() => router.push("/add-meal" as Href)}
              style={[
                styles.actionButton,
                styles.actionPrimary,
                { backgroundColor: theme.colors.primarySoft },
              ]}
            >
              <Ionicons
                name="add"
                size={24}
                color={theme.colors.primary}
              />
              <Text
                style={[
                  styles.actionLabel,
                  { color: theme.colors.primary },
                ]}
              >
                {translate("addMeal", language)}
              </Text>
            </Pressable>

            <Pressable
              onPress={() => router.push("/scan-barcode" as Href)}
              style={[
                styles.actionButton,
                styles.actionSecondary,
                {
                  backgroundColor: theme.colors.card,
                  borderColor: theme.colors.border,
                },
              ]}
            >
              <Ionicons
                name="barcode-outline"
                size={24}
                color={theme.colors.text}
              />
              <Text
                style={[styles.actionLabel, { color: theme.colors.text }]}
              >
                {translate("scanBarcode", language)}
              </Text>
            </Pressable>

            <Pressable
              onPress={() => router.push("/scan-photo" as Href)}
              style={[
                styles.actionButton,
                styles.actionSecondary,
                {
                  backgroundColor: theme.colors.card,
                  borderColor: theme.colors.border,
                },
              ]}
            >
              <Ionicons
                name="camera-outline"
                size={24}
                color={theme.colors.text}
              />
              <Text
                style={[styles.actionLabel, { color: theme.colors.text }]}
              >
                {translate("scanWithPhoto", language)}
              </Text>
            </Pressable>
          </View>

          {/* Meals Section */}
          <View style={styles.mealsSection}>
            <View style={styles.mealsHeader}>
              <Text
                style={[styles.mealsTitle, { color: theme.colors.text }]}
              >
                {translate("meals", language)}
              </Text>
            </View>

            {todayMeals.length === 0 ? (
              <View
                style={[
                  styles.emptyCard,
                  {
                    backgroundColor: theme.colors.card,
                    borderColor: theme.colors.border,
                  },
                ]}
              >
                <View
                  style={[
                    styles.emptyIconBox,
                    { backgroundColor: theme.colors.primarySoft },
                  ]}
                >
                  <Ionicons
                    name="restaurant-outline"
                    size={26}
                    color={theme.colors.primary}
                  />
                </View>
                <Text
                  style={[styles.emptyTitle, { color: theme.colors.text }]}
                >
                  {translate("noMealsYet", language)}
                </Text>
                <Text
                  style={[
                    styles.emptySubtitle,
                    { color: theme.colors.mutedText },
                  ]}
                >
                  {translate("noMealsSubtitle", language)}
                </Text>
              </View>
            ) : (
              <View style={styles.mealList}>
                {todayMeals.map((meal) => (
                  <MealCard
                    key={meal.id}
                    icon={getMealIcon(meal.category)}
                    title={meal.title}
                    items={
                      meal.description ||
                      getMealCategoryLabel(meal.category, language)
                    }
                    calories={meal.calories}
                    protein={meal.protein}
                    carbs={meal.carbs}
                    fat={meal.fat}
                    onPress={() =>
                      router.push(`/meal-detail?mealId=${meal.id}` as Href)
                    }
                    onDelete={() => confirmDeleteMeal(meal.id)}
                  />
                ))}
              </View>
            )}
          </View>
        </ScrollView>
      </View>
    </Screen>
  );
}

function getMealIcon(category: MealCategory) {
  switch (category) {
    case "breakfast":
      return "🥣";
    case "lunch":
      return "🍝";
    case "dinner":
      return "🥗";
    case "snack":
      return "🍎";
    default:
      return "🍽️";
  }
}

function getMealCategoryLabel(
  category: MealCategory,
  language: "tr" | "en",
) {
  const labels: Record<MealCategory, { tr: string; en: string }> = {
    breakfast: { tr: "Kahvaltı", en: "Breakfast" },
    lunch: { tr: "Öğle Yemeği", en: "Lunch" },
    dinner: { tr: "Akşam Yemeği", en: "Dinner" },
    snack: { tr: "Ara Öğün", en: "Snack" },
  };
  return labels[category][language];
}

const styles = StyleSheet.create({
  outer: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 120,
  },
  heroSection: {
    alignItems: "center",
    marginTop: 12,
    marginBottom: 28,
  },
  ringTrackBg: {
    position: "absolute",
    width: 256,
    height: 256,
    borderRadius: 128,
  },
  ringClipRight: {
    position: "absolute",
    left: 128,
    top: 0,
    width: 128,
    height: 256,
    overflow: "hidden",
  },
  ringHalfRight: {
    width: 128,
    height: 256,
    borderTopRightRadius: 128,
    borderBottomRightRadius: 128,
    transformOrigin: [0, 128, 0],
  },
  ringClipLeft: {
    position: "absolute",
    left: 0,
    top: 0,
    width: 128,
    height: 256,
    overflow: "hidden",
  },
  ringHalfLeft: {
    width: 128,
    height: 256,
    borderTopLeftRadius: 128,
    borderBottomLeftRadius: 128,
    transformOrigin: [128, 128, 0],
  },
  ringInner: {
    position: "absolute",
    top: 8,
    left: 8,
    width: 240,
    height: 240,
    borderRadius: 120,
  },
  ringCenter: {
    position: "absolute",
    top: 8,
    left: 8,
    width: 240,
    height: 240,
    alignItems: "center",
    justifyContent: "center",
  },
  calorieNumber: {
    fontSize: 40,
    fontWeight: "800",
    letterSpacing: -1.6,
  },
  calorieTarget: {
    fontSize: 14,
    fontWeight: "400",
    marginTop: 2,
  },
  remaining: {
    fontSize: 12,
    fontWeight: "600",
    marginTop: 6,
  },
  nutrientSection: {
    gap: 14,
    marginBottom: 28,
  },
  quickActions: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 32,
  },
  actionButton: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    gap: 8,
    borderRadius: 16,
  },
  actionPrimary: {},
  actionSecondary: {
    borderWidth: 1,
  },
  actionLabel: {
    fontSize: 10,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    textAlign: "center",
  },
  mealsSection: {},
  mealsHeader: {
    marginBottom: 14,
  },
  mealsTitle: {
    fontSize: 20,
    fontWeight: "700",
  },
  mealList: {
    gap: 12,
  },
  emptyCard: {
    borderWidth: 1,
    borderRadius: 24,
    padding: 22,
    alignItems: "center",
  },
  emptyIconBox: {
    width: 54,
    height: 54,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: "700",
    textAlign: "center",
  },
  emptySubtitle: {
    marginTop: 6,
    fontSize: 13,
    lineHeight: 19,
    fontWeight: "500",
    textAlign: "center",
  },
});
