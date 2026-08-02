import { Ionicons } from "@expo/vector-icons";
import { ImpactFeedbackStyle, impactAsync } from "expo-haptics";
import { router, type Href } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import {
  Pressable,
  ScrollView,
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
  withTiming,
} from "react-native-reanimated";
import { Button } from "../../src/components/Button";
import { ProgressIndicator } from "../../src/components/ProgressIndicator";
import { Screen } from "../../src/components/Screen";
import { translate } from "../../src/i18n/translations";
import { useAppStore } from "../../src/stores/appStore";
import { useAuthStore } from "../../src/stores/authStore";
import { useGoalStore } from "../../src/stores/goalStore";
import { useOnboardingStore } from "../../src/stores/onboardingStore";
import { getTheme } from "../../src/theme/theme";
import {
  calculateDailyCalories,
  calculateMacroTargets,
  type ActivityLevel,
  type Gender,
} from "../../src/utils/calorieCalculator";

const TOTAL_STEPS = 3;

type ActivityOption = {
  value: ActivityLevel;
  icon: keyof typeof Ionicons.glyphMap;
  titleKey: "sedentaryTitle" | "lightTitle" | "activeTitle" | "veryActiveTitle";
  descKey: "sedentaryDesc" | "lightDesc" | "activeDesc" | "veryActiveDesc";
};

const activityOptions: ActivityOption[] = [
  {
    value: "sedentary",
    icon: "briefcase",
    titleKey: "sedentaryTitle",
    descKey: "sedentaryDesc",
  },
  {
    value: "light",
    icon: "walk",
    titleKey: "lightTitle",
    descKey: "lightDesc",
  },
  {
    value: "active",
    icon: "fitness",
    titleKey: "activeTitle",
    descKey: "activeDesc",
  },
  {
    value: "veryActive",
    icon: "flash",
    titleKey: "veryActiveTitle",
    descKey: "veryActiveDesc",
  },
];

function ActivityCard({
  option,
  isSelected,
  onSelect,
  theme,
  language,
}: {
  option: ActivityOption;
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
        transform: [{ scale: pressed ? 0.98 : 1 }],
      })}
      accessibilityLabel={`${translate(option.titleKey, language)}: ${translate(option.descKey, language)}`}
      accessibilityRole="radio"
      accessibilityState={{ selected: isSelected }}
    >
      <Animated.View
        style={[
          styles.activityCard,
          {
            borderRadius: theme.radius.lg,
            borderWidth: 1.5,
          },
          animatedCardStyle,
          isSelected && { borderWidth: 2 },
        ]}
      >
        <View style={styles.activityCardLeft}>
          <Animated.View
            style={[
              styles.activityIconContainer,
              {
                backgroundColor: isSelected
                  ? theme.colors.primary
                  : theme.colors.cardSoft,
                borderRadius: theme.radius.md,
              },
            ]}
          >
            <Ionicons
              name={option.icon}
              size={22}
              color={isSelected ? "#FFFFFF" : theme.colors.primary}
            />
          </Animated.View>

          <View style={styles.activityCardText}>
            <Text
              style={[
                styles.activityCardTitle,
                {
                  color: theme.colors.text,
                  fontFamily: theme.typography.headlineMd.fontFamily,
                  fontSize: theme.typography.headlineMd.fontSize,
                },
              ]}
            >
              {translate(option.titleKey, language)}
            </Text>
            <Text
              style={[
                styles.activityCardSubtitle,
                {
                  color: theme.colors.mutedText,
                  fontFamily: theme.typography.bodyMd.fontFamily,
                },
              ]}
            >
              {translate(option.descKey, language)}
            </Text>
          </View>
        </View>

        {isSelected && (
          <Animated.View entering={FadeInDown.duration(250)}>
            <Ionicons
              name="checkmark-circle"
              size={26}
              color={theme.colors.primary}
            />
          </Animated.View>
        )}
      </Animated.View>
    </Pressable>
  );
}

