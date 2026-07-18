import { Ionicons } from "@expo/vector-icons";
import { router, type Href } from "expo-router";
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Screen } from "../../src/components/Screen";
import { translate } from "../../src/i18n/translations";
import { useAppStore } from "../../src/stores/appStore";
import { useAuthStore } from "../../src/stores/authStore";
import { useGoalStore } from "../../src/stores/goalStore";
import { useMealStore } from "../../src/stores/mealStore";
import { getTheme } from "../../src/theme/theme";
import { calculateMacroTargets } from "../../src/utils/calorieCalculator";

const PROTEIN_COLOR = "#1F4D3A";
const CARBS_COLOR = "#B8863B";
const FAT_COLOR = "#8C9C86";

export default function ProfileScreen() {
  const themeMode = useAppStore((s) => s.themeMode);
  const language = useAppStore((s) => s.language);
  const setThemeMode = useAppStore((s) => s.setThemeMode);
  const setLanguage = useAppStore((s) => s.setLanguage);
  const user = useAuthStore((s) => s.user);
  const token = useAuthStore((s) => s.token);
  const logout = useAuthStore((s) => s.logout);
  const deleteAccount = useAuthStore((s) => s.deleteAccount);
  const goal = useGoalStore((s) => s.goal);
  const clearGoal = useGoalStore((s) => s.clearGoal);
  const clearMeals = useMealStore((s) => s.clearMeals);
  const theme = getTheme(themeMode);

  const initials =
    user?.fullName
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2) || "??";

  const fallback = calculateMacroTargets(
    goal?.targetCalories ?? 2000,
    goal?.goalType ?? "maintain",
  );
  const targetProtein = goal?.targetProtein || fallback.protein;
  const targetCarbs = goal?.targetCarbs || fallback.carbs;
  const targetFat = goal?.targetFat || fallback.fat;
  const totalMacroGrams = targetProtein + targetCarbs + targetFat;

  const confirmClearMeals = () => {
    Alert.alert(
      translate("clearMealsTitle", language),
      translate("clearMealsMessage", language),
      [
        { text: translate("cancel", language), style: "cancel" },
        {
          text: translate("clear", language),
          style: "destructive",
          onPress: async () => {
            try {
              await clearMeals(token);
              Alert.alert(
                translate("clearMeals", language),
                translate("mealsCleared", language),
              );
            } catch (error) {
              Alert.alert(
                translate("error", language),
                error instanceof Error
                  ? error.message
                  : translate("genericError", language),
              );
            }
          },
        },
      ],
    );
  };

  const confirmLogout = () => {
    Alert.alert(
      translate("confirmLogout", language),
      translate("confirmLogoutMessage", language),
      [
        { text: translate("cancel", language), style: "cancel" },
        {
          text: translate("logout", language),
          style: "destructive",
          onPress: () => {
            clearMeals();
            clearGoal();
            logout();
            router.dismissAll();
          },
        },
      ],
    );
  };

  const confirmDeleteAccount = () => {
    Alert.alert(
      translate("confirmDeleteAccount", language),
      translate("confirmDeleteAccountMessage", language),
      [
        { text: translate("cancel", language), style: "cancel" },
        {
          text: translate("deleteAccount", language),
          style: "destructive",
          onPress: async () => {
            try {
              await deleteAccount();
              clearMeals();
              clearGoal();
              router.dismissAll();
            } catch (error) {
              Alert.alert(
                translate("error", language),
                error instanceof Error
                  ? error.message
                  : translate("accountDeleteFailed", language),
              );
            }
          },
        },
      ],
    );
  };

  return (
    <Screen>
      <ScrollView
        style={[styles.container, { backgroundColor: theme.colors.background }]}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <View style={[styles.avatar, { backgroundColor: theme.colors.primary }]}>
              <Text style={styles.avatarText}>{initials}</Text>
            </View>
            <View style={styles.headerInfo}>
              <Text style={[styles.userName, { color: theme.colors.text }]}>
                {user?.fullName || translate("guestUser", language)}
              </Text>
              <Text style={[styles.userMeta, { color: theme.colors.mutedText }]}>
                {translate("member", language)} · {user?.email || "-"}
              </Text>
            </View>
          </View>
          <Pressable
            style={[
              styles.settingsBtn,
              { backgroundColor: theme.colors.card, borderColor: theme.colors.border },
            ]}
          >
            <Ionicons name="settings-outline" size={17} color={theme.colors.mutedText} />
          </Pressable>
        </View>

        {/* Stats bar */}
        <View style={[styles.statsBar, { borderTopColor: theme.colors.border, borderBottomColor: theme.colors.border }]}>
          <View style={[styles.statItem, { borderRightColor: theme.colors.border }]}>
            <Text style={[styles.statValue, { color: theme.colors.text }]}>
              {goal?.heightCm ?? "-"}
            </Text>
            <Text style={[styles.statLabel, { color: theme.colors.mutedText }]}>
              CM {translate("height", language).toUpperCase()}
            </Text>
          </View>
          <View style={[styles.statItem, { borderRightColor: theme.colors.border }]}>
            <Text style={[styles.statValue, { color: theme.colors.text }]}>
              {goal?.weightKg ?? "-"}
            </Text>
            <Text style={[styles.statLabel, { color: theme.colors.mutedText }]}>
              KG {translate("weight", language).toUpperCase()}
            </Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: theme.colors.text }]}>
              {goal?.age ?? "-"}
            </Text>
            <Text style={[styles.statLabel, { color: theme.colors.mutedText }]}>
              {translate("age", language).toUpperCase()}
            </Text>
          </View>
        </View>

        {/* Account card */}
        <View style={[styles.card, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
          <View style={styles.cardHeader}>
            <Text style={[styles.cardTitle, { color: theme.colors.mutedText }]}>
              {translate("account", language)}
            </Text>
            {user?.emailVerified ? (
              <View style={[styles.badge, { backgroundColor: theme.colors.primarySoft }]}>
                <Text style={[styles.badgeText, { color: theme.colors.primary }]}>
                  {translate("emailVerified", language)}
                </Text>
              </View>
            ) : null}
          </View>
          <View style={[styles.fieldRow, { borderTopColor: theme.colors.border }]}>
            <Text style={[styles.fieldLabel, { color: theme.colors.mutedText }]}>
              {translate("fullName", language).toUpperCase()}
            </Text>
            <Text style={[styles.fieldValue, { color: theme.colors.text }]}>
              {user?.fullName || translate("guestUser", language)}
            </Text>
          </View>
          <View style={[styles.fieldRow, { borderTopColor: theme.colors.border }]}>
            <Text style={[styles.fieldLabel, { color: theme.colors.mutedText }]}>
              {translate("email", language).toUpperCase()}
            </Text>
            <Text style={[styles.fieldValue, { color: theme.colors.text }]}>
              {user?.email || "-"}
            </Text>
          </View>
        </View>

        {/* Goal card */}
        <View style={[styles.card, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
          <View style={[styles.goalTopBorder, { backgroundColor: theme.colors.text }]} />
          <View style={styles.goalHeader}>
            <Text style={[styles.goalTitle, { color: theme.colors.text }]}>
              {translate("goalSummary", language)}
            </Text>
          </View>
          <View style={[styles.goalBody, { borderBottomColor: theme.colors.text }]}>
            {goal ? (
              <>
                <View style={styles.calorieRow}>
                  <Text style={[styles.calorieValue, { color: theme.colors.text }]}>
                    {goal.targetCalories}
                  </Text>
                  <Text style={[styles.calorieUnit, { color: theme.colors.mutedText }]}>
                    kcal / {translate("day", language)}
                  </Text>
                </View>

                <View style={styles.progressBar}>
                  <View
                    style={[
                      styles.progressSegment,
                      {
                        width: `${(targetProtein / totalMacroGrams) * 100}%`,
                        backgroundColor: themeMode === "dark" ? "#6ED28A" : PROTEIN_COLOR,
                      },
                    ]}
                  />
                  <View
                    style={[
                      styles.progressSegment,
                      {
                        width: `${(targetCarbs / totalMacroGrams) * 100}%`,
                        backgroundColor: themeMode === "dark" ? "#FFB36B" : CARBS_COLOR,
                      },
                    ]}
                  />
                  <View
                    style={[
                      styles.progressSegment,
                      {
                        width: `${(targetFat / totalMacroGrams) * 100}%`,
                        backgroundColor: themeMode === "dark" ? "#C58BFF" : FAT_COLOR,
                      },
                    ]}
                  />
                </View>

                <MacroRow
                  color={themeMode === "dark" ? "#6ED28A" : PROTEIN_COLOR}
                  label={translate("protein", language)}
                  value={`${targetProtein} g`}
                  border
                  theme={theme}
                />
                <MacroRow
                  color={themeMode === "dark" ? "#FFB36B" : CARBS_COLOR}
                  label={translate("carbs", language)}
                  value={`${targetCarbs} g`}
                  border
                  theme={theme}
                />
                <MacroRow
                  color={themeMode === "dark" ? "#C58BFF" : FAT_COLOR}
                  label={translate("fat", language)}
                  value={`${targetFat} g`}
                  theme={theme}
                />
              </>
            ) : (
              <Text style={[styles.emptyText, { color: theme.colors.mutedText }]}>
                {translate("noGoalYet", language)}
              </Text>
            )}
          </View>
          <Pressable
            style={styles.goalEditBtn}
            onPress={() => router.push("/goal" as Href)}
          >
            <Ionicons name="flag-outline" size={15} color={theme.colors.primary} />
            <Text style={[styles.goalEditText, { color: theme.colors.primary }]}>
              {translate("editGoal", language)}
            </Text>
          </Pressable>
        </View>

        {/* Preferences */}
        <View style={[styles.card, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
          <Text style={[styles.prefsTitle, { color: theme.colors.mutedText }]}>
            {translate("preferences", language)}
          </Text>
          <Text style={[styles.prefsLabel, { color: theme.colors.mutedText }]}>
            {translate("theme", language).toUpperCase()}
          </Text>
          <View style={[styles.segmentGrid, { borderColor: theme.colors.border }]}>
            <Pressable
              onPress={() => setThemeMode("light")}
              style={[
                styles.segmentOption,
                {
                  backgroundColor: themeMode === "light" ? theme.colors.primary : "transparent",
                  borderRightColor: theme.colors.border,
                },
              ]}
            >
              <Text
                style={{
                  fontSize: 13,
                  fontWeight: "500",
                  color: themeMode === "light" ? "#FFFFFF" : theme.colors.mutedText,
                }}
              >
                {translate("lightTheme", language)}
              </Text>
            </Pressable>
            <Pressable
              onPress={() => setThemeMode("dark")}
              style={[
                styles.segmentOption,
                { backgroundColor: themeMode === "dark" ? theme.colors.primary : "transparent" },
              ]}
            >
              <Text
                style={{
                  fontSize: 13,
                  fontWeight: "500",
                  color: themeMode === "dark" ? "#FFFFFF" : theme.colors.mutedText,
                }}
              >
                {translate("darkTheme", language)}
              </Text>
            </Pressable>
          </View>

          <Text style={[styles.prefsLabel, { color: theme.colors.mutedText, marginTop: 12 }]}>
            {translate("language", language).toUpperCase()}
          </Text>
          <View style={[styles.segmentGrid, { borderColor: theme.colors.border }]}>
            <Pressable
              onPress={() => setLanguage("tr")}
              style={[
                styles.segmentOption,
                {
                  backgroundColor: language === "tr" ? theme.colors.primary : "transparent",
                  borderRightColor: theme.colors.border,
                },
              ]}
            >
              <Text
                style={{
                  fontSize: 13,
                  fontWeight: "500",
                  color: language === "tr" ? "#FFFFFF" : theme.colors.mutedText,
                }}
              >
                {translate("turkish", language)}
              </Text>
            </Pressable>
            <Pressable
              onPress={() => setLanguage("en")}
              style={[
                styles.segmentOption,
                { backgroundColor: language === "en" ? theme.colors.primary : "transparent" },
              ]}
            >
              <Text
                style={{
                  fontSize: 13,
                  fontWeight: "500",
                  color: language === "en" ? "#FFFFFF" : theme.colors.mutedText,
                }}
              >
                {translate("english", language)}
              </Text>
            </Pressable>
          </View>
        </View>

        {/* Data */}
        <View style={[styles.card, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
          <Pressable style={styles.dataRow} onPress={confirmClearMeals}>
            <View style={styles.dataLeft}>
              <Ionicons name="trash-outline" size={16} color={theme.colors.danger} />
              <Text style={[styles.dataText, { color: theme.colors.danger }]}>
                {translate("clearMeals", language)}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={15} color={theme.colors.mutedText} />
          </Pressable>
        </View>

        {/* App info */}
        <View style={styles.appInfo}>
          <View style={[styles.appInfoIcon, { backgroundColor: theme.colors.primary }]}>
            <Ionicons name="leaf" size={17} color="#FFFFFF" />
          </View>
          <Text style={[styles.appInfoName, { color: theme.colors.text }]}>NutriTrack</Text>
          <Text style={[styles.appInfoDesc, { color: theme.colors.mutedText }]}>
            {translate("version", language)} 1.0.0 · {translate("smartNutritionTracking", language)}
          </Text>
        </View>

        {/* Action buttons */}
        <View style={styles.actions}>
          <Pressable
            style={[styles.logoutBtn, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}
            onPress={confirmLogout}
          >
            <Ionicons name="log-out-outline" size={16} color={theme.colors.text} />
            <Text style={[styles.logoutText, { color: theme.colors.text }]}>
              {translate("logout", language)}
            </Text>
          </Pressable>
          <Pressable
            style={styles.deleteBtn}
            onPress={confirmDeleteAccount}
          >
            <Ionicons name="person-remove-outline" size={16} color="#A13B2E" />
            <Text style={styles.deleteText}>
              {translate("deleteAccount", language)}
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </Screen>
  );
}

function MacroRow({
  color,
  label,
  value,
  border,
  theme,
}: {
  color: string;
  label: string;
  value: string;
  border?: boolean;
  theme: ReturnType<typeof getTheme>;
}) {
  return (
    <View style={[styles.macroRow, border && { borderTopColor: theme.colors.border }]}>
      <View style={styles.macroLeft}>
        <View style={[styles.macroDot, { backgroundColor: color }]} />
        <Text style={[styles.macroLabel, { color: theme.colors.text }]}>{label}</Text>
      </View>
      <Text style={[styles.macroValue, { color: theme.colors.text }]}>{value}</Text>
    </View>
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
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginTop: 8,
    marginBottom: 18,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    fontFamily: "serif",
    fontWeight: "500",
    fontSize: 18,
    color: "#F4F6F1",
  },
  headerInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 22,
    fontWeight: "500",
    fontFamily: "serif",
  },
  userMeta: {
    marginTop: 2,
    fontSize: 12,
    letterSpacing: 0.02,
  },
  settingsBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 0.5,
    alignItems: "center",
    justifyContent: "center",
  },
  statsBar: {
    flexDirection: "row",
    borderTopWidth: 1,
    borderBottomWidth: 1,
    marginBottom: 20,
  },
  statItem: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 12,
    borderRightWidth: 1,
  },
  statValue: {
    fontSize: 19,
    fontWeight: "500",
    fontVariant: ["tabular-nums"],
  },
  statLabel: {
    marginTop: 2,
    fontSize: 10,
    letterSpacing: 0.08,
    textTransform: "uppercase",
  },
  card: {
    borderWidth: 0.5,
    borderRadius: 12,
    marginBottom: 16,
    overflow: "hidden",
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 18,
    paddingTop: 14,
    paddingBottom: 14,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: "500",
    fontFamily: "serif",
  },
  badge: {
    paddingHorizontal: 9,
    paddingVertical: 3,
    borderRadius: 20,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: "500",
  },
  fieldRow: {
    paddingHorizontal: 18,
    paddingVertical: 9,
    borderTopWidth: 0.5,
  },
  fieldLabel: {
    marginBottom: 3,
    fontSize: 10,
    textTransform: "uppercase",
    letterSpacing: 0.06,
  },
  fieldValue: {
    fontSize: 14,
    fontWeight: "500",
  },
  goalTopBorder: {
    height: 6,
  },
  goalHeader: {
    paddingHorizontal: 18,
    paddingTop: 14,
    paddingBottom: 6,
  },
  goalTitle: {
    fontSize: 19,
    fontWeight: "600",
    fontFamily: "serif",
    letterSpacing: -0.01,
  },
  goalBody: {
    paddingHorizontal: 18,
    paddingBottom: 12,
    borderBottomWidth: 5,
  },
  calorieRow: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 6,
    paddingTop: 8,
    paddingBottom: 8,
    borderTopWidth: 1,
    borderTopColor: "#16241C",
  },
  calorieValue: {
    fontSize: 34,
    fontWeight: "500",
    fontVariant: ["tabular-nums"],
  },
  calorieUnit: {
    fontSize: 13,
  },
  progressBar: {
    height: 8,
    borderRadius: 2,
    flexDirection: "row",
    overflow: "hidden",
    marginVertical: 4,
    marginBottom: 14,
  },
  progressSegment: {
    height: 8,
  },
  macroRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 7,
    borderTopWidth: 0.5,
  },
  macroLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  macroDot: {
    width: 8,
    height: 8,
    borderRadius: 2,
  },
  macroLabel: {
    fontSize: 13,
  },
  macroValue: {
    fontSize: 13,
    fontVariant: ["tabular-nums"],
  },
  goalEditBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 13,
  },
  goalEditText: {
    fontSize: 13,
    fontWeight: "500",
  },
  prefsTitle: {
    paddingHorizontal: 18,
    paddingTop: 14,
    paddingBottom: 14,
    fontSize: 14,
    fontWeight: "500",
    fontFamily: "serif",
  },
  prefsLabel: {
    paddingHorizontal: 18,
    marginBottom: 6,
    fontSize: 11,
    textTransform: "uppercase",
    letterSpacing: 0.06,
  },
  segmentGrid: {
    flexDirection: "row",
    marginHorizontal: 18,
    marginBottom: 12,
    borderWidth: 0.5,
    borderRadius: 8,
    overflow: "hidden",
  },
  segmentOption: {
    flex: 1,
    paddingVertical: 9,
    alignItems: "center",
    justifyContent: "center",
    borderRightWidth: 0.5,
  },
  dataRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 13,
    paddingHorizontal: 18,
  },
  dataLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  dataText: {
    fontSize: 13,
    fontWeight: "500",
  },
  appInfo: {
    alignItems: "center",
    paddingVertical: 18,
  },
  appInfoIcon: {
    width: 34,
    height: 34,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  appInfoName: {
    fontSize: 13,
    fontWeight: "500",
  },
  appInfoDesc: {
    marginTop: 2,
    fontSize: 11,
  },
  actions: {
    gap: 8,
    marginBottom: 20,
  },
  logoutBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 12,
    borderWidth: 0.5,
    borderRadius: 10,
  },
  logoutText: {
    fontSize: 13,
    fontWeight: "500",
  },
  deleteBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 12,
    borderWidth: 0.5,
    borderRadius: 10,
    backgroundColor: "#FCEBEB",
    borderColor: "#E7B4AC",
  },
  deleteText: {
    fontSize: 13,
    fontWeight: "500",
    color: "#A13B2E",
  },
  emptyText: {
    fontSize: 13,
    fontWeight: "500",
    paddingVertical: 8,
  },
});
