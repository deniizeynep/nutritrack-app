import { Ionicons } from "@expo/vector-icons";
import { useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Screen } from "../../src/components/Screen";
import { translate } from "../../src/i18n/translations";
import { useAppStore } from "../../src/stores/appStore";
import { useGoalStore } from "../../src/stores/goalStore";
import { useMealStore, type Meal } from "../../src/stores/mealStore";
import { getTheme } from "../../src/theme/theme";

type StatsPeriod = "weekly" | "monthly";

const PERIODS: StatsPeriod[] = ["weekly", "monthly"];

export default function StatsScreen() {
  const themeMode = useAppStore((state) => state.themeMode);
  const language = useAppStore((state) => state.language);
  const theme = getTheme(themeMode);
  const [period, setPeriod] = useState<StatsPeriod>("weekly");

  const meals = useMealStore((state) => state.meals);
  const goal = useGoalStore((state) => state.goal);

  const targetCalories = goal?.targetCalories ?? 2000;

  const periodData = useMemo(() => {
    return getPeriodDays(period, language).map((day) => {
      const dayMeals = meals.filter((meal) => {
        return getMealDateKey(meal) === day.dateKey;
      });

      return {
        dateKey: day.dateKey,
        label: day.label,
        calories: dayMeals.reduce((total, meal) => total + meal.calories, 0),
        protein: dayMeals.reduce((total, meal) => total + meal.protein, 0),
        carbs: dayMeals.reduce((total, meal) => total + meal.carbs, 0),
        fat: dayMeals.reduce((total, meal) => total + meal.fat, 0),
      };
    });
  }, [meals, period, language]);

  const filteredMeals = useMemo(() => {
    const periodDateKeys = new Set(periodData.map((day) => day.dateKey));

    return meals.filter((meal) => periodDateKeys.has(getMealDateKey(meal)));
  }, [meals, periodData]);

  const totalCalories = periodData.reduce(
    (total, day) => total + day.calories,
    0,
  );
  const totalProtein = periodData.reduce((total, day) => total + day.protein, 0);
  const totalCarbs = periodData.reduce((total, day) => total + day.carbs, 0);
  const totalFat = periodData.reduce((total, day) => total + day.fat, 0);

  const dailyAverage =
    periodData.length > 0 ? Math.round(totalCalories / periodData.length) : 0;

  const highestDay = periodData.reduce(
    (highest, day) => (day.calories > highest.calories ? day : highest),
    periodData[0],
  );

  const previousWeekAverage = useMemo(() => {
    const prevDays = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const startDate = new Date(today);
    startDate.setDate(today.getDate() - 13);

    const endDate = new Date(today);
    endDate.setDate(today.getDate() - 7);

    for (
      const date = new Date(startDate);
      date <= endDate;
      date.setDate(date.getDate() + 1)
    ) {
      const dateKey = getDateKey(date);
      const dayMeals = meals.filter((meal) => getMealDateKey(meal) === dateKey);
      prevDays.push(dayMeals.reduce((total, meal) => total + meal.calories, 0));
    }

    return prevDays.length > 0
      ? Math.round(prevDays.reduce((a, b) => a + b, 0) / prevDays.length)
      : 0;
  }, [meals]);

  const weeklyChangePercent = useMemo(() => {
    if (previousWeekAverage === 0) return 0;
    return Math.round(
      ((dailyAverage - previousWeekAverage) / previousWeekAverage) * 100,
    );
  }, [dailyAverage, previousWeekAverage]);

  const maxChartValue = Math.max(
    ...periodData.map((day) => day.calories),
    targetCalories,
    1,
  );

  const totalMacroGrams = totalProtein + totalCarbs + totalFat;

  const proteinPercent = totalMacroGrams > 0 ? Math.round((totalProtein / totalMacroGrams) * 100) : 0;
  const carbsPercent = totalMacroGrams > 0 ? Math.round((totalCarbs / totalMacroGrams) * 100) : 0;
  const fatPercent = totalMacroGrams > 0 ? Math.round((totalFat / totalMacroGrams) * 100) : 0;

  const hasPeriodMeals = filteredMeals.length > 0;

  const goalProgress = goal && goal.targetCalories > 0
    ? Math.min(Math.round((dailyAverage / goal.targetCalories) * 100), 999)
    : 0;

  return (
    <Screen>
      <ScrollView
        style={[styles.container, { backgroundColor: theme.colors.background }]}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={[styles.headerTitle, { color: theme.colors.primary }]}>
            {language === "tr" ? "İstatistikler" : "Statistics"}
          </Text>
        </View>

        <View style={[styles.segmentedControl, { backgroundColor: theme.colors.cardSoft }]}>
          {PERIODS.map((periodOption) => {
            const selected = periodOption === period;

            return (
              <Pressable
                key={periodOption}
                onPress={() => setPeriod(periodOption)}
                style={[
                  styles.segment,
                  {
                    backgroundColor: selected ? theme.colors.primary : "transparent",
                  },
                ]}
              >
                <Text
                  style={[
                    styles.segmentText,
                    {
                      color: selected ? "#FFFFFF" : theme.colors.mutedText,
                    },
                  ]}
                >
                  {translate(periodOption, language)}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {hasPeriodMeals ? (
          <>
            <View style={[styles.card, { backgroundColor: theme.colors.card }]}>
              <Text style={[styles.cardEyebrow, { color: theme.colors.mutedText }]}>
                {translate("averageIntake", language)}
              </Text>
              <View style={styles.averageRow}>
                <Text style={[styles.averageValue, { color: theme.colors.primary }]}>
                  {dailyAverage.toLocaleString()} kcal
                </Text>
                {weeklyChangePercent !== 0 && (
                  <Text
                    style={[
                      styles.changePercent,
                      {
                        color: weeklyChangePercent > 0 ? "#22C55E" : theme.colors.danger,
                      },
                    ]}
                  >
                    {weeklyChangePercent > 0 ? "+" : ""}
                    {weeklyChangePercent}% {translate("vsLastWeek", language)}
                  </Text>
                )}
              </View>

              <View style={styles.chartArea}>
                {periodData.map((day) => (
                  <DayBar
                    key={day.dateKey}
                    label={day.label}
                    calories={day.calories}
                    maxValue={maxChartValue}
                  />
                ))}
              </View>
            </View>

            <View style={styles.bentoGrid}>
              <View
                style={[
                  styles.bentoCard,
                  { backgroundColor: theme.colors.card, borderLeftColor: theme.colors.primary },
                ]}
              >
                <Text style={[styles.bentoLabel, { color: theme.colors.mutedText }]}>
                  {translate("highestDay", language)}
                </Text>
                <Text style={[styles.bentoValue, { color: theme.colors.primary }]}>
                  {highestDay?.label ?? "-"}
                </Text>
                <Text style={[styles.bentoSub, { color: theme.colors.mutedText }]}>
                  {highestDay?.calories ? `${highestDay.calories.toLocaleString()} kcal` : "0 kcal"}
                </Text>
              </View>

              <View
                style={[
                  styles.bentoCard,
                  { backgroundColor: theme.colors.card, borderLeftColor: theme.colors.primarySoft },
                ]}
              >
                <Text style={[styles.bentoLabel, { color: theme.colors.mutedText }]}>
                  {translate("dailyAverage", language)}
                </Text>
                <Text style={[styles.bentoValue, { color: theme.colors.text }]}>
                  {dailyAverage.toLocaleString()} kcal
                </Text>
                <Text style={[styles.bentoSub, { color: theme.colors.mutedText }]}>
                  {translate("targetLabel", language)}: {targetCalories.toLocaleString()}
                </Text>
              </View>
            </View>

            <View style={[styles.card, { backgroundColor: theme.colors.card }]}>
              <Text style={[styles.cardTitle, { color: theme.colors.primary }]}>
                {translate("macroDistribution", language)}
              </Text>

              <View style={styles.macroList}>
                <MacroBar
                  label={translate("protein", language)}
                  percent={proteinPercent}
                  grams={totalProtein}
                  color="#2F80ED"
                />
                <MacroBar
                  label={translate("carbs", language)}
                  percent={carbsPercent}
                  grams={totalCarbs}
                  color="#F2994A"
                />
                <MacroBar
                  label={translate("fat", language)}
                  percent={fatPercent}
                  grams={totalFat}
                  color="#9B51E0"
                />
              </View>
            </View>

            <View style={[styles.card, { backgroundColor: theme.colors.card }]}>
              <Text style={[styles.cardTitle, { color: theme.colors.primary }]}>
                {translate("goalProgress", language)}
              </Text>

              <View style={styles.goalProgressContainer}>
                <View
                  style={[
                    styles.goalRingOuter,
                    { borderColor: theme.colors.primarySoft },
                  ]}
                >
                  <Text style={[styles.goalRingPercent, { color: theme.colors.primary }]}>
                    {goalProgress}%
                  </Text>
                </View>

                <View
                  style={[
                    styles.goalBarTrack,
                    { backgroundColor: theme.colors.cardSoft },
                  ]}
                >
                  <View
                    style={[
                      styles.goalBarFill,
                      {
                        width: `${Math.min(goalProgress, 100)}%`,
                        backgroundColor: theme.colors.primary,
                      },
                    ]}
                  />
                </View>

                <View style={styles.goalInfo}>
                  <Text style={[styles.goalInfoTitle, { color: theme.colors.text }]}>
                    {dailyAverage.toLocaleString()} / {targetCalories.toLocaleString()} kcal
                  </Text>
                  <Text style={[styles.goalInfoSub, { color: theme.colors.mutedText }]}>
                    {goalProgress >= 85
                      ? translate("goalProximity", language)
                      : translate("ofDailyTargetAverage", language)}
                  </Text>
                </View>
              </View>
            </View>
          </>
        ) : (
          <View
            style={[
              styles.emptyCard,
              { backgroundColor: theme.colors.card, borderColor: theme.colors.border },
            ]}
          >
            <View
              style={[styles.emptyIconBox, { backgroundColor: theme.colors.primarySoft }]}
            >
              <Ionicons name="analytics-outline" size={30} color={theme.colors.primary} />
            </View>

            <Text style={[styles.emptyTitle, { color: theme.colors.text }]}>
              {translate("noRecordsForPeriod", language)}
            </Text>

            <Text style={[styles.emptySubtitle, { color: theme.colors.mutedText }]}>
              {translate("addMealsToBuildStats", language)}
            </Text>
          </View>
        )}
      </ScrollView>
    </Screen>
  );
}

type DayBarProps = {
  label: string;
  calories: number;
  maxValue: number;
};

function DayBar({ label, calories, maxValue }: DayBarProps) {
  const themeMode = useAppStore((state) => state.themeMode);
  const theme = getTheme(themeMode);

  const heightPercent = Math.max(
    (calories / maxValue) * 100,
    calories > 0 ? 8 : 0,
  );

  return (
    <View style={styles.dayBarItem}>
      <View style={[styles.barWrapper, { backgroundColor: theme.colors.cardSoft }]}>
        <View
          style={[
            styles.barFill,
            {
              height: `${heightPercent}%`,
              backgroundColor:
                calories > 0 ? theme.colors.primary : theme.colors.cardSoft,
            },
          ]}
        />
      </View>
      <Text style={[styles.barLabel, { color: theme.colors.mutedText }]}>
        {label}
      </Text>
    </View>
  );
}

type MacroBarProps = {
  label: string;
  percent: number;
  grams: number;
  color: string;
};

function MacroBar({ label, percent, grams, color }: MacroBarProps) {
  const themeMode = useAppStore((state) => state.themeMode);
  const theme = getTheme(themeMode);

  return (
    <View style={styles.macroRow}>
      <View style={styles.macroInfo}>
        <Text style={[styles.macroLabel, { color: theme.colors.text }]}>{label}</Text>
        <Text style={[styles.macroValue, { color: theme.colors.primary }]}>
          {percent}% ({grams}g)
        </Text>
      </View>
      <View style={[styles.macroTrack, { backgroundColor: theme.colors.cardSoft }]}>
        <View
          style={[
            styles.macroFill,
            {
              width: `${Math.min(percent, 100)}%`,
              backgroundColor: color,
            },
          ]}
        />
      </View>
    </View>
  );
}

function getMealDateKey(meal: Meal) {
  return getDateKey(new Date(meal.loggedAt ?? meal.createdAt));
}

function getDateKey(date: Date) {
  const normalizedDate = new Date(date);
  normalizedDate.setHours(0, 0, 0, 0);

  const year = normalizedDate.getFullYear();
  const month = String(normalizedDate.getMonth() + 1).padStart(2, "0");
  const day = String(normalizedDate.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function getPeriodDays(period: StatsPeriod, language: "tr" | "en") {
  const days = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const startDate = new Date(today);

  if (period === "weekly") {
    startDate.setDate(today.getDate() - 6);
  }

  if (period === "monthly") {
    startDate.setDate(1);
  }

  for (
    const date = new Date(startDate);
    date <= today;
    date.setDate(date.getDate() + 1)
  ) {
    const dateKey = getDateKey(date);
    const label = getDayLabel(date, period, language);

    days.push({
      dateKey,
      label,
    });
  }

  return days;
}

function getDayLabel(date: Date, period: StatsPeriod, language: "tr" | "en") {
  const locale = language === "tr" ? "tr-TR" : "en-US";

  if (period === "weekly") {
    return date.toLocaleDateString(locale, {
      weekday: "short",
    });
  }

  return String(date.getDate());
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 4,
    paddingBottom: 120,
  },
  header: {
    marginTop: 8,
    marginBottom: 16,
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "700",
    letterSpacing: -0.5,
  },
  segmentedControl: {
    flexDirection: "row",
    padding: 4,
    borderRadius: 12,
    marginBottom: 16,
  },
  segment: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  segmentText: {
    fontSize: 13,
    fontWeight: "600",
  },
  card: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 3,
  },
  cardEyebrow: {
    fontSize: 12,
    fontWeight: "600",
    letterSpacing: 0.05,
    marginBottom: 4,
  },
  averageRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "baseline",
    marginBottom: 16,
  },
  averageValue: {
    fontSize: 28,
    fontWeight: "800",
    letterSpacing: -0.5,
  },
  changePercent: {
    fontSize: 12,
    fontWeight: "600",
  },
  chartArea: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    height: 120,
    gap: 6,
  },
  dayBarItem: {
    flex: 1,
    alignItems: "center",
  },
  barWrapper: {
    height: 100,
    width: "100%",
    borderRadius: 8,
    overflow: "hidden",
    justifyContent: "flex-end",
  },
  barFill: {
    width: "100%",
    borderRadius: 8,
  },
  barLabel: {
    marginTop: 8,
    fontSize: 10,
    fontWeight: "600",
  },
  bentoGrid: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 16,
    alignItems: "stretch",
  },
  bentoCard: {
    flex: 1,
    borderRadius: 16,
    padding: 16,
    borderLeftWidth: 4,
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 3,
  },
  bentoLabel: {
    fontSize: 11,
    fontWeight: "600",
    letterSpacing: 0.05,
    marginBottom: 4,
  },
  bentoValue: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 2,
  },
  bentoSub: {
    fontSize: 12,
    fontWeight: "500",
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 16,
  },
  macroList: {
    gap: 14,
  },
  macroRow: {
    gap: 8,
  },
  macroInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  macroLabel: {
    fontSize: 13,
    fontWeight: "600",
  },
  macroValue: {
    fontSize: 13,
    fontWeight: "700",
  },
  macroTrack: {
    height: 8,
    borderRadius: 999,
    overflow: "hidden",
  },
  macroFill: {
    height: "100%",
    borderRadius: 999,
  },
  goalProgressContainer: {
    alignItems: "center",
    gap: 16,
  },
  goalRingOuter: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  goalRingPercent: {
    fontSize: 28,
    fontWeight: "800",
    letterSpacing: -0.5,
  },
  goalBarTrack: {
    width: "100%",
    height: 10,
    borderRadius: 999,
    overflow: "hidden",
  },
  goalBarFill: {
    height: "100%",
    borderRadius: 999,
  },
  goalInfo: {
    alignItems: "center",
    gap: 4,
  },
  goalInfoTitle: {
    fontSize: 14,
    fontWeight: "700",
  },
  goalInfoSub: {
    fontSize: 12,
    fontWeight: "500",
    lineHeight: 18,
  },
  emptyCard: {
    borderWidth: 1,
    borderRadius: 24,
    padding: 24,
    alignItems: "center",
  },
  emptyIconBox: {
    width: 60,
    height: 60,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "900",
    textAlign: "center",
  },
  emptySubtitle: {
    marginTop: 8,
    fontSize: 13,
    lineHeight: 20,
    fontWeight: "600",
    textAlign: "center",
  },
});
