import { Ionicons } from "@expo/vector-icons";
import { ImpactFeedbackStyle, impactAsync } from "expo-haptics";
import { router, type Href } from "expo-router";
import { useCallback, useEffect, useMemo, useRef } from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from "react-native";
import Animated, {
  FadeInDown,
  FadeInUp,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
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
const HOLD_INTERVAL_MS = 120;

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

function AgeDisplay({
  age,
  theme,
  language,
}: {
  age: number | null;
  theme: ReturnType<typeof getTheme>;
  language: "tr" | "en";
}) {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);
  const prevAge = useRef(age);

  useEffect(() => {
    if (age !== prevAge.current && age !== null) {
      scale.value = withSequence(
        withTiming(1.2, { duration: 100 }),
        withTiming(1, { duration: 200 }),
      );
      opacity.value = withSequence(
        withTiming(0.3, { duration: 80 }),
        withTiming(1, { duration: 150 }),
      );
    }
    prevAge.current = age;
  }, [age, scale, opacity]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  return (
    <View style={styles.ageDisplayCenter}>
      <Animated.Text
        style={[
          styles.ageNumber,
          animatedStyle,
          {
            color: age ? theme.colors.text : theme.colors.mutedText,
            fontFamily: theme.typography.headlineMd.fontFamily,
          },
        ]}
      >
        {age ?? "—"}
      </Animated.Text>
      <Text
        style={[
          styles.ageUnitText,
          {
            color: theme.colors.mutedText,
            fontFamily: theme.typography.bodyMd.fontFamily,
          },
        ]}
      >
        {translate("ageYears", language)}
      </Text>
    </View>
  );
}

type AgeButtonProps = {
  icon: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
  onPressIn: () => void;
  onPressOut: () => void;
  disabled: boolean;
  theme: ReturnType<typeof getTheme>;
  accessibilityLabel: string;
};

const AgeButton = ({
  icon,
  onPress,
  onPressIn,
  onPressOut,
  disabled,
  theme,
  accessibilityLabel,
}: AgeButtonProps) => {
  const scale = useSharedValue(1);

  const onPressInAnimated = useCallback(() => {
    scale.value = withTiming(0.88, { duration: 100 });
    onPressIn();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onPressIn]);

  const onPressOutAnimated = useCallback(() => {
    // eslint-disable-next-line react-hooks/immutability
    scale.value = withTiming(1, { duration: 150 });
    onPressOut();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onPressOut]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const btnColor = disabled ? theme.colors.mutedText : theme.colors.primary;
  const btnBg = disabled ? "transparent" : theme.colors.cardSoft;

  return (
    <Pressable
      onPress={onPress}
      onPressIn={onPressInAnimated}
      onPressOut={onPressOutAnimated}
      disabled={disabled}
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      hitSlop={8}
    >
      <Animated.View
        style={[
          styles.ageButton,
          animatedStyle,
          {
            backgroundColor: btnBg,
            borderColor: disabled ? theme.colors.border : theme.colors.primary,
          },
        ]}
      >
        <Ionicons name={icon} size={22} color={btnColor} />
      </Animated.View>
    </Pressable>
  );
};

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

  const holdTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const holdInterval = useRef<ReturnType<typeof setInterval> | null>(null);
  const didHold = useRef(false);
  const ageRef = useRef(age);

  useEffect(() => {
    ageRef.current = age;
  });

  const changeAgeBy = useCallback(
    (delta: number) => {
      const current = ageRef.current ?? 25;
      const next = Math.max(AGE_MIN, Math.min(AGE_MAX, current + delta));
      setAge(next);
    },
    [setAge],
  );

  const startHold = useCallback((delta: number) => {
    didHold.current = false;
    holdTimeout.current = setTimeout(() => {
      didHold.current = true;
      changeAgeBy(delta);
      impactAsync(ImpactFeedbackStyle.Light).catch(() => {});
      holdInterval.current = setInterval(() => {
        changeAgeBy(delta);
        impactAsync(ImpactFeedbackStyle.Light).catch(() => {});
      }, HOLD_INTERVAL_MS);
    }, 400);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const stopHold = useCallback(() => {
    if (holdTimeout.current !== null) {
      clearTimeout(holdTimeout.current);
      holdTimeout.current = null;
    }
    if (holdInterval.current !== null) {
      clearInterval(holdInterval.current);
      holdInterval.current = null;
    }
  }, []);

  const handleGenderSelect = useCallback(
    (value: OnboardingGender) => {
      setGender(value);
      impactAsync(ImpactFeedbackStyle.Light).catch(() => {});
    },
    [setGender],
  );

  const handleContinue = () => {
    router.push("/onboarding/step3" as Href);
  };

  const isMin = age === AGE_MIN;
  const isMax = age === AGE_MAX;

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

            <View
              style={[
                styles.ageCard,
                {
                  backgroundColor: theme.colors.card,
                  borderRadius: theme.radius.lg,
                  borderColor: theme.colors.border,
                },
              ]}
            >
              <View style={styles.ageRow}>
                <AgeButton
                  icon="remove"
                  onPress={() => {
                    if (!didHold.current) {
                      changeAgeBy(-1);
                      impactAsync(ImpactFeedbackStyle.Light).catch(() => {});
                    }
                  }}
                  onPressIn={() => startHold(-1)}
                  onPressOut={stopHold}
                  disabled={isMin}
                  theme={theme}
                  accessibilityLabel={translate("decrease", language)}
                />

                <AgeDisplay age={age} theme={theme} language={language} />

                <AgeButton
                  icon="add"
                  onPress={() => {
                    if (!didHold.current) {
                      changeAgeBy(1);
                      impactAsync(ImpactFeedbackStyle.Light).catch(() => {});
                    }
                  }}
                  onPressIn={() => startHold(1)}
                  onPressOut={stopHold}
                  disabled={isMax}
                  theme={theme}
                  accessibilityLabel={translate("increase", language)}
                />
              </View>
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
  ageCard: {
    borderWidth: 1,
    paddingVertical: 20,
    paddingHorizontal: 24,
  },
  ageRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  ageDisplayCenter: {
    alignItems: "center",
    flex: 1,
  },
  ageNumber: {
    fontSize: 32,
    fontWeight: "800",
    lineHeight: 38,
  },
  ageUnitText: {
    fontSize: 13,
    marginTop: 2,
  },
  ageButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
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
