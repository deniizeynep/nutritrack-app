import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Switch, Text, View } from "react-native";
import { ProfilePage } from "../src/components/ProfilePage";
import { translate } from "../src/i18n/translations";
import { useAppStore } from "../src/stores/appStore";
import { getTheme } from "../src/theme/theme";

export default function SettingsScreen() {
  const themeMode = useAppStore((state) => state.themeMode);
  const language = useAppStore((state) => state.language);
  const setThemeMode = useAppStore((state) => state.setThemeMode);
  const theme = getTheme(themeMode);
  const isDarkMode = themeMode === "dark";

  return (
    <ProfilePage
      title={translate("appSettings", language)}
      subtitle={translate("appSettingsSubtitle", language)}
      compactHeader
    >
      <View style={styles.sectionHeader}>
        <Ionicons name="globe-outline" size={15} color={theme.colors.primary} />
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
          {translate("languageAndRegion", language)}
        </Text>
      </View>

      <View style={[styles.card, { backgroundColor: theme.colors.card }]}>
        <SettingsRow
          label={translate("appLanguage", language)}
          value={translate(
            language === "tr" ? "turkishLocale" : "englishLocale",
            language,
          )}
        />
        <View style={[styles.divider, { backgroundColor: theme.colors.border }]} />
        <SettingsRow
          label={translate("unitSystem", language)}
          value={translate("metricUnits", language)}
        />
      </View>

      <View style={[styles.sectionHeader, styles.sectionSpacing]}>
        <Ionicons name="moon-outline" size={15} color={theme.colors.primary} />
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
          {translate("appearance", language)}
        </Text>
      </View>

      <View style={[styles.card, { backgroundColor: theme.colors.card }]}>
        <View style={styles.row}>
          <View style={styles.rowText}>
            <Text style={[styles.rowLabel, { color: theme.colors.text }]}>
              {translate("darkMode", language)}
            </Text>
            <Text style={[styles.rowValue, { color: theme.colors.mutedText }]}>
              {translate("darkModeSubtitle", language)}
            </Text>
          </View>
          <Switch
            value={isDarkMode}
            onValueChange={(value) => setThemeMode(value ? "dark" : "light")}
            trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
            thumbColor="#FFFFFF"
            ios_backgroundColor={theme.colors.border}
          />
        </View>
      </View>
    </ProfilePage>
  );
}

function SettingsRow({ label, value }: { label: string; value: string }) {
  const themeMode = useAppStore((state) => state.themeMode);
  const theme = getTheme(themeMode);

  return (
    <View style={styles.row}>
      <View style={styles.rowText}>
        <Text style={[styles.rowLabel, { color: theme.colors.text }]}>{label}</Text>
        <Text style={[styles.rowValue, { color: theme.colors.mutedText }]}>{value}</Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color={theme.colors.mutedText} />
    </View>
  );
}

const styles = StyleSheet.create({
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    marginBottom: 9,
    paddingHorizontal: 4,
  },
  sectionSpacing: {
    marginTop: 22,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 0.4,
    textTransform: "uppercase",
  },
  card: {
    borderRadius: 14,
    paddingHorizontal: 12,
  },
  row: {
    minHeight: 58,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 1,
  },
  rowText: { flex: 1, paddingRight: 12 },
  rowLabel: { fontSize: 13, fontWeight: "600" },
  rowValue: { marginTop: 3, fontSize: 11, fontWeight: "500" },
  divider: { height: StyleSheet.hairlineWidth },
});
