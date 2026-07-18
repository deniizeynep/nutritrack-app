import { Ionicons } from "@expo/vector-icons";
import { router, type Href } from "expo-router";
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

export default function PersonalInformationScreen() {
  const themeMode = useAppStore((state) => state.themeMode);
  const language = useAppStore((state) => state.language);
  const user = useAuthStore((state) => state.user);
  const token = useAuthStore((state) => state.token);
  const authIsLoading = useAuthStore((state) => state.isLoading);
  const updateProfile = useAuthStore((state) => state.updateProfile);
  const requestEmailChange = useAuthStore((state) => state.requestEmailChange);
  const pendingEmailChange = useAuthStore((state) => state.pendingEmailChange);
  const loadMe = useAuthStore((state) => state.loadMe);
  const goal = useGoalStore((state) => state.goal);
  const goalIsLoading = useGoalStore((state) => state.isLoading);
  const setGoal = useGoalStore((state) => state.setGoal);
  const theme = getTheme(themeMode);
  const [heightCm, setHeightCm] = useState(goal ? String(goal.heightCm) : "");
  const [weightKg, setWeightKg] = useState(goal ? String(goal.weightKg) : "");
  const [gender, setGender] = useState<Gender>(goal?.gender ?? "female");
  const [birthDate, setBirthDate] = useState(formatBirthDate(goal?.birthDate));
  const initialName = splitFullName(user?.fullName ?? "");
  const [firstName, setFirstName] = useState(initialName.firstName);
  const [lastName, setLastName] = useState(initialName.lastName);
  const [email, setEmail] = useState(user?.email ?? "");

  useEffect(() => {
    if (token && !user && !authIsLoading) {
      void loadMe();
    }
  }, [authIsLoading, loadMe, token, user]);

  useEffect(() => {
    if (!goal) {
      return;
    }

    // Controlled fields must follow a goal restored from persisted storage.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setHeightCm(String(goal.heightCm));
    setWeightKg(String(goal.weightKg));
    setGender(goal.gender);
    setBirthDate(formatBirthDate(goal.birthDate));
  }, [goal]);

  useEffect(() => {
    const name = splitFullName(user?.fullName ?? "");

    // Controlled fields must follow account data refreshed after a save.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setFirstName(name.firstName);
    setLastName(name.lastName);
  }, [user?.fullName]);

  useEffect(() => {
    // Keep an unsaved email edit when only the user's name is refreshed.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setEmail(user?.email ?? "");
  }, [user?.email]);

  const saveChanges = async (
    parsedHeight: number,
    parsedWeight: number,
    parsedBirthDate: NonNullable<ReturnType<typeof parseBirthDate>>,
    fullName: string,
    normalizedEmail: string,
  ) => {
    if (!goal) {
      return;
    }

    const calories = calculateDailyCalories({
      age: parsedBirthDate.age,
      heightCm: parsedHeight,
      weightKg: parsedWeight,
      gender,
      activityLevel: goal.activityLevel,
      goalType: goal.goalType,
    });
    const macros = calculateMacroTargets(calories.targetCalories, goal.goalType);

    try {
      await Promise.all([
        setGoal(
          {
            ...goal,
            age: parsedBirthDate.age,
            birthDate: parsedBirthDate.iso,
            heightCm: parsedHeight,
            weightKg: parsedWeight,
            gender,
            ...calories,
            targetProtein: macros.protein,
            targetCarbs: macros.carbs,
            targetFat: macros.fat,
          },
          token,
        ),
        updateProfile(fullName),
      ]);

      if (normalizedEmail !== user?.email.toLowerCase()) {
        await requestEmailChange(normalizedEmail);
        router.push("/profile-email-verification" as Href);
        return;
      }

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

  const handleSave = () => {
    const parsedHeight = Number(heightCm);
    const parsedWeight = Number(weightKg);
    const parsedBirthDate = parseBirthDate(birthDate);
    const fullName = [firstName.trim(), lastName.trim()].filter(Boolean).join(" ");
    const normalizedEmail = email.trim().toLowerCase();

    if (
      !goal ||
      firstName.trim().length < 2 ||
      !/^[^\s@]+@gmail\.com$/.test(normalizedEmail) ||
      !parsedBirthDate ||
      !Number.isInteger(parsedHeight) ||
      parsedHeight < 100 ||
      parsedHeight > 230 ||
      !Number.isInteger(parsedWeight) ||
      parsedWeight < 30 ||
      parsedWeight > 250
    ) {
      Alert.alert(
        translate("error", language),
        translate("accountInformationValidation", language),
      );
      return;
    }

    const hasChanges =
      fullName !== user?.fullName.trim() ||
      normalizedEmail !== user?.email.toLowerCase() ||
      parsedBirthDate.iso !== goal.birthDate ||
      gender !== goal.gender ||
      parsedHeight !== goal.heightCm ||
      parsedWeight !== goal.weightKg;

    if (!hasChanges) {
      Alert.alert(
        translate("personalInformation", language),
        translate("noAccountChanges", language),
      );
      return;
    }

    Alert.alert(
      translate("confirmAccountChanges", language),
      translate("confirmAccountChangesMessage", language),
      [
        { text: translate("cancel", language), style: "cancel" },
        {
          text: translate("save", language),
          onPress: () =>
            void saveChanges(
              parsedHeight,
              parsedWeight,
              parsedBirthDate,
              fullName,
              normalizedEmail,
            ),
        },
      ],
    );
  };

  return (
    <ProfilePage
      title={translate("personalInformation", language)}
      subtitle={translate("personalInformationSubtitle", language)}
      compactHeader
    >
      <View style={styles.form}>
        {pendingEmailChange ? (
          <Pressable
            onPress={() =>
              router.push("/profile-email-verification" as Href)
            }
            style={[
              styles.pendingEmailCard,
              {
                backgroundColor: theme.colors.primarySoft,
                borderColor: theme.colors.primary,
              },
            ]}
          >
            <Ionicons name="mail-unread-outline" size={21} color={theme.colors.primary} />
            <View style={styles.pendingEmailTextArea}>
              <Text
                style={[styles.pendingEmailTitle, { color: theme.colors.text }]}
              >
                {translate("pendingEmailChange", language)}
              </Text>
              <Text
                style={[styles.pendingEmailText, { color: theme.colors.mutedText }]}
              >
                {pendingEmailChange.email}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={19} color={theme.colors.primary} />
          </Pressable>
        ) : null}

        <View style={styles.inputRow}>
          <View style={styles.halfInput}>
            <Input
              label={translate("firstName", language)}
              value={firstName}
              onChangeText={setFirstName}
              autoCapitalize="words"
            />
          </View>
          <View style={styles.halfInput}>
            <Input
              label={translate("lastName", language)}
              value={lastName}
              onChangeText={setLastName}
              autoCapitalize="words"
            />
          </View>
        </View>

        <Input
          label={translate("email", language)}
          icon="mail-outline"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
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
          value={birthDate}
          onChangeText={(value) => setBirthDate(formatBirthDateInput(value))}
          placeholder={translate("birthDatePlaceholder", language)}
          keyboardType="number-pad"
          maxLength={10}
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
              label={`${translate("weight", language)} (kg)`}
              icon="scale-outline"
              value={weightKg}
              onChangeText={setWeightKg}
              keyboardType="number-pad"
            />
          </View>
        </View>

        <Button
          onPress={handleSave}
          disabled={authIsLoading || goalIsLoading || !goal}
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
  const [firstName = "", ...lastNameParts] = fullName.trim().split(/\s+/);

  return {
    firstName,
    lastName: lastNameParts.join(" "),
  };
}

function formatBirthDate(value?: string | null) {
  if (!value) {
    return "";
  }

  const [year, month, day] = value.split("-");
  return `${day}.${month}.${year}`;
}

function formatBirthDateInput(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 8);
  const parts = [digits.slice(0, 2), digits.slice(2, 4), digits.slice(4)];
  return parts.filter(Boolean).join(".");
}

function parseBirthDate(value: string) {
  const match = /^(\d{2})\.(\d{2})\.(\d{4})$/.exec(value);

  if (!match) {
    return null;
  }

  const [, dayText, monthText, yearText] = match;
  const day = Number(dayText);
  const month = Number(monthText);
  const year = Number(yearText);
  const date = new Date(year, month - 1, day);

  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return null;
  }

  const today = new Date();
  let age = today.getFullYear() - year;

  if (
    today.getMonth() < month - 1 ||
    (today.getMonth() === month - 1 && today.getDate() < day)
  ) {
    age -= 1;
  }

  if (date > today || age < 13 || age > 100) {
    return null;
  }

  return {
    age,
    iso: `${yearText}-${monthText}-${dayText}`,
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
  pendingEmailCard: {
    minHeight: 68,
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  pendingEmailTextArea: { flex: 1 },
  pendingEmailTitle: { fontSize: 13, fontWeight: "900" },
  pendingEmailText: { marginTop: 3, fontSize: 12, fontWeight: "600" },
});