function SummaryCard({
  theme,
  language,
}: {
  theme: ReturnType<typeof getTheme>;
  language: "tr" | "en";
}) {
  const selectedGoal = useOnboardingStore((s) => s.selectedGoal);
  const gender = useOnboardingStore((s) => s.gender);
  const age = useOnboardingStore((s) => s.age);
  const height = useOnboardingStore((s) => s.height);
  const weight = useOnboardingStore((s) => s.weight);
  const activityLevel = useOnboardingStore((s) => s.activityLevel);

  const goalLabel =
    selectedGoal === "lose"
      ? translate("loseWeight", language)
      : selectedGoal === "maintain"
        ? translate("maintainWeight", language)
        : translate("gainWeight", language);

  const genderLabel =
    gender === "male"
      ? translate("genderMale", language)
      : gender === "female"
        ? translate("genderFemale", language)
        : translate("genderOther", language);

  const activityLabel =
    activityLevel === "sedentary"
      ? translate("sedentaryTitle", language)
      : activityLevel === "light"
        ? translate("lightTitle", language)
        : activityLevel === "active"
          ? translate("activeTitle", language)
          : activityLevel === "veryActive"
            ? translate("veryActiveTitle", language)
            : "";

  const rows = [
    { icon: "fitness" as const, label: translate("summaryGoal", language), value: goalLabel },
    { icon: "person" as const, label: translate("summaryGender", language), value: genderLabel },
    { icon: "calendar" as const, label: translate("summaryAge", language), value: age !== null ? `${age}` : "" },
    { icon: "resize" as const, label: translate("summaryHeight", language), value: height !== null ? `${height} cm` : "" },
    { icon: "scale" as const, label: translate("summaryWeight", language), value: weight !== null ? `${weight} kg` : "" },
    { icon: "walk" as const, label: translate("summaryActivity", language), value: activityLabel },
  ];

  return (
    <View
      style={[
        styles.summaryCard,
        {
          backgroundColor: theme.colors.card,
          borderColor: theme.colors.border,
          borderRadius: theme.radius.lg,
        },
        theme.elevation.card,
      ]}
    >
      {rows.map((row, index) => (
        <View key={index}>
          {index > 0 && (
            <View
              style={[
                styles.summaryDivider,
                { backgroundColor: theme.colors.border },
              ]}
            />
          )}
          <View style={styles.summaryRow}>
            <View style={styles.summaryIconCircle}>
              <Ionicons
                name={row.icon}
                size={16}
                color={theme.colors.primary}
              />
            </View>
            <Text
              style={[
                styles.summaryLabel,
                {
                  color: theme.colors.mutedText,
                  fontFamily: theme.typography.bodyMd.fontFamily,
                },
              ]}
            >
              {row.label}
            </Text>
            <Text
              style={[
                styles.summaryValue,
                {
                  color: theme.colors.text,
                  fontFamily: theme.typography.headlineMd.fontFamily,
                },
              ]}
            >
              {row.value}
            </Text>
          </View>
        </View>
      ))}
    </View>
  );
}

function AiInfoCardStep3({
  theme,
  language,
}: {
  theme: ReturnType<typeof getTheme>;
  language: "tr" | "en";
}) {
  return (
    <View
      style={[
        styles.aiCard,
        {
          backgroundColor: theme.colors.cardSoft,
          borderRadius: theme.radius.lg,
          borderWidth: 1,
          borderColor: theme.colors.border,
        },
      ]}
    >
      <View
        style={[
          styles.aiIconCircle,
          {
            backgroundColor: theme.colors.card,
            borderRadius: theme.radius.full,
          },
        ]}
      >
        <Ionicons name="hardware-chip-outline" size={26} color={theme.colors.primary} />
      </View>

      <Text
        style={[
          styles.aiText,
          {
            color: theme.colors.mutedText,
            fontFamily: theme.typography.bodyMd.fontFamily,
            fontSize: theme.typography.bodyMd.fontSize,
            lineHeight: theme.typography.bodyMd.lineHeight,
          },
        ]}
      >
        {translate("onboardingAiInfoStep3", language)}
      </Text>
    </View>
  );
}

