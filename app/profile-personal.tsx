import { StyleSheet, Text, View } from "react-native";
import { ProfilePage } from "../src/components/ProfilePage";
import { translate } from "../src/i18n/translations";
import { useAppStore } from "../src/stores/appStore";
import { useAuthStore } from "../src/stores/authStore";
import { useGoalStore } from "../src/stores/goalStore";
import { getTheme } from "../src/theme/theme";

export default function PersonalInformationScreen() {
  const themeMode = useAppStore((state) => state.themeMode);
  const language = useAppStore((state) => state.language);
  const user = useAuthStore((state) => state.user);
  const goal = useGoalStore((state) => state.goal);
  const theme = getTheme(themeMode);

  return (
    <ProfilePage
      title={translate("personalInformation", language)}
      subtitle={translate("personalInformationSubtitle", language)}
    >
      <View
        style={[
          styles.card,
          { backgroundColor: theme.colors.card, borderColor: theme.colors.border },
        ]}
      >
        <InformationRow label={translate("fullName", language)} value={user?.fullName || "-"} />
        <InformationRow label={translate("email", language)} value={user?.email || "-"} />
        <InformationRow label={translate("age", language)} value={goal?.age ? String(goal.age) : "-"} />
        <InformationRow label={translate("height", language)} value={goal?.heightCm ? `${goal.heightCm} cm` : "-"} />
        <InformationRow label={translate("weight", language)} value={goal?.weightKg ? `${goal.weightKg} kg` : "-"} />
      </View>
    </ProfilePage>
  );
}

function InformationRow({ label, value }: { label: string; value: string }) {
  const themeMode = useAppStore((state) => state.themeMode);
  const theme = getTheme(themeMode);
  return (
    <View style={[styles.row, { borderBottomColor: theme.colors.border }]}>
      <Text style={[styles.label, { color: theme.colors.mutedText }]}>{label}</Text>
      <Text style={[styles.value, { color: theme.colors.text }]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderWidth: 1, borderRadius: 20, paddingHorizontal: 16 },
  row: { paddingVertical: 14, borderBottomWidth: 1, gap: 4 },
  label: { fontSize: 11, fontWeight: "700" },
  value: { fontSize: 15, fontWeight: "800" },
});
