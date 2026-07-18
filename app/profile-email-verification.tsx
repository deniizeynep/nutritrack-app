import { Ionicons } from "@expo/vector-icons";
import { router, type Href } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { Alert, StyleSheet, Text, View } from "react-native";
import { Button } from "../src/components/Button";
import { Input } from "../src/components/Input";
import { ProfilePage } from "../src/components/ProfilePage";
import { translate } from "../src/i18n/translations";
import { useAppStore } from "../src/stores/appStore";
import { useAuthStore } from "../src/stores/authStore";
import { getTheme } from "../src/theme/theme";

export default function ProfileEmailVerificationScreen() {
  const language = useAppStore((state) => state.language);
  const themeMode = useAppStore((state) => state.themeMode);
  const pendingEmailChange = useAuthStore((state) => state.pendingEmailChange);
  const isLoading = useAuthStore((state) => state.isLoading);
  const verifyEmailChange = useAuthStore((state) => state.verifyEmailChange);
  const resendEmailChange = useAuthStore((state) => state.resendEmailChange);
  const theme = getTheme(themeMode);
  const [code, setCode] = useState("");
  const isVerifyingRef = useRef(false);

  useEffect(() => {
    if (!pendingEmailChange && !isVerifyingRef.current) {
      router.replace("/(tabs)/profile" as Href);
    }
  }, [pendingEmailChange]);

  const handleVerify = async () => {
    if (!/^\d{6}$/.test(code)) {
      Alert.alert(
        translate("emailChangeVerification", language),
        translate("invalidOrExpiredCode", language),
      );
      return;
    }

    try {
      isVerifyingRef.current = true;
      await verifyEmailChange(code);
      Alert.alert(
        translate("emailChangeCompleted", language),
        translate("emailChangeCompletedMessage", language),
        [
          {
            text: translate("ok", language),
            onPress: () => router.replace("/(tabs)/profile" as Href),
          },
        ],
      );
    } catch (error) {
      isVerifyingRef.current = false;
      Alert.alert(
        translate("emailChangeVerification", language),
        error instanceof Error
          ? error.message
          : translate("invalidOrExpiredCode", language),
      );
    }
  };

  const handleResend = async () => {
    try {
      await resendEmailChange();
      Alert.alert(
        translate("emailChangeVerification", language),
        translate("codeSentAgain", language),
      );
    } catch (error) {
      Alert.alert(
        translate("emailChangeVerification", language),
        error instanceof Error ? error.message : translate("genericError", language),
      );
    }
  };

  return (
    <ProfilePage
      title={translate("emailChangeVerification", language)}
      subtitle={translate("emailChangeVerificationSubtitle", language)}
      compactHeader
    >
      <View style={styles.header}>
        <View
          style={[styles.iconBox, { backgroundColor: theme.colors.primarySoft }]}
        >
          <Ionicons name="mail-open-outline" size={30} color={theme.colors.primary} />
        </View>
        <Text style={[styles.title, { color: theme.colors.text }]}>
          {translate("verifyNewEmail", language)}
        </Text>
        <Text
          style={[styles.description, { color: theme.colors.mutedText }]}
        >
          {translate("emailChangeCodeSent", language)}
        </Text>
        <Text style={[styles.email, { color: theme.colors.primary }]}>
          {pendingEmailChange?.email ?? "-"}
        </Text>
      </View>

      <View
        style={[
          styles.card,
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
          disabled={isLoading || !pendingEmailChange || code.length !== 6}
        >
          {translate("verifyCode", language)}
        </Button>
        <Button
          variant="secondary"
          onPress={handleResend}
          disabled={isLoading || !pendingEmailChange}
        >
          {translate("resendCode", language)}
        </Button>
      </View>
    </ProfilePage>
  );
}

const styles = StyleSheet.create({
  header: { alignItems: "center", marginBottom: 24 },
  iconBox: {
    width: 64,
    height: 64,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  title: { fontSize: 24, fontWeight: "900", textAlign: "center" },
  description: {
    marginTop: 10,
    fontSize: 13,
    lineHeight: 20,
    fontWeight: "600",
    textAlign: "center",
  },
  email: { marginTop: 8, fontSize: 15, fontWeight: "900" },
  card: { borderWidth: 1, borderRadius: 24, padding: 18, gap: 14 },
});
