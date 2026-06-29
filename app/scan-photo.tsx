import { StyleSheet, Text, View } from "react-native";
import { Screen } from "../src/components/Screen";
import { translate } from "../src/i18n/translations";
import { useAppStore } from "../src/stores/appStore";
import { getTheme } from "../src/theme/theme";

export default function ScanPhotoScreen() {
  const themeMode = useAppStore((state) => state.themeMode);
  const language = useAppStore((state) => state.language);
  const theme = getTheme(themeMode);

  return (
    <Screen>
      <View
        style={[styles.container, { backgroundColor: theme.colors.background }]}
      >
        <Text style={[styles.title, { color: theme.colors.text }]}>
          {translate("scanWithPhoto", language)}
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
    fontSize: 30,
    fontWeight: "900",
  },
});
