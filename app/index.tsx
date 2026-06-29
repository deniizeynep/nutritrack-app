import { router } from "expo-router";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import { Button } from "../src/components/Button";
import { Screen } from "../src/components/Screen";
import { translate } from "../src/i18n/translations";
import { useAppStore } from "../src/stores/appStore";
import { getTheme } from "../src/theme/theme";

export default function WelcomeScreen() {
  const themeMode = useAppStore((state) => state.themeMode);
  const language = useAppStore((state) => state.language);
  const toggleTheme = useAppStore((state) => state.toggleTheme);
  const setLanguage = useAppStore((state) => state.setLanguage);

  const theme = getTheme(themeMode);

  return (
    <Screen>
      <View
        style={[
          styles.container,
          {
            backgroundColor: theme.colors.background,
          },
        ]}
      >
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
          >
            <Text
              style={[styles.smallButtonText, { color: theme.colors.text }]}
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
          >
            <Text
              style={[styles.smallButtonText, { color: theme.colors.text }]}
            >
              {themeMode === "dark" ? "☀️" : "🌙"}
            </Text>
          </Pressable>
        </View>

        <View
          style={[
            styles.heroCard,
            {
              backgroundColor:
                themeMode === "dark" ? theme.colors.card : theme.colors.primary,
            },
          ]}
        >
          <Text style={styles.logoIcon}>🌿</Text>

          <Text style={styles.appName}>{translate("appName", language)}</Text>

          <Text style={styles.title}>
            {translate("welcomeTitle", language)}
          </Text>

          <Text style={styles.subtitle}>
            {translate("welcomeSubtitle", language)}
          </Text>

          <View style={styles.imageCircle}>
            <Image
              source={{
                uri: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=600&auto=format&fit=crop",
              }}
              style={styles.foodImage}
            />
          </View>
        </View>

        <View style={styles.bottom}>
          <Button onPress={() => router.push("/(auth)/register")}>
            {translate("start", language)}
          </Button>

          <Pressable
            onPress={() => router.push("/(auth)/login")}
            style={styles.loginRow}
          >
            <Text style={[styles.loginText, { color: theme.colors.mutedText }]}>
              {translate("alreadyHaveAccount", language)}{" "}
            </Text>

            <Text style={[styles.loginLink, { color: theme.colors.primary }]}>
              {translate("login", language)}
            </Text>
          </Pressable>
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  topActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 10,
    marginBottom: 16,
  },
  smallButton: {
    width: 48,
    height: 40,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  smallButtonText: {
    fontSize: 14,
    fontWeight: "800",
  },
  heroCard: {
    flex: 1,
    borderRadius: 34,
    padding: 26,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  logoIcon: {
    fontSize: 52,
    marginBottom: 10,
  },
  appName: {
    fontSize: 34,
    fontWeight: "900",
    color: "#FFFFFF",
    marginBottom: 14,
  },
  title: {
    fontSize: 22,
    lineHeight: 30,
    fontWeight: "800",
    color: "#FFFFFF",
    textAlign: "center",
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 15,
    lineHeight: 22,
    color: "rgba(255,255,255,0.85)",
    textAlign: "center",
    marginBottom: 34,
  },
  imageCircle: {
    width: 210,
    height: 210,
    borderRadius: 105,
    backgroundColor: "rgba(255,255,255,0.16)",
    alignItems: "center",
    justifyContent: "center",
    padding: 12,
  },
  foodImage: {
    width: "100%",
    height: "100%",
    borderRadius: 999,
  },
  bottom: {
    paddingTop: 18,
  },
  loginRow: {
    marginTop: 18,
    flexDirection: "row",
    justifyContent: "center",
  },
  loginText: {
    fontSize: 14,
    fontWeight: "500",
  },
  loginLink: {
    fontSize: 14,
    fontWeight: "800",
  },
});
