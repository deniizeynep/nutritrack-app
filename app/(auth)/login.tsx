import { router, type Href } from "expo-router";
import { StyleSheet, Text, View } from "react-native";
import { Button } from "../../src/components/Button";
import { Screen } from "../../src/components/Screen";
import { translate } from "../../src/i18n/translations";
import { useAppStore } from "../../src/stores/appStore";
import { getTheme } from "../../src/theme/theme";

export default function LoginScreen() {
  const themeMode = useAppStore((state) => state.themeMode);
  const language = useAppStore((state) => state.language);
  const theme = getTheme(themeMode);

  return (
    <Screen>
      <View
        style={[styles.container, { backgroundColor: theme.colors.background }]}
      >
        <Text style={[styles.title, { color: theme.colors.text }]}>
          {translate("login", language)}
        </Text>

        <Text style={[styles.description, { color: theme.colors.mutedText }]}>
          Giriş ekranını bir sonraki adımda profesyonel tasarlayacağız.
        </Text>

        <Button onPress={() => router.replace("/(tabs)/home" as Href)}>
          {translate("continueDemo", language)}
        </Button>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingBottom: 24,
    justifyContent: "center",
    gap: 18,
  },
  title: {
    fontSize: 32,
    fontWeight: "900",
  },
  description: {
    fontSize: 15,
    fontWeight: "600",
    lineHeight: 22,
  },
});
