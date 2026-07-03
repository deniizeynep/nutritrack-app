import { Ionicons } from "@expo/vector-icons";
import { router, type Href } from "expo-router";
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
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

  const goal = useGoalStore((state) => state.goal);
  const clearGoal = useGoalStore((state) => state.clearGoal);
  const clearMeals = useMealStore((state) => state.clearMeals);
  const meals = useMealStore((state) => state.meals);

  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const deleteAccount = useAuthStore((state) => state.deleteAccount);

  const theme = getTheme(themeMode);

  const totalCalories = meals.reduce((total, meal) => total + meal.calories, 0);
  const fallbackMacroTargets = calculateMacroTargets(
    goal?.targetCalories ?? 2000,
    goal?.goalType ?? "maintain",
  );
  const targetProtein = goal?.targetProtein || fallbackMacroTargets.protein;
  const targetCarbs = goal?.targetCarbs || fallbackMacroTargets.carbs;
  const targetFat = goal?.targetFat || fallbackMacroTargets.fat;

  const confirmLogout = () => {
    Alert.alert(
      translate("confirmLogout", language),
      translate("confirmLogoutMessage", language),
      [
        {
          text: translate("cancel", language),
          style: "cancel",
        },
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
        {
          text: translate("cancel", language),
          style: "cancel",
        },
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
          <View
            style={[
              styles.avatarBox,
              {
                backgroundColor: theme.colors.primarySoft,
              },
            ]}
          >
            <Ionicons
              name="person-outline"
              size={34}
              color={theme.colors.primary}
            />
          </View>

          <Text style={[styles.title, { color: theme.colors.text }]}>
            {user?.fullName || translate("guestUser", language)}
          </Text>

          <Text style={[styles.subtitle, { color: theme.colors.mutedText }]}>
            {user?.email || translate("profileSubtitle", language)}
          </Text>
        </View>

        <View style={styles.statsRow}>
          <MiniStat
            icon="flame-outline"
            label={translate("calories", language)}
            value={`${totalCalories} kcal`}
          />

          <MiniStat
            icon="restaurant-outline"
            label={translate("meals", language)}
            value={`${meals.length}`}
          />
        </View>

        <Section title={translate("goalSummary", language)}>
          {goal ? (
            <View>
              <View style={styles.goalRow}>
                <View>
                  <Text
                    style={[
                      styles.goalLabel,
                      { color: theme.colors.mutedText },
                    ]}
                  >
                    {translate("dailyTarget", language)}
                  </Text>

                  <Text
                    style={[styles.goalValue, { color: theme.colors.text }]}
                  >
                    {goal.targetCalories} kcal
                  </Text>
                </View>

                <Pressable
                  onPress={() => router.push("/goal" as Href)}
                  style={[
                    styles.smallAction,
                    {
                      backgroundColor: theme.colors.primarySoft,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.smallActionText,
                      { color: theme.colors.primary },
                    ]}
                  >
                    {translate("editGoal", language)}
                  </Text>
                </Pressable>
              </View>

              <View
                style={[
                  styles.divider,
                  { backgroundColor: theme.colors.border },
                ]}
              />

              <InfoRow
                label={translate("weight", language)}
                value={`${goal.weightKg} kg`}
              />
              <InfoRow
                label={translate("height", language)}
                value={`${goal.heightCm} cm`}
              />
              <InfoRow
                label={translate("estimatedBmr", language)}
                value={`${goal.bmr} kcal`}
              />
              <InfoRow
                label={translate("targetProtein", language)}
                value={`${targetProtein}g`}
              />
              <InfoRow
                label={translate("targetCarbs", language)}
                value={`${targetCarbs}g`}
              />
              <InfoRow
                label={translate("targetFat", language)}
                value={`${targetFat}g`}
              />
            </View>
          ) : (
            <View style={styles.emptyGoal}>
              <Text
                style={[styles.emptyText, { color: theme.colors.mutedText }]}
              >
                {translate("noGoalYet", language)}
              </Text>

              <Pressable
                onPress={() => router.push("/goal" as Href)}
                style={[
                  styles.fullAction,
                  {
                    backgroundColor: theme.colors.primary,
                  },
                ]}
              >
                <Text style={styles.fullActionText}>
                  {translate("goalSetup", language)}
                </Text>
              </Pressable>
            </View>
          )}
        </Section>

        <Section title={translate("account", language)}>
          <DangerRow
            icon="log-out-outline"
            label={translate("logout", language)}
            onPress={confirmLogout}
          />

          <DangerRow
            icon="person-remove-outline"
            label={translate("deleteAccount", language)}
            onPress={confirmDeleteAccount}
          />
        </Section>

      </ScrollView>
    </Screen>
  );
}

type MiniStatProps = {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
};

function MiniStat({ icon, label, value }: MiniStatProps) {
  const themeMode = useAppStore((state) => state.themeMode);
  const theme = getTheme(themeMode);

  return (
    <View
      style={[
        styles.miniStat,
        {
          backgroundColor: theme.colors.card,
          borderColor: theme.colors.border,
        },
      ]}
    >
      <View
        style={[
          styles.miniIconBox,
          {
            backgroundColor: theme.colors.primarySoft,
          },
        ]}
      >
        <Ionicons name={icon} size={20} color={theme.colors.primary} />
      </View>

      <Text style={[styles.miniValue, { color: theme.colors.text }]}>
        {value}
      </Text>
      <Text style={[styles.miniLabel, { color: theme.colors.mutedText }]}>
        {label}
      </Text>
    </View>
  );
}

type SectionProps = {
  title: string;
  children: React.ReactNode;
};

function Section({ title, children }: SectionProps) {
  const themeMode = useAppStore((state) => state.themeMode);
  const theme = getTheme(themeMode);

  return (
    <View
      style={[
        styles.section,
        {
          backgroundColor: theme.colors.card,
          borderColor: theme.colors.border,
        },
      ]}
    >
      <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
        {title}
      </Text>
      {children}
    </View>
  );
}

type InfoRowProps = {
  label: string;
  value: string;
};

function InfoRow({ label, value }: InfoRowProps) {
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

type DangerRowProps = {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
};

function DangerRow({ icon, label, onPress }: DangerRowProps) {
  const themeMode = useAppStore((state) => state.themeMode);
  const theme = getTheme(themeMode);

  return (
    <Pressable onPress={onPress} style={styles.settingRow}>
      <View style={styles.settingLeft}>
        <View
          style={[
            styles.settingIcon,
            {
              backgroundColor: theme.colors.cardSoft,
            },
          ]}
        >
          <Ionicons name={icon} size={19} color={theme.colors.danger} />
        </View>

        <Text style={[styles.settingLabel, { color: theme.colors.danger }]}>
          {label}
        </Text>
      </View>
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
  statsRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 16,
  },
  miniStat: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 22,
    padding: 14,
  },
  miniIconBox: {
    width: 38,
    height: 38,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  miniValue: {
    fontSize: 17,
    fontWeight: "900",
  },
  miniLabel: {
    marginTop: 4,
    fontSize: 12,
    fontWeight: "700",
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
  goalRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  goalLabel: {
    fontSize: 12,
    fontWeight: "800",
    marginBottom: 4,
  },
  goalValue: {
    fontSize: 26,
    fontWeight: "900",
  },
  smallAction: {
    minHeight: 38,
    borderRadius: 999,
    paddingHorizontal: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  smallActionText: {
    fontSize: 12,
    fontWeight: "900",
  },
  divider: {
    height: 1,
    marginVertical: 16,
  },
  infoRow: {
    minHeight: 32,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  infoLabel: {
    fontSize: 13,
    fontWeight: "700",
  },
  infoValue: {
    fontSize: 13,
    fontWeight: "900",
    flexShrink: 1,
    marginLeft: 12,
    textAlign: "right",
  },
  emptyGoal: {
    gap: 14,
  },
  emptyText: {
    fontSize: 13,
    fontWeight: "700",
    lineHeight: 19,
  },
  fullAction: {
    height: 48,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
  },
  fullActionText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "900",
  },
  settingRow: {
    minHeight: 54,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  settingLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  settingIcon: {
    width: 38,
    height: 38,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  settingLabel: {
    fontSize: 14,
    fontWeight: "800",
  },
});
