import { Ionicons } from "@expo/vector-icons";
import { useMemo } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { Screen } from "../../src/components/Screen";
import { translate } from "../../src/i18n/translations";
import { useAppStore } from "../../src/stores/appStore";
import { useGoalStore } from "../../src/stores/goalStore";
import { useMealStore, type Meal } from "../../src/stores/mealStore";
import { getTheme } from "../../src/theme/theme";

type DayStats = {
  dateKey: string;
  label: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
};

export default function StatsScreen() {
  const themeMode = useAppStore((state) => state.themeMode);
  const language = useAppStore((state) => state.language);
  const theme = getTheme(themeMode);

  const meals = useMealStore((state) => state.meals);
  const goal = useGoalStore((state) => state.goal);

  const targetCalories = goal?.targetCalories ?? 2000;

  const weekData = useMemo(() => {
    return getLast7Days(language).map((day) => {
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
  }, [meals, language]);

  const totalCalories = weekData.reduce(
    (total, day) => total + day.calories,
    0,
  );
  const totalProtein = weekData.reduce((total, day) => total + day.protein, 0);
  const totalCarbs = weekData.reduce((total, day) => total + day.carbs, 0);
  const totalFat = weekData.reduce((total, day) => total + day.fat, 0);

  const activeDays = weekData.filter((day) => day.calories > 0).length;

  const averageCalories =
    activeDays > 0 ? Math.round(totalCalories / activeDays) : 0;

  const highestDay = weekData.reduce(
    (highest, day) => (day.calories > highest.calories ? day : highest),
    weekData[0],
  );

  const targetHitDays = weekData.filter((day) => {
    if (day.calories === 0) {
      return false;
    }

    const lowerLimit = targetCalories * 0.9;
    const upperLimit = targetCalories * 1.1;

    return day.calories >= lowerLimit && day.calories <= upperLimit;
  }).length;

  const maxChartValue = Math.max(
    ...weekData.map((day) => day.calories),
    targetCalories,
    1,
  );

  const hasMeals = meals.length > 0;

  return (
    <Screen>
      <ScrollView
        style={[
          styles.container,
          {
            backgroundColor: theme.colors.background,
          },
        ]}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.headerArea}>
          <View
            style={[
              styles.logoBox,
              {
                backgroundColor: theme.colors.primarySoft,
              },
            ]}
          >
            <Ionicons
              name="bar-chart-outline"
              size={30}
              color={theme.colors.primary}
            />
          </View>

          <Text style={[styles.title, { color: theme.colors.text }]}>
            {translate("weeklyStats", language)}
          </Text>

          <Text style={[styles.subtitle, { color: theme.colors.mutedText }]}>
            {translate("statsSubtitle", language)}
          </Text>
        </View>

        {hasMeals ? (
          <>
            <View style={styles.statGrid}>
              <StatCard
                icon="flame-outline"
                label={translate("averageCalories", language)}
                value={`${averageCalories} kcal`}
              />

              <StatCard
                icon="trophy-outline"
                label={translate("highestDay", language)}
                value={
                  highestDay?.calories
                    ? `${highestDay.calories} kcal`
                    : `0 kcal`
                }
              />

              <StatCard
                icon="flag-outline"
                label={translate("targetHitDays", language)}
                value={`${targetHitDays}/7`}
              />
            </View>

            <View
              style={[
                styles.chartCard,
                {
                  backgroundColor: theme.colors.card,
                  borderColor: theme.colors.border,
                },
              ]}
            >
              <View style={styles.cardHeader}>
                <View>
                  <Text
                    style={[
                      styles.cardEyebrow,
                      {
                        color: theme.colors.mutedText,
                      },
                    ]}
                  >
                    {translate("thisWeek", language)}
                  </Text>

                  <Text
                    style={[
                      styles.cardTitle,
                      {
                        color: theme.colors.text,
                      },
                    ]}
                  >
                    {translate("weeklyCalories", language)}
                  </Text>
                </View>

                <View
                  style={[
                    styles.targetBadge,
                    {
                      backgroundColor: theme.colors.primarySoft,
                    },
                  ]}
                >
                  <Ionicons
                    name="flag-outline"
                    size={16}
                    color={theme.colors.primary}
                  />

                  <Text
                    style={[
                      styles.targetBadgeText,
                      {
                        color: theme.colors.primary,
                      },
                    ]}
                  >
                    {targetCalories} kcal
                  </Text>
                </View>
              </View>

              <View style={styles.chartArea}>
                {weekData.map((day) => (
                  <DayBar
                    key={day.dateKey}
                    label={day.label}
                    calories={day.calories}
                    maxValue={maxChartValue}
                  />
                ))}
              </View>
            </View>

            <View
              style={[
                styles.macroCard,
                {
                  backgroundColor: theme.colors.card,
                  borderColor: theme.colors.border,
                },
              ]}
            >
              <Text style={[styles.cardTitle, { color: theme.colors.text }]}>
                {translate("weeklyMacros", language)}
              </Text>

              <View style={styles.macroList}>
                <MacroLine
                  label={translate("protein", language)}
                  value={totalProtein}
                  color={theme.colors.protein}
                />

                <MacroLine
                  label={translate("carbs", language)}
                  value={totalCarbs}
                  color={theme.colors.carbs}
                />

                <MacroLine
                  label={translate("fat", language)}
                  value={totalFat}
                  color={theme.colors.fat}
                />
              </View>
            </View>
          </>
        ) : (
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
                {
                  backgroundColor: theme.colors.primarySoft,
                },
              ]}
            >
              <Ionicons
                name="analytics-outline"
                size={30}
                color={theme.colors.primary}
              />
            </View>

            <Text style={[styles.emptyTitle, { color: theme.colors.text }]}>
              {translate("noStatsYet", language)}
            </Text>

            <Text
              style={[styles.emptySubtitle, { color: theme.colors.mutedText }]}
            >
              {translate("noStatsSubtitle", language)}
            </Text>
          </View>
        )}
      </ScrollView>
    </Screen>
  );
}

