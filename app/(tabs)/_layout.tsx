import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { translate } from "../../src/i18n/translations";
import { useAppStore } from "../../src/stores/appStore";
import { getTheme } from "../../src/theme/theme";

export default function TabsLayout() {
  const themeMode = useAppStore((state) => state.themeMode);
  const language = useAppStore((state) => state.language);

  const theme = getTheme(themeMode);

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.mutedText,
        tabBarStyle: {
          height: 72,
          paddingTop: 8,
          paddingBottom: 12,
          backgroundColor: theme.colors.card,
          borderTopColor: theme.colors.border,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "700",
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          href: null,
        }}
      />

      <Tabs.Screen
        name="home"
        options={{
          title: translate("home", language),
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home-outline" color={color} size={size} />
          ),
        }}
      />

      <Tabs.Screen
        name="diary"
        options={{
          title: translate("diary", language),
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="calendar-outline" color={color} size={size} />
          ),
        }}
      />

      <Tabs.Screen
        name="stats"
        options={{
          title: translate("stats", language),
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="bar-chart-outline" color={color} size={size} />
          ),
        }}
      />

      <Tabs.Screen
        name="profile"
        options={{
          title: translate("profile", language),
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person-outline" color={color} size={size} />
          ),
        }}
      />
    </Tabs>
  );
}
