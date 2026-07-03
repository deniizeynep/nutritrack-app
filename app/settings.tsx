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
import { Button } from "../src/components/Button";
import { Screen } from "../src/components/Screen";
import { translate } from "../src/i18n/translations";
import { useAppStore } from "../src/stores/appStore";
import { useAuthStore } from "../src/stores/authStore";
import { useGoalStore } from "../src/stores/goalStore";
import { useMealStore } from "../src/stores/mealStore";
import { getTheme, type ThemeMode } from "../src/theme/theme";
import { calculateMacroTargets } from "../src/utils/calorieCalculator";

export default function SettingsScreen() {
  const themeMode = useAppStore((state) => state.themeMode);
  const language = useAppStore((state) => state.language);
  const setThemeMode = useAppStore((state) => state.setThemeMode);
  const setLanguage = useAppStore((state) => state.setLanguage);
  const user = useAuthStore((state) => state.user);
  const token = useAuthStore((state) => state.token);
  const goal = useGoalStore((state) => state.goal);
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
        {
          text: translate("cancel", language),
          style: "cancel",
        },
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

  return (
    <Screen>
      <ScrollView
        style={[styles.container, { backgroundColor: theme.colors.background }]}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.topBar}>
          <Pressable
            onPress={() => router.back()}
            style={[
              styles.iconButton,
              {
                backgroundColor: theme.colors.card,
                borderColor: theme.colors.border,
              },
            ]}
          >
            <Ionicons name="chevron-back" size={22} color={theme.colors.text} />
          </Pressable>

          <Text style={[styles.topTitle, { color: theme.colors.text }]}> 
            {translate("settings", language)}
          </Text>

          <View style={styles.fakeSpace} />
        </View>

        <Section title={translate("appearance", language)}>
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
        </Section>

        <Section title={translate("language", language)}>
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

        <Section title={translate("account", language)}>
          <InfoRow
            label={translate("fullName", language)}
            value={user?.fullName || translate("guestUser", language)}
          />
          <InfoRow label={translate("email", language)} value={user?.email || "-"} />
          <Button
            variant="secondary"
            onPress={() => router.push("/(tabs)/profile" as Href)}
            style={styles.sectionButton}
          >
            {translate("goToProfile", language)}
          </Button>
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
              <InfoRow
                label={translate("targetFat", language)}
                value={`${targetFat}g`}
              />
            </View>
          ) : (
            <Text style={[styles.emptyText, { color: theme.colors.mutedText }]}> 
              {translate("noGoalYet", language)}
            </Text>
          )}

          <Button
            variant="secondary"
            onPress={() => router.push("/goal" as Href)}
            style={styles.sectionButton}
          >
            {translate("editGoal", language)}
          </Button>
        </Section>

        <Section title={translate("data", language)}>
          <Pressable
            onPress={confirmClearMeals}
            style={[
              styles.dangerButton,
              {
                backgroundColor: theme.colors.cardSoft,
              },
            ]}
          >
            <Ionicons name="trash-outline" size={19} color={theme.colors.danger} />
            <Text style={[styles.dangerText, { color: theme.colors.danger }]}> 
              {translate("clearMeals", language)}
            </Text>
          </Pressable>
        </Section>

        <Section title={translate("appInfo", language)}>
          <InfoRow label="NutriTrack" value="" />
          <InfoRow label={translate("version", language)} value="1.0.0" />
          <InfoRow label={translate("aiProvider", language)} value="Gemini" />
          <InfoRow
            label={translate("barcodeSource", language)}
            value="Open Food Facts"
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
    <View
      style={[
        styles.card,
        {
          backgroundColor: theme.colors.card,
          borderColor: theme.colors.border,
        },
      ]}
    >
      <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>{title}</Text>
      {children}
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
      <Text
        style={[
          styles.choiceText,
          {
            color: selected ? "#FFFFFF" : theme.colors.text,
          },
        ]}
      >
        {label}
      </Text>
    </Pressable>
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 4,
    paddingBottom: 48,
  },
  topBar: {
    height: 46,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 18,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 15,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  topTitle: {
    fontSize: 17,
    fontWeight: "900",
  },
  fakeSpace: {
    width: 40,
  },
  card: {
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
  segmentRow: {
    flexDirection: "row",
    gap: 10,
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
  infoRow: {
    minHeight: 32,
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
  sectionButton: {
    marginTop: 14,
  },
  emptyText: {
    fontSize: 13,
    lineHeight: 19,
    fontWeight: "700",
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
});
