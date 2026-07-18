import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import { Alert, Pressable, StyleSheet, Text, View } from "react-native";
import { Button } from "../src/components/Button";
import { Input } from "../src/components/Input";
import { ProfilePage } from "../src/components/ProfilePage";
import { translate } from "../src/i18n/translations";
import { useAppStore } from "../src/stores/appStore";
import { useAuthStore } from "../src/stores/authStore";
import { useGoalStore } from "../src/stores/goalStore";
import { getTheme } from "../src/theme/theme";
import {
  calculateDailyCalories,
  calculateMacroTargets,
  type Gender,
} from "../src/utils/calorieCalculator";
import { displayToKg, formatWeight, unitLabel } from "../src/utils/units";

export default function PersonalInformationScreen() {
  const themeMode = useAppStore((state) => state.themeMode);
  const language = useAppStore((state) => state.language);
  const unitSystem = useAppStore((state) => state.unitSystem);
  const user = useAuthStore((state) => state.user);
  const token = useAuthStore((state) => state.token);
  const goal = useGoalStore((state) => state.goal);
  const isLoading = useGoalStore((state) => state.isLoading);
  const setGoal = useGoalStore((state) => state.setGoal);
  const theme = getTheme(themeMode);
  const [heightCm, setHeightCm] = useState(goal ? String(goal.heightCm) : "");
  const [weightKg, setWeightKg] = useState(
    goal ? String(formatWeight(goal.weightKg, unitSystem).split(" ")[0]) : "",
  );
  const [gender, setGender] = useState<Gender>(goal?.gender ?? "female");
  const { firstName, lastName } = splitFullName(user?.fullName ?? "");

  useEffect(() => {
    if (!goal) {
      return;
    }

    // Controlled fields must follow a goal restored from persisted storage.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setHeightCm(String(goal.heightCm));
    setWeightKg(String(formatWeight(goal.weightKg, unitSystem).split(" ")[0]));
    setGender(goal.gender);
  }, [goal, unitSystem]);

  const handleSave = async () => {
    const parsedHeight = Number(heightCm);
    const parsedWeight = Math.round(displayToKg(Number(weightKg), unitSystem) * 10) / 10;

    if (
      !goal ||
      !Number.isInteger(parsedHeight) ||
      parsedHeight < 100 ||
      parsedHeight > 230 ||
      parsedWeight < 30 ||
      parsedWeight > 250
    ) {
      Alert.alert(
        translate("error", language),
        translate("accountInformationValidation", language),
      );
      return;
    }

    const calories = calculateDailyCalories({
      age: goal.age,
      heightCm: parsedHeight,
      weightKg: parsedWeight,
      gender,
      activityLevel: goal.activityLevel,
      goalType: goal.goalType,
    });
    const macros = calculateMacroTargets(calories.targetCalories, goal.goalType);

    try {
      await setGoal(
        {
          ...goal,
          heightCm: parsedHeight,
          weightKg: parsedWeight,
          gender,
          ...calories,
          targetProtein: macros.protein,
          targetCarbs: macros.carbs,
          targetFat: macros.fat,
        },
        token,
      );
      Alert.alert(
        translate("accountInformationSaved", language),
        translate("accountInformationSavedMessage", language),
      );
    } catch (error) {
      Alert.alert(
        translate("error", language),
        error instanceof Error
          ? error.message
          : translate("genericError", language),
      );
    }
  };

  return (
    <ProfilePage
      title={translate("personalInformation", language)}
      subtitle={translate("personalInformationSubtitle", language)}
      compactHeader
    >
      <View style={styles.form}>
        <View style={styles.inputRow}>
          <View style={styles.halfInput}>
            <Input
              label={translate("firstName", language)}
              value={firstName}
              editable={false}
            />
          </View>
          <View style={styles.halfInput}>
            <Input
              label={translate("lastName", language)}
              value={lastName}
              editable={false}
            />
          </View>
        </View>

        <Input
          label={translate("email", language)}
          icon="mail-outline"
          value={user?.email ?? "-"}
          editable={false}
        />

        <Text style={[styles.label, { color: theme.colors.mutedText }]}>
          {translate("gender", language)}
        </Text>
        <View style={styles.genderRow}>
          <GenderOption
            gender="male"
            selected={gender === "male"}
            onPress={() => setGender("male")}
            label={translate("male", language)}
          />
          <GenderOption
            gender="female"
            selected={gender === "female"}
            onPress={() => setGender("female")}
            label={translate("female", language)}
          />
        </View>

        <Input
          label={translate("birthDate", language)}
          icon="calendar-outline"
          value="-"
          editable={false}
        />

        <View style={styles.inputRow}>
          <View style={styles.halfInput}>
            <Input
              label={`${translate("height", language)} (cm)`}
              icon="resize-outline"
              value={heightCm}
              onChangeText={setHeightCm}
              keyboardType="number-pad"
            />
          </View>
          <View style={styles.halfInput}>
            <Input
              label={`${translate("weight", language)} (${unitLabel(unitSystem)})`}
              icon="scale-outline"
              value={weightKg}
              onChangeText={setWeightKg}
              keyboardType="number-pad"
            />
          </View>
        </View>

        <Button
          onPress={handleSave}
          disabled={isLoading || !goal}
          style={styles.saveButton}
        >
          {translate("save", language)}
        </Button>

        <View
          style={[
            styles.focusCard,
            {
              backgroundColor: theme.colors.primarySoft,
              borderColor: theme.colors.border,
            },
          ]}
        >
          <Text
            style={[styles.focusTitle, { color: theme.colors.mutedText }]}
          >
            {translate("focusOnYourGoal", language)}
          </Text>
          <Text style={[styles.focusText, { color: theme.colors.text }]}>
            “{translate("personalDataNote", language)}”
          </Text>
        </View>
      </View>
    </ProfilePage>
  );
}

