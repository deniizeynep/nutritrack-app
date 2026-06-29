import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useAppStore } from "../stores/appStore";
import { getTheme } from "../theme/theme";

type MealCardProps = {
  icon: string;
  title: string;
  calories: number;
  items: string;
  protein?: number;
  carbs?: number;
  fat?: number;
  onDelete?: () => void;
};

export function MealCard({
  icon,
  title,
  calories,
  items,
  protein = 0,
  carbs = 0,
  fat = 0,
  onDelete,
}: MealCardProps) {
  const themeMode = useAppStore((state) => state.themeMode);
  const theme = getTheme(themeMode);

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: theme.colors.card,
          borderColor: theme.colors.border,
        },
      ]}
    >
      <View style={styles.top}>
        <View style={styles.left}>
          <View
            style={[
              styles.iconBox,
              {
                backgroundColor: theme.colors.primarySoft,
              },
            ]}
          >
            <Text style={styles.icon}>{icon}</Text>
          </View>

          <View style={styles.titleArea}>
            <Text style={[styles.title, { color: theme.colors.text }]}>
              {title}
            </Text>

            <Text
              numberOfLines={1}
              style={[styles.items, { color: theme.colors.mutedText }]}
            >
              {items}
            </Text>
          </View>
        </View>

        <View style={styles.right}>
          <Text style={[styles.calories, { color: theme.colors.text }]}>
            {calories} kcal
          </Text>

          {onDelete ? (
            <Pressable onPress={onDelete} hitSlop={10}>
              <Ionicons
                name="trash-outline"
                size={18}
                color={theme.colors.mutedText}
              />
            </Pressable>
          ) : null}
        </View>
      </View>

      <View
        style={[styles.divider, { backgroundColor: theme.colors.border }]}
      />

      <View style={styles.macroRow}>
        <MacroPill label="P" value={protein} color={theme.colors.protein} />
        <MacroPill label="C" value={carbs} color={theme.colors.carbs} />
        <MacroPill label="F" value={fat} color={theme.colors.fat} />
      </View>
    </View>
  );
}

type MacroPillProps = {
  label: string;
  value: number;
  color: string;
};

function MacroPill({ label, value, color }: MacroPillProps) {
  return (
    <View style={styles.macroPill}>
      <View style={[styles.macroDot, { backgroundColor: color }]} />

      <Text style={styles.macroText}>
        {label}: {value}g
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderRadius: 20,
    padding: 14,
  },
  top: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
  },
  left: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  icon: {
    fontSize: 22,
  },
  titleArea: {
    flex: 1,
  },
  title: {
    fontSize: 15,
    fontWeight: "800",
  },
  items: {
    marginTop: 3,
    fontSize: 12,
    fontWeight: "500",
  },
  right: {
    alignItems: "flex-end",
    gap: 8,
  },
  calories: {
    fontSize: 14,
    fontWeight: "900",
  },
  divider: {
    height: 1,
    marginVertical: 12,
  },
  macroRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  macroPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  macroDot: {
    width: 7,
    height: 7,
    borderRadius: 999,
  },
  macroText: {
    fontSize: 11,
    fontWeight: "800",
    color: "#8A8A8A",
  },
});
