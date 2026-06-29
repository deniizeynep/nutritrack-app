import { StyleSheet, Text, View } from "react-native";
import { useAppStore } from "../stores/appStore";
import { getTheme } from "../theme/theme";

type MealCardProps = {
  icon: string;
  title: string;
  calories: number;
  items: string;
};

export function MealCard({ icon, title, calories, items }: MealCardProps) {
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

        <View>
          <Text style={[styles.title, { color: theme.colors.text }]}>
            {title}
          </Text>

          <Text style={[styles.items, { color: theme.colors.mutedText }]}>
            {items}
          </Text>
        </View>
      </View>

      <Text style={[styles.calories, { color: theme.colors.text }]}>
        {calories} kcal
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderRadius: 20,
    padding: 14,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  left: {
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
  title: {
    fontSize: 15,
    fontWeight: "800",
  },
  items: {
    marginTop: 3,
    fontSize: 12,
    fontWeight: "500",
  },
  calories: {
    fontSize: 14,
    fontWeight: "900",
  },
});
