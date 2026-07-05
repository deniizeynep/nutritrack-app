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

export default function ProfileScreen() {
  const themeMode = useAppStore((state) => state.themeMode);
  const language = useAppStore((state) => state.language);
  const setThemeMode = useAppStore((state) => state.setThemeMode);
  const setLanguage = useAppStore((state) => state.setLanguage);
  const user = useAuthStore((state) => state.user);
  const token = useAuthStore((state) => state.token);
  const logout = useAuthStore((state) => state.logout);
  const deleteAccount = useAuthStore((state) => state.deleteAccount);
  const goal = useGoalStore((state) => state.goal);
  const clearGoal = useGoalStore((state) => state.clearGoal);
  const clearMeals = useMealStore((state) => state.clearMeals);
  const theme = getTheme(themeMode);
  const fallbackMacroTargets = calculateMacroTargets(
    goal?.targetCalories ?? 2000,
    goal?.goalType ?? "maintain",
  );
  const targetProtein = goal?.targetProtein || fallbackMacroTargets.protein;
  const targetCarbs = goal?.targetCarbs || fallbackMacroTargets.carbs;
  const targetFat = goal?.targetFat || fallbackMacroTargets.fat;

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
                error instanceof Error ? error.message : translate("genericError", language),
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
            router.replace("/" as Href);
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
              router.replace("/" as Href);
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
        <View style={styles.headerArea}>
          <View style={[styles.avatarBox, { backgroundColor: theme.colors.primarySoft }]}> 
            <Ionicons name="person-outline" size={34} color={theme.colors.primary} />
          </View>

          <Text style={[styles.title, { color: theme.colors.text }]}> 
            {user?.fullName || translate("guestUser", language)}
          </Text>
          <Text style={[styles.subtitle, { color: theme.colors.mutedText }]}> 
            {translate("profileSubtitle", language)}
          </Text>
        </View>

        <Section title={translate("account", language)}>
          <InfoRow
            label={translate("fullName", language)}
            value={user?.fullName || translate("guestUser", language)}
          />
          <InfoRow label={translate("email", language)} value={user?.email || "-"} />
          <InfoRow
            label={translate("emailVerificationStatus", language)}
            value={
              user?.emailVerified
                ? translate("emailVerified", language)
                : translate("emailNotVerifiedStatus", language)
            }
          />
        </Section>

        <Section title={translate("goalSummary", language)}>
          {goal ? (
            <View>
              <InfoRow
                label={translate("targetCalories", language)}
                value={`${goal.targetCalories} kcal`}
              />
              <InfoRow
                label={translate("targetProtein", language)}
                value={`${targetProtein}g`}
              />
              <InfoRow
                label={translate("targetCarbs", language)}
                value={`${targetCarbs}g`}
              />
              <InfoRow label={translate("targetFat", language)} value={`${targetFat}g`} />
            </View>
          ) : (
            <Text style={[styles.emptyText, { color: theme.colors.mutedText }]}> 
              {translate("noGoalYet", language)}
            </Text>
          )}

          <ActionButton
            label={translate("editGoal", language)}
            icon="flag-outline"
            onPress={() => router.push("/goal" as Href)}
          />
        </Section>

        <Section title={translate("preferences", language)}>
          <Text style={[styles.groupLabel, { color: theme.colors.mutedText }]}> 
            {translate("theme", language)}
          </Text>
          <View style={styles.segmentRow}>
            <ChoicePill
              label={translate("lightTheme", language)}
              selected={themeMode === "light"}
              onPress={() => setThemeMode("light")}
            />
            <ChoicePill
              label={translate("darkTheme", language)}
              selected={themeMode === "dark"}
              onPress={() => setThemeMode("dark")}
            />
          </View>

          <Text style={[styles.groupLabel, { color: theme.colors.mutedText }]}> 
            {translate("language", language)}
          </Text>
          <View style={styles.segmentRow}>
            <ChoicePill
              label={translate("turkish", language)}
              selected={language === "tr"}
              onPress={() => setLanguage("tr")}
            />
            <ChoicePill
              label={translate("english", language)}
              selected={language === "en"}
              onPress={() => setLanguage("en")}
            />
          </View>
        </Section>

        <Section title={translate("data", language)}>
          <DangerButton
            icon="trash-outline"
            label={translate("clearMeals", language)}
            onPress={confirmClearMeals}
          />
        </Section>

        <Section title={translate("appInfo", language)}>
          <InfoRow label="NutriTrack" value="" />
          <InfoRow label={translate("version", language)} value="1.0.0" />
          <InfoRow
            label={translate("description", language)}
            value={translate("smartNutritionTracking", language)}
          />
        </Section>

        <Section title={translate("accountActions", language)}>
          <DangerButton
            icon="log-out-outline"
            label={translate("logout", language)}
            onPress={confirmLogout}
          />
          <View style={styles.actionGap} />
          <DangerButton
            icon="person-remove-outline"
            label={translate("deleteAccount", language)}
            onPress={confirmDeleteAccount}
          />
        </Section>
      </ScrollView>
    </Screen>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  const themeMode = useAppStore((state) => state.themeMode);
  const theme = getTheme(themeMode);

  return (
    <View style={[styles.section, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}> 
      <Text style={[styles.sectionTitle, { color: theme.colors.text }]}> 
        {title}
      </Text>
      {children}
    </View>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  const themeMode = useAppStore((state) => state.themeMode);
  const theme = getTheme(themeMode);

  return (
    <View style={styles.infoRow}>
      <Text style={[styles.infoLabel, { color: theme.colors.mutedText }]}> 
        {label}
      </Text>
      <Text style={[styles.infoValue, { color: theme.colors.text }]}> 
        {value}
      </Text>
    </View>
  );
}

function ChoicePill({
  label,
  selected,
  onPress,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
}) {
  const themeMode = useAppStore((state) => state.themeMode);
  const theme = getTheme(themeMode);

  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.choicePill,
        {
          backgroundColor: selected ? theme.colors.primary : theme.colors.cardSoft,
          borderColor: selected ? theme.colors.primary : theme.colors.border,
        },
      ]}
    >
      <Text style={[styles.choiceText, { color: selected ? "#FFFFFF" : theme.colors.text }]}> 
        {label}
      </Text>
    </Pressable>
  );
}