function GenderOption({
  gender,
  selected,
  onPress,
  label,
}: {
  gender: Gender;
  selected: boolean;
  onPress: () => void;
  label: string;
}) {
  const themeMode = useAppStore((state) => state.themeMode);
  const theme = getTheme(themeMode);

  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.genderOption,
        {
          backgroundColor: selected ? theme.colors.primary : theme.colors.card,
          borderColor: selected ? theme.colors.primary : theme.colors.border,
        },
      ]}
    >
      <Ionicons
        name={gender === "male" ? "male" : "female"}
        size={18}
        color={selected ? "#FFFFFF" : theme.colors.text}
      />
      <Text
        style={[
          styles.genderText,
          { color: selected ? "#FFFFFF" : theme.colors.text },
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

function splitFullName(fullName: string) {
  const [firstName = "-", ...lastNameParts] = fullName.trim().split(/\s+/);

  return {
    firstName: firstName || "-",
    lastName: lastNameParts.join(" ") || "-",
  };
}

const styles = StyleSheet.create({
  form: { gap: 16 },
  inputRow: { flexDirection: "row", gap: 12 },
  halfInput: { flex: 1 },
  label: {
    marginLeft: 4,
    marginBottom: -8,
    fontSize: 13,
    fontWeight: "800",
  },
  genderRow: { flexDirection: "row", gap: 8 },
  genderOption: {
    flex: 1,
    minHeight: 48,
    borderWidth: 1,
    borderRadius: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  genderText: { fontSize: 13, fontWeight: "800" },
  saveButton: { marginTop: 8 },
  focusCard: {
    marginTop: 22,
    minHeight: 120,
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 24,
    paddingVertical: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  focusTitle: { fontSize: 13, fontWeight: "700", textAlign: "center" },
  focusText: {
    marginTop: 10,
    fontSize: 13,
    lineHeight: 20,
    fontStyle: "italic",
    textAlign: "center",
  },
});
