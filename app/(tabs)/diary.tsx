import { Ionicons } from "@expo/vector-icons";
import { router, type Href } from "expo-router";
import { useMemo, useState } from "react";
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Screen } from "../../src/components/Screen";
import {
  translate,
  type TranslationKey,
} from "../../src/i18n/translations";
import { useAppStore } from "../../src/stores/appStore";
import { useAuthStore } from "../../src/stores/authStore";
import { useGoalStore } from "../../src/stores/goalStore";
import {
  useMealStore,
  type Meal,
  type MealCategory,
} from "../../src/stores/mealStore";
import { getTheme } from "../../src/theme/theme";

const mealSections = [
  { category: "breakfast", labelKey: "breakfast" },
  { category: "lunch", labelKey: "lunch" },
  { category: "dinner", labelKey: "dinner" },
  { category: "snack", labelKey: "diarySnacks" },
] satisfies { category: MealCategory; labelKey: TranslationKey }[];

export default function DiaryScreen() {
  const themeMode = useAppStore((state) => state.themeMode);
  const language = useAppStore((state) => state.language);
  const theme = getTheme(themeMode);
  const token = useAuthStore((state) => state.token);

  const meals = useMealStore((state) => state.meals);
  const deleteMeal = useMealStore((state) => state.deleteMeal);

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

  const goal = useGoalStore((state) => state.goal);

  const daySummaries = useMemo(() => {
    const grouped = meals.reduce<Record<string, Meal[]>>((acc, meal) => {
      const dateKey = (meal.loggedAt ?? meal.createdAt).slice(0, 10);

      if (!acc[dateKey]) {
        acc[dateKey] = [];
      }

      acc[dateKey].push(meal);

      return acc;
    }, {});

    return Object.entries(grouped)
      .map(([dateKey, dayMeals]) => ({
        dateKey,
        meals: dayMeals,
        calories: dayMeals.reduce((total, meal) => total + meal.calories, 0),
        protein: dayMeals.reduce((total, meal) => total + meal.protein, 0),
        carbs: dayMeals.reduce((total, meal) => total + meal.carbs, 0),
        fat: dayMeals.reduce((total, meal) => total + meal.fat, 0),
      }))
      .sort((a, b) => b.dateKey.localeCompare(a.dateKey));
  }, [meals]);

  const [selectedDateKey, setSelectedDateKey] = useState<string | null>(null);

  const selectedDay =
    daySummaries.find((day) => day.dateKey === selectedDateKey) ??
    daySummaries[0] ??
    null;

  const targetCalories = goal?.targetCalories ?? 2000;

  const progressPercent = selectedDay
    ? Math.min((selectedDay.calories / targetCalories) * 100, 100)
    : 0;

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
                backgroundColor: theme.colors.primary,
              },
            ]}
          >
            <Ionicons
              name="calendar-outline"
              size={28}
              color="#FFFFFF"
            />
          </View>

          <Text style={[styles.title, { color: theme.colors.text }]}>
            {translate("calorieHistory", language)}
          </Text>

          <Text
            adjustsFontSizeToFit
            minimumFontScale={0.78}
            numberOfLines={1}
            style={[styles.subtitle, { color: theme.colors.mutedText }]}
          >
            {translate("diarySubtitle", language)}
          </Text>
        </View>

        {daySummaries.length > 0 ? (
          <>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.dayList}
            >
              {daySummaries.map((day) => {
                const selected = selectedDay?.dateKey === day.dateKey;

                return (
                  <Pressable
                    key={day.dateKey}
                    onPress={() => setSelectedDateKey(day.dateKey)}
                    style={[
                      styles.dayChip,
                      {
                        backgroundColor: selected
                          ? theme.colors.primary
                          : theme.colors.card,
                        borderColor: selected
                          ? theme.colors.primary
                          : theme.colors.border,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.dayChipDate,
                        {
                          color: selected ? "#FFFFFF" : theme.colors.text,
                        },
                      ]}
                    >
                      {formatWeekday(day.dateKey, language)}
                    </Text>

                    <Text
                      style={[
                        styles.dayChipInfo,
                        {
                          color: selected
                            ? "rgba(255,255,255,0.82)"
                            : theme.colors.mutedText,
                        },
                      ]}
                    >
                      {formatDayNumber(day.dateKey)}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>

            {selectedDay ? (
              <>
                <View
                  style={[
                    styles.summaryCard,
                    {
                      backgroundColor: theme.colors.card,
                      borderColor: theme.colors.border,
                    },
                  ]}
                >
                  <View style={styles.summaryTop}>
                    <View>
                      <Text
                        style={[
                          styles.summaryLabel,
                          { color: theme.colors.mutedText },
                        ]}
                      >
                        {formatLongDate(selectedDay.dateKey, language)}
                      </Text>

                      <Text
                        style={[
                          styles.summaryTitle,
                          { color: theme.colors.text },
                        ]}
                      >
                        {translate("totalCalories", language)}
                      </Text>
                    </View>

                    <View
                      style={[
                        styles.calorieBadge,
                        {
                          backgroundColor: theme.colors.primarySoft,
                        },
                      ]}
                    >
                      <Ionicons
                        name="flame-outline"
                        size={18}
                        color={theme.colors.primary}
                      />

                      <Text
                        style={[
                          styles.calorieBadgeText,
                          { color: theme.colors.primary },
                        ]}
                      >
                        {selectedDay.calories} kcal
                      </Text>
                    </View>
                  </View>

                  <View
                    style={[
                      styles.progressTrack,
                      {
                        backgroundColor: theme.colors.cardSoft,
                      },
                    ]}
                  >
                    <View
                      style={[
                        styles.progressFill,
                        {
                          width: `${progressPercent}%`,
                          backgroundColor: theme.colors.primary,
                        },
                      ]}
                    />
                  </View>

                  <Text
                    style={[
                      styles.progressText,
                      { color: theme.colors.mutedText },
                    ]}
                  >
                    {translate("targetProgress", language)}:{" "}
                    {Math.round(progressPercent)}%
                  </Text>

                  <View
                    style={[
                      styles.divider,
                      {
                        backgroundColor: theme.colors.border,
                      },
                    ]}
                  />

                  <Text
                    style={[
                      styles.macroTitle,
                      {
                        color: theme.colors.text,
                      },
                    ]}
                  >
                    {translate("macroSummary", language)}
                  </Text>

                  <View style={styles.macroRow}>
                    <MacroBox
                      label={translate("protein", language)}
                      value={selectedDay.protein}
                      color={theme.colors.protein}
                    />

                    <MacroBox
                      label={translate("carbs", language)}
                      value={selectedDay.carbs}
                      color={theme.colors.carbs}
                    />

                    <MacroBox
                      label={translate("fat", language)}
                      value={selectedDay.fat}
                      color={theme.colors.fat}
                    />
                  </View>
                </View>

                <View style={styles.mealSections}>
                  <Text
                    style={[styles.mealsTitle, { color: theme.colors.text }]}
                  >
                    {translate("meals", language)}
                  </Text>

                  {mealSections.map((section) => {
                    const sectionMeals = selectedDay.meals.filter(
                      (meal) => meal.category === section.category,
                    );

                    return (
                      <View
                        key={section.category}
                        style={[
                          styles.mealSection,
                          {
                            backgroundColor: theme.colors.card,
                            borderColor: theme.colors.border,
                          },
                        ]}
                      >
                        <View style={styles.mealSectionHeader}>
                          <View style={styles.mealSectionHeading}>
                            <Ionicons
                              name={getMealSectionIcon(section.category)}
                              size={20}
                              color={theme.colors.primary}
                            />

                            <Text
                              style={[
                                styles.mealSectionTitle,
                                { color: theme.colors.text },
                              ]}
                            >
                              {translate(section.labelKey, language)}
                            </Text>
                          </View>
                        </View>

                        {sectionMeals.length > 0 ? (
                          sectionMeals.map((meal) => (
                            <View key={meal.id} style={styles.mealRow}>
                              <Pressable
                                onPress={() =>
                                  router.push(
                                    `/meal-detail?mealId=${meal.id}` as Href,
                                  )
                                }
                                style={({ pressed }) => [
                                  styles.mealRowContent,
                                  { opacity: pressed ? 0.72 : 1 },
                                ]}
                              >
                                <View
                                  style={[
                                    styles.mealIcon,
                                    {
                                      backgroundColor: theme.colors.cardSoft,
                                    },
                                  ]}
                                >
                                  <Text style={styles.mealEmoji}>
                                    {getMealIcon(meal.category)}
                                  </Text>
                                </View>

                                <View style={styles.mealInfo}>
                                  <Text
                                    numberOfLines={1}
                                    style={[
                                      styles.mealTitle,
                                      { color: theme.colors.text },
                                    ]}
                                  >
                                    {meal.title}
                                  </Text>

                                  <Text
                                    style={[
                                      styles.mealCalories,
                                      { color: theme.colors.mutedText },
                                    ]}
                                  >
                                    {meal.calories} kcal
                                  </Text>
                                </View>

                                <Ionicons
                                  name="chevron-forward"
                                  size={18}
                                  color={theme.colors.mutedText}
                                />
                              </Pressable>

                              <Pressable
                                accessibilityLabel={translate(
                                  "deleteMeal",
                                  language,
                                )}
                                hitSlop={8}
                                onPress={() => confirmDeleteMeal(meal.id)}
                              >
                                <Ionicons
                                  name="trash-outline"
                                  size={17}
                                  color={theme.colors.mutedText}
                                />
                              </Pressable>
                            </View>
                          ))
                        ) : (
                          <View
                            style={[
                              styles.emptyMealSection,
                              { borderColor: theme.colors.border },
                            ]}
                          >
                            <Text
                              style={[
                                styles.emptyMealSectionText,
                                { color: theme.colors.mutedText },
                              ]}
                            >
                              {translate("noMealInSection", language)}
                            </Text>
                          </View>
                        )}
                      </View>
                    );
                  })}
                </View>
              </>
            ) : null}
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
                name="calendar-clear-outline"
                size={30}
                color={theme.colors.primary}
              />
            </View>

            <Text style={[styles.emptyTitle, { color: theme.colors.text }]}>
              {translate("noDiaryYet", language)}
            </Text>

            <Text
              style={[styles.emptySubtitle, { color: theme.colors.mutedText }]}
            >
              {translate("noDiarySubtitle", language)}
            </Text>
          </View>
        )}
      </ScrollView>

      <Pressable
        accessibilityLabel={translate("addMeal", language)}
        accessibilityRole="button"
        onPress={() => router.push("/add-meal" as Href)}
        style={({ pressed }) => [
          styles.floatingAddButton,
          {
            backgroundColor: theme.colors.primary,
            opacity: pressed ? 0.84 : 1,
          },
        ]}
      >
        <Ionicons name="add" size={30} color="#FFFFFF" />
      </Pressable>
    </Screen>
  );
}

type MacroBoxProps = {
  label: string;
  value: number;
  color: string;
};

function MacroBox({ label, value, color }: MacroBoxProps) {
  const themeMode = useAppStore((state) => state.themeMode);
  const theme = getTheme(themeMode);

  return (
    <View
      style={[
        styles.macroBox,
        {
          backgroundColor: theme.colors.cardSoft,
        },
      ]}
    >
      <View style={[styles.macroDot, { backgroundColor: color }]} />

      <Text style={[styles.macroBoxLabel, { color: theme.colors.mutedText }]}>
        {label}
      </Text>

      <Text style={[styles.macroBoxValue, { color: theme.colors.text }]}>
        {value}g
      </Text>
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

function formatWeekday(dateKey: string, language: "tr" | "en") {
  const date = new Date(`${dateKey}T12:00:00`);

  return date.toLocaleDateString(language === "tr" ? "tr-TR" : "en-US", {
    weekday: "short",
  });
}

function getMealSectionIcon(category: MealCategory) {
  switch (category) {
    case "breakfast":
      return "sunny-outline";
    case "lunch":
      return "partly-sunny-outline";
    case "dinner":
      return "moon-outline";
    case "snack":
      return "restaurant-outline";
  }
}

function formatDayNumber(dateKey: string) {
  return new Date(`${dateKey}T12:00:00`).getDate();
}

function formatLongDate(dateKey: string, language: "tr" | "en") {
  const todayKey = new Date().toISOString().slice(0, 10);

  if (dateKey === todayKey) {
    return language === "tr" ? "Bugün" : "Today";
  }

  const date = new Date(`${dateKey}T12:00:00`);

  return date.toLocaleDateString(language === "tr" ? "tr-TR" : "en-US", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
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
    marginTop: 10,
    marginBottom: 28,
    alignItems: "center",
  },
  logoBox: {
    width: 60,
    height: 60,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: "900",
    letterSpacing: -0.8,
    textAlign: "center",
  },
  subtitle: {
    alignSelf: "stretch",
    marginTop: 12,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "500",
    textAlign: "center",
  },
  dayList: {
    gap: 8,
    paddingBottom: 18,
  },
  dayChip: {
    width: 62,
    minHeight: 70,
    borderWidth: 1,
    borderRadius: 18,
    paddingHorizontal: 8,
    paddingVertical: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  dayChipDate: {
    fontSize: 11,
    fontWeight: "800",
    textTransform: "capitalize",
  },
  dayChipInfo: {
    marginTop: 3,
    fontSize: 19,
    lineHeight: 23,
    fontWeight: "900",
  },
  summaryCard: {
    borderWidth: 1,
    borderRadius: 24,
    padding: 18,
  },
  summaryTop: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 12,
  },
  summaryLabel: {
    fontSize: 12,
    fontWeight: "800",
    marginBottom: 4,
    textTransform: "capitalize",
  },
  summaryTitle: {
    fontSize: 20,
    fontWeight: "900",
  },
  calorieBadge: {
    minHeight: 38,
    borderRadius: 999,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  calorieBadgeText: {
    fontSize: 13,
    fontWeight: "900",
  },
  progressTrack: {
    height: 9,
    borderRadius: 999,
    overflow: "hidden",
    marginTop: 18,
  },
  progressFill: {
    height: "100%",
    borderRadius: 999,
  },
  progressText: {
    marginTop: 8,
    fontSize: 12,
    fontWeight: "700",
  },
  divider: {
    height: 1,
    marginVertical: 16,
  },
  macroTitle: {
    fontSize: 15,
    fontWeight: "900",
    marginBottom: 12,
  },
  macroRow: {
    flexDirection: "row",
    gap: 10,
  },
  macroBox: {
    flex: 1,
    borderRadius: 18,
    padding: 12,
  },
  macroDot: {
    width: 8,
    height: 8,
    borderRadius: 999,
    marginBottom: 8,
  },
  macroBoxLabel: {
    fontSize: 11,
    fontWeight: "800",
  },
  macroBoxValue: {
    marginTop: 4,
    fontSize: 15,
    fontWeight: "900",
  },
  mealSections: {
    marginTop: 24,
    gap: 14,
  },
  mealsTitle: {
    marginBottom: 2,
    fontSize: 21,
    fontWeight: "900",
    letterSpacing: -0.4,
  },
  mealSection: {
    gap: 10,
    borderWidth: 1,
    borderRadius: 22,
    padding: 14,
  },
  mealSectionHeader: {
    minHeight: 30,
    flexDirection: "row",
    alignItems: "center",
  },
  mealSectionHeading: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  mealSectionTitle: {
    fontSize: 16,
    fontWeight: "900",
    letterSpacing: -0.3,
  },
  mealRow: {
    minHeight: 48,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  mealRowContent: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  mealIcon: {
    width: 42,
    height: 42,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
  },
  mealEmoji: {
    fontSize: 20,
  },
  mealInfo: {
    flex: 1,
  },
  mealTitle: {
    fontSize: 14,
    fontWeight: "800",
  },
  mealCalories: {
    marginTop: 3,
    fontSize: 11,
    fontWeight: "600",
  },
  emptyMealSection: {
    minHeight: 46,
    borderWidth: 1,
    borderStyle: "dashed",
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyMealSectionText: {
    fontSize: 11,
    fontWeight: "600",
  },
  floatingAddButton: {
    position: "absolute",
    right: 20,
    bottom: 14,
    width: 56,
    height: 56,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.22,
    shadowRadius: 8,
    elevation: 8,
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