export default function OnboardingStep3() {
  const themeMode = useAppStore((s) => s.themeMode);
  const language = useAppStore((s) => s.language);
  const theme = useMemo(() => getTheme(themeMode), [themeMode]);

  const selectedGoal = useOnboardingStore((s) => s.selectedGoal);
  const gender = useOnboardingStore((s) => s.gender);
  const age = useOnboardingStore((s) => s.age);
  const height = useOnboardingStore((s) => s.height);
  const weight = useOnboardingStore((s) => s.weight);
  const activityLevel = useOnboardingStore((s) => s.activityLevel);
  const setActivityLevel = useOnboardingStore((s) => s.setActivityLevel);

  const token = useAuthStore((s) => s.token);
  const setGoal = useGoalStore((s) => s.setGoal);
  const setOnboardingCompleted = useAppStore((s) => s.setOnboardingCompleted);

  const { height: screenHeight } = useWindowDimensions();
  const isSmallScreen = screenHeight < 700;

  const [isSaving, setIsSaving] = useState(false);

  const canContinue =
    selectedGoal !== null &&
    gender !== null &&
    age !== null &&
    height !== null &&
    weight !== null &&
    activityLevel !== null;

  const handleActivitySelect = (level: ActivityLevel) => {
    setActivityLevel(level);
    impactAsync(ImpactFeedbackStyle.Light).catch(() => {});
  };

  const handleFinish = async () => {
    if (isSaving || !canContinue) return;

    setIsSaving(true);

    try {
      if (age !== null && height !== null && weight !== null) {
        const calcGender: Gender =
          gender === "male" ? "male" : "female";

        const calorieResult = calculateDailyCalories({
          gender: calcGender,
          age,
          heightCm: height,
          weightKg: weight,
          activityLevel,
          goalType: selectedGoal,
        });

        const macroTargets = calculateMacroTargets(
          calorieResult.targetCalories,
          selectedGoal,
        );

        await setGoal(
          {
            age,
            heightCm: height,
            weightKg: weight,
            gender: calcGender,
            activityLevel,
            goalType: selectedGoal,
            bmr: calorieResult.bmr,
            maintenanceCalories: calorieResult.maintenanceCalories,
            targetCalories: calorieResult.targetCalories,
            targetProtein: macroTargets.protein,
            targetCarbs: macroTargets.carbs,
            targetFat: macroTargets.fat,
          },
          token,
        );
      }

      setOnboardingCompleted(true);
      router.replace("/(tabs)/home" as Href);
    } catch {
      setIsSaving(false);
    }
  };

  return (
    <Screen>
      <ScrollView
        contentContainerStyle={[
          styles.scroll,
          {
            paddingBottom: isSmallScreen ? 24 : 40,
          },
        ]}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        <Animated.View
          style={styles.content}
          entering={FadeInUp.duration(400).springify()}
        >
          <ProgressIndicator
            currentStep={3}
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
              {translate("onboardingFinalTitle", language)}
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
              {translate("onboardingFinalSubtitle", language)}
            </Text>
          </View>

          <View
            style={[
              styles.section,
              isSmallScreen && styles.sectionSmall,
            ]}
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
              {translate("activityLevelLabel", language)}
            </Text>

            <View style={styles.activityCardsSection}>
              {activityOptions.map((option) => (
                <ActivityCard
                  key={option.value}
                  option={option}
                  isSelected={activityLevel === option.value}
                  onSelect={() => handleActivitySelect(option.value)}
                  theme={theme}
                  language={language}
                />
              ))}
            </View>
          </View>

          <View
            style={[
              styles.section,
              isSmallScreen && styles.sectionSmall,
            ]}
          >
            <SummaryCard theme={theme} language={language} />
          </View>

          <AiInfoCardStep3 theme={theme} language={language} />

          <Animated.View
            style={styles.continueSection}
            entering={FadeInUp.duration(400).delay(200)}
          >
            <Button
              onPress={() => {
                void handleFinish();
              }}
              disabled={!canContinue || isSaving}
              accessibilityLabel={translate("createPlanButton", language)}
              accessibilityRole="button"
            >
              <View style={styles.continueButtonContent}>
                <Text style={styles.continueButtonText}>
                  {translate("createPlanButton", language)}
                </Text>
                <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />
              </View>
            </Button>
          </Animated.View>
        </Animated.View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
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
  activityCardsSection: {
    gap: 12,
  },
  activityCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 18,
    paddingHorizontal: 18,
    minHeight: 72,
  },
  activityCardLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    gap: 14,
  },
  activityIconContainer: {
    width: 48,
    height: 48,
    alignItems: "center",
    justifyContent: "center",
  },
  activityCardText: {
    flex: 1,
    gap: 4,
  },
  activityCardTitle: {
    fontWeight: "700",
    lineHeight: 24,
  },
  activityCardSubtitle: {
    fontSize: 13,
    lineHeight: 18,
  },
  summaryCard: {
    borderWidth: 1,
    paddingVertical: 8,
    paddingHorizontal: 18,
  },
  summaryDivider: {
    height: 1,
  },
  summaryRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
  },
  summaryIconCircle: {
    marginRight: 12,
  },
  summaryLabel: {
    fontSize: 14,
    flex: 1,
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: "700",
  },
  aiCard: {
    marginTop: 24,
    paddingHorizontal: 24,
    paddingVertical: 28,
    alignItems: "center",
    gap: 16,
  },
  aiIconCircle: {
    width: 56,
    height: 56,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 1,
  },
  aiText: {
    textAlign: "center",
    lineHeight: 22,
  },
  continueSection: {
    marginTop: 28,
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
