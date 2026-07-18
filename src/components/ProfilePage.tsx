import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import type { ReactNode } from "react";
import { useEffect } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import Animated, {
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { darkColors, lightColors } from "../constants/colors";
import { useAppStore } from "../stores/appStore";
import { getTheme } from "../theme/theme";
import { Screen } from "./Screen";

export function ProfilePage({
  title,
  subtitle,
  compactHeader = false,
  children,
}: {
  title: string;
  subtitle: string;
  compactHeader?: boolean;
  children: ReactNode;
}) {
  const themeMode = useAppStore((state) => state.themeMode);
  const theme = getTheme(themeMode);
  const themeProgress = useSharedValue(themeMode === "dark" ? 1 : 0);

  useEffect(() => {
    themeProgress.value = withTiming(themeMode === "dark" ? 1 : 0, {
      duration: 320,
    });
  }, [themeMode, themeProgress]);

  const animatedScrollStyle = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(
      themeProgress.value,
      [0, 1],
      [lightColors.background, darkColors.background],
    ),
  }));

  return (
    <Screen>
      <Animated.ScrollView
        style={animatedScrollStyle}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.topBar}>
          <Pressable
            onPress={() => router.back()}
            style={[
              styles.backButton,
              { backgroundColor: theme.colors.card, borderColor: theme.colors.border },
            ]}
          >
            <Ionicons name="chevron-back" size={22} color={theme.colors.text} />
          </Pressable>
          {compactHeader ? (
            <Text style={[styles.topBarTitle, { color: theme.colors.text }]}>
              {title}
            </Text>
          ) : null}
          {compactHeader ? <View style={styles.backButtonPlaceholder} /> : null}
        </View>
        {!compactHeader ? (
          <>
            <Text style={[styles.title, { color: theme.colors.text }]}>{title}</Text>
            <Text
              style={[styles.subtitle, { color: theme.colors.mutedText }]}
            >
              {subtitle}
            </Text>
          </>
        ) : null}
        <View style={styles.body}>{children}</View>
      </Animated.ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: 20, paddingTop: 4, paddingBottom: 48 },
  topBar: {
    height: 48,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  backButton: {
    width: 42,
    height: 42,
    borderRadius: 15,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  backButtonPlaceholder: { width: 42 },
  topBarTitle: { fontSize: 16, fontWeight: "900" },
  title: { marginTop: 16, fontSize: 28, fontWeight: "900" },
  subtitle: { marginTop: 7, fontSize: 13, lineHeight: 19, fontWeight: "600" },
  body: { marginTop: 24 },
});
