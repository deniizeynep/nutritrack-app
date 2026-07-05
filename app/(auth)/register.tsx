import { Ionicons } from "@expo/vector-icons";
import { router, type Href } from "expo-router";
import { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Button } from "../../src/components/Button";
import { Input } from "../../src/components/Input";
import { Screen } from "../../src/components/Screen";
import { translate } from "../../src/i18n/translations";
import { useAppStore } from "../../src/stores/appStore";
import { useAuthStore } from "../../src/stores/authStore";
import {
  GoogleSignInError,
  isExpoGoBuild,
  hasGoogleSignInConfig,
  isGoogleSignInAvailable,
} from "../../src/services/googleAuth";
import { getTheme } from "../../src/theme/theme";

export default function RegisterScreen() {
  const themeMode = useAppStore((state) => state.themeMode);
  const language = useAppStore((state) => state.language);
  const theme = getTheme(themeMode);

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const register = useAuthStore((state) => state.register);
  const signInWithGoogle = useAuthStore((state) => state.signInWithGoogle);
  const isLoading = useAuthStore((state) => state.isLoading);
  const canUseGoogleSignIn = isGoogleSignInAvailable();
  const hasGoogleConfig = hasGoogleSignInConfig();
  const googleSignInHint = isExpoGoBuild()
    ? translate("googleSignInRequiresBuild", language)
    : !hasGoogleConfig
      ? translate("googleSignInConfigMissing", language)
    : translate("googleSignInUnavailable", language);

  const handleRegister = async () => {
    if (!fullName.trim() || !email.trim() || !password.trim()) {
      Alert.alert(translate("requiredFields", language), "", [
        { text: translate("ok", language) },
      ]);
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert(translate("passwordMismatch", language), "", [
        { text: translate("ok", language) },
      ]);
      return;
    }

    try {
      await register(fullName.trim(), email.trim(), password);
      router.replace("/(tabs)/home" as Href);
    } catch (error) {
      Alert.alert(
        translate("createAccount", language),
        error instanceof Error ? error.message : "Kayıt oluşturulamadı.",
        [{ text: translate("ok", language) }],
      );
    }
  };

  const handleGoogleRegister = async () => {
    try {
      await signInWithGoogle();
      router.replace("/(tabs)/home" as Href);
    } catch (error) {
      if (error instanceof GoogleSignInError && error.code === "CANCELLED") {
        return;
      }

      Alert.alert(
        translate("createAccount", language),
        error instanceof GoogleSignInError
          ? error.code === "UNAVAILABLE"
            ? translate("googleSignInRequiresBuild", language)
            : error.code === "PLAY_SERVICES_NOT_AVAILABLE"
            ? translate("googlePlayServicesUnavailable", language)
            : translate("googleSignInFailed", language)
          : error instanceof Error
            ? error.message
            : translate("googleSignInFailed", language),
        [{ text: translate("ok", language) }],
      );
    }
  };

  return (
    <Screen>
      <KeyboardAvoidingView
        style={[
          styles.keyboardView,
          { backgroundColor: theme.colors.background },
        ]}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.topBar}>
            <Pressable
              onPress={() => router.replace("/" as Href)}
              style={[
                styles.iconButton,
                {
                  backgroundColor: theme.colors.card,
                  borderColor: theme.colors.border,
                },
              ]}
            >
              <Ionicons
                name="chevron-back"
                size={22}
                color={theme.colors.text}
              />
            </Pressable>

            <Text style={[styles.topTitle, { color: theme.colors.text }]}>
              {translate("appName", language)}
            </Text>

            <View style={styles.fakeSpace} />
          </View>

          <View style={styles.headerArea}>
            <View
              style={[
                styles.logoBox,
                {
                  backgroundColor: theme.colors.primarySoft,
                },
              ]}
            >
              <Text style={styles.logoIcon}>🥑</Text>
            </View>

            <Text style={[styles.title, { color: theme.colors.text }]}>
              {translate("createAccount", language)}
            </Text>

            <Text style={[styles.subtitle, { color: theme.colors.mutedText }]}>
              {translate("registerSubtitle", language)}
            </Text>
          </View>

          <View
            style={[
              styles.formCard,
              {
                backgroundColor: theme.colors.card,
                borderColor: theme.colors.border,
              },
            ]}
          >
            <View style={styles.form}>
              <Input
                label={translate("fullName", language)}
                icon="person-outline"
                placeholder={translate("fullNamePlaceholder", language)}
                value={fullName}
                onChangeText={setFullName}
              />

              <Input
                label={translate("email", language)}
                icon="mail-outline"
                placeholder={translate("emailPlaceholder", language)}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />

              <Input
                label={translate("password", language)}
                icon="lock-closed-outline"
                placeholder={translate("passwordPlaceholder", language)}
                value={password}
                onChangeText={setPassword}
                isPassword
              />

              <Input
                label={translate("confirmPassword", language)}
                icon="shield-checkmark-outline"
                placeholder={translate("confirmPasswordPlaceholder", language)}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                isPassword
              />

              <Button onPress={handleRegister} disabled={isLoading}>
                {isLoading ? "..." : translate("createAccount", language)}
              </Button>

              <View style={styles.dividerRow}>
                <View
                  style={[
                    styles.divider,
                    { backgroundColor: theme.colors.border },
                  ]}
                />

                <Text
                  style={[styles.orText, { color: theme.colors.mutedText }]}
                >
                  {translate("or", language)}
                </Text>

                <View
                  style={[
                    styles.divider,
                    { backgroundColor: theme.colors.border },
                  ]}
                />
              </View>

              <Pressable
                disabled={isLoading || !canUseGoogleSignIn || !hasGoogleConfig}
                onPress={handleGoogleRegister}
                style={[
                  styles.googleButton,
                  {
                    backgroundColor:
                      themeMode === "dark" ? theme.colors.cardSoft : "#FFFFFF",
                    borderColor: theme.colors.border,
                    opacity:
                      isLoading || !canUseGoogleSignIn || !hasGoogleConfig
                        ? 0.6
                        : 1,
                  },
                ]}
              >
                <Ionicons
                  name="logo-google"
                  size={20}
                  color={theme.colors.text}
                />

                <Text style={[styles.googleText, { color: theme.colors.text }]}> 
                  {isLoading
                    ? translate("loading", language)
                    : translate("continueWithGoogle", language)}
                </Text>
              </Pressable>

              {!canUseGoogleSignIn || !hasGoogleConfig ? (
                <Text
                  style={[
                    styles.googleNote,
                    { color: theme.colors.mutedText },
                  ]}
                >
                  {googleSignInHint}
                </Text>
              ) : null}
            </View>
          </View>

          <Pressable
            onPress={() => router.push("/(auth)/login" as Href)}
            style={styles.bottomLink}
          >
            <Text
              style={[styles.bottomText, { color: theme.colors.mutedText }]}
            >
              {translate("haveAccount", language)}{" "}
            </Text>

            <Text
              style={[styles.bottomLinkText, { color: theme.colors.primary }]}
            >
              {translate("login", language)}
            </Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  keyboardView: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 4,
    paddingBottom: 28,
  },
  topBar: {
    height: 46,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 15,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  topTitle: {
    fontSize: 16,
    fontWeight: "900",
  },
  fakeSpace: {
    width: 40,
  },
  headerArea: {
    marginTop: 22,
    marginBottom: 24,
    alignItems: "center",
  },
  logoBox: {
    width: 64,
    height: 64,
    borderRadius: 23,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 18,
  },
  logoIcon: {
    fontSize: 32,
  },
  title: {
    fontSize: 34,
    fontWeight: "900",
    letterSpacing: -0.8,
    textAlign: "center",
  },
  subtitle: {
    marginTop: 10,
    fontSize: 13,
    lineHeight: 22,
    fontWeight: "600",
    textAlign: "center",
    maxWidth: 310,
  },
  formCard: {
    borderWidth: 1,
    borderRadius: 30,
    padding: 20,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 16,
    shadowOffset: {
      width: 0,
      height: 8,
    },
    elevation: 4,
  },
  form: {
    gap: 14,
  },
  dividerRow: {
    marginVertical: 2,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  divider: {
    flex: 1,
    height: 1,
  },
  orText: {
    fontSize: 12,
    fontWeight: "800",
  },
  googleButton: {
    height: 54,
    borderRadius: 20,
    borderWidth: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  googleText: {
    fontSize: 15,
    fontWeight: "900",
  },
  googleNote: {
    marginTop: 10,
    fontSize: 12,
    lineHeight: 18,
    fontWeight: "700",
    textAlign: "center",
  },
  bottomLink: {
    paddingTop: 24,
    flexDirection: "row",
    justifyContent: "center",
  },
  bottomText: {
    fontSize: 14,
    fontWeight: "700",
  },
  bottomLinkText: {
    fontSize: 14,
    fontWeight: "900",
  },
});
