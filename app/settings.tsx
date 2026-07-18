import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Alert, Pressable, StyleSheet, Text, View } from "react-native";
import { ProfilePage } from "../src/components/ProfilePage";
import { translate } from "../src/i18n/translations";
import { useAppStore } from "../src/stores/appStore";
import { useAuthStore } from "../src/stores/authStore";
import { useGoalStore } from "../src/stores/goalStore";
import { useMealStore } from "../src/stores/mealStore";
import { getTheme } from "../src/theme/theme";

export default function SettingsScreen() {
  const themeMode = useAppStore((state) => state.themeMode);
  const language = useAppStore((state) => state.language);
  const setThemeMode = useAppStore((state) => state.setThemeMode);
  const setLanguage = useAppStore((state) => state.setLanguage);
  const token = useAuthStore((state) => state.token);
  const deleteAccount = useAuthStore((state) => state.deleteAccount);
  const clearGoal = useGoalStore((state) => state.clearGoal);
  const clearMeals = useMealStore((state) => state.clearMeals);
  const theme = getTheme(themeMode);

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
    <ProfilePage
      title={translate("appSettings", language)}
      subtitle={translate("appSettingsSubtitle", language)}
    >
      <View
        style={[
          styles.card,
          { backgroundColor: theme.colors.card, borderColor: theme.colors.border },
        ]}
      >
        <Text style={[styles.groupLabel, { color: theme.colors.text }]}>
          {translate("theme", language)}
        </Text>
        <View style={styles.choiceRow}>
          <ChoiceButton
            label={translate("lightTheme", language)}
            selected={themeMode === "light"}
            onPress={() => setThemeMode("light")}
          />
          <ChoiceButton
            label={translate("darkTheme", language)}
            selected={themeMode === "dark"}
            onPress={() => setThemeMode("dark")}
          />
        </View>

        <Text style={[styles.groupLabel, { color: theme.colors.text }]}>
          {translate("language", language)}
        </Text>
        <View style={styles.choiceRow}>
          <ChoiceButton
            label={translate("turkish", language)}
            selected={language === "tr"}
            onPress={() => setLanguage("tr")}
          />
          <ChoiceButton
            label={translate("english", language)}
            selected={language === "en"}
            onPress={() => setLanguage("en")}
          />
        </View>
      </View>

      <View
        style={[
          styles.card,
          styles.actionCard,
          { backgroundColor: theme.colors.card, borderColor: theme.colors.border },
        ]}
      >
        <SettingsAction
          icon="trash-outline"
          label={translate("clearMeals", language)}
          onPress={confirmClearMeals}
        />
        <SettingsAction
          icon="person-remove-outline"
          label={translate("deleteAccount", language)}
          onPress={confirmDeleteAccount}
          danger
        />
      </View>
    </ProfilePage>
  );
}

function ChoiceButton({
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
        styles.choiceButton,
        {
          backgroundColor: selected ? theme.colors.primary : theme.colors.cardSoft,
          borderColor: selected ? theme.colors.primary : theme.colors.border,
        },
      ]}
    >
      <Text
        style={[
          styles.choiceText,
          { color: selected ? "#FFFFFF" : theme.colors.text },
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

function SettingsAction({
  icon,
  label,
  onPress,
  danger = false,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
  danger?: boolean;
}) {
  const themeMode = useAppStore((state) => state.themeMode);
  const theme = getTheme(themeMode);
  const color = danger ? theme.colors.danger : theme.colors.text;
  return (
    <Pressable onPress={onPress} style={styles.actionRow}>
      <Ionicons name={icon} size={20} color={color} />
      <Text style={[styles.actionText, { color }]}>{label}</Text>
      <Ionicons name="chevron-forward" size={18} color={theme.colors.mutedText} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: { borderWidth: 1, borderRadius: 20, padding: 16, marginBottom: 14 },
  groupLabel: { fontSize: 13, fontWeight: "900", marginBottom: 10 },
  choiceRow: { flexDirection: "row", gap: 10, marginBottom: 18 },
  choiceButton: {
    flex: 1,
    minHeight: 44,
    borderWidth: 1,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
  },
  choiceText: { fontSize: 13, fontWeight: "800" },
  actionCard: { paddingVertical: 4 },
  actionRow: {
    minHeight: 58,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  actionText: { flex: 1, fontSize: 14, fontWeight: "800" },
});
