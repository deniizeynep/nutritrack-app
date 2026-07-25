import { Ionicons } from "@expo/vector-icons";
import { ImpactFeedbackStyle, impactAsync } from "expo-haptics";
import { router, type Href } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  useWindowDimensions,
} from "react-native";
import Animated, {
  FadeInDown,
  FadeInUp,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { Button } from "../../src/components/Button";
import { ProgressIndicator } from "../../src/components/ProgressIndicator";
import { Screen } from "../../src/components/Screen";
import { translate } from "../../src/i18n/translations";
import { useAppStore } from "../../src/stores/appStore";
import {
  useOnboardingStore,
  type OnboardingGender,
} from "../../src/stores/onboardingStore";
import { getTheme } from "../../src/theme/theme";

const TOTAL_STEPS = 3;
const AGE_MIN = 13;
const AGE_MAX = 100;

type GenderOption = {
  value: OnboardingGender;
  icon: keyof typeof Ionicons.glyphMap;
  labelKey: "genderMale" | "genderFemale" | "genderOther";
};

const genderOptions: GenderOption[] = [
  { value: "male", icon: "male", labelKey: "genderMale" },
  { value: "female", icon: "female", labelKey: "genderFemale" },
  { value: "other", icon: "transgender", labelKey: "genderOther" },
];

function GenderCard({
  option,
  isSelected,
  onSelect,
  theme,
  language,
}: {
  option: GenderOption;
  isSelected: boolean;
  onSelect: () => void;
  theme: ReturnType<typeof getTheme>;
  language: "tr" | "en";
}) {
  const backgroundProgress = useSharedValue(isSelected ? 1 : 0);

  useEffect(() => {
    backgroundProgress.value = withTiming(isSelected ? 1 : 0, {
      duration: 250,
    });
  }, [isSelected, backgroundProgress]);

  const animatedCardStyle = useAnimatedStyle(() => ({
    backgroundColor:
      backgroundProgress.value === 1
        ? theme.colors.primarySoft
        : theme.colors.card,
    borderColor:
      backgroundProgress.value === 1
        ? theme.colors.primary
        : theme.colors.border,
  }));

  return (
    <Pressable
      onPress={onSelect}
      style={({ pressed }) => ({
        transform: [{ scale: pressed ? 0.95 : 1 }],
        flex: 1,
      })}
      accessibilityLabel={translate(option.labelKey, language)}
      accessibilityRole="radio"
      accessibilityState={{ selected: isSelected }}
    >
      <Animated.View
        style={[
          styles.genderCard,
          {
            borderRadius: theme.radius.lg,
            borderWidth: 1.5,
          },
          animatedCardStyle,
          isSelected && { borderWidth: 2 },
        ]}
      >
        <View
          style={[
            styles.genderIconContainer,
            {
              backgroundColor: isSelected
                ? theme.colors.primary
                : theme.colors.cardSoft,
              borderRadius: theme.radius.full,
            },
          ]}
        >
          <Ionicons
            name={option.icon}
            size={26}
            color={isSelected ? "#FFFFFF" : theme.colors.primary}
          />
        </View>
        <Text
          style={[
            styles.genderLabel,
            {
              color: isSelected ? theme.colors.text : theme.colors.mutedText,
              fontFamily: theme.typography.labelMd.fontFamily,
            },
          ]}
        >
          {translate(option.labelKey, language)}
        </Text>
        {isSelected && (
          <Animated.View
            entering={FadeInDown.duration(200)}
            style={styles.genderCheckmark}
          >
            <Ionicons
              name="checkmark-circle"
              size={20}
              color={theme.colors.primary}
            />
          </Animated.View>
        )}
      </Animated.View>
    </Pressable>
  );
}

export default function OnboardingStep2() {
  const themeMode = useAppStore((s) => s.themeMode);
  const language = useAppStore((s) => s.language);
  const theme = useMemo(() => getTheme(themeMode), [themeMode]);

  const gender = useOnboardingStore((s) => s.gender);
  const age = useOnboardingStore((s) => s.age);
  const setGender = useOnboardingStore((s) => s.setGender);
  const setAge = useOnboardingStore((s) => s.setAge);

  const { height: screenHeight } = useWindowDimensions();
  const isSmallScreen = screenHeight < 700;

  const canContinue = gender !== null && age !== null;

  const [ageText, setAgeText] = useState(age !== null ? String(age) : "");

  const commitAgeFromText = useCallback(
    (text: string) => {
      const trimmed = text.trim();
      if (trimmed === "") {
        setAgeText("");
        return;
      }
      const parsed = parseInt(trimmed, 10);
      if (!isNaN(parsed) && parsed >= AGE_MIN && parsed <= AGE_MAX) {
        setAge(parsed);
        setAgeText(String(parsed));
        impactAsync(ImpactFeedbackStyle.Light).catch(() => {});
      } else {
        setAgeText(age !== null ? String(age) : "");
      }
    },
    [age, setAge],
  );

  const handleAgeBlur = useCallback(() => {
    commitAgeFromText(ageText);
  }, [ageText, commitAgeFromText]);

  const handleAgeSubmit = useCallback(() => {
    commitAgeFromText(ageText);
  }, [ageText, commitAgeFromText]);

  const handleGenderSelect = useCallback(
    (value: OnboardingGender) => {
      setGender(value);
      impactAsync(ImpactFeedbackStyle.Light).catch(() => {});
    },
    [setGender],
  );

  const changeAgeBy = useCallback(
    (delta: number) => {
      const current = age ?? 25;
      const newAge = Math.max(AGE_MIN, Math.min(AGE_MAX, current + delta));
      setAge(newAge);
      setAgeText(String(newAge));
      impactAsync(ImpactFeedbackStyle.Light).catch(() => {});
    },
    [age, setAge],
  );

  const handleContinue = () => {
    router.push("/onboarding/step3" as Href);
  };

  return (
    <Screen>
      <View style={styles.root}>
        <Animated.View
          style={styles.body}
          entering={FadeInUp.duration(400).springify()}
        >
          <ProgressIndicator
            currentStep={2}
            totalSteps={TOTAL_STEPS}
            stepLabel={translate("onboardingSteps", language)}
          />

          <View
            style={[
              styles.titleSection,
              isSmallScreen && styles.titleSectionSmall,
            ]}
          >
            <Text
              style={[
                styles.title,
                {
                  color: theme.colors.text,
                  fontFamily: theme.typography.displayLg.fontFamily,
                  fontSize: isSmallScreen
                    ? 26
                    : theme.typography.displayLg.fontSize,
                  lineHeight: isSmallScreen
                    ? 32
                    : theme.typography.displayLg.lineHeight,
                },
              ]}
              accessibilityRole="header"
            >
              {translate("onboardingPersonalTitle", language)}
            </Text>
            <Text
              style={[
                styles.subtitle,
                {
                  color: theme.colors.mutedText,
                  fontFamily: theme.typography.bodyMd.fontFamily,
                },
              ]}
            >
              {translate("onboardingPersonalSubtitle", language)}
            </Text>
          </View>

          <View
            style={[styles.section, isSmallScreen && styles.sectionSmall]}
          >
            <Text
              style={[
                styles.sectionLabel,
                {
                  color: theme.colors.mutedText,
                  fontFamily: theme.typography.labelMd.fontFamily,
                },
              ]}
            >
              {translate("genderLabel", language)}
            </Text>
            <View style={styles.genderRow}>
              {genderOptions.map((option) => (
                <GenderCard
                  key={option.value}
                  option={option}
                  isSelected={gender === option.value}
                  onSelect={() => handleGenderSelect(option.value)}
                  theme={theme}
                  language={language}
                />
              ))}
            </View>
          </View>

          <View
            style={[styles.section, isSmallScreen && styles.sectionSmall]}
          >
            <Text
              style={[
                styles.sectionLabel,
                {
                  color: theme.colors.mutedText,
                  fontFamily: theme.typography.labelMd.fontFamily,
                },
              ]}
            >
              {translate("ageLabel", language)}
            </Text>

            <View style={styles.ageInputCard}>
              <View
                style={[
                  styles.ageInputCardInner,
                  {
                    backgroundColor: theme.colors.card,
                    borderRadius: theme.radius.lg,
                    borderColor: theme.colors.border,
                  },
                ]}
              >
                <Pressable
                  onPress={() => changeAgeBy(-1)}
                  style={[
                    styles.ageStepperButton,
                    {
                      backgroundColor: theme.colors.cardSoft,
                      borderRadius: theme.radius.full,
                    },
                  ]}
                  accessibilityLabel={translate("decrease", language)}
                  accessibilityRole="button"
                  hitSlop={8}
                >
                  <Ionicons
                    name="remove"
                    size={22}
                    color={theme.colors.primary}
                  />
                </Pressable>

                <TextInput
                  style={[
                    styles.ageTextInput,
                    {
                      color: theme.colors.text,
                      fontFamily: theme.typography.headlineMd.fontFamily,
                      backgroundColor: theme.colors.card,
                    },
                  ]}
                  value={ageText}
                  onChangeText={setAgeText}
                  onBlur={handleAgeBlur}
                  onSubmitEditing={handleAgeSubmit}
                  keyboardType="numeric"
                  maxLength={3}
                  placeholder="—"
                  placeholderTextColor={theme.colors.mutedText}
                  textAlign="center"
                  selectTextOnFocus
                  accessibilityLabel={translate("ageLabel", language)}
                  returnKeyType="done"
                />

                <Pressable
                  onPress={() => changeAgeBy(1)}
                  style={[
                    styles.ageStepperButton,
                    {
                      backgroundColor: theme.colors.cardSoft,
                      borderRadius: theme.radius.full,
                    },
                  ]}
                  accessibilityLabel={translate("increase", language)}
                  accessibilityRole="button"
                  hitSlop={8}
                >
                  <Ionicons
                    name="add"
                    size={22}
                    color={theme.colors.primary}
                  />
                </Pressable>
              </View>

              <Text
                style={[
                  styles.ageUnitLabel,
                  {
                    color: theme.colors.mutedText,
                    fontFamily: theme.typography.bodyMd.fontFamily,
                  },
                ]}
              >
                {translate("ageYears", language)}
              </Text>
            </View>
          </View>
        </Animated.View>

        <Animated.View
          style={[
            styles.footer,
            {
              paddingBottom: isSmallScreen ? 16 : 24,
            },
          ]}
          entering={FadeInUp.duration(400).delay(200)}
        >
          <Button
            onPress={handleContinue}
            disabled={!canContinue}
            accessibilityLabel={translate("continueButton", language)}
            accessibilityRole="button"
          >
            <View style={styles.continueButtonContent}>
              <Text style={styles.continueButtonText}>
                {translate("continueButton", language)}
              </Text>
              <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />
            </View>
          </Button>
        </Animated.View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    paddingHorizontal: 20,
  },
  body: {
    flex: 1,
  },
  titleSection: {
    marginTop: 28,
  },
  titleSectionSmall: {
    marginTop: 18,
  },
  title: {
    fontWeight: "800",
    letterSpacing: -0.02,
    maxWidth: 320,
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 22,
    marginTop: 10,
    maxWidth: 340,
  },
  section: {
    marginTop: 28,
  },
  sectionSmall: {
    marginTop: 16,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: "600",
    letterSpacing: 1.5,
    marginBottom: 12,
  },
  genderRow: {
    flexDirection: "row",
    gap: 10,
  },
  genderCard: {
    paddingVertical: 16,
    paddingHorizontal: 10,
    alignItems: "center",
    minHeight: 108,
    justifyContent: "center",
  },
  genderIconContainer: {
    width: 48,
    height: 48,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  genderLabel: {
    fontSize: 12,
    fontWeight: "600",
    letterSpacing: 0.5,
  },
  genderCheckmark: {
    position: "absolute",
    top: 6,
    right: 6,
  },
  ageInputCard: {
    alignItems: "center",
  },
  ageInputCardInner: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1.5,
    paddingVertical: 16,
    paddingHorizontal: 20,
    gap: 16,
    width: "100%",
  },
  ageTextInput: {
    flex: 1,
    fontSize: 36,
    fontWeight: "800",
    height: 52,
    padding: 0,
    textAlign: "center",
  },
  ageStepperButton: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  ageUnitLabel: {
    fontSize: 13,
    marginTop: 10,
  },
  footer: {
    paddingTop: 8,
  },
  continueButtonContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  continueButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "900",
  },
});
