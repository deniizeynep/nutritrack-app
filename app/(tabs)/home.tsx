import { Ionicons } from "@expo/vector-icons";
import { router, type Href } from "expo-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import { MacroProgress } from "../../src/components/MacroProgress";
import { MealCard } from "../../src/components/MealCard";
import { Screen } from "../../src/components/Screen";
import { translate, type Language } from "../../src/i18n/translations";
import { useAppStore } from "../../src/stores/appStore";
import { useAuthStore } from "../../src/stores/authStore";
import { useGoalStore } from "../../src/stores/goalStore";
import { useMealStore, type Meal, type MealCategory } from "../../src/stores/mealStore";
import { getTheme } from "../../src/theme/theme";
import { calculateMacroTargets } from "../../src/utils/calorieCalculator";

const DAY_OFFSETS = [0, 1, 2] as const;

function getDateKey(offset: number): string {
  const date = new Date();
  date.setDate(date.getDate() - offset);
  return date.toISOString().slice(0, 10);
}

function getDayLabel(offset: number, language: Language): string {
  if (offset === 0) return translate("todayLabel", language);
  if (offset === 1) return translate("yesterday", language);
  return translate("twoDaysAgo", language);
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
  const { width: screenWidth } = useWindowDimensions();
  const scrollRef = useRef<ScrollView>(null);

  const themeMode = useAppStore((state) => state.themeMode);
  const language = useAppStore((state) => state.language);
  const toggleTheme = useAppStore((state) => state.toggleTheme);
  const setLanguage = useAppStore((state) => state.setLanguage);

  const theme = getTheme(themeMode);
  const token = useAuthStore((state) => state.token);
  const goal = useGoalStore((state) => state.goal);
  const fetchGoal = useGoalStore((state) => state.fetchGoal);
  const meals = useMealStore((state) => state.meals);
  const fetchMeals = useMealStore((state) => state.fetchMeals);
  const deleteMeal = useMealStore((state) => state.deleteMeal);

  const [activeDay, setActiveDay] = useState(0);

  useEffect(() => {
    fetchMeals(token);
    fetchGoal(token);
  }, [fetchGoal, fetchMeals, token]);

  const dayKeys = useMemo(() => DAY_OFFSETS.map(getDateKey), []);

  const mealsByDay = useMemo(() => {
    return dayKeys.map((dateKey) =>
      meals.filter((meal) => {
        const mealDate = meal.loggedAt ?? meal.createdAt;
        return mealDate.slice(0, 10) === dateKey;
      }),
    );
  }, [meals, dayKeys]);

  const statsByDay = useMemo(
    () => mealsByDay.map(computeDayStats),
    [mealsByDay],
  );

  const targetCalories = goal?.targetCalories ?? 2000;
  const fallbackMacroTargets = calculateMacroTargets(
    goal?.targetCalories ?? 2000,
    goal?.goalType ?? "maintain",
  );
  const targetProtein = goal?.targetProtein || fallbackMacroTargets.protein;
  const targetCarbs = goal?.targetCarbs || fallbackMacroTargets.carbs;
  const targetFat = goal?.targetFat || fallbackMacroTargets.fat;

  const handleScrollEnd = useCallback(
    (e: { nativeEvent: { contentOffset: { x: number } } }) => {
      const pageIndex = Math.round(
        e.nativeEvent.contentOffset.x / screenWidth,
      );
      setActiveDay(pageIndex);
    },
    [screenWidth],
  );

  const scrollToDay = useCallback(
    (index: number) => {
      scrollRef.current?.scrollTo({ x: index * screenWidth, animated: true });
    },
    [screenWidth],
  );

  const confirmDeleteMeal = (mealId: string) => {
    Alert.alert(
      translate("confirmDeleteMeal", language),
      translate("confirmDeleteMealMessage", language),
      [
        {
          text: translate("cancel", language),
          style: "cancel",
        },
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
        <View style={styles.header}>
          <View style={styles.headerSpacer} />

          <Text style={[styles.headerTitle, { color: theme.colors.text }]}>
            {getDayLabel(activeDay, language)}
          </Text>

          <View style={styles.headerActions}>
            <Pressable
              onPress={() => setLanguage(language === "tr" ? "en" : "tr")}
              style={[
                styles.smallButton,
                {
                  backgroundColor: theme.colors.card,
                  borderColor: theme.colors.border,
                },
              ]}
            >
              <Text
                style={[styles.smallButtonText, { color: theme.colors.text }]}
              >
                {language === "tr" ? "EN" : "TR"}
              </Text>
            </Pressable>

            <Pressable
              onPress={toggleTheme}
              style={[
                styles.smallButton,
                {
                  backgroundColor: theme.colors.card,
                  borderColor: theme.colors.border,
                },
              ]}
            >
              <Text
                style={[styles.smallButtonText, { color: theme.colors.text }]}
              >
                {themeMode === "dark" ? "☀️" : "🌙"}
              </Text>
            </Pressable>
          </View>
        </View>

        <View style={styles.dotsRow}>
          {DAY_OFFSETS.map((offset) => (
            <Pressable
              key={offset}
              onPress={() => scrollToDay(offset)}
              style={styles.dotPressable}
            >
              <View
                style={[
                  styles.dot,
                  activeDay === offset
                    ? { backgroundColor: theme.colors.primary, width: 20 }
                    : { backgroundColor: theme.colors.mutedText },
                ]}
              />
            </Pressable>
          ))}
        </View>

        <ScrollView
          ref={scrollRef}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={handleScrollEnd}
          style={styles.swipeContainer}
        >
          {DAY_OFFSETS.map((offset) => (
            <View key={offset} style={{ width: screenWidth }}>
              <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.dayContent}
              >
                <DaySummaryCard
                  dayOffset={offset}
                  stats={statsByDay[offset]}
                  targetCalories={targetCalories}
                  targetProtein={targetProtein}
                  targetCarbs={targetCarbs}
                  targetFat={targetFat}
                  theme={theme}
                  language={language}
                  goal={goal}
                />

                {offset === 0 ? (
                  <QuickActions theme={theme} language={language} />
                ) : null}

                <View style={styles.sectionHeader}>
                  <Text
                    style={[styles.sectionTitle, { color: theme.colors.text }]}
                  >
                    {translate("meals", language)}
                  </Text>
                </View>

                <DayMealList
                  dayMeals={mealsByDay[offset]}
                  isToday={offset === 0}
                  theme={theme}
                  language={language}
                  onDeleteMeal={confirmDeleteMeal}
                />
              </ScrollView>
            </View>
          ))}
        </ScrollView>
      </View>
    </Screen>
  );
}

type DaySummaryCardProps = {
  dayOffset: number;
  stats: DayStats;
  targetCalories: number;
  targetProtein: number;
  targetCarbs: number;
  targetFat: number;
  theme: ReturnType<typeof getTheme>;
  language: Language;
  goal: ReturnType<typeof useGoalStore.getState>["goal"];
};

function DaySummaryCard({
  dayOffset,
  stats,
  targetCalories,
  targetProtein,
  targetCarbs,
  targetFat,
  theme,
  language,
  goal,
}: DaySummaryCardProps) {
  const remainingCalories = targetCalories - stats.calories;
  const progressPercent = Math.min(
    (stats.calories / targetCalories) * 100,
    100,
  );

  return (
    <View
      style={[
        styles.summaryCard,
        {
          backgroundColor: theme.colors.card,
          borderColor: theme.colors.border,
        },
      ]}
    >
      <View style={styles.summaryHeader}>
        <Text
          style={[styles.sectionLabel, { color: theme.colors.mutedText }]}
        >
          {translate("dailySummary", language)}
        </Text>

        {goal && dayOffset === 0 ? (
          <View
            style={[
              styles.savedGoalBadge,
              { backgroundColor: theme.colors.primarySoft },
            ]}
          >
            <Text
              style={[styles.savedGoalText, { color: theme.colors.primary }]}
            >
              {translate("savedGoal", language)}
            </Text>
          </View>
        ) : null}
      </View>

      <View style={styles.calorieCenter}>
        <View
          style={[styles.calorieRing, { borderColor: theme.colors.primarySoft }]}
        >
          <View
            style={[
              styles.calorieRingInner,
              { borderColor: theme.colors.primary },
            ]}
          >
            <Text
              style={[styles.calorieNumber, { color: theme.colors.text }]}
            >
              {stats.calories.toLocaleString("tr-TR")}
            </Text>

            <Text
              style={[styles.calorieTarget, { color: theme.colors.mutedText }]}
            >
              / {targetCalories.toLocaleString("tr-TR")} kcal
            </Text>

            <Text style={[styles.remaining, { color: theme.colors.primary }]}>
              {translate("remaining", language)} {remainingCalories} kcal
            </Text>
          </View>
        </View>
      </View>

      <View
        style={[styles.mainProgressTrack, { backgroundColor: theme.colors.cardSoft }]}
      >
        <View
          style={[
            styles.mainProgressFill,
            {
              width: `${progressPercent}%`,
              backgroundColor: theme.colors.primary,
            },
          ]}
        />
      </View>

      <View style={styles.macroRow}>
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

      {dayOffset === 0 ? (
        <Pressable
          onPress={() => router.push("/goal" as Href)}
          style={[styles.goalButton, { backgroundColor: theme.colors.primarySoft }]}
        >
          <Ionicons
            name="flag-outline"
            size={18}
            color={theme.colors.primary}
          />
          <Text
            style={[styles.goalButtonText, { color: theme.colors.primary }]}
          >
            {translate("goalSetup", language)}
          </Text>
        </Pressable>
      ) : null}
    </View>
  );
}

type QuickActionsProps = {
  theme: ReturnType<typeof getTheme>;
  language: Language;
};

function QuickActions({ theme, language }: QuickActionsProps) {
  return (
    <View style={styles.quickActions}>
      <Pressable
        onPress={() => router.push("/add-meal" as Href)}
        style={[
          styles.actionCard,
          {
            backgroundColor: theme.colors.card,
            borderColor: theme.colors.border,
          },
        ]}
      >
        <Ionicons
          name="add-circle-outline"
          size={28}
          color={theme.colors.primary}
        />
        <Text style={[styles.actionText, { color: theme.colors.text }]}>
          {translate("addMeal", language)}
        </Text>
      </Pressable>

      <Pressable
        onPress={() => router.push("/scan-barcode" as Href)}
        style={[
          styles.actionCard,
          {
            backgroundColor: theme.colors.card,
            borderColor: theme.colors.border,
          },
        ]}
      >
        <Ionicons
          name="barcode-outline"
          size={28}
          color={theme.colors.primary}
        />
        <Text style={[styles.actionText, { color: theme.colors.text }]}>
          {translate("scanBarcode", language)}
        </Text>
      </Pressable>

      <Pressable
        onPress={() => router.push("/scan-photo" as Href)}
        style={[
          styles.actionCard,
          {
            backgroundColor: theme.colors.card,
            borderColor: theme.colors.border,
          },
        ]}
      >
        <Ionicons
          name="camera-outline"
          size={28}
          color={theme.colors.primary}
        />
        <Text style={[styles.actionText, { color: theme.colors.text }]}>
          {translate("scanWithPhoto", language)}
        </Text>
      </Pressable>
    </View>
  );
}

type DayMealListProps = {
  dayMeals: Meal[];
  isToday: boolean;
  theme: ReturnType<typeof getTheme>;
  language: Language;
  onDeleteMeal: (mealId: string) => void;
};

function DayMealList({
  dayMeals,
  isToday,
  theme,
  language,
  onDeleteMeal,
}: DayMealListProps) {
  if (dayMeals.length === 0) {
    const emptyTitle = isToday
      ? translate("noMealsYet", language)
      : translate("noMealsForDay", language);
    const emptySubtitle = isToday
      ? translate("noMealsSubtitle", language)
      : translate("noMealsForDaySubtitle", language);

    return (
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
          style={[styles.emptyIconBox, { backgroundColor: theme.colors.primarySoft }]}
        >
          <Ionicons
            name="restaurant-outline"
            size={26}
            color={theme.colors.primary}
          />
        </View>

        <Text style={[styles.emptyTitle, { color: theme.colors.text }]}>
          {emptyTitle}
        </Text>

        <Text
          style={[styles.emptySubtitle, { color: theme.colors.mutedText }]}
        >
          {emptySubtitle}
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.mealList}>
      {dayMeals.map((meal) => (
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
          onDelete={isToday ? () => onDeleteMeal(meal.id) : undefined}
        />
      ))}
    </View>
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

function getMealCategoryLabel(category: MealCategory, language: "tr" | "en") {
  const labels = {
    breakfast: {
      tr: "Kahvaltı",
      en: "Breakfast",
    },
    lunch: {
      tr: "Öğle Yemeği",
      en: "Lunch",
    },
    dinner: {
      tr: "Akşam Yemeği",
      en: "Dinner",
    },
    snack: {
      tr: "Ara Öğün",
      en: "Snack",
    },
  };

  return labels[category][language];
}

const styles = StyleSheet.create({
  outer: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 4,
    paddingBottom: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerSpacer: {
    width: 84,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "900",
  },
  headerActions: {
    flexDirection: "row",
    gap: 8,
  },
  smallButton: {
    width: 38,
    height: 36,
    borderRadius: 13,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  smallButtonText: {
    fontSize: 12,
    fontWeight: "900",
  },
  dotsRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
    paddingVertical: 6,
  },
  dotPressable: {
    padding: 4,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 999,
  },
  swipeContainer: {
    flex: 1,
  },
  dayContent: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 120,
  },
  summaryCard: {
    borderWidth: 1,
    borderRadius: 28,
    padding: 20,
  },
  summaryHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 18,
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: "800",
  },
  savedGoalBadge: {
    paddingHorizontal: 10,
    height: 28,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
  },
  savedGoalText: {
    fontSize: 11,
    fontWeight: "900",
  },
  calorieCenter: {
    alignItems: "center",
    justifyContent: "center",
  },
  calorieRing: {
    width: 190,
    height: 190,
    borderRadius: 95,
    borderWidth: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  calorieRingInner: {
    width: 150,
    height: 150,
    borderRadius: 75,
    borderWidth: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  calorieNumber: {
    fontSize: 34,
    fontWeight: "900",
  },
  calorieTarget: {
    fontSize: 13,
    fontWeight: "700",
    marginTop: 2,
  },
  remaining: {
    fontSize: 12,
    fontWeight: "800",
    marginTop: 8,
  },
  mainProgressTrack: {
    height: 10,
    borderRadius: 999,
    marginTop: 22,
    overflow: "hidden",
  },
  mainProgressFill: {
    height: "100%",
    borderRadius: 999,
  },
  macroRow: {
    marginTop: 22,
    flexDirection: "row",
    gap: 12,
  },
  goalButton: {
    marginTop: 18,
    height: 46,
    borderRadius: 17,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  goalButtonText: {
    fontSize: 14,
    fontWeight: "900",
  },
  quickActions: {
    marginTop: 18,
    flexDirection: "row",
    gap: 12,
  },
  actionCard: {
    flex: 1,
    minHeight: 92,
    borderWidth: 1,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    padding: 10,
  },
  actionText: {
    fontSize: 12,
    fontWeight: "800",
    textAlign: "center",
  },
  sectionHeader: {
    marginTop: 28,
    marginBottom: 14,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "900",
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
    fontWeight: "900",
    textAlign: "center",
  },
  emptySubtitle: {
    marginTop: 6,
    fontSize: 13,
    lineHeight: 19,
    fontWeight: "600",
    textAlign: "center",
  },
});
