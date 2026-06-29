import { StatusBar } from "expo-status-bar";
import type { ReactNode } from "react";
import { SafeAreaView, StyleSheet, View } from "react-native";
import { useAppStore } from "../stores/appStore";
import { getTheme } from "../theme/theme";

type ScreenProps = {
  children: ReactNode;
};

export function Screen({ children }: ScreenProps) {
  const themeMode = useAppStore((state) => state.themeMode);
  const theme = getTheme(themeMode);

  return (
    <SafeAreaView
      style={[
        styles.safeArea,
        {
          backgroundColor: theme.colors.background,
        },
      ]}
    >
      <StatusBar style={themeMode === "dark" ? "light" : "dark"} />

      <View style={styles.container}>{children}</View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
});
