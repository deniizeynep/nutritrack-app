import { StyleSheet, Text, View } from "react-native";
import { useAppStore } from "../stores/appStore";
import { getTheme } from "../theme/theme";

type MacroProgressProps = {
  label: string;
  current: number;
  target: number;
  color: string;
  unit?: string;
};

export function MacroProgress({
  label,
  current,
  target,
  color,
  unit = "g",
}: MacroProgressProps) {
  const themeMode = useAppStore((state) => state.themeMode);
  const theme = getTheme(themeMode);

  const percent = Math.min((current / target) * 100, 100);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={[styles.label, { color: theme.colors.text }]}>
          {label}
        </Text>

        <Text style={[styles.value, { color: theme.colors.mutedText }]}>
          {current} / {target}
          {unit}
        </Text>
      </View>

      <View
        style={[
          styles.track,
          {
            backgroundColor: theme.colors.cardSoft,
          },
        ]}
      >
        <View
          style={[
            styles.fill,
            {
              width: `${percent}%`,
              backgroundColor: color,
            },
          ]}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    gap: 8,
  },
  header: {
    gap: 2,
  },
  label: {
    fontSize: 12,
    fontWeight: "800",
  },
  value: {
    fontSize: 11,
    fontWeight: "600",
  },
  track: {
    height: 7,
    borderRadius: 999,
    overflow: "hidden",
  },
  fill: {
    height: "100%",
    borderRadius: 999,
  },
});
