import { Ionicons } from "@expo/vector-icons";
import { router, type Href } from "expo-router";
import { useEffect, useMemo } from "react";
import {
  ActivityIndicator,
  Image,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { Button } from "../src/components/Button";
import { Screen } from "../src/components/Screen";
import { translate } from "../src/i18n/translations";
import { useAppStore } from "../src/stores/appStore";
import { useAuthStore } from "../src/stores/authStore";
import { getTheme } from "../src/theme/theme";

const HERO_IMAGE_URI =
  "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=600&auto=format&fit=crop";

function Ring({
  size,
  borderWidth,
  color,
  duration,
  clockwise,
  delay,
}: {
  size: number;
  borderWidth: number;
  color: string;
  duration: number;
  clockwise: boolean;
  delay: number;
}) {
  const rotation = useSharedValue(0);

  useEffect(() => {
    rotation.value = withDelay(
      delay,
      withRepeat(
        withTiming(clockwise ? 360 : -360, {
          duration,
          easing: Easing.linear,
        }),
        -1,
        false,
      ),
    );
  }, [rotation, clockwise, duration, delay]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      {
        rotate: `${rotation.value}deg`,
      },
    ],
  }));

  return (
    <Animated.View
      style={[
        {
          position: "absolute",
          width: size,
          height: size,
          borderRadius: size / 2,
          borderWidth,
          borderColor: color,
          borderStyle: "dashed",
        },
        animatedStyle,
      ]}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
    />
  );
}

function HeroGlow({ size, color }: { size: number; color: string }) {
  return (
    <View
      style={{
        position: "absolute",
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: color,
        opacity: 0.12,
      }}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
    />
  );
}

function FloatingBadge({
  icon,
  text,
  style,
  themeColors,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  text: string;
  style: object;
  themeColors: ReturnType<typeof getTheme>["colors"];
}) {
  const float = useSharedValue(0);

  useEffect(() => {
    float.value = withRepeat(
      withSequence(
        withTiming(-6, {
          duration: 2200,
          easing: Easing.inOut(Easing.ease),
        }),
        withTiming(0, {
          duration: 2200,
          easing: Easing.inOut(Easing.ease),
        }),
      ),
      -1,
      true,
    );
  }, [float]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: float.value }],
  }));

  return (
    <Animated.View
      style={[
        {
          flexDirection: "row",
          alignItems: "center",
          gap: 6,
          paddingHorizontal: 14,
          paddingVertical: 10,
          borderRadius: 9999,
          backgroundColor:
            Platform.OS === "ios"
              ? themeColors.cardSoft
              : themeColors.card,
          borderWidth: 1,
          borderColor: themeColors.border,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.08,
          shadowRadius: 8,
          elevation: 2,
        },
        style,
        animatedStyle,
      ]}
      accessibilityLabel={text}
      accessibilityRole="text"
    >
      <Ionicons
        name={icon}
        size={16}
        color={themeColors.primary}
        accessibilityElementsHidden
      />
      <Text
        style={{
          fontSize: 12,
          fontWeight: "700",
          color: themeColors.text,
          letterSpacing: 0.4,
        }}
      >
        {text}
      </Text>
    </Animated.View>
  );
}

function AmbientCircle({
  size,
  top,
  left,
  right,
  bottom,
  color,
  opacity,
  duration,
  delay,
  drifty,
}: {
  size: number;
  top?: number;
  left?: number;
  right?: number;
  bottom?: number;
  color: string;
  opacity: number;
  duration: number;
  delay: number;
  drifty: boolean;
}) {
  const drift = useSharedValue(0);

  useEffect(() => {
    if (drifty) {
      drift.value = withDelay(
        delay,
        withRepeat(
          withSequence(
            withTiming(30, { duration, easing: Easing.inOut(Easing.ease) }),
            withTiming(0, { duration, easing: Easing.inOut(Easing.ease) }),
          ),
          -1,
          true,
        ),
      );
    }
  }, [drift, duration, delay, drifty]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: drift.value }, { translateX: drift.value * 0.5 }],
  }));

  return (
    <Animated.View
      style={[
        {
          position: "absolute",
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: color,
          opacity,
          top,
          left,
          right,
          bottom,
        },
        drifty ? animatedStyle : undefined,
      ]}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
    />
  );
}