type StatCardProps = {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
};

function StatCard({ icon, label, value }: StatCardProps) {
  const themeMode = useAppStore((state) => state.themeMode);
  const theme = getTheme(themeMode);

  return (
    <View
      style={[
        styles.statCard,
        {
          backgroundColor: theme.colors.card,
          borderColor: theme.colors.border,
        },
      ]}
    >
      <View
        style={[
          styles.statIconBox,
          {
            backgroundColor: theme.colors.primarySoft,
          },
        ]}
      >
        <Ionicons name={icon} size={19} color={theme.colors.primary} />
      </View>

      <Text style={[styles.statValue, { color: theme.colors.text }]}>
        {value}
      </Text>

      <Text style={[styles.statLabel, { color: theme.colors.mutedText }]}>
        {label}
      </Text>
    </View>
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
      <View style={styles.barWrapper}>
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

      <Text style={[styles.barValue, { color: theme.colors.mutedText }]}>
        {calories > 0 ? calories : "-"}
      </Text>

      <Text style={[styles.barLabel, { color: theme.colors.text }]}>
        {label}
      </Text>
    </View>
  );
}

type MacroLineProps = {
  label: string;
  value: number;
  color: string;
};

function MacroLine({ label, value, color }: MacroLineProps) {
  const themeMode = useAppStore((state) => state.themeMode);
  const theme = getTheme(themeMode);

  const maxValue = Math.max(value, 1);
  const percent = Math.min((value / maxValue) * 100, 100);

  return (
    <View>
      <View style={styles.macroHeader}>
        <View style={styles.macroLabelRow}>
          <View style={[styles.macroDot, { backgroundColor: color }]} />

          <Text style={[styles.macroLabel, { color: theme.colors.text }]}>
            {label}
          </Text>
        </View>

        <Text style={[styles.macroValue, { color: theme.colors.mutedText }]}>
          {value}g
        </Text>
      </View>

      <View
        style={[
          styles.macroTrack,
          {
            backgroundColor: theme.colors.cardSoft,
          },
        ]}
      >
        <View
          style={[
            styles.macroFill,
            {
              width: `${percent}%`,
              backgroundColor: color,
            },
          ]}
        />
      </View>
    </View>
  );
}

function getMealDateKey(meal: Meal) {
  return meal.createdAt.slice(0, 10);
}

function getLast7Days(language: "tr" | "en") {
  const days = [];

  for (let index = 6; index >= 0; index--) {
    const date = new Date();
    date.setDate(date.getDate() - index);

    const dateKey = date.toISOString().slice(0, 10);

    const label = date.toLocaleDateString(
      language === "tr" ? "tr-TR" : "en-US",
      {
        weekday: "short",
      },
    );

    days.push({
      dateKey,
      label,
    });
  }

  return days;
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
  headerArea: {
    marginTop: 8,
    marginBottom: 24,
    alignItems: "center",
  },
  logoBox: {
    width: 64,
    height: 64,
    borderRadius: 23,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 18,
  },
  title: {
    fontSize: 32,
    fontWeight: "900",
    letterSpacing: -0.8,
    textAlign: "center",
  },
  subtitle: {
    marginTop: 10,
    fontSize: 13,
    lineHeight: 20,
    fontWeight: "600",
    textAlign: "center",
    maxWidth: 315,
  },
  statGrid: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 22,
    padding: 12,
    minHeight: 112,
  },
  statIconBox: {
    width: 34,
    height: 34,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  statValue: {
    fontSize: 16,
    fontWeight: "900",
  },
  statLabel: {
    marginTop: 4,
    fontSize: 10,
    lineHeight: 14,
    fontWeight: "700",
  },
  chartCard: {
    borderWidth: 1,
    borderRadius: 24,
    padding: 18,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 12,
    marginBottom: 18,
  },
  cardEyebrow: {
    fontSize: 12,
    fontWeight: "800",
    marginBottom: 4,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: "900",
  },
  targetBadge: {
    minHeight: 34,
    borderRadius: 999,
    paddingHorizontal: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  targetBadgeText: {
    fontSize: 12,
    fontWeight: "900",
  },
  chartArea: {
    height: 230,
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    gap: 8,
  },
  dayBarItem: {
    flex: 1,
    alignItems: "center",
  },
  barWrapper: {
    height: 145,
    width: "100%",
    borderRadius: 999,
    overflow: "hidden",
    justifyContent: "flex-end",
  },
  barFill: {
    width: "100%",
    borderRadius: 999,
  },
  barValue: {
    marginTop: 8,
    fontSize: 10,
    fontWeight: "800",
  },
  barLabel: {
    marginTop: 5,
    fontSize: 11,
    fontWeight: "900",
    textTransform: "capitalize",
  },
  macroCard: {
    marginTop: 16,
    borderWidth: 1,
    borderRadius: 24,
    padding: 18,
  },
  macroList: {
    marginTop: 18,
    gap: 16,
  },
  macroHeader: {
    marginBottom: 8,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  macroLabelRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  macroDot: {
    width: 9,
    height: 9,
    borderRadius: 999,
  },
  macroLabel: {
    fontSize: 13,
    fontWeight: "900",
  },
  macroValue: {
    fontSize: 13,
    fontWeight: "800",
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
