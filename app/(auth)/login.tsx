import { StyleSheet, Text, View } from "react-native";
import { Screen } from "../../src/components/Screen";
import { useAppStore } from "../../src/stores/appStore";
import { getTheme } from "../../src/theme/theme";

export default function LoginScreen() {
  const themeMode = useAppStore((state) => state.themeMode);
  const theme = getTheme(themeMode);

  return (
    <Screen>
      <View style={styles.container}>
        <Text style={[styles.title, { color: theme.colors.text }]}>
          Giriş Yap
        </Text>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: "center",
  },
  title: {
    fontSize: 28,
    fontWeight: "900",
  },
});
