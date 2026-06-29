import { StatusBar } from "expo-status-bar";
import type { ReactNode } from "react";
import {
  StyleSheet,
  useWindowDimensions,
  View,
  type ViewStyle,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAppStore } from "../stores/appStore";
import { getTheme } from "../theme/theme";

type ScreenProps = {
  children: ReactNode;
  style?: ViewStyle;
};

export function Screen({ children, style }: ScreenProps) {
  const themeMode = useAppStore((state) => state.themeMode);
  const theme = getTheme(themeMode);

  const insets = useSafeAreaInsets();
  const { height } = useWindowDimensions();

  const responsiveTopGap = height < 700 ? 4 : height < 820 ? 8 : 5;

  return (
    <View
      style={[
        styles.root,
        {
          backgroundColor: theme.colors.background,
          paddingTop: insets.top + responsiveTopGap,
          paddingBottom: insets.bottom,
        },
        style,
      ]}
    >
      <StatusBar style={themeMode === "dark" ? "light" : "dark"} />

      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
});
