import { StatusBar } from "expo-status-bar";
import type { ReactNode } from "react";
import { useEffect } from "react";
import {
  StyleSheet,
  useWindowDimensions,
  type ViewStyle,
} from "react-native";
import Animated, {
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { darkColors, lightColors } from "../constants/colors";
import { useAppStore } from "../stores/appStore";

type ScreenProps = {
  children: ReactNode;
  style?: ViewStyle;
};

const THEME_TRANSITION_MS = 320;

export function Screen({ children, style }: ScreenProps) {
  const themeMode = useAppStore((state) => state.themeMode);
  const themeProgress = useSharedValue(themeMode === "dark" ? 1 : 0);

  const insets = useSafeAreaInsets();
  const { height } = useWindowDimensions();

  const responsiveTopGap = height < 700 ? 4 : height < 820 ? 8 : 5;

  useEffect(() => {
    themeProgress.value = withTiming(themeMode === "dark" ? 1 : 0, {
      duration: THEME_TRANSITION_MS,
    });
  }, [themeMode, themeProgress]);

  const animatedRootStyle = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(
      themeProgress.value,
      [0, 1],
      [lightColors.background, darkColors.background],
    ),
  }));

  return (
    <Animated.View
      style={[
        styles.root,
        animatedRootStyle,
        {
          paddingTop: insets.top + responsiveTopGap,
          paddingBottom: insets.bottom,
        },
        style,
      ]}
    >
      <StatusBar style={themeMode === "dark" ? "light" : "dark"} animated />

      {children}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
});
