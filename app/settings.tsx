import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import {
  Alert,
  Modal,
  Pressable,
  StyleSheet,
  Switch,
  Text,
  View,
} from "react-native";
import { router } from "expo-router";
import { ProfilePage } from "../src/components/ProfilePage";
import { translate } from "../src/i18n/translations";
import { useAppStore } from "../src/stores/appStore";
import { useAuthStore } from "../src/stores/authStore";
import { useGoalStore } from "../src/stores/goalStore";
import { useMealStore } from "../src/stores/mealStore";
import { getTheme } from "../src/theme/theme";

export default function SettingsScreen() {
  const [selection, setSelection] = useState<"language" | "unit" | null>(null);
  const themeMode = useAppStore((state) => state.themeMode);
  const language = useAppStore((state) => state.language);
  const unitSystem = useAppStore((state) => state.unitSystem);
  const setThemeMode = useAppStore((state) => state.setThemeMode);
  const dataSharingEnabled = useAppStore((state) => state.dataSharingEnabled);
  const setDataSharingEnabled = useAppStore((state) => state.setDataSharingEnabled);
  const mealRemindersEnabled = useAppStore((state) => state.mealRemindersEnabled);
  const waterTrackingEnabled = useAppStore((state) => state.waterTrackingEnabled);
  const setMealRemindersEnabled = useAppStore((state) => state.setMealRemindersEnabled);
  const setWaterTrackingEnabled = useAppStore((state) => state.setWaterTrackingEnabled);
  const deleteAccount = useAuthStore((state) => state.deleteAccount);
  const clearGoal = useGoalStore((state) => state.clearGoal);
  const clearMeals = useMealStore((state) => state.clearMeals);
  const setLanguage = useAppStore((state) => state.setLanguage);
  const setUnitSystem = useAppStore((state) => state.setUnitSystem);
  const theme = getTheme(themeMode);
  const isDarkMode = themeMode === "dark";

  const confirmDeleteAccount = () => {
    Alert.alert(
      translate("deleteAccount", language),
      translate("deleteAccountMessage", language),
      [
        { text: translate("cancel", language), style: "cancel" },
        {
          text: translate("deleteAccount", language),
          style: "destructive",
          onPress: () => {
            Alert.alert(
              translate("deleteAccountFinalTitle", language),
              translate("deleteAccountFinalMessage", language),
              [
                { text: translate("cancel", language), style: "cancel" },
                {
                  text: translate("deleteAccount", language),
                  style: "destructive",
                  onPress: async () => {
                    try {
                      await deleteAccount();
                      clearMeals();
                      clearGoal();
                      router.dismissAll();
                    } catch (error) {
                      Alert.alert(
                        translate("error", language),
                        error instanceof Error
                          ? error.message
                          : translate("accountDeleteFailed", language),
                      );
                    }
                  },
                },
              ],
            );
          },
        },
      ],
    );
  };

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
          onPress={() => setSelection("language")}
        />
        <View style={[styles.divider, { backgroundColor: theme.colors.border }]} />
        <SettingsRow
          label={translate("unitSystem", language)}
          value={translate(unitSystem === "metric" ? "metricUnits" : "imperialUnits", language)}
          onPress={() => setSelection("unit")}
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

      <View style={[styles.sectionHeader, styles.sectionSpacing]}>
        <Ionicons name="shield-checkmark-outline" size={15} color={theme.colors.primary} />
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
          {translate("privacyAndSecurity", language)}
        </Text>
      </View>

      <View style={[styles.card, { backgroundColor: theme.colors.card }]}>
        <View style={styles.row}>
          <View style={styles.rowText}>
            <Text style={[styles.rowLabel, { color: theme.colors.text }]}>
              {translate("dataSharing", language)}
            </Text>
            <Text style={[styles.rowValue, { color: theme.colors.mutedText }]}>
              {translate("dataSharingSubtitle", language)}
            </Text>
          </View>
          <Switch
            value={dataSharingEnabled}
            onValueChange={setDataSharingEnabled}
            trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
            thumbColor="#FFFFFF"
            ios_backgroundColor={theme.colors.border}
          />
        </View>
        <View style={[styles.divider, { backgroundColor: theme.colors.border }]} />
        <Pressable onPress={confirmDeleteAccount} style={styles.row}>
          <View style={styles.rowText}>
            <Text style={[styles.rowLabel, { color: theme.colors.danger }]}>
              {translate("deleteDataPermanently", language)}
            </Text>
            <Text style={[styles.rowValue, { color: theme.colors.danger }]}>
              {translate("deleteDataPermanentlySubtitle", language)}
            </Text>
          </View>
          <Ionicons name="trash-outline" size={19} color={theme.colors.danger} />
        </Pressable>
      </View>

      <View style={[styles.sectionHeader, styles.sectionSpacing]}>
        <Ionicons name="notifications-outline" size={15} color={theme.colors.primary} />
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
          {translate("notifications", language)}
        </Text>
      </View>

      <View style={[styles.card, { backgroundColor: theme.colors.card }]}>
        <NotificationRow
          icon="restaurant-outline"
          label={translate("mealReminders", language)}
          subtitle={translate("mealRemindersSubtitle", language)}
          enabled={mealRemindersEnabled}
          onEnabledChange={setMealRemindersEnabled}
        />
        <View style={[styles.divider, { backgroundColor: theme.colors.border }]} />
        <NotificationRow
          icon="water-outline"
          label={translate("waterTracking", language)}
          subtitle={translate("waterTrackingSubtitle", language)}
          enabled={waterTrackingEnabled}
          onEnabledChange={setWaterTrackingEnabled}
        />
      </View>
      <View style={styles.appInfo}>
        <Text style={[styles.appVersion, { color: theme.colors.mutedText }]}>
          {translate("appVersion", language)}
        </Text>
        <Text style={[styles.appTagline, { color: theme.colors.mutedText }]}>
          {translate("appTagline", language)}
        </Text>
      </View>
      <SelectionModal
        visible={selection !== null}
        title={translate(selection === "language" ? "appLanguage" : "unitSystem", language)}
        language={language}
        selectedValue={selection === "language" ? language : unitSystem}
        options={
          selection === "language"
            ? [
                { value: "tr", label: translate("turkishLocale", language) },
                { value: "en", label: translate("englishLocale", language) },
              ]
            : [
                { value: "metric", label: translate("metricUnits", language) },
                { value: "imperial", label: translate("imperialUnits", language) },
              ]
        }
        onSelect={(value) => {
          if (selection === "language") {
            setLanguage(value as "tr" | "en");
          } else {
            setUnitSystem(value as "metric" | "imperial");
          }
          setSelection(null);
        }}
        onClose={() => setSelection(null)}
      />
    </ProfilePage>
  );
}

