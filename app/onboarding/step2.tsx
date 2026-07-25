import { Ionicons } from "@expo/vector-icons";
import { ImpactFeedbackStyle, impactAsync } from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { router, type Href } from "expo-router";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
} from "react";
import {
  FlatList,
  Image,
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
import {
  useOnboardingStore,
  type OnboardingGender,
} from "../../src/stores/onboardingStore";
import { getTheme } from "../../src/theme/theme";

const TOTAL_STEPS = 3;
const AGE_MIN = 13;
const AGE_MAX = 100;
const AGE_ITEM_HEIGHT = 44;
const AGE_VISIBLE_COUNT = 7;

const ages = Array.from(
  { length: AGE_MAX - AGE_MIN + 1 },
  (_, i) => AGE_MIN + i,
);

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

const DEFAULT_AGE_INDEX = 12;

function AgePicker({
  selectedAge,
  onSelectAge,
  theme,
}: {
  selectedAge: number | null;
  onSelectAge: (age: number) => void;
  theme: ReturnType<typeof getTheme>;
}) {
  const flatListRef = useRef<FlatList<number>>(null);
  const selectedAgeRef = useRef(selectedAge);

  useEffect(() => {
    selectedAgeRef.current = selectedAge;
  });

  const containerHeight = AGE_ITEM_HEIGHT * AGE_VISIBLE_COUNT;

  const renderAgeItem = useCallback(
    ({ item }: { item: number }) => {
      const isActive = selectedAgeRef.current === item;
      return (
        <View style={styles.ageItem}>
          <Text
            style={[
              styles.ageItemText,
              {
                color: isActive ? theme.colors.text : theme.colors.mutedText,
                fontFamily: theme.typography.bodyMd.fontFamily,
                fontSize: isActive ? 24 : 16,
                fontWeight: isActive ? "700" : "400",
              },
            ]}
          >
            {item}
          </Text>
        </View>
      );
    },
    [theme],
  );

  const handleMomentumEnd = useCallback(
    (e: { nativeEvent: { contentOffset: { y: number } } }) => {
      const index = Math.round(
        e.nativeEvent.contentOffset.y / AGE_ITEM_HEIGHT,
      );
      const clampedIndex = Math.max(0, Math.min(index, ages.length - 1));
      const age = ages[clampedIndex];
      if (age !== selectedAgeRef.current) {
        impactAsync(ImpactFeedbackStyle.Light).catch(() => {});
        onSelectAge(age);
      }
    },
    [onSelectAge],
  );

  const getItemLayout = useCallback(
    (_: unknown, index: number) => ({
      length: AGE_ITEM_HEIGHT,
      offset: AGE_ITEM_HEIGHT * index,
      index,
    }),
    [],
  );

  return (
    <View
      style={[
        styles.agePickerContainer,
        {
          height: containerHeight,
          borderRadius: theme.radius.lg,
          backgroundColor: theme.colors.card,
          borderWidth: 1,
          borderColor: theme.colors.border,
        },
      ]}
    >
      <View
        style={[
          styles.ageHighlightBar,
          {
            backgroundColor: theme.colors.primarySoft,
            borderRadius: theme.radius.md,
            top: (containerHeight - AGE_ITEM_HEIGHT) / 2,
          },
        ]}
        pointerEvents="none"
      />

      <LinearGradient
        colors={[theme.colors.card, "transparent"]}
        style={[styles.ageGradientTop, { height: AGE_ITEM_HEIGHT * 2 }]}
        pointerEvents="none"
      />
      <LinearGradient
        colors={["transparent", theme.colors.card]}
        style={[styles.ageGradientBottom, { height: AGE_ITEM_HEIGHT * 2 }]}
        pointerEvents="none"
      />

      <FlatList
        ref={flatListRef}
        data={ages}
        keyExtractor={(item) => item.toString()}
        renderItem={renderAgeItem}
        extraData={selectedAge}
        contentContainerStyle={{
          paddingVertical: (containerHeight - AGE_ITEM_HEIGHT) / 2,
        }}
        snapToInterval={AGE_ITEM_HEIGHT}
        decelerationRate="fast"
        showsVerticalScrollIndicator={false}
        onMomentumScrollEnd={handleMomentumEnd}
        getItemLayout={getItemLayout}
        initialScrollIndex={DEFAULT_AGE_INDEX}
        initialNumToRender={20}
        maxToRenderPerBatch={30}
        windowSize={5}
        removeClippedSubviews={true}
      />
    </View>
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

  const handleGenderSelect = (value: OnboardingGender) => {
    setGender(value);
    impactAsync(ImpactFeedbackStyle.Light).catch(() => {});
  };

  const handleContinue = () => {
    router.push("/onboarding/step3" as Href);
  };

  return (
    <Screen>
      <ScrollView
        contentContainerStyle={[
          styles.scroll,
          { paddingBottom: isSmallScreen ? 24 : 40 },
        ]}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        <Animated.View
          style={styles.content}
          entering={FadeInUp.duration(400).springify()}
        >
          <ProgressIndicator
            currentStep={2}
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

          <View style={styles.section}>
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

          <View style={styles.section}>
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
            <AgePicker
              selectedAge={age}
              onSelectAge={setAge}
              theme={theme}
            />
            <Text
              style={[
                styles.ageDisplay,
                {
                  color: age ? theme.colors.text : theme.colors.mutedText,
                  fontFamily: theme.typography.headlineMd.fontFamily,
                },
              ]}
              accessibilityLabel={
                age
                  ? `${age} ${translate("ageYears", language)}`
                  : translate("ageYears", language)
              }
            >
              <Text
                style={[
                  styles.ageNumber,
                  {
                    color: age ? theme.colors.text : theme.colors.mutedText,
                  },
                ]}
              >
                {age ?? "—"}
              </Text>
              {" "}
              {translate("ageYears", language)}
            </Text>
          </View>

          <View style={styles.illustrationSection}>
            <Image
              source={require("../../assets/images/logo-glow.png")}
              style={styles.illustration}
              resizeMode="contain"
            />
          </View>

          <Animated.View
            style={styles.continueSection}
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
  section: {
    marginTop: 28,
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
    paddingVertical: 18,
    paddingHorizontal: 12,
    alignItems: "center",
    minHeight: 120,
    justifyContent: "center",
  },
  genderIconContainer: {
    width: 52,
    height: 52,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
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
  agePickerContainer: {
    overflow: "hidden",
    position: "relative",
  },
  ageHighlightBar: {
    position: "absolute",
    left: 20,
    right: 20,
    height: AGE_ITEM_HEIGHT,
  },
  ageGradientTop: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1,
  },
  ageGradientBottom: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 1,
  },
  ageItem: {
    height: AGE_ITEM_HEIGHT,
    alignItems: "center",
    justifyContent: "center",
  },
  ageItemText: {
    textAlign: "center",
  },
  ageDisplay: {
    textAlign: "center",
    marginTop: 12,
    fontWeight: "700",
  },
  ageNumber: {
    fontSize: 24,
    fontWeight: "800",
  },
  illustrationSection: {
    marginTop: 32,
    alignItems: "center",
  },
  illustration: {
    width: 180,
    height: 180,
    borderRadius: 24,
    opacity: 0.85,
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
