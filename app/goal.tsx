import { Ionicons } from "@expo/vector-icons";
import { router, type Href } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import {
  Alert,
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
import { useAuthStore } from "../src/stores/authStore";
import { useGoalStore } from "../src/stores/goalStore";
import { getTheme } from "../src/theme/theme";
import {
  calculateDailyCalories,
  calculateMacroTargets,
  type ActivityLevel,
  type Gender,
  type GoalType,
} from "../src/utils/calorieCalculator";

export default function GoalScreen() {
  const themeMode = useAppStore((state) => state.themeMode);
  const language = useAppStore((state) => state.language);
  const theme = getTheme(themeMode);
  const token = useAuthStore((state) => state.token);
  const savedGoal = useGoalStore((state) => state.goal);
  const isLoading = useGoalStore((state) => state.isLoading);
  const setGoal = useGoalStore((state) => state.setGoal);

  const [age, setAge] = useState("");
  const [heightCm, setHeightCm] = useState("");
  const [weightKg, setWeightKg] = useState("");

  const [gender, setGender] = useState<Gender>("female");
  const [activityLevel, setActivityLevel] = useState<ActivityLevel>("moderate");
  const [goalType, setGoalType] = useState<GoalType>("maintain");

  useEffect(() => {
    if (!savedGoal) {
      return;
    }

    // Controlled fields must be populated when the persisted goal finishes loading.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setAge(String(savedGoal.age));
    setHeightCm(String(savedGoal.heightCm));
    setWeightKg(String(savedGoal.weightKg));
    setGender(savedGoal.gender);
    setActivityLevel(savedGoal.activityLevel);
    setGoalType(savedGoal.goalType);
  }, [savedGoal]);

  const validationMessage = useMemo(() => {
    return getGoalValidationMessage(age, heightCm, weightKg, language);
  }, [age, heightCm, weightKg, language]);

  const result = useMemo(() => {
    if (validationMessage) {
      return null;
    }

    const parsedAge = Number(age);
    const parsedHeight = Number(heightCm);
    const parsedWeight = Number(weightKg);

    if (!parsedAge || !parsedHeight || !parsedWeight) {
      return null;
    }

    const calorieResult = calculateDailyCalories({
      gender,
      age: parsedAge,
      heightCm: parsedHeight,
      weightKg: parsedWeight,
      activityLevel,
      goalType,
    });

    return {
      ...calorieResult,
      macroTargets: calculateMacroTargets(
        calorieResult.targetCalories,
        goalType,
      ),
    };
  }, [age, heightCm, weightKg, gender, activityLevel, goalType, validationMessage]);

  const saveGoal = async (calculation: NonNullable<typeof result>) => {
    try {
      await setGoal(
        {
          age: Number(age),
          birthDate: savedGoal?.birthDate,
          heightCm: Number(heightCm),
          weightKg: Number(weightKg),
          gender,
          activityLevel,
          goalType,
          bmr: calculation.bmr,
          maintenanceCalories: calculation.maintenanceCalories,
          targetCalories: calculation.targetCalories,
          targetProtein: calculation.macroTargets.protein,
          targetCarbs: calculation.macroTargets.carbs,
          targetFat: calculation.macroTargets.fat,
        },
        token,
      );

      router.replace("/(tabs)/home" as Href);
    } catch (error) {
      Alert.alert(
        translate("error", language),
        error instanceof Error ? error.message : translate("genericError", language),
      );
    }
  };

  const handleSaveGoal = () => {
    if (validationMessage) {
      Alert.alert(translate("error", language), validationMessage, [
        { text: translate("ok", language) },
      ]);
      return;
    }

    if (!result) {
      return;
    }

    Alert.alert(
      translate("confirmGoalSave", language),
      translate("confirmGoalSaveMessage", language),
      [
        { text: translate("cancel", language), style: "cancel" },
        {
          text: translate("save", language),
          onPress: () => void saveGoal(result),
        },
      ],
    );
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
              {translate("goalSetup", language)}
            </Text>

            <View style={styles.fakeSpace} />
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

            {validationMessage ? (
              <Text style={[styles.errorText, { color: theme.colors.danger }]}> 
                {validationMessage}
              </Text>
            ) : null}

            <Text style={[styles.groupTitle, { color: theme.colors.text }]}>
              {translate("gender", language)}
            </Text>

            <View style={styles.chipRow}>
              <View style={styles.inputHalf}>
                <OptionChip
                  label={translate("female", language)}
                  selected={gender === "female"}
                  onPress={() => setGender("female")}
                />
              </View>

              <View style={styles.inputHalf}>
                <OptionChip
                  label={translate("male", language)}
                  selected={gender === "male"}
                  onPress={() => setGender("male")}
                />
              </View>
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

            <Button
              onPress={handleSaveGoal}
              style={styles.calculateButton}
              disabled={isLoading}
            >
              {translate("saveGoal", language)}
            </Button>
          </View>

          {result ? (
            <View
              style={[
                styles.resultCard,
                {
                  backgroundColor: theme.colors.card,
                  borderColor: theme.colors.border,
                },
              ]}
            >
              <View style={styles.resultHeader}>
                <View
                  style={[
                    styles.resultIconBox,
                    {
                      backgroundColor: theme.colors.primarySoft,
                    },
                  ]}
                >
                  <Ionicons
                    name="flame-outline"
                    size={22}
                    color={theme.colors.primary}
                  />
                </View>

                <View style={styles.resultTitleArea}>
                  <Text
                    style={[
                      styles.resultLabel,
                      { color: theme.colors.mutedText },
                    ]}
                  >
                    {translate("dailyTarget", language)}
                  </Text>

                  <Text
                    style={[
                      styles.resultCalories,
                      { color: theme.colors.text },
                    ]}
                  >
                    {result.targetCalories.toLocaleString("tr-TR")} kcal
                  </Text>
                </View>
              </View>

              <View
                style={[
                  styles.resultDivider,
                  { backgroundColor: theme.colors.border },
                ]}
              />

              <View style={styles.macroTargetBlock}>
                <Text
                  style={[styles.macroTitle, { color: theme.colors.text }]}
                >
                  {translate("recommendedMacros", language)}
                </Text>

                <View style={styles.resultRows}>
                  <View style={styles.resultRow}>
                    <Text
                      style={[
                        styles.resultRowLabel,
                        { color: theme.colors.mutedText },
                      ]}
                    >
                      {translate("protein", language)}
                    </Text>

                    <Text
                      style={[
                        styles.resultRowValue,
                        { color: theme.colors.text },
                      ]}
                    >
                      {result.macroTargets.protein}g
                    </Text>
                  </View>

                  <View style={styles.resultRow}>
                    <Text
                      style={[
                        styles.resultRowLabel,
                        { color: theme.colors.mutedText },
                      ]}
                    >
                      {translate("carbs", language)}
                    </Text>

                    <Text
                      style={[
                        styles.resultRowValue,
                        { color: theme.colors.text },
                      ]}
                    >
                      {result.macroTargets.carbs}g
                    </Text>
                  </View>

                  <View style={styles.resultRow}>
                    <Text
                      style={[
                        styles.resultRowLabel,
                        { color: theme.colors.mutedText },
                      ]}
                    >
                      {translate("fat", language)}
                    </Text>

                    <Text
                      style={[
                        styles.resultRowValue,
                        { color: theme.colors.text },
                      ]}
                    >
                      {result.macroTargets.fat}g
                    </Text>
                  </View>
                </View>
              </View>

              <View
                style={[
                  styles.resultDivider,
                  { backgroundColor: theme.colors.border },
                ]}
              />

              <View style={styles.resultRows}>
                <View style={styles.resultRow}>
                  <Text
                    style={[
                      styles.resultRowLabel,
                      { color: theme.colors.mutedText },
                    ]}
                  >
                    {translate("maintenance", language)}
                  </Text>

                  <Text
                    style={[
                      styles.resultRowValue,
                      { color: theme.colors.text },
                    ]}
                  >
                    {result.maintenanceCalories} kcal
                  </Text>
                </View>

                <View style={styles.resultRow}>
                  <Text
                    style={[
                      styles.resultRowLabel,
                      { color: theme.colors.mutedText },
                    ]}
                  >
                    {translate("estimatedBmr", language)}
                  </Text>

                  <Text
                    style={[
                      styles.resultRowValue,
                      { color: theme.colors.text },
                    ]}
                  >
                    {result.bmr} kcal
                  </Text>
                </View>
              </View>

              <View
                style={[
                  styles.noteBox,
                  {
                    backgroundColor: theme.colors.cardSoft,
                  },
                ]}
              >
                <Text style={[styles.note, { color: theme.colors.mutedText }]}>
                  {translate("calorieEstimateNote", language)}
                  {"\n"}
                  {translate("macroTargetsNote", language)}
                </Text>
              </View>
            </View>
          ) : null}
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}

function parsePositiveNumber(value: string) {
  if (!value.trim()) {
    return null;
  }

  const parsed = Number(value);

  if (!Number.isFinite(parsed) || parsed <= 0) {
    return null;
  }

  return parsed;
}

function getGoalValidationMessage(
  age: string,
  heightCm: string,
  weightKg: string,
  language: "tr" | "en",
) {
  const parsedAge = parsePositiveNumber(age);
  const parsedHeight = parsePositiveNumber(heightCm);
  const parsedWeight = parsePositiveNumber(weightKg);

  if (parsedAge === null || parsedHeight === null || parsedWeight === null) {
    return translate("invalidValue", language);
  }

  if (parsedAge < 13 || parsedAge > 100) {
    return translate("ageRangeError", language);
  }

  if (parsedHeight < 100 || parsedHeight > 230) {
    return translate("heightRangeError", language);
  }

  if (parsedWeight < 30 || parsedWeight > 250) {
    return translate("weightRangeError", language);
  }

  return null;
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
    fontSize: 18,
    fontWeight: "900",
  },
  fakeSpace: {
    width: 40,
  },
  card: {
    marginTop: 20,
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
  errorText: {
    marginTop: -2,
    fontSize: 12,
    lineHeight: 18,
    fontWeight: "800",
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
    borderRadius: 24,
    padding: 18,
  },
  resultHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  resultIconBox: {
    width: 48,
    height: 48,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
  },
  resultTitleArea: {
    flex: 1,
  },
  resultLabel: {
    fontSize: 12,
    fontWeight: "800",
    marginBottom: 4,
  },
  resultCalories: {
    fontSize: 28,
    fontWeight: "900",
    letterSpacing: -0.6,
  },
  resultDivider: {
    height: 1,
    marginVertical: 16,
  },
  resultRows: {
    gap: 12,
  },
  macroTargetBlock: {
    gap: 12,
  },
  macroTitle: {
    fontSize: 14,
    fontWeight: "900",
  },
  resultRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  resultRowLabel: {
    fontSize: 13,
    fontWeight: "700",
  },
  resultRowValue: {
    fontSize: 14,
    fontWeight: "900",
  },
  noteBox: {
    marginTop: 16,
    borderRadius: 18,
    padding: 12,
  },
  note: {
    fontSize: 12,
    lineHeight: 18,
    fontWeight: "600",
  },
});
