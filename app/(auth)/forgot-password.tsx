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

const gmailRegex = /^[^\s@]+@gmail\.com$/i;

export default function ForgotPasswordScreen() {
  const themeMode = useAppStore((state) => state.themeMode);
  const language = useAppStore((state) => state.language);
  const theme = getTheme(themeMode);
  const isLoading = useAuthStore((state) => state.isLoading);
  const forgotPassword = useAuthStore((state) => state.forgotPassword);
  const [email, setEmail] = useState("");

  const handleSubmit = async () => {
    const trimmedEmail = email.trim().toLowerCase();

    if (!trimmedEmail) {
      Alert.alert(translate("requiredFields", language), "", [
        { text: translate("ok", language) },
      ]);
      return;
    }

    if (!gmailRegex.test(trimmedEmail)) {
      Alert.alert(
        translate("forgotPasswordTitle", language),
        translate("validGmailError", language),
        [{ text: translate("ok", language) }],
      );
      return;
    }

    try {
      await forgotPassword(trimmedEmail);
      Alert.alert(
        translate("forgotPasswordTitle", language),
        translate("resetCodeSent", language),
        [{ text: translate("ok", language) }],
      );
      router.push("/(auth)/reset-password" as Href);
    } catch (error) {
      Alert.alert(
        translate("forgotPasswordTitle", language),
        error instanceof Error ? error.message : translate("genericError", language),
        [{ text: translate("ok", language) }],
      );
    }
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
              <Ionicons name="key-outline" size={30} color={theme.colors.primary} />
            </View>

            <Text style={[styles.title, { color: theme.colors.text }]}> 
              {translate("forgotPasswordTitle", language)}
            </Text>

            <Text style={[styles.subtitle, { color: theme.colors.mutedText }]}> 
              {translate("forgotPasswordSubtitle", language)}
            </Text>
          </View>

          <View
            style={[
              styles.formCard,
              { backgroundColor: theme.colors.card, borderColor: theme.colors.border },
            ]}
          >
            <Input
              label={translate("email", language)}
              icon="mail-outline"
              placeholder={translate("emailPlaceholder", language)}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <Button onPress={handleSubmit} disabled={isLoading} style={styles.button}>
              {isLoading
                ? translate("loading", language)
                : translate("sendResetCode", language)}
            </Button>
          </View>

          <Pressable
            onPress={() => router.replace("/(auth)/login" as Href)}
            style={styles.bottomLink}
          >
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
