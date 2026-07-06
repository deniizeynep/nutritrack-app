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
import { getTheme } from "../../src/theme/theme";

export default function VerifyEmailScreen() {
  const themeMode = useAppStore((state) => state.themeMode);
  const language = useAppStore((state) => state.language);
  const theme = getTheme(themeMode);
  const pendingEmail = useAuthStore((state) => state.pendingVerificationEmail);
  const isLoading = useAuthStore((state) => state.isLoading);
  const verifyEmail = useAuthStore((state) => state.verifyEmail);
  const resendVerification = useAuthStore((state) => state.resendVerification);
  const clearPendingVerification = useAuthStore(
    (state) => state.clearPendingVerification,
  );
  const [code, setCode] = useState("");

  const email = pendingEmail ?? "";

  const handleVerify = async () => {
    if (!email || !/^\d{6}$/.test(code.trim())) {
      Alert.alert(
        translate("verifyEmail", language),
        translate("invalidOrExpiredCode", language),
        [{ text: translate("ok", language) }],
      );
      return;
    }

    try {
      await verifyEmail(email, code.trim());
      router.replace("/(tabs)/home" as Href);
    } catch (error) {
      Alert.alert(
        translate("verifyEmail", language),
        error instanceof Error
          ? error.message
          : translate("invalidOrExpiredCode", language),
        [{ text: translate("ok", language) }],
      );
    }
  };

  const handleResend = async () => {
    if (!email) {
      return;
    }

    try {
      await resendVerification(email);
      Alert.alert(
        translate("verifyEmail", language),
        translate("codeSentAgain", language),
        [{ text: translate("ok", language) }],
      );
    } catch (error) {
      Alert.alert(
        translate("verifyEmail", language),
        error instanceof Error ? error.message : translate("genericError", language),
        [{ text: translate("ok", language) }],
      );
    }
  };

  const goBackToLogin = () => {
    clearPendingVerification();
    router.replace("/(auth)/login" as Href);
  };

  return (
    <Screen>
      <KeyboardAvoidingView
        style={[styles.keyboardView, { backgroundColor: theme.colors.background }]}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.headerArea}>
            <View
              style={[
                styles.logoBox,
                { backgroundColor: theme.colors.primarySoft },
              ]}
            >
              <Ionicons
                name="mail-open-outline"
                size={30}
                color={theme.colors.primary}
              />
            </View>

            <Text style={[styles.title, { color: theme.colors.text }]}> 
              {translate("verifyEmail", language)}
            </Text>

            <Text style={[styles.subtitle, { color: theme.colors.mutedText }]}> 
              {translate("enterVerificationCode", language)}
            </Text>

            <Text style={[styles.helpText, { color: theme.colors.mutedText }]}> 
              {translate("codeDeliveryHelp", language)}
            </Text>

            <Text style={[styles.emailText, { color: theme.colors.primary }]}> 
              {email || "-"}
            </Text>
          </View>

          <View
            style={[
              styles.formCard,
              { backgroundColor: theme.colors.card, borderColor: theme.colors.border },
            ]}
          >
            <Input
              label={translate("verificationCode", language)}
              icon="keypad-outline"
              placeholder="123456"
              value={code}
              onChangeText={(value) => setCode(value.replace(/\D/g, "").slice(0, 6))}
              keyboardType="number-pad"
              maxLength={6}
            />

            <Button
              onPress={handleVerify}
              disabled={isLoading || !email || code.length !== 6}
              style={styles.button}
            >
              {isLoading ? translate("loading", language) : translate("verifyCode", language)}
            </Button>

            <Button
              variant="secondary"
              onPress={handleResend}
              disabled={isLoading || !email}
              style={styles.button}
            >
              {translate("resendCode", language)}
            </Button>
          </View>

          <Pressable onPress={goBackToLogin} style={styles.bottomLink}>
            <Text style={[styles.bottomLinkText, { color: theme.colors.primary }]}> 
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
    justifyContent: "center",
    paddingHorizontal: 20,
    paddingBottom: 28,
  },
  headerArea: {
    alignItems: "center",
    marginBottom: 24,
  },
  logoBox: {
    width: 64,
    height: 64,
    borderRadius: 23,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 18,
  },
  title: {
    fontSize: 34,
    fontWeight: "900",
    textAlign: "center",
  },
  subtitle: {
    marginTop: 10,
    fontSize: 14,
    lineHeight: 22,
    fontWeight: "700",
    textAlign: "center",
  },
  emailText: {
    marginTop: 10,
    fontSize: 15,
    fontWeight: "900",
  },
  helpText: {
    marginTop: 8,
    fontSize: 12,
    lineHeight: 18,
    fontWeight: "700",
    textAlign: "center",
  },
  formCard: {
    borderWidth: 1,
    borderRadius: 30,
    padding: 20,
    gap: 14,
  },
  button: {
    marginTop: 2,
  },
  bottomLink: {
    paddingTop: 24,
    alignItems: "center",
  },
  bottomLinkText: {
    fontSize: 14,
    fontWeight: "900",
  },
});
