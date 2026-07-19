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
import { formatWeight } from "../../src/utils/units";

export default function ProfileScreen() {
  const themeMode = useAppStore((state) => state.themeMode);
  const language = useAppStore((state) => state.language);
  const unitSystem = useAppStore((state) => state.unitSystem);
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const goal = useGoalStore((state) => state.goal);
  const clearGoal = useGoalStore((state) => state.clearGoal);
  const clearMeals = useMealStore((state) => state.clearMeals);
  const theme = getTheme(themeMode);
  const displayName = user?.fullName || translate("guestUser", language);

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
            router.replace("/");
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
          <View style={styles.identityRow}>
            <View
              style={[
                styles.avatarBox,
                { backgroundColor: theme.colors.primary },
              ]}
            >
              <Text style={styles.avatarText}>{getInitials(displayName)}</Text>
            </View>

            <View style={styles.identityInfo}>
              <Text
                numberOfLines={1}
                style={[styles.title, { color: theme.colors.text }]}
              >
                {displayName}
              </Text>
              <Text
                numberOfLines={1}
                style={[styles.subtitle, { color: theme.colors.mutedText }]}
              >
                {translate("member", language)} · {user?.email || "-"}
              </Text>
            </View>
          </View>

          <View style={styles.profileMetricsRow}>
            <ProfileMetricCard
              label={translate("profileWeight", language)}
              value={goal?.weightKg ? formatWeight(goal.weightKg, unitSystem) : "-"}
            />
            <ProfileMetricCard
              label={translate("profileTargetCalories", language)}
              value={goal?.targetCalories ? `${goal.targetCalories} kcal` : "-"}
            />
          </View>
        </View>

        <View style={styles.menuList}>
          <ProfileMenuItem
            icon="person-outline"
            title={translate("personalInformation", language)}
            subtitle={translate("personalInformationSubtitle", language)}
            href="/profile-personal"
          />
          <ProfileMenuItem
            icon="restaurant-outline"
            title={translate("nutritionGoals", language)}
            subtitle={translate("nutritionGoalsSubtitle", language)}
            href="/goal"
          />
          <ProfileMenuItem
            icon="notifications-outline"
            title={translate("reminders", language)}
            subtitle={translate("remindersSubtitle", language)}
            href="/profile-reminders"
          />
          <ProfileMenuItem
            icon="settings-outline"
            title={translate("appSettings", language)}
            subtitle={translate("appSettingsSubtitle", language)}
            href="/settings"
          />
        </View>

        <Pressable
          onPress={confirmLogout}
          style={[
            styles.logoutButton,
            {
              backgroundColor: theme.colors.card,
              borderColor: theme.colors.danger,
            },
          ]}
        >
          <Text style={[styles.logoutText, { color: theme.colors.danger }]}>
            {translate("logout", language)}
          </Text>
        </Pressable>
      </ScrollView>
    </Screen>
  );
}

function ProfileMetricCard({ label, value }: { label: string; value: string }) {
  const themeMode = useAppStore((state) => state.themeMode);
  const theme = getTheme(themeMode);

  return (
    <View
      style={[
        styles.profileMetricCard,
        { backgroundColor: theme.colors.card, borderColor: theme.colors.border },
      ]}
    >
      <Text
        style={[styles.profileMetricLabel, { color: theme.colors.mutedText }]}
      >
        {label}
      </Text>
      <Text style={[styles.profileMetricValue, { color: theme.colors.text }]}>
        {value}
      </Text>
    </View>
  );
}

function ProfileMenuItem({
  icon,
  title,
  subtitle,
  href,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle: string;
  href: Href;
}) {
  const themeMode = useAppStore((state) => state.themeMode);
  const theme = getTheme(themeMode);

  return (
    <Pressable
      onPress={() => router.push(href)}
      style={({ pressed }) => [
        styles.menuCard,
        {
          backgroundColor: theme.colors.card,
          borderColor: theme.colors.border,
          opacity: pressed ? 0.82 : 1,
        },
      ]}
    >
      <View
        style={[styles.menuIconBox, { backgroundColor: theme.colors.cardSoft }]}
      >
        <Ionicons name={icon} size={21} color={theme.colors.primary} />
      </View>
      <View style={styles.menuTextArea}>
        <Text style={[styles.menuTitle, { color: theme.colors.text }]}>
          {title}
        </Text>
        <Text style={[styles.menuSubtitle, { color: theme.colors.mutedText }]}>
          {subtitle}
        </Text>
      </View>
      <Ionicons name="chevron-forward" size={19} color={theme.colors.mutedText} />
    </Pressable>
  );
}

function getInitials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0).toLocaleUpperCase())
    .join("");
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 120,
  },
  headerArea: { marginBottom: 28 },
  identityRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  avatarBox: {
    width: 68,
    height: 68,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: { color: "#FFFFFF", fontSize: 23, fontWeight: "900" },
  identityInfo: { flex: 1, minWidth: 0 },
  title: { fontSize: 22, fontWeight: "900" },
  subtitle: { marginTop: 4, fontSize: 13, lineHeight: 18, fontWeight: "600" },
  profileMetricsRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 18,
  },
  profileMetricCard: {
    flex: 1,
    minHeight: 82,
    paddingHorizontal: 12,
    paddingVertical: 14,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  profileMetricLabel: {
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 0.5,
    textAlign: "center",
  },
  profileMetricValue: {
    marginTop: 7,
    fontSize: 18,
    fontWeight: "900",
    textAlign: "center",
  },
  menuList: { gap: 12 },
  menuCard: {
    minHeight: 76,
    borderWidth: 1,
    borderRadius: 18,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  menuIconBox: {
    width: 42,
    height: 42,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
  },
  menuTextArea: { flex: 1 },
  menuTitle: { fontSize: 14, fontWeight: "800" },
  menuSubtitle: { marginTop: 3, fontSize: 11, fontWeight: "600" },
  logoutButton: {
    minHeight: 52,
    marginTop: 30,
    borderWidth: 1,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  logoutText: { fontSize: 14, fontWeight: "800" },
});