export default function WelcomeScreen() {
  const themeMode = useAppStore((state) => state.themeMode);
  const language = useAppStore((state) => state.language);
  const toggleTheme = useAppStore((state) => state.toggleTheme);
  const setLanguage = useAppStore((state) => state.setLanguage);

  const theme = getTheme(themeMode);

  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isLoading = useAuthStore((state) => state.isLoading);
  const hasHydrated = useAuthStore((state) => state.hasHydrated);
  const hasCheckedSession = useAuthStore((state) => state.hasCheckedSession);
  const loadMe = useAuthStore((state) => state.loadMe);

  const { width: screenWidth, height: screenHeight } = useWindowDimensions();

  const heroImageSize = useMemo(
    () => Math.min(screenWidth * 0.45, 210),
    [screenWidth],
  );
  const heroBoxSize = useMemo(
    () => Math.min(screenWidth * 0.75, 340),
    [screenWidth],
  );

  const isSmallScreen = screenHeight < 700;

  useEffect(() => {
    if (hasHydrated && !hasCheckedSession && !isLoading) {
      loadMe();
    }
  }, [hasCheckedSession, hasHydrated, isLoading, loadMe]);

  useEffect(() => {
    if (hasCheckedSession && isAuthenticated) {
      router.replace("/(tabs)/home" as Href);
    }
  }, [hasCheckedSession, isAuthenticated]);

  const contentOpacity = useSharedValue(0);
  const heroScale = useSharedValue(0.85);

  useEffect(() => {
    if (hasCheckedSession && !isAuthenticated) {
      contentOpacity.value = withTiming(1, { duration: 500 });
      heroScale.value = withDelay(200, withSpring(1, { damping: 12, stiffness: 100 }));
    }
  }, [hasCheckedSession, isAuthenticated, contentOpacity, heroScale]);

  const animatedContentStyle = useAnimatedStyle(() => ({
    opacity: contentOpacity.value,
  }));

  const animatedHeroStyle = useAnimatedStyle(() => ({
    transform: [{ scale: heroScale.value }],
  }));

  if (!hasCheckedSession) {
    return (
      <Screen>
        <View
          style={[
            styles.loadingContainer,
            { backgroundColor: theme.colors.background },
          ]}
        >
          <Text style={styles.loadingLogo}>🌿</Text>
          <Text
            style={[styles.loadingAppName, { color: theme.colors.text }]}
          >
            {translate("appName", language)}
          </Text>
          <Text
            style={[styles.loadingVersion, { color: theme.colors.mutedText }]}
          >
            {translate("vitalitySubtitle", language)}
          </Text>
          <ActivityIndicator
            color={theme.colors.primary}
            size="large"
            style={{ marginTop: 24 }}
          />
        </View>
      </Screen>
    );
  }

  return (
    <Screen>
      <ScrollView
        contentContainerStyle={[
          styles.scroll,
          {
            paddingBottom: 32,
          },
        ]}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        {/* Ambient background decorations */}
        <View
          style={styles.ambientLayer}
          pointerEvents="none"
          accessibilityElementsHidden
          importantForAccessibility="no-hide-descendants"
        >
          <AmbientCircle
            size={screenWidth * 0.7}
            top={-screenWidth * 0.15}
            right={-screenWidth * 0.2}
            color={theme.design.colors.primary}
            opacity={0.06}
            duration={8000}
            delay={500}
            drifty
          />
          <AmbientCircle
            size={screenWidth * 0.5}
            top={screenWidth * 0.35}
            left={-screenWidth * 0.2}
            color={theme.design.colors.primary}
            opacity={0.04}
            duration={10000}
            delay={1000}
            drifty
          />
          <AmbientCircle
            size={screenWidth * 0.4}
            bottom={screenWidth * 0.1}
            right={-screenWidth * 0.15}
            color={theme.design.colors.primary}
            opacity={0.05}
            duration={9000}
            delay={2000}
            drifty
          />
        </View>

        <Animated.View style={[styles.content, animatedContentStyle]}>
          {/* Branding Header */}
          <View style={styles.brandingHeader}>
            <View style={styles.brandingLeft}>
              <View
                style={[
                  styles.logoCircle,
                  { backgroundColor: theme.colors.primarySoft },
                ]}
              >
                <Ionicons
                  name="leaf"
                  size={22}
                  color={theme.colors.primary}
                />
              </View>
              <View style={styles.brandingText}>
                <Text
                  style={[
                    styles.brandingAppName,
                    {
                      color: theme.colors.text,
                      fontFamily: theme.typography.headlineLg.fontFamily,
                    },
                  ]}
                >
                  {translate("appName", language)}
                </Text>
                <Text
                  style={[
                    styles.brandingVersion,
                    {
                      color: theme.colors.mutedText,
                      fontFamily: theme.typography.labelMd.fontFamily,
                    },
                  ]}
                >
                  {translate("vitalitySubtitle", language)}
                </Text>
              </View>
            </View>

            <View style={styles.topActions}>
              <Pressable
                onPress={() => setLanguage(language === "tr" ? "en" : "tr")}
                style={[
                  styles.smallButton,
                  {
                    backgroundColor: theme.colors.card,
                    borderColor: theme.colors.border,
                  },
                ]}
                accessibilityLabel={
                  language === "tr"
                    ? "Switch to English"
                    : "Türkçeye geç"
                }
                accessibilityRole="button"
                hitSlop={8}
              >
                <Text
                  style={[
                    styles.smallButtonText,
                    { color: theme.colors.text },
                  ]}
                >
                  {language === "tr" ? "EN" : "TR"}
                </Text>
              </Pressable>

              <Pressable
                onPress={toggleTheme}
                style={[
                  styles.smallButton,
                  {
                    backgroundColor: theme.colors.card,
                    borderColor: theme.colors.border,
                  },
                ]}
                accessibilityLabel={
                  themeMode === "dark"
                    ? "Switch to light theme"
                    : "Karanlık temaya geç"
                }
                accessibilityRole="button"
                hitSlop={8}
              >
                <Ionicons
                  name={themeMode === "dark" ? "sunny" : "moon"}
                  size={18}
                  color={theme.colors.text}
                />
              </Pressable>
            </View>
          </View>

          {/* Hero Section */}
          <View
            style={[
              styles.heroSection,
              {
                height: isSmallScreen ? screenWidth * 0.68 : screenWidth * 0.75,
                marginTop: isSmallScreen ? 8 : 14,
              },
            ]}
          >
            {/* Hero container */}
            <Animated.View
              style={[
                styles.heroBox,
                {
                  width: heroBoxSize,
                  height: heroBoxSize,
                },
                animatedHeroStyle,
              ]}
            >
              {/* Glow behind image */}
              <HeroGlow
                size={heroImageSize * 1.35}
                color={themeMode === "dark" ? theme.colors.primary : theme.colors.primary}
              />

              {/* Decorative rings */}
              <Ring
                size={heroImageSize + 32}
                borderWidth={1.5}
                color={theme.colors.primarySoft}
                duration={14000}
                clockwise
                delay={600}
              />
              <Ring
                size={heroImageSize + 56}
                borderWidth={1}
                color={theme.colors.primary}
                duration={18000}
                clockwise={false}
                delay={900}
              />
              <Ring
                size={heroImageSize + 80}
                borderWidth={0.5}
                color={theme.colors.border}
                duration={22000}
                clockwise
                delay={1200}
              />

              {/* Food image */}
              <View
                style={[
                  styles.imageCircle,
                  {
                    width: heroImageSize,
                    height: heroImageSize,
                    borderRadius: heroImageSize / 2,
                    backgroundColor:
                      themeMode === "dark"
                        ? theme.colors.cardSoft
                        : theme.colors.primarySoft,
                  },
                ]}
              >
                <Image
                  source={{ uri: HERO_IMAGE_URI }}
                  style={[
                    styles.foodImage,
                    {
                      borderRadius: heroImageSize / 2,
                    },
                  ]}
                  accessibilityLabel="Healthy food bowl"
                />
              </View>

              {/* Floating Badge — Top Right */}
              <FloatingBadge
                icon="flash"
                text={translate("vitalityBadge", language)}
                style={{
                  position: "absolute",
                  top: -8,
                  right: -8,
                }}
                themeColors={theme.colors}
              />

              {/* Floating Badge — Bottom Left */}
              <FloatingBadge
                icon="heart"
                text={translate("coreHealth", language)}
                style={{
                  position: "absolute",
                  bottom: -8,
                  left: -8,
                  flexDirection: "row-reverse",
                }}
                themeColors={theme.colors}
              />
            </Animated.View>
          </View>

          {/* Welcome Text */}
          <View style={styles.welcomeTextSection}>
            <Text
              style={[
                styles.welcomeTitle,
                {
                  color: theme.colors.text,
                  fontFamily: theme.typography.displayLg.fontFamily,
                  fontSize: isSmallScreen ? 28 : 32,
                  lineHeight: isSmallScreen ? 36 : 40,
                },
              ]}
              accessibilityRole="header"
            >
              {translate("welcomeGreeting", language)}
            </Text>
            <Text
              style={[
                styles.welcomeDescription,
                {
                  color: theme.colors.mutedText,
                  fontFamily: theme.typography.bodyMd.fontFamily,
                },
              ]}
            >
              {translate("welcomeGreetingDescription", language)}
            </Text>
          </View>

          {/* Action Buttons */}
          <View
            style={[
              styles.buttonsSection,
              { marginTop: isSmallScreen ? 16 : 24 },
            ]}
          >
            <Button
              onPress={() => router.push("/(auth)/register" as Href)}
              accessibilityLabel={translate("startJourney", language)}
              accessibilityRole="button"
            >
              <Text style={styles.primaryButtonContent}>
                {translate("startJourney", language)}{"  "}
                <Ionicons
                  name="arrow-forward"
                  size={18}
                  color="#FFFFFF"
                />
              </Text>
            </Button>

            <View style={{ height: 14 }} />

            <Button
              variant="secondary"
              onPress={() => router.push("/(auth)/login" as Href)}
              accessibilityLabel={translate("login", language)}
              accessibilityRole="button"
            >
              {translate("login", language)}
            </Button>
          </View>

          {/* Terms Footer */}
          <View style={styles.termsFooter}>
            <Text
              style={[
                styles.termsText,
                {
                  color: theme.colors.mutedText,
                  fontFamily: theme.typography.bodyMd.fontFamily,
                },
              ]}
            >
              {translate("termsText", language).split("{termsLink}")[0]}
            </Text>
            <Pressable
              onPress={() => router.push("/terms" as Href)}
              hitSlop={12}
              accessibilityLabel={translate("termsLink", language)}
              accessibilityRole="link"
              style={styles.termsLinkWrapper}
            >
              <Text
                style={[
                  styles.termsLink,
                  { color: theme.colors.primary },
                ]}
              >
                {translate("termsLink", language)}
              </Text>
            </Pressable>
            <Text
              style={[
                styles.termsText,
                {
                  color: theme.colors.mutedText,
                  fontFamily: theme.typography.bodyMd.fontFamily,
                },
              ]}
            >
              {translate("termsText", language)
                .split("{termsLink}")[1] ?? ""}
            </Text>
          </View>
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
  ambientLayer: {
    ...StyleSheet.absoluteFill,
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  loadingLogo: {
    fontSize: 54,
  },
  loadingAppName: {
    fontSize: 30,
    fontWeight: "900",
  },
  loadingVersion: {
    fontSize: 12,
    fontWeight: "600",
    letterSpacing: 2,
    textTransform: "uppercase",
  },
  brandingHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  brandingLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  logoCircle: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  brandingText: {
    gap: 2,
  },
  brandingAppName: {
    fontSize: 20,
    fontWeight: "700",
    lineHeight: 26,
  },
  brandingVersion: {
    fontSize: 11,
    fontWeight: "600",
    letterSpacing: 2,
    textTransform: "uppercase",
  },
  topActions: {
    flexDirection: "row",
    gap: 8,
  },
  smallButton: {
    width: 40,
    height: 38,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  smallButtonText: {
    fontSize: 13,
    fontWeight: "800",
  },
  heroSection: {
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  heroBox: {
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  imageCircle: {
    alignItems: "center",
    justifyContent: "center",
    padding: 8,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 8,
  },
  foodImage: {
    width: "100%",
    height: "100%",
  },
  welcomeTextSection: {
    alignItems: "center",
    paddingHorizontal: 20,
    marginTop: 24,
  },
  welcomeTitle: {
    fontWeight: "800",
    textAlign: "center",
    letterSpacing: -0.4,
  },
  welcomeDescription: {
    fontSize: 14,
    lineHeight: 22,
    textAlign: "center",
    marginTop: 10,
    maxWidth: 320,
  },
  buttonsSection: {
    paddingHorizontal: 4,
  },
  primaryButtonContent: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "900",
  },
  termsFooter: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    marginTop: 24,
    paddingHorizontal: 20,
  },
  termsText: {
    fontSize: 12,
    lineHeight: 18,
    textAlign: "center",
  },
  termsLinkWrapper: {
    minHeight: 24,
    justifyContent: "center",
  },
  termsLink: {
    fontSize: 12,
    fontWeight: "700",
    lineHeight: 18,
    textDecorationLine: "underline",
  },
});