function SettingsRow({
  label,
  value,
  onPress,
}: {
  label: string;
  value: string;
  onPress?: () => void;
}) {
  const themeMode = useAppStore((state) => state.themeMode);
  const theme = getTheme(themeMode);

  return (
    <Pressable onPress={onPress} disabled={!onPress} style={styles.row}>
      <View style={styles.rowText}>
        <Text style={[styles.rowLabel, { color: theme.colors.text }]}>{label}</Text>
        <Text style={[styles.rowValue, { color: theme.colors.mutedText }]}>{value}</Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color={theme.colors.mutedText} />
    </Pressable>
  );
}

function NotificationRow({
  icon,
  label,
  subtitle,
  enabled,
  onEnabledChange,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  subtitle: string;
  enabled: boolean;
  onEnabledChange: (enabled: boolean) => void;
}) {
  const themeMode = useAppStore((state) => state.themeMode);
  const theme = getTheme(themeMode);

  return (
    <View style={styles.row}>
      <View style={[styles.notificationIcon, { backgroundColor: theme.colors.primarySoft }]}>
        <Ionicons name={icon} size={19} color={theme.colors.primary} />
      </View>
      <View style={styles.rowText}>
        <Text style={[styles.rowLabel, { color: theme.colors.text }]}>{label}</Text>
        <Text style={[styles.rowValue, { color: theme.colors.mutedText }]}>{subtitle}</Text>
      </View>
      <Switch
        value={enabled}
        onValueChange={onEnabledChange}
        trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
        thumbColor="#FFFFFF"
        ios_backgroundColor={theme.colors.border}
      />
    </View>
  );
}

function SelectionModal({
  visible,
  title,
  language,
  selectedValue,
  options,
  onSelect,
  onClose,
}: {
  visible: boolean;
  title: string;
  language: "tr" | "en";
  selectedValue: string;
  options: { value: string; label: string }[];
  onSelect: (value: string) => void;
  onClose: () => void;
}) {
  const themeMode = useAppStore((state) => state.themeMode);
  const theme = getTheme(themeMode);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.modalBackdrop} onPress={onClose}>
        <Pressable
          style={[styles.modalCard, { backgroundColor: theme.colors.card }]}
          onPress={(event) => event.stopPropagation()}
        >
          <Text style={[styles.modalTitle, { color: theme.colors.text }]}>{title}</Text>
          <Text style={[styles.modalSubtitle, { color: theme.colors.mutedText }]}>
            {translate("chooseOption", language)}
          </Text>
          <View style={[styles.modalOptions, { borderColor: theme.colors.border }]}>
            {options.map((option, index) => (
              <Pressable
                key={option.value}
                onPress={() => onSelect(option.value)}
                style={[
                  styles.modalOption,
                  index > 0 && { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: theme.colors.border },
                ]}
              >
                <Text style={[styles.modalOptionText, { color: theme.colors.text }]}>
                  {option.label}
                </Text>
                <Ionicons
                  name={selectedValue === option.value ? "checkmark-circle" : "ellipse-outline"}
                  size={22}
                  color={selectedValue === option.value ? theme.colors.primary : theme.colors.mutedText}
                />
              </Pressable>
            ))}
          </View>
          <Pressable onPress={onClose} style={styles.modalCancel}>
            <Text style={[styles.modalCancelText, { color: theme.colors.primary }]}>
              {translate("cancel", language)}
            </Text>
          </Pressable>
        </Pressable>
      </Pressable>
    </Modal>
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
  notificationIcon: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  rowLabel: { fontSize: 13, fontWeight: "600" },
  rowValue: { marginTop: 3, fontSize: 11, fontWeight: "500" },
  divider: { height: StyleSheet.hairlineWidth },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.38)",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  modalCard: {
    borderRadius: 22,
    padding: 18,
  },
  modalTitle: { fontSize: 18, fontWeight: "900" },
  modalSubtitle: { marginTop: 5, fontSize: 12, fontWeight: "600" },
  modalOptions: { marginTop: 16, borderWidth: 1, borderRadius: 14, overflow: "hidden" },
  modalOption: {
    minHeight: 54,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  modalOptionText: { fontSize: 14, fontWeight: "700" },
  modalCancel: { alignItems: "center", paddingTop: 16 },
  modalCancelText: { fontSize: 13, fontWeight: "800" },
  appInfo: { alignItems: "center", marginTop: 30, paddingBottom: 8 },
  appVersion: { fontSize: 11, fontWeight: "600" },
  appTagline: { marginTop: 4, fontSize: 9, fontWeight: "500", opacity: 0.7 },
});
