import { Ionicons } from "@expo/vector-icons";
import { router, type Href } from "expo-router";
import { useMemo, useState } from "react";
import {
    KeyboardAvoidingView,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from "react-native";
import { Button } from "../src/components/Button";
import { Input } from "../src/components/Input";
import { Screen } from "../src/components/Screen";
import { translate } from "../src/i18n/translations";
import { useAppStore } from "../src/stores/appStore";
import { useGoalStore } from "../src/stores/goalStore";
import { getTheme } from "../src/theme/theme";
import {
    calculateDailyCalories,
    type ActivityLevel,
    type Gender,
    type GoalType,
} from "../src/utils/calorieCalculator";

export default function GoalScreen() {
  const themeMode = useAppStore((state) => state.themeMode);
  const language = useAppStore((state) => state.language);
  const theme = getTheme(themeMode);
  const setGoal = useGoalStore((state) => state.setGoal);

  const [age, setAge] = useState("");
  const [heightCm, setHeightCm] = useState("");
  const [weightKg, setWeightKg] = useState("");

  const [gender, setGender] = useState<Gender>("female");
  const [activityLevel, setActivityLevel] = useState<ActivityLevel>("moderate");
  const [goalType, setGoalType] = useState<GoalType>("maintain");

  const result = useMemo(() => {
    const parsedAge = Number(age);
    const parsedHeight = Number(heightCm);
    const parsedWeight = Number(weightKg);

    if (!parsedAge || !parsedHeight || !parsedWeight) {
      return null;
    }

    return calculateDailyCalories({
      gender,
      age: parsedAge,
      heightCm: parsedHeight,
      weightKg: parsedWeight,
      activityLevel,
      goalType,
    });
  }, [age, heightCm, weightKg, gender, activityLevel, goalType]);

  const handleSaveGoal = () => {
    if (!result) {
      return;
    }

    setGoal({
      age: Number(age),
      heightCm: Number(heightCm),
      weightKg: Number(weightKg),
      gender,
      activityLevel,
      goalType,
      bmr: result.bmr,
      maintenanceCalories: result.maintenanceCalories,
      targetCalories: result.targetCalories,
    });

    router.replace("/(tabs)/home" as Href);
  };

  return (
    <Screen>
      <KeyboardAvoidingView
        style={[
          styles.keyboardView,
          {
            backgroundColor: theme.colors.background,
          },
        ]}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
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
              <Ionicons
                name="chevron-back"
                size={22}
                color={theme.colors.text}
              />
            </Pressable>

            <Text style={[styles.topTitle, { color: theme.colors.text }]}>
              {translate("target", language)}
            </Text>

            <View style={styles.fakeSpace} />
          </View>

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
                name="flag-outline"
                size={30}
                color={theme.colors.primary}
              />
            </View>

            <Text style={[styles.title, { color: theme.colors.text }]}>
              {translate("goalSetup", language)}
            </Text>

            <Text style={[styles.subtitle, { color: theme.colors.mutedText }]}>
              {translate("goalSubtitle", language)}
            </Text>
          </View>

          <View
            style={[
              styles.card,
              {
                backgroundColor: theme.colors.card,
                borderColor: theme.colors.border,
              },
            ]}
          >
            <View style={styles.row}>
              <View style={styles.inputHalf}>
                <Input
                  label={translate("age", language)}
                  icon="calendar-outline"
                  placeholder={translate("agePlaceholder", language)}
                  keyboardType="number-pad"
                  value={age}
                  onChangeText={setAge}
                />
              </View>

              <View style={styles.inputHalf}>
                <Input
                  label={`${translate("height", language)} (cm)`}
                  icon="resize-outline"
                  placeholder={translate("heightPlaceholder", language)}
                  keyboardType="number-pad"
                  value={heightCm}
                  onChangeText={setHeightCm}
                />
              </View>
            </View>

            <Input
              label={`${translate("weight", language)} (kg)`}
              icon="scale-outline"
              placeholder={translate("weightPlaceholder", language)}
              keyboardType="number-pad"
              value={weightKg}
              onChangeText={setWeightKg}
            />

            <Text style={[styles.groupTitle, { color: theme.colors.text }]}>
              {translate("gender", language)}
            </Text>

            <View style={styles.chipRow}>
              <OptionChip
                label={translate("female", language)}
                selected={gender === "female"}
                onPress={() => setGender("female")}
              />

              <OptionChip
                label={translate("male", language)}
                selected={gender === "male"}
                onPress={() => setGender("male")}
              />
            </View>

            <Text style={[styles.groupTitle, { color: theme.colors.text }]}>
              {translate("activityLevel", language)}
            </Text>

            <View style={styles.chipWrap}>
              <OptionChip
                label={translate("sedentary", language)}
                selected={activityLevel === "sedentary"}
                onPress={() => setActivityLevel("sedentary")}
              />

              <OptionChip
                label={translate("light", language)}
                selected={activityLevel === "light"}
                onPress={() => setActivityLevel("light")}
              />

              <OptionChip
                label={translate("moderate", language)}
                selected={activityLevel === "moderate"}
                onPress={() => setActivityLevel("moderate")}
              />

              <OptionChip
                label={translate("active", language)}
                selected={activityLevel === "active"}
                onPress={() => setActivityLevel("active")}
              />

              <OptionChip
                label={translate("veryActive", language)}
                selected={activityLevel === "veryActive"}
                onPress={() => setActivityLevel("veryActive")}
              />
            </View>

            <Text style={[styles.groupTitle, { color: theme.colors.text }]}>
              {translate("goalType", language)}
            </Text>

            <View style={styles.chipWrap}>
              <OptionChip
                label={translate("loseWeight", language)}
                selected={goalType === "lose"}
                onPress={() => setGoalType("lose")}
              />

              <OptionChip
                label={translate("maintainWeight", language)}
                selected={goalType === "maintain"}
                onPress={() => setGoalType("maintain")}
              />

              <OptionChip
                label={translate("gainWeight", language)}
                selected={goalType === "gain"}
                onPress={() => setGoalType("gain")}
              />
            </View>

            <Button onPress={handleSaveGoal} style={styles.calculateButton}>
              {result
                ? translate("saveGoal", language)
                : translate("fillInfoToCalculate", language)}
            </Button>
          </View>

          {result ? (
            <View
              style={[
                styles.resultCard,
                {
                  backgroundColor: theme.colors.primarySoft,
                  borderColor: theme.colors.border,
                },
              ]}
            >
              <Text
                style={[styles.resultLabel, { color: theme.colors.primary }]}
              >
                {translate("dailyTarget", language)}
              </Text>

              <Text
                style={[styles.resultCalories, { color: theme.colors.text }]}
              >
                {result.targetCalories.toLocaleString("tr-TR")} kcal
              </Text>

              <View style={styles.resultGrid}>
                <View
                  style={[
                    styles.resultMiniCard,
                    {
                      backgroundColor: theme.colors.card,
                      borderColor: theme.colors.border,
                    },
                  ]}
                >
                  <Text
                    style={[styles.note, { color: theme.colors.mutedText }]}
                  >
                    {translate("goalSavedNote", language)}
                  </Text>

                  <Text
                    style={[styles.note, { color: theme.colors.mutedText }]}
                  >
                    {translate("calorieEstimateNote", language)}
                  </Text>

                  <Text
                    style={[
                      styles.resultMiniValue,
                      { color: theme.colors.text },
                    ]}
                  >
                    {result.maintenanceCalories} kcal
                  </Text>
                </View>

                <View
                  style={[
                    styles.resultMiniCard,
                    {
                      backgroundColor: theme.colors.card,
                      borderColor: theme.colors.border,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.resultMiniLabel,
                      { color: theme.colors.mutedText },
                    ]}
                  >
                    {translate("estimatedBmr", language)}
                  </Text>

                  <Text
                    style={[
                      styles.resultMiniValue,
                      { color: theme.colors.text },
                    ]}
                  >
                    {result.bmr} kcal
                  </Text>
                </View>
              </View>

              <Text style={[styles.note, { color: theme.colors.mutedText }]}>
                {translate("calorieEstimateNote", language)}
              </Text>
            </View>
          ) : null}

          <Button
            variant="secondary"
            onPress={() => router.replace("/(tabs)/home" as Href)}
            style={styles.homeButton}
          >
            {translate("home", language)}
          </Button>
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}

type OptionChipProps = {
  label: string;
  selected: boolean;
  onPress: () => void;
};

function OptionChip({ label, selected, onPress }: OptionChipProps) {
  const themeMode = useAppStore((state) => state.themeMode);
  const theme = getTheme(themeMode);

  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.chip,
        {
          backgroundColor: selected
            ? theme.colors.primary
            : theme.colors.cardSoft,
          borderColor: selected ? theme.colors.primary : theme.colors.border,
        },
      ]}
    >
      <Text
        style={[
          styles.chipText,
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

const styles = StyleSheet.create({
  keyboardView: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 4,
    paddingBottom: 34,
  },
  topBar: {
    height: 46,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
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
    fontSize: 16,
    fontWeight: "900",
  },
  fakeSpace: {
    width: 40,
  },
  headerArea: {
    marginTop: 20,
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
  card: {
    borderWidth: 1,
    borderRadius: 30,
    padding: 18,
    gap: 15,
  },
  row: {
    flexDirection: "row",
    gap: 12,
  },
  inputHalf: {
    flex: 1,
  },
  groupTitle: {
    fontSize: 14,
    fontWeight: "900",
    marginTop: 2,
  },
  chipRow: {
    flexDirection: "row",
    gap: 10,
  },
  chipWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  chip: {
    minHeight: 40,
    paddingHorizontal: 14,
    borderRadius: 999,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  chipText: {
    fontSize: 13,
    fontWeight: "900",
  },
  calculateButton: {
    marginTop: 4,
  },
  resultCard: {
    marginTop: 18,
    borderWidth: 1,
    borderRadius: 30,
    padding: 20,
  },
  resultLabel: {
    fontSize: 13,
    fontWeight: "900",
    marginBottom: 6,
  },
  resultCalories: {
    fontSize: 38,
    fontWeight: "900",
    letterSpacing: -1,
  },
  resultGrid: {
    marginTop: 18,
    flexDirection: "row",
    gap: 12,
  },
  resultMiniCard: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 20,
    padding: 14,
  },
  resultMiniLabel: {
    fontSize: 11,
    fontWeight: "800",
    marginBottom: 6,
  },
  resultMiniValue: {
    fontSize: 15,
    fontWeight: "900",
  },
  note: {
    marginTop: 14,
    fontSize: 12,
    lineHeight: 18,
    fontWeight: "600",
  },
  homeButton: {
    marginTop: 18,
  },
});