function ActionButton({
  icon,
  label,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
}) {
  const themeMode = useAppStore((state) => state.themeMode);
  const theme = getTheme(themeMode);

  return (
    <Pressable
      onPress={onPress}
      style={[styles.actionButton, { backgroundColor: theme.colors.primarySoft }]}
    >
      <Ionicons name={icon} size={18} color={theme.colors.primary} />
      <Text style={[styles.actionText, { color: theme.colors.primary }]}> 
        {label}
      </Text>
    </Pressable>
  );
}

function DangerButton({
  icon,
  label,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
}) {
  const themeMode = useAppStore((state) => state.themeMode);
  const theme = getTheme(themeMode);

  return (
    <Pressable
      onPress={onPress}
      style={[styles.dangerButton, { backgroundColor: theme.colors.cardSoft }]}
    >
      <Ionicons name={icon} size={19} color={theme.colors.danger} />
      <Text style={[styles.dangerText, { color: theme.colors.danger }]}> 
        {label}
      </Text>
    </Pressable>
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
  headerArea: {
    marginTop: 8,
    marginBottom: 24,
    alignItems: "center",
  },
  avatarBox: {
    width: 70,
    height: 70,
    borderRadius: 26,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 18,
  },
  title: {
    fontSize: 32,
    fontWeight: "900",
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
  section: {
    borderWidth: 1,
    borderRadius: 24,
    padding: 18,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "900",
    marginBottom: 16,
  },
  infoRow: {
    minHeight: 34,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  infoLabel: {
    flex: 1,
    fontSize: 13,
    fontWeight: "700",
  },
  infoValue: {
    flex: 1,
    fontSize: 13,
    fontWeight: "900",
    textAlign: "right",
  },
  emptyText: {
    fontSize: 13,
    lineHeight: 19,
    fontWeight: "700",
  },
  groupLabel: {
    marginTop: 2,
    marginBottom: 10,
    fontSize: 13,
    fontWeight: "900",
  },
  segmentRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 16,
  },
  choicePill: {
    flex: 1,
    minHeight: 44,
    borderRadius: 999,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 12,
  },
  choiceText: {
    fontSize: 13,
    fontWeight: "900",
  },
  actionButton: {
    marginTop: 16,
    minHeight: 48,
    borderRadius: 17,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  actionText: {
    fontSize: 14,
    fontWeight: "900",
  },
  dangerButton: {
    minHeight: 48,
    borderRadius: 17,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  dangerText: {
    fontSize: 14,
    fontWeight: "900",
  },
  actionGap: {
    height: 10,
  },
});
