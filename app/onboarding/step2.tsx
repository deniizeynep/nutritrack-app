import { Ionicons } from "@expo/vector-icons";
import { ImpactFeedbackStyle, impactAsync } from "expo-haptics";
import { router, type Href } from "expo-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
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
const HEIGHT_MIN = 100;
const HEIGHT_MAX = 250;
const WEIGHT_MIN = 30;
const WEIGHT_MAX = 300;
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

function AgeNumberDisplay({
  age,
  theme,
}: {
  age: number | null;
  theme: ReturnType<typeof getTheme>;
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

function MetricInput({
  label,
  value,
  onChangeText,
  onBlur,
  placeholder,
  unit,
  theme,
  keyboardType = "numeric" as const,
}: {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  onBlur: () => void;
  placeholder: string;
  unit: string;
  theme: ReturnType<typeof getTheme>;
  keyboardType?: "numeric" | "decimal-pad";
}) {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <View style={styles.metricContainer}>
      <Text
        style={[
          styles.metricLabel,
          {
            color: theme.colors.mutedText,
            fontFamily: theme.typography.labelMd.fontFamily,
          },
        ]}
      >
        {label}
      </Text>
      <View
        style={[
          styles.metricInputWrapper,
          {
            backgroundColor: theme.colors.card,
            borderColor: isFocused ? theme.colors.primary : theme.colors.border,
            borderRadius: theme.radius.md,
          },
        ]}
      >
        <TextInput
          style={[
            styles.metricInput,
            {
              color: theme.colors.text,
              fontFamily: theme.typography.bodyLg.fontFamily,
            },
          ]}
          value={value}
          onChangeText={onChangeText}
          onBlur={() => {
            setIsFocused(false);
            onBlur();
          }}
          onFocus={() => setIsFocused(true)}
          placeholder={placeholder}
          placeholderTextColor={theme.colors.mutedText}
          keyboardType={keyboardType}
          selectTextOnFocus
          returnKeyType="done"
        />
        <Text
          style={[
            styles.metricUnit,
            {
              color: theme.colors.mutedText,
              fontFamily: theme.typography.bodyMd.fontFamily,
            },
          ]}
        >
          {unit}
        </Text>
      </View>
    </View>
  );
}

export default function OnboardingStep2() {
  const themeMode = useAppStore((s) => s.themeMode);
  const language = useAppStore((s) => s.language);
  const theme = useMemo(() => getTheme(themeMode), [themeMode]);

  const gender = useOnboardingStore((s) => s.gender);
  const age = useOnboardingStore((s) => s.age);
  const height = useOnboardingStore((s) => s.height);
  const weight = useOnboardingStore((s) => s.weight);
  const setGender = useOnboardingStore((s) => s.setGender);
  const setAge = useOnboardingStore((s) => s.setAge);
  const setHeight = useOnboardingStore((s) => s.setHeight);
  const setWeight = useOnboardingStore((s) => s.setWeight);

  const { height: screenHeight } = useWindowDimensions();
  const isSmallScreen = screenHeight < 700;

  const holdTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const holdInterval = useRef<ReturnType<typeof setInterval> | null>(null);
  const didHold = useRef(false);
  const ageRef = useRef(age);

  useEffect(() => {
    ageRef.current = age;
  });

  const [isEditingAge, setIsEditingAge] = useState(false);
  const [ageEditText, setAgeEditText] = useState("");
  const ageInputRef = useRef<TextInput>(null);

  const [heightText, setHeightText] = useState(
    height !== null ? String(height) : "",
  );
  const [weightText, setWeightText] = useState(
    weight !== null ? formatWeightText(weight) : "",
  );

  const canContinue =
    gender !== null &&
    age !== null &&
    height !== null &&
    weight !== null;

  const changeAgeBy = useCallback(
    (delta: number) => {
      const current = ageRef.current ?? 25;
      const next = Math.max(AGE_MIN, Math.min(AGE_MAX, current + delta));
      setAge(next);
    },
    [setAge],
  );

  const startHold = useCallback(
    (delta: number) => {
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
    },
    [changeAgeBy],
  );

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

  const startEditingAge = () => {
    setAgeEditText(age !== null ? String(age) : "");
    setIsEditingAge(true);
    setTimeout(() => ageInputRef.current?.focus(), 50);
  };

  const commitAge = useCallback(() => {
    const trimmed = ageEditText.trim();
    if (trimmed === "") {
      setIsEditingAge(false);
      return;
    }
    const parsed = parseInt(trimmed, 10);
    if (!isNaN(parsed) && parsed >= AGE_MIN && parsed <= AGE_MAX) {
      setAge(parsed);
    }
    setIsEditingAge(false);
  }, [ageEditText, setAge]);

  const commitHeight = useCallback(() => {
    const trimmed = heightText.trim();
    if (trimmed === "") {
      setHeight(null);
      setHeightText("");
      return;
    }
    const parsed = parseInt(trimmed, 10);
    if (!isNaN(parsed) && parsed >= HEIGHT_MIN && parsed <= HEIGHT_MAX) {
      setHeight(parsed);
      setHeightText(String(parsed));
    } else if (height !== null) {
      setHeightText(String(height));
    } else {
      setHeightText("");
    }
  }, [heightText, height, setHeight]);

  const commitWeight = useCallback(() => {
    const trimmed = weightText.trim();
    if (trimmed === "") {
      setWeight(null);
      setWeightText("");
      return;
    }
    const normalized = trimmed.replace(",", ".");
    const parsed = parseFloat(normalized);
    if (
      !isNaN(parsed) &&
      parsed >= WEIGHT_MIN &&
      parsed <= WEIGHT_MAX
    ) {
      setWeight(parsed);
      setWeightText(formatWeightText(parsed));
    } else if (weight !== null) {
      setWeightText(formatWeightText(weight));
    } else {
      setWeightText("");
    }
  }, [weightText, weight, setWeight]);

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

                {isEditingAge ? (
                  <View style={styles.ageDisplayCenter}>
                    <TextInput
                      ref={ageInputRef}
                      style={[
                        styles.ageEditInput,
                        {
                          color: theme.colors.text,
                          fontFamily: theme.typography.headlineMd.fontFamily,
                        },
                      ]}
                      value={ageEditText}
                      onChangeText={setAgeEditText}
                      onBlur={commitAge}
                      onSubmitEditing={commitAge}
                      keyboardType="numeric"
                      maxLength={3}
                      textAlign="center"
                      selectTextOnFocus
                      returnKeyType="done"
                    />
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
                ) : (
                  <Pressable
                    onPress={startEditingAge}
                    style={styles.ageDisplayCenter}
                    accessibilityLabel={`${translate("ageLabel", language)}: ${age ?? "—"}`}
                    accessibilityRole="button"
                    accessibilityHint={translate("editField", language)}
                  >
                    <AgeNumberDisplay age={age} theme={theme} />
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
                  </Pressable>
                )}

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

          <View
            style={[styles.metricsRow, isSmallScreen && styles.metricsRowSmall]}
          >
            <MetricInput
              label={translate("height", language)}
              value={heightText}
              onChangeText={setHeightText}
              onBlur={commitHeight}
              placeholder={translate("heightPlaceholder", language)}
              unit="cm"
              theme={theme}
            />

            <MetricInput
              label={translate("weight", language)}
              value={weightText}
              onChangeText={setWeightText}
              onBlur={commitWeight}
              placeholder={translate("weightPlaceholder", language)}
              unit="kg"
              theme={theme}
              keyboardType="decimal-pad"
            />
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

function formatWeightText(value: number): string {
  if (Number.isInteger(value)) return String(value);
  return value.toFixed(1);
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
  ageEditInput: {
    fontSize: 32,
    fontWeight: "800",
    height: 44,
    width: 80,
    padding: 0,
    textAlign: "center",
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
  metricsRow: {
    marginTop: 18,
    flexDirection: "row",
    gap: 12,
  },
  metricsRowSmall: {
    marginTop: 12,
  },
  metricContainer: {
    flex: 1,
    gap: 6,
  },
  metricLabel: {
    fontSize: 11,
    fontWeight: "600",
    letterSpacing: 1.2,
  },
  metricInputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 14,
    minHeight: 50,
  },
  metricInput: {
    flex: 1,
    fontSize: 18,
    fontWeight: "700",
    padding: 0,
    height: 40,
  },
  metricUnit: {
    fontSize: 13,
    fontWeight: "500",
    marginLeft: 6,
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
