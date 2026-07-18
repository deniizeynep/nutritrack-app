import { Ionicons } from "@expo/vector-icons";
import type { ComponentProps, ReactNode } from "react";
import { useState } from "react";
import {
  Modal,
  Pressable,
  StyleSheet,
  Switch,
  Text,
  View,
} from "react-native";
import { ProfilePage } from "../src/components/ProfilePage";
import { translate } from "../src/i18n/translations";
import { useAppStore } from "../src/stores/appStore";
import { getTheme, type AppTheme } from "../src/theme/theme";

type IconName = ComponentProps<typeof Ionicons>["name"];

export default function RemindersScreen() {
  const themeMode = useAppStore((state) => state.themeMode);
  const language = useAppStore((state) => state.language);
  const theme = getTheme(themeMode);
  const [breakfastEnabled, setBreakfastEnabled] = useState(true);
  const [lunchEnabled, setLunchEnabled] = useState(true);
  const [dinnerEnabled, setDinnerEnabled] = useState(true);
  const [waterEnabled, setWaterEnabled] = useState(true);

  return (
    <ProfilePage
      title={translate("reminders", language)}
      subtitle={translate("remindersSubtitle", language)}
      compactHeader
    >
      <View style={styles.cardList}>
        <ReminderCard
          icon="cafe-outline"
          title={translate("breakfast", language)}
          frequency={translate("everyDay", language)}
          enabled={breakfastEnabled}
          onEnabledChange={setBreakfastEnabled}
          theme={theme}
        >
          <TimeRow
            label={translate("reminderTime", language)}
            initialTime="08:30"
            theme={theme}
          />
        </ReminderCard>

        <ReminderCard
          icon="fast-food-outline"
          title={translate("lunch", language)}
          frequency={translate("everyDay", language)}
          enabled={lunchEnabled}
          onEnabledChange={setLunchEnabled}
          theme={theme}
        >
          <TimeRow
            label={translate("reminderTime", language)}
            initialTime="13:00"
            theme={theme}
          />
        </ReminderCard>

        <ReminderCard
          icon="restaurant-outline"
          title={translate("dinner", language)}
          frequency={translate("everyDay", language)}
          enabled={dinnerEnabled}
          onEnabledChange={setDinnerEnabled}
          theme={theme}
        >
          <TimeRow
            label={translate("reminderTime", language)}
            initialTime="19:30"
            theme={theme}
          />
        </ReminderCard>

        <ReminderCard
          icon="water-outline"
          title={translate("waterIntake", language)}
          frequency={translate("everyTwoHours", language)}
          enabled={waterEnabled}
          onEnabledChange={setWaterEnabled}
          theme={theme}
          accent
        >
          <View style={[styles.timeRow, { backgroundColor: theme.colors.cardSoft }]}>
            <Text style={[styles.timeLabel, { color: theme.colors.mutedText }]}>
              {translate("startAndEnd", language)}
            </Text>
            <View style={styles.timeRange}>
              <TimePickerField initialTime="08:00" theme={theme} />
              <Text style={[styles.timeSeparator, { color: theme.colors.mutedText }]}>-</Text>
              <TimePickerField initialTime="22:00" theme={theme} />
            </View>
          </View>
        </ReminderCard>
      </View>
    </ProfilePage>
  );
}

function ReminderCard({
  icon,
  title,
  frequency,
  enabled,
  onEnabledChange,
  theme,
  accent = false,
  children,
}: {
  icon: IconName;
  title: string;
  frequency: string;
  enabled: boolean;
  onEnabledChange: (value: boolean) => void;
  theme: AppTheme;
  accent?: boolean;
  children: ReactNode;
}) {
  const iconBackground = accent ? "#A7F3D0" : theme.colors.primarySoft;
  const iconColor = accent ? "#047857" : theme.colors.primary;

  return (
    <View
      style={[
        styles.card,
        theme.elevation.card,
        { backgroundColor: theme.colors.card, borderColor: theme.colors.border },
      ]}
    >
      <View style={styles.cardHeader}>
        <View style={[styles.iconCircle, { backgroundColor: iconBackground }]}>
          <Ionicons name={icon} size={21} color={iconColor} />
        </View>
        <View style={styles.cardTitleGroup}>
          <Text style={[styles.cardTitle, { color: theme.colors.text }]}>{title}</Text>
          <Text style={[styles.frequency, { color: theme.colors.mutedText }]}>
            {frequency}
          </Text>
        </View>
        <Switch
          value={enabled}
          onValueChange={onEnabledChange}
          trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
          thumbColor="#FFFFFF"
          ios_backgroundColor={theme.colors.border}
        />
      </View>
      {children}
    </View>
  );
}

