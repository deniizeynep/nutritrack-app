import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";
import { ProfilePage } from "../src/components/ProfilePage";
import { translate } from "../src/i18n/translations";
import { useAppStore } from "../src/stores/appStore";
import { getTheme } from "../src/theme/theme";

export default function RemindersScreen() {
  const themeMode = useAppStore((state) => state.themeMode);
  const language = useAppStore((state) => state.language);
  const theme = getTheme(themeMode);

  return (
    <ProfilePage
      title={translate("reminders", language)}
      subtitle={translate("remindersSubtitle", language)}
    >
      <View
        style={[
          styles.card,
          { backgroundColor: theme.colors.card, borderColor: theme.colors.border },
        ]}
      >
        <View
          style={[styles.iconBox, { backgroundColor: theme.colors.primarySoft }]}
        >
          <Ionicons name="notifications-outline" size={28} color={theme.colors.primary} />
        </View>
        <Text style={[styles.title, { color: theme.colors.text }]}>
          {translate("remindersComingSoon", language)}
        </Text>
        <Text style={[styles.subtitle, { color: theme.colors.mutedText }]}>
          {translate("remindersComingSoonSubtitle", language)}
        </Text>
      </View>
    </ProfilePage>
  );
}

const styles = StyleSheet.create({
  card: { borderWidth: 1, borderRadius: 20, padding: 24, alignItems: "center" },
  iconBox: { width: 58, height: 58, borderRadius: 20, alignItems: "center", justifyContent: "center" },
  title: { marginTop: 16, fontSize: 17, fontWeight: "900", textAlign: "center" },
  subtitle: { marginTop: 7, fontSize: 12, lineHeight: 18, fontWeight: "600", textAlign: "center" },
});
