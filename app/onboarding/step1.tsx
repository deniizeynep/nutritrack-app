import { Ionicons } from "@expo/vector-icons";
import { ImpactFeedbackStyle, impactAsync } from "expo-haptics";
import { router, type Href } from "expo-router";
import { useEffect, useMemo } from "react";
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
import { useOnboardingStore } from "../../src/stores/onboardingStore";
import { getTheme } from "../../src/theme/theme";
import type { GoalType } from "../../src/utils/calorieCalculator";

const TOTAL_STEPS = 3;

type GoalOption = {
  goalType: GoalType;
  icon: keyof typeof Ionicons.glyphMap;
  titleKey: "onboardingLoseWeightTitle" | "onboardingMaintainWeightTitle" | "onboardingGainWeightTitle";
  subtitleKey: "onboardingLoseWeightSubtitle" | "onboardingMaintainWeightSubtitle" | "onboardingGainWeightSubtitle";
};

const goalOptions: GoalOption[] = [
  {
    goalType: "lose",
    icon: "trending-down",
    titleKey: "onboardingLoseWeightTitle",
    subtitleKey: "onboardingLoseWeightSubtitle",
  },
  {
    goalType: "maintain",
    icon: "scale",
    titleKey: "onboardingMaintainWeightTitle",
    subtitleKey: "onboardingMaintainWeightSubtitle",
  },
  {
    goalType: "gain",
    icon: "fitness",
    titleKey: "onboardingGainWeightTitle",
    subtitleKey: "onboardingGainWeightSubtitle",
  },
];

function GoalCard({
  option,
  isSelected,
  onSelect,
  theme,
  language,
}: {
  option: GoalOption;
  isSelected: boolean;
  onSelect: () => void;
  theme: ReturnType<typeof getTheme>;
  language: "tr" | "en";
}) {
  const backgroundProgress = useSharedValue(isSelected ? 1 : 0);

  useEffect(() => {
    backgroundProgress.value = withTiming(isSelected ? 1 : 0, { duration: 250 });
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
      accessibilityLabel={`${translate(option.titleKey, language)}: ${translate(option.subtitleKey, language)}`}
      accessibilityRole="radio"
      accessibilityState={{ selected: isSelected }}
    >
      <Animated.View
        style={[
          styles.goalCard,
          {
            borderRadius: theme.radius.lg,
            borderWidth: 1.5,
          },
          animatedCardStyle,
          isSelected && { borderWidth: 2 },
        ]}
      >
        <View style={styles.goalCardLeft}>
          <Animated.View
            style={[
              styles.goalIconContainer,
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

          <View style={styles.goalCardText}>
            <Text
              style={[
                styles.goalCardTitle,
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
                styles.goalCardSubtitle,
                {
                  color: theme.colors.mutedText,
                  fontFamily: theme.typography.bodyMd.fontFamily,
                },
              ]}
            >
              {translate(option.subtitleKey, language)}
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

function AiInfoCard({
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
        <Ionicons
          name="bulb"
          size={26}
          color={theme.colors.primary}
        />
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
        {translate("onboardingAiInfo", language)}
      </Text>
    </View>
  );
}

export default function OnboardingStep1() {
  const themeMode = useAppStore((s) => s.themeMode);
  const language = useAppStore((s) => s.language);
  const theme = useMemo(() => getTheme(themeMode), [themeMode]);

  const selectedGoal = useOnboardingStore((s) => s.selectedGoal);
  const setSelectedGoal = useOnboardingStore((s) => s.setSelectedGoal);

  const { height: screenHeight } = useWindowDimensions();
  const isSmallScreen = screenHeight < 700;

  const handleGoalSelect = (goalType: GoalType) => {
    setSelectedGoal(goalType);
    impactAsync(ImpactFeedbackStyle.Light).catch(() => {});
  };

  const handleContinue = () => {
    router.push("/onboarding/step2" as Href);
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
            currentStep={1}
            totalSteps={TOTAL_STEPS}
            stepLabel={translate("onboardingSteps", language)}
          />

          <View style={styles.titleSection}>
            <Text
              style={[
                styles.title,
                {
                  color: theme.colors.text,
                  fontFamily: theme.typography.displayLg.fontFamily,
                  fontSize: isSmallScreen ? 26 : theme.typography.displayLg.fontSize,
                  lineHeight: isSmallScreen ? 32 : theme.typography.displayLg.lineHeight,
                },
              ]}
              accessibilityRole="header"
            >
              {translate("onboardingGoalTitle", language)}
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
              {translate("onboardingGoalSubtitle", language)}
            </Text>
          </View>

          <View style={styles.goalCardsSection}>
            {goalOptions.map((option) => (
              <GoalCard
                key={option.goalType}
                option={option}
                isSelected={selectedGoal === option.goalType}
                onSelect={() => handleGoalSelect(option.goalType)}
                theme={theme}
                language={language}
              />
            ))}
          </View>

          <AiInfoCard theme={theme} language={language} />

          <Animated.View
            style={styles.continueSection}
            entering={FadeInUp.duration(400).delay(200)}
          >
            <Button
              onPress={handleContinue}
              disabled={!selectedGoal}
              accessibilityLabel={translate("continueButton", language)}
              accessibilityRole="button"
            >
              <View style={styles.continueButtonContent}>
                <Text style={styles.continueButtonText}>
                  {translate("continueButton", language)}
                </Text>
                <Ionicons
                  name="arrow-forward"
                  size={18}
                  color="#FFFFFF"
                />
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
  goalCardsSection: {
    marginTop: 28,
    gap: 12,
  },
  goalCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 18,
    paddingHorizontal: 18,
    minHeight: 72,
  },
  goalCardLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    gap: 14,
  },
  goalIconContainer: {
    width: 48,
    height: 48,
    alignItems: "center",
    justifyContent: "center",
  },
  goalCardText: {
    flex: 1,
    gap: 4,
  },
  goalCardTitle: {
    fontWeight: "700",
    lineHeight: 24,
  },
  goalCardSubtitle: {
    fontSize: 13,
    lineHeight: 18,
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