function TimeRow({
  label,
  initialTime,
  theme,
}: {
  label: string;
  initialTime: string;
  theme: AppTheme;
}) {
  return (
    <View style={[styles.timeRow, { backgroundColor: theme.colors.cardSoft }]}>
      <Text style={[styles.timeLabel, { color: theme.colors.mutedText }]}>{label}</Text>
      <View style={styles.editTime}>
        <TimePickerField initialTime={initialTime} theme={theme} />
        <Ionicons name="pencil" size={14} color={theme.colors.primary} />
      </View>
    </View>
  );
}

function TimePickerField({ initialTime, theme }: { initialTime: string; theme: AppTheme }) {
  const language = useAppStore((state) => state.language);
  const [selectedTime, setSelectedTime] = useState(() => createTimeDate(initialTime));
  const [draftTime, setDraftTime] = useState(selectedTime);
  const [isPickerOpen, setIsPickerOpen] = useState(false);

  const openPicker = () => {
    setDraftTime(selectedTime);
    setIsPickerOpen(true);
  };

  const saveTime = () => {
    setSelectedTime(draftTime);
    setIsPickerOpen(false);
  };

  const adjustTime = (unit: "hour" | "minute", amount: number) => {
    const nextTime = new Date(draftTime);
    if (unit === "hour") {
      nextTime.setHours(nextTime.getHours() + amount);
    } else {
      nextTime.setMinutes(nextTime.getMinutes() + amount);
    }
    setDraftTime(nextTime);
  };

  return (
    <>
      <Pressable
        onPress={openPicker}
        accessibilityRole="button"
        style={({ pressed }) => [
          styles.timeButton,
          {
            backgroundColor: theme.colors.card,
            borderColor: theme.colors.border,
            opacity: pressed ? 0.7 : 1,
          },
        ]}
      >
        <Text style={[styles.timeText, { color: theme.colors.primary }]}>
          {formatTime(selectedTime)}
        </Text>
      </Pressable>

      <Modal
        visible={isPickerOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setIsPickerOpen(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={[styles.pickerSheet, { backgroundColor: theme.colors.card }]}>
            <Text style={[styles.pickerTitle, { color: theme.colors.text }]}>
              {translate("reminderTime", language)}
            </Text>
            <View style={styles.timeControls}>
              <TimeControl
                label={translate("hour", language)}
                value={String(draftTime.getHours()).padStart(2, "0")}
                onIncrease={() => adjustTime("hour", 1)}
                onDecrease={() => adjustTime("hour", -1)}
                theme={theme}
              />
              <Text style={[styles.controlSeparator, { color: theme.colors.text }]}>:</Text>
              <TimeControl
                label={translate("minute", language)}
                value={String(draftTime.getMinutes()).padStart(2, "0")}
                onIncrease={() => adjustTime("minute", 5)}
                onDecrease={() => adjustTime("minute", -5)}
                theme={theme}
              />
            </View>
            <View style={styles.pickerActions}>
              <Pressable
                onPress={() => setIsPickerOpen(false)}
                style={[styles.pickerAction, { borderColor: theme.colors.border }]}
              >
                <Text style={[styles.pickerActionText, { color: theme.colors.mutedText }]}>
                  {translate("cancel", language)}
                </Text>
              </Pressable>
              <Pressable
                onPress={saveTime}
                style={[styles.pickerAction, { backgroundColor: theme.colors.primary }]}
              >
                <Text style={[styles.pickerActionText, { color: "#FFFFFF" }]}>
                  {translate("save", language)}
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}

function TimeControl({
  label,
  value,
  onIncrease,
  onDecrease,
  theme,
}: {
  label: string;
  value: string;
  onIncrease: () => void;
  onDecrease: () => void;
  theme: AppTheme;
}) {
  return (
    <View style={styles.timeControl}>
      <Text style={[styles.controlLabel, { color: theme.colors.mutedText }]}>{label}</Text>
      <Pressable
        onPress={onIncrease}
        accessibilityRole="button"
        accessibilityLabel={`${label} +`}
        style={[styles.stepButton, { backgroundColor: theme.colors.cardSoft }]}
      >
        <Ionicons name="chevron-up" size={22} color={theme.colors.primary} />
      </Pressable>
      <View
        style={[
          styles.controlValue,
          { backgroundColor: theme.colors.cardSoft, borderColor: theme.colors.border },
        ]}
      >
        <Text style={[styles.controlValueText, { color: theme.colors.text }]}>{value}</Text>
      </View>
      <Pressable
        onPress={onDecrease}
        accessibilityRole="button"
        accessibilityLabel={`${label} -`}
        style={[styles.stepButton, { backgroundColor: theme.colors.cardSoft }]}
      >
        <Ionicons name="chevron-down" size={22} color={theme.colors.primary} />
      </Pressable>
    </View>
  );
}

function createTimeDate(time: string) {
  const [hours, minutes] = time.split(":").map(Number);
  const date = new Date();
  date.setHours(hours, minutes, 0, 0);
  return date;
}

function formatTime(date: Date) {
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${hours}:${minutes}`;
}

const styles = StyleSheet.create({
  cardList: { gap: 14 },
  card: { borderWidth: 1, borderRadius: 18, padding: 14 },
  cardHeader: { flexDirection: "row", alignItems: "center" },
  iconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
  },
  cardTitleGroup: { flex: 1, marginLeft: 12 },
  cardTitle: { fontSize: 15, lineHeight: 20, fontWeight: "700" },
  frequency: {
    marginTop: 1,
    fontSize: 10,
    lineHeight: 13,
    fontWeight: "800",
    letterSpacing: 0.4,
  },
  timeRow: {
    minHeight: 48,
    marginTop: 12,
    borderRadius: 12,
    paddingHorizontal: 11,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  timeLabel: { flexShrink: 1, fontSize: 12, lineHeight: 17, fontWeight: "500" },
  editTime: { flexDirection: "row", alignItems: "center", gap: 8 },
  timeRange: { flexDirection: "row", alignItems: "center", gap: 5 },
  timeSeparator: { fontSize: 12, fontWeight: "700" },
  timeButton: {
    minWidth: 58,
    height: 30,
    paddingHorizontal: 8,
    borderWidth: 1,
    borderRadius: 7,
    alignItems: "center",
    justifyContent: "center",
  },
  timeText: {
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 0.3,
  },
  modalBackdrop: {
    flex: 1,
    padding: 20,
    backgroundColor: "rgba(0, 0, 0, 0.45)",
    alignItems: "center",
    justifyContent: "center",
  },
  pickerSheet: { width: "100%", maxWidth: 320, borderRadius: 20, padding: 18 },
  pickerTitle: { fontSize: 17, fontWeight: "900", textAlign: "center" },
  timeControls: {
    marginTop: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 16,
  },
  timeControl: { alignItems: "center", gap: 7 },
  controlLabel: { fontSize: 11, fontWeight: "700" },
  stepButton: {
    width: 54,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  controlValue: {
    width: 72,
    height: 58,
    borderWidth: 1,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  controlValueText: { fontSize: 26, fontWeight: "900" },
  controlSeparator: { marginTop: 25, fontSize: 28, fontWeight: "900" },
  pickerActions: { marginTop: 20, flexDirection: "row", gap: 10 },
  pickerAction: {
    flex: 1,
    height: 44,
    borderWidth: 1,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  pickerActionText: { fontSize: 14, fontWeight: "800" },
});
