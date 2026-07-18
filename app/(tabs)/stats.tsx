import { Ionicons } from "@expo/vector-icons";
import Animated, { FadeIn, FadeInRight, FadeInLeft } from "react-native-reanimated";
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useMemo, useState } from "react";
import * as Print from "expo-print";
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

  const previousMonthAverage = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const lastMonthStart = new Date(today.getFullYear(), today.getMonth() - 1, 1);
    const lastMonthEnd = new Date(today.getFullYear(), today.getMonth(), 0);
    const prevDays = [];

    for (
      const date = new Date(lastMonthStart);
      date <= lastMonthEnd;
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

  const comparisonAverage = useMemo(() => {
    return period === "weekly" ? previousWeekAverage : previousMonthAverage;
  }, [period, previousWeekAverage, previousMonthAverage]);

  const weeklyChangePercent = useMemo(() => {
    if (comparisonAverage === 0) return 0;
    return Math.round(
      ((dailyAverage - comparisonAverage) / comparisonAverage) * 100,
    );
  }, [dailyAverage, comparisonAverage]);

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

  const avgCaloriesDisplay = dailyAverage.toLocaleString();
  const comparisonPeriodText = period === "weekly"
    ? (language === "tr" ? "geçen haftaya" : "last week")
    : (language === "tr" ? "geçen aya" : "last month");

  const insightText = useMemo(() => {
    if (weeklyChangePercent > 15) {
      return language === "tr"
        ? `Kalori alımınız ${comparisonPeriodText} göre %${weeklyChangePercent} arttı. Hedefinize ulaşmak için porsiyon boyutlarını gözden geçirin.`
        : `Your calorie intake increased by ${weeklyChangePercent}% compared to ${comparisonPeriodText}. Review your portion sizes to stay on track.`;
    }
    if (weeklyChangePercent < -15) {
      return language === "tr"
        ? `Harika! Kalori alımınız ${comparisonPeriodText} göre %${Math.abs(weeklyChangePercent)} azaldı. Bu tempoyu koruyun!`
        : `Great! Your calorie intake decreased by ${Math.abs(weeklyChangePercent)}% compared to ${comparisonPeriodText}. Keep it up!`;
    }
    if (goalProgress >= 85) {
      return language === "tr"
        ? `Günlük hedefinizin %${goalProgress}’ine ulaştınız. Tutarsız günlere odaklanarak beslenme düzeninizi iyileştirebilirsiniz.`
        : `You've reached ${goalProgress}% of your daily target. Focus on inconsistent days to improve your nutrition routine.`;
    }
    if (goalProgress < 50) {
      return language === "tr"
        ? `Günlük hedefinizin sadece %${goalProgress}’ine ulaştınız. Düzenli öğünler ve atıştırmalarla alımınızı artırabilirsiniz.`
        : `You've only reached ${goalProgress}% of your daily target. You can increase your intake with regular meals and snacks.`;
    }
    return language === "tr"
      ? `${period === "weekly" ? "Bu hafta" : "Bu ay"} dengeli besleniyorsunuz. Günlük ortalamanız ${avgCaloriesDisplay} kcal, hedefinize çok yakınsınız.`
      : `You're eating balanced ${period === "weekly" ? "this week" : "this month"}. Your daily average is ${avgCaloriesDisplay} kcal, very close to your target.`;
  }, [weeklyChangePercent, goalProgress, avgCaloriesDisplay, language, comparisonPeriodText, period]);

  const insightColor = useMemo(() => {
    if (weeklyChangePercent > 15 || goalProgress < 50) return "#E74C3C";
    if (weeklyChangePercent < -15 || goalProgress >= 85) return "#22C55E";
    return theme.colors.primary;
  }, [weeklyChangePercent, goalProgress, theme.colors.primary]);

  const insightIcon = useMemo(() => {
    if (weeklyChangePercent > 15 || goalProgress < 50) return "warning" as const;
    if (weeklyChangePercent < -15 || goalProgress >= 85) return "checkmark-circle" as const;
    return "information-circle" as const;
  }, [weeklyChangePercent, goalProgress]);

  const handleExportPdf = async () => {
    const periodLabel = translate(period, language);

    const today = new Date();
    const dateStr = today.toLocaleDateString(language === "tr" ? "tr-TR" : "en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    const macroBarHtml = (label: string, percent: number, grams: number, color: string) => `
      <div style="margin-bottom:12px;">
        <div style="display:flex;justify-content:space-between;margin-bottom:4px;">
          <span style="font-weight:600;font-size:13px;">${label}</span>
          <span style="font-weight:700;font-size:13px;color:${color};">${percent}% (${grams}g)</span>
        </div>
        <div style="background:#f0f0f0;border-radius:999px;height:10px;overflow:hidden;">
          <div style="background:${color};height:100%;border-radius:999px;width:${Math.min(percent, 100)}%;"></div>
        </div>
      </div>`;

    const dayBarsHtml = periodData.map((day) => {
      const heightPct = maxChartValue > 0 ? Math.round((day.calories / maxChartValue) * 100) : 0;
      return `
        <div style="text-align:center;flex:1;">
          <div style="background:#f0f0f0;border-radius:6px;height:100px;display:flex;flex-direction:column;justify-content:flex-end;overflow:hidden;">
            <div style="background:#4CAF50;height:${heightPct}%;border-radius:6px;"></div>
          </div>
          <div style="font-size:10px;margin-top:6px;color:#888;">${day.label}</div>
          <div style="font-size:9px;color:#aaa;">${day.calories}</div>
        </div>`;
    }).join("");

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8" />
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 30px; color: #1a1a1a; }
          h1 { color: #4CAF50; font-size: 24px; margin-bottom: 4px; }
          h2 { font-size: 16px; color: #333; margin: 24px 0 12px; border-bottom: 2px solid #EAF8EF; padding-bottom: 6px; }
          .subtitle { color: #888; font-size: 12px; margin-bottom: 20px; }
          .card { border: 1px solid #eee; border-radius: 12px; padding: 16px; margin-bottom: 16px; }
          .big-number { font-size: 28px; font-weight: 800; color: #4CAF50; }
          .change { font-size: 12px; font-weight: 600; }
          .change.up { color: #22C55E; }
          .change.down { color: #E74C3C; }
          .bento { display: flex; gap: 12px; margin-bottom: 16px; }
          .bento-item { flex: 1; border-left: 4px solid #4CAF50; padding: 12px; border-radius: 12px; background: #fafafa; }
          .bento-label { font-size: 11px; color: #888; font-weight: 600; }
          .bento-value { font-size: 18px; font-weight: 700; margin: 4px 0 2px; }
          .bento-sub { font-size: 12px; color: #888; }
          .chart { display: flex; align-items: flex-end; gap: 4px; margin-top: 12px; }
          .insight { border-left: 4px solid #4CAF50; padding: 12px; margin-bottom: 16px; border-radius: 12px; background: #fafafa; }
          .insight-title { font-weight: 600; font-size: 12px; margin-bottom: 6px; }
          .insight-text { font-size: 14px; line-height: 1.6; }
          .comparison { margin-bottom: 12px; }
          .comparison-label { font-size: 12px; font-weight: 600; margin-bottom: 4px; color: #888; }
          .comparison-bar { background: #f0f0f0; border-radius: 999px; height: 10px; overflow: hidden; margin-bottom: 4px; }
          .comparison-fill { height: 100%; border-radius: 999px; }
          .comparison-value { font-size: 12px; font-weight: 600; }
          .footer { text-align: center; color: #aaa; font-size: 10px; margin-top: 30px; }
        </style>
      </head>
      <body>
        <h1>${language === "tr" ? "İstatistikler" : "Statistics"} — ${periodLabel}</h1>
        <div class="subtitle">${dateStr}</div>

        <div class="card">
          <div style="font-size:12px;color:#888;font-weight:600;margin-bottom:4px;">${translate("averageIntake", language)}</div>
          <div style="display:flex;justify-content:space-between;align-items:baseline;">
            <div class="big-number">${dailyAverage.toLocaleString()} kcal</div>
            ${weeklyChangePercent !== 0
              ? `<span class="change ${weeklyChangePercent > 0 ? "up" : "down"}">${weeklyChangePercent > 0 ? "+" : ""}${weeklyChangePercent}% ${translate(period === "weekly" ? "vsLastWeek" : "vsLastMonth", language)}</span>`
              : ""}
          </div>
          <div class="chart">${dayBarsHtml}</div>
        </div>

        <div class="bento">
          <div class="bento-item">
            <div class="bento-label">${translate("highestDay", language)}</div>
            <div class="bento-value" style="color:#4CAF50;">${highestDay?.label ?? "-"}</div>
            <div class="bento-sub">${highestDay?.calories ? `${highestDay.calories.toLocaleString()} kcal` : "0 kcal"}</div>
          </div>
          <div class="bento-item" style="border-left-color:#81C784;">
            <div class="bento-label">${translate("dailyAverage", language)}</div>
            <div class="bento-value">${dailyAverage.toLocaleString()} kcal</div>
            <div class="bento-sub">${translate("targetLabel", language)}: ${targetCalories.toLocaleString()}</div>
          </div>
        </div>

        <div class="card">
          <h2>${translate("macroDistribution", language)}</h2>
          ${macroBarHtml(translate("protein", language), proteinPercent, totalProtein, "#2F80ED")}
          ${macroBarHtml(translate("carbs", language), carbsPercent, totalCarbs, "#F2994A")}
          ${macroBarHtml(translate("fat", language), fatPercent, totalFat, "#9B51E0")}
        </div>

        <div class="insight" style="border-left-color:${insightColor};">
          <div class="insight-title" style="color:${insightColor};">${translate(period === "weekly" ? "weeklyHighlight" : "monthlyHighlight", language)}</div>
          <div class="insight-text">${insightText}</div>
        </div>

        ${period === "monthly" ? `<div class="card">
          <h2>${translate("thisMonthVsLast", language)}</h2>
          <div class="comparison">
            <div class="comparison-label">${translate("thisMonthLabel", language)}</div>
            <div class="comparison-bar">
              <div class="comparison-fill" style="background:#4CAF50;width:${maxChartValue > 0 ? Math.min((dailyAverage / maxChartValue) * 100, 100) : 0}%;"></div>
            </div>
            <div class="comparison-value">${dailyAverage.toLocaleString()} ${translate("kcalPerDayAvg", language)}</div>
          </div>
          <div class="comparison">
            <div class="comparison-label">${translate("lastMonthLabel", language)}</div>
            <div class="comparison-bar">
              <div class="comparison-fill" style="background:#999;width:${maxChartValue > 0 ? Math.min((previousMonthAverage / maxChartValue) * 100, 100) : 0}%;"></div>
            </div>
            <div class="comparison-value">${previousMonthAverage.toLocaleString()} ${translate("kcalPerDayAvg", language)}</div>
          </div>
        </div>` : ""}

        <div class="footer">
          NutriTrack — ${language === "tr" ? "Beslenme Takip Uygulaması" : "Nutrition Tracking App"}
        </div>
      </body>
      </html>`;

    try {
      await Print.printAsync({ html });
    } catch (error) {
      console.error("PDF EXPORT ERROR:", error);
      Alert.alert(
        language === "tr" ? "Hata" : "Error",
        language === "tr"
          ? `PDF oluşturulurken hata: ${error instanceof Error ? error.message : String(error)}`
          : `PDF error: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  };

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
          <Animated.View key={period} entering={period === "monthly" ? FadeInRight.duration(300) : FadeInLeft.duration(300)}>
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
                    {weeklyChangePercent}% {translate(period === "weekly" ? "vsLastWeek" : "vsLastMonth", language)}
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

            <View style={[styles.card, styles.macroCard, { backgroundColor: theme.colors.card }]}>
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

            <View style={[styles.card, { backgroundColor: theme.colors.card, borderLeftWidth: 4, borderLeftColor: insightColor }]}>
              <View style={styles.insightHeader}>
                <Ionicons name={insightIcon} size={22} color={insightColor} />
                <Text style={[styles.cardEyebrow, { color: insightColor, marginLeft: 8 }]}>
                  {translate(period === "weekly" ? "weeklyHighlight" : "monthlyHighlight", language)}
                </Text>
              </View>
              <Text style={[styles.insightText, { color: theme.colors.text }]}>
                {insightText}
              </Text>
            </View>

            <View style={[styles.card, { backgroundColor: theme.colors.card }]}>
              <Text style={[styles.cardTitle, { color: theme.colors.primary }]}>
                {translate(period === "weekly" ? "thisWeekVsLast" : "thisMonthVsLast", language)}
              </Text>

              <View style={styles.comparisonRow}>
                <Text style={[styles.comparisonLabel, { color: theme.colors.mutedText }]}>
                  {translate(period === "weekly" ? "thisWeekLabel" : "thisMonthLabel", language)}
                </Text>
                <View style={[styles.comparisonBarTrack, { backgroundColor: theme.colors.cardSoft }]}>
                  <View
                    style={[
                      styles.comparisonBarFill,
                      {
                        width: `${maxChartValue > 0 ? Math.min((dailyAverage / maxChartValue) * 100, 100) : 0}%`,
                        backgroundColor: theme.colors.primary,
                      },
                    ]}
                  />
                </View>
                <Text style={[styles.comparisonValue, { color: theme.colors.text }]}>
                  {dailyAverage.toLocaleString()} {translate("kcalPerDayAvg", language)}
                </Text>
              </View>

              <View style={styles.comparisonRow}>
                <Text style={[styles.comparisonLabel, { color: theme.colors.mutedText }]}>
                  {translate(period === "weekly" ? "lastWeekLabel" : "lastMonthLabel", language)}
                </Text>
                <View style={[styles.comparisonBarTrack, { backgroundColor: theme.colors.cardSoft }]}>
                  <View
                    style={[
                      styles.comparisonBarFill,
                      {
                        width: `${maxChartValue > 0 ? Math.min((comparisonAverage / maxChartValue) * 100, 100) : 0}%`,
                        backgroundColor: theme.colors.mutedText,
                      },
                    ]}
                  />
                </View>
                <Text style={[styles.comparisonValue, { color: theme.colors.text }]}>
                  {comparisonAverage.toLocaleString()} {translate("kcalPerDayAvg", language)}
                </Text>
              </View>
            </View>

            <View style={[styles.card, { backgroundColor: theme.colors.card }]}>
              <View style={styles.exportHeader}>
                <Ionicons name="document-text-outline" size={22} color={theme.colors.primary} />
                <Text style={[styles.cardTitle, { color: theme.colors.primary, marginBottom: 0, marginLeft: 8 }]}>
                  {language === "tr" ? "Rapor" : "Report"}
                </Text>
              </View>
              <Text style={[styles.exportDescription, { color: theme.colors.mutedText }]}>
                {translate(period === "weekly" ? "downloadWeeklyPdf" : "downloadMonthlyPdf", language)}
              </Text>
              <Pressable
                style={[styles.exportButton, { backgroundColor: theme.colors.primary }]}
                onPress={handleExportPdf}
              >
                <Ionicons name="download-outline" size={18} color="#FFFFFF" />
                <Text style={styles.exportButtonText}>PDF</Text>
              </Pressable>
            </View>
          </Animated.View>
        ) : (
          <Animated.View entering={FadeIn.duration(300)}>
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
          </Animated.View>
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
  const [showValue, setShowValue] = useState(false);

  const heightPercent = Math.max(
    (calories / maxValue) * 100,
    calories > 0 ? 8 : 0,
  );

  return (
    <Pressable
      delayLongPress={250}
      onLongPress={() => setShowValue(true)}
      onPressOut={() => setShowValue(false)}
      style={styles.dayBarItem}
      accessibilityLabel={`${label}, ${calories.toLocaleString()} kcal`}
    >
      {showValue && (
        <View style={[styles.barTooltip, { backgroundColor: theme.colors.text }]}>
          <Text style={[styles.barTooltipText, { color: theme.colors.background }]}>
            {calories.toLocaleString()} kcal
          </Text>
        </View>
      )}
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
    </Pressable>
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
  macroCard: {
    borderRadius: 20,
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
    position: "relative",
  },
  barTooltip: {
    position: "absolute",
    top: -30,
    zIndex: 10,
    minWidth: 68,
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 8,
    alignItems: "center",
  },
  barTooltipText: {
    fontSize: 10,
    fontWeight: "700",
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
  },
  bentoCard: {
    flexBasis: "48%",
    flexShrink: 0,
    flexGrow: 0,
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
  insightHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  insightText: {
    fontSize: 14,
    fontWeight: "500",
    lineHeight: 22,
  },
  comparisonRow: {
    marginBottom: 12,
  },
  comparisonLabel: {
    fontSize: 12,
    fontWeight: "600",
    marginBottom: 6,
  },
  comparisonBarTrack: {
    height: 10,
    borderRadius: 999,
    overflow: "hidden",
    marginBottom: 4,
  },
  comparisonBarFill: {
    height: "100%",
    borderRadius: 999,
  },
  comparisonValue: {
    fontSize: 12,
    fontWeight: "600",
  },
  exportHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  exportDescription: {
    fontSize: 13,
    fontWeight: "500",
    marginBottom: 14,
  },
  exportButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 12,
    borderRadius: 12,
  },
  exportButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
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
