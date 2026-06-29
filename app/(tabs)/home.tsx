import { Ionicons } from "@expo/vector-icons";
import { router, type Href } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { MacroProgress } from "../../src/components/MacroProgress";
import { MealCard } from "../../src/components/MealCard";
import { Screen } from "../../src/components/Screen";
import { translate } from "../../src/i18n/translations";
import { useAppStore } from "../../src/stores/appStore";
import { useGoalStore } from "../../src/stores/goalStore";
import { getTheme } from "../../src/theme/theme";

export default function HomeScreen() {
  const themeMode = useAppStore((state) => state.themeMode);
  const language = useAppStore((state) => state.language);
  const toggleTheme = useAppStore((state) => state.toggleTheme);
  const setLanguage = useAppStore((state) => state.setLanguage);

  const theme = getTheme(themeMode);
  const goal = useGoalStore((state) => state.goal);

  const consumedCalories = 1420;
  const targetCalories = goal?.targetCalories ?? 2000;
  const remainingCalories = targetCalories - consumedCalories;
  const progressPercent = Math.min(
    (consumedCalories / targetCalories) * 100,
    100,
  );

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
        <View style={styles.header}>
          <Pressable
            style={[
              styles.iconButton,
              {
                backgroundColor: theme.colors.card,
                borderColor: theme.colors.border,
              },
            ]}
          >
            <Ionicons name="menu-outline" size={24} color={theme.colors.text} />
          </Pressable>

          <Text style={[styles.headerTitle, { color: theme.colors.text }]}>
            {translate("today", language)}
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

            {goal ? (
              <View
                style={[
                  styles.savedGoalBadge,
                  {
                    backgroundColor: theme.colors.primarySoft,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.savedGoalText,
                    { color: theme.colors.primary },
                  ]}
                >
                  {translate("savedGoal", language)}
                </Text>
              </View>
            ) : null}
          </View>

          <View style={styles.calorieCenter}>
            <View
              style={[
                styles.calorieRing,
                {
                  borderColor: theme.colors.primarySoft,
                },
              ]}
            >
              <View
                style={[
                  styles.calorieRingInner,
                  {
                    borderColor: theme.colors.primary,
                  },
                ]}
              >
                <Text
                  style={[styles.calorieNumber, { color: theme.colors.text }]}
                >
                  {consumedCalories.toLocaleString("tr-TR")}
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
                  style={[styles.remaining, { color: theme.colors.primary }]}
                >
                  {translate("remaining", language)} {remainingCalories} kcal
                </Text>
              </View>
            </View>
          </View>

          <View
            style={[
              styles.mainProgressTrack,
              {
                backgroundColor: theme.colors.cardSoft,
              },
            ]}
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
              current={78}
              target={120}
              color={theme.colors.protein}
            />

            <MacroProgress
              label={translate("carbs", language)}
              current={142}
              target={250}
              color={theme.colors.carbs}
            />

            <MacroProgress
              label={translate("fat", language)}
              current={48}
              target={65}
              color={theme.colors.fat}
            />
          </View>
          <Pressable
            onPress={() => router.push("/goal" as Href)}
            style={[
              styles.goalButton,
              {
                backgroundColor: theme.colors.primarySoft,
              },
            ]}
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
        </View>

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

        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            {translate("meals", language)}
          </Text>

          <Text style={[styles.seeAll, { color: theme.colors.primary }]}>
            Daha fazla
          </Text>
        </View>

        <View style={styles.mealList}>
          <MealCard
            icon="🥣"
            title={translate("breakfast", language)}
            items="Yulaf ezmesi, muz, süt"
            calories={520}
          />

          <MealCard
            icon="🍝"
            title={translate("lunch", language)}
            items="Penne makarna"
            calories={450}
          />

          <MealCard
            icon="🥗"
            title={translate("dinner", language)}
            items="Tavuklu salata"
            calories={320}
          />
        </View>
      </ScrollView>
    </Screen>
  );
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
    marginBottom: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
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
  summaryCard: {
    borderWidth: 1,
    borderRadius: 28,
    padding: 20,
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: "800",
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
  seeAll: {
    fontSize: 13,
    fontWeight: "800",
  },
  mealList: {
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
  summaryHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 18,
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
});
