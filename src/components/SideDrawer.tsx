import { Ionicons } from "@expo/vector-icons";
import { router, type Href } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { translate } from "../i18n/translations";
import { useAppStore } from "../stores/appStore";
import { useAuthStore } from "../stores/authStore";
import { useGoalStore } from "../stores/goalStore";
import { useMealStore } from "../stores/mealStore";
import { getTheme } from "../theme/theme";
import { calculateMacroTargets } from "../utils/calorieCalculator";

type SideDrawerProps = {
  visible: boolean;
  onClose: () => void;
};

type QuickAction = {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  route: Href;
};

const drawerWidth = Math.round(Dimensions.get("window").width * 0.78);

export function SideDrawer({ visible, onClose }: SideDrawerProps) {
  const themeMode = useAppStore((state) => state.themeMode);
  const language = useAppStore((state) => state.language);
  const user = useAuthStore((state) => state.user);
  const goal = useGoalStore((state) => state.goal);
  const meals = useMealStore((state) => state.meals);
  const theme = getTheme(themeMode);
  const [isMounted, setIsMounted] = useState(visible);
  const translateX = useRef(new Animated.Value(-drawerWidth)).current;

  useEffect(() => {
    if (visible) {
      setIsMounted(true);
    }
  }, [visible]);

  useEffect(() => {
    if (!isMounted) {
      return;
    }

    Animated.timing(translateX, {
      toValue: visible ? 0 : -drawerWidth,
      duration: 220,
      useNativeDriver: true,
    }).start(({ finished }) => {
      if (finished && !visible) {
        setIsMounted(false);
      }
    });
  }, [isMounted, translateX, visible]);

  const todayKey = new Date().toISOString().slice(0, 10);
  const todaysMeals = meals.filter((meal) => {
    const mealDate = meal.loggedAt ?? meal.createdAt;
    return mealDate.slice(0, 10) === todayKey;
  });
  const todayCalories = todaysMeals.reduce(
    (total, meal) => total + meal.calories,
    0,
  );
  const todayProtein = todaysMeals.reduce(
    (total, meal) => total + meal.protein,
    0,
  );
  const todayCarbs = todaysMeals.reduce((total, meal) => total + meal.carbs, 0);
  const todayFat = todaysMeals.reduce((total, meal) => total + meal.fat, 0);
  const targetCalories = goal?.targetCalories ?? 2000;
  const fallbackMacroTargets = calculateMacroTargets(
    goal?.targetCalories ?? 2000,
    goal?.goalType ?? "maintain",
  );
  const targetProtein = goal?.targetProtein || fallbackMacroTargets.protein;
  const targetCarbs = goal?.targetCarbs || fallbackMacroTargets.carbs;
  const targetFat = goal?.targetFat || fallbackMacroTargets.fat;
  const calorieProgress =
    targetCalories > 0 ? Math.min(todayCalories / targetCalories, 1) : 0;

  const quickActions: QuickAction[] = [
    {
      icon: "flag-outline",
      label: translate("myGoal", language),
      route: "/goal" as Href,
    },
    {
      icon: "calendar-outline",
      label: translate("diary", language),
      route: "/(tabs)/diary" as Href,
    },
    {
      icon: "bar-chart-outline",
      label: translate("stats", language),
      route: "/(tabs)/stats" as Href,
    },
    {
      icon: "person-outline",
      label: translate("profile", language),
      route: "/(tabs)/profile" as Href,
    },
    {
      icon: "settings-outline",
      label: translate("settings", language),
      route: "/settings" as Href,
    },
  ];

  const openRoute = (route: Href) => {
    onClose();
    router.push(route);
  };

  if (!isMounted) {
    return null;
  }

  return (
    <Modal visible={isMounted} transparent animationType="none" onRequestClose={onClose}>
      <View style={styles.modalRoot}>
        <Pressable style={styles.overlay} onPress={onClose} />

        <Animated.View
          style={[
            styles.drawer,
            {
              width: drawerWidth,
              backgroundColor: theme.colors.background,
              borderColor: theme.colors.border,
              transform: [{ translateX }],
            },
          ]}
        >
          <View style={styles.headerRow}>
            <View>
              <Text style={[styles.brand, { color: theme.colors.text }]}>NutriTrack</Text>
              <Text style={[styles.menuLabel, { color: theme.colors.mutedText }]}> 
                {translate("menu", language)}
              </Text>
            </View>

            <Pressable
              onPress={onClose}
              style={[
                styles.closeButton,
                {
                  backgroundColor: theme.colors.card,
                  borderColor: theme.colors.border,
                },
              ]}
            >
              <Ionicons name="close" size={20} color={theme.colors.text} />
            </Pressable>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            <View
              style={[
                styles.card,
                {
                  backgroundColor: theme.colors.card,
                  borderColor: theme.colors.border,
                },
              ]}
            >
              <Text style={[styles.cardTitle, { color: theme.colors.text }]}> 
                {translate("accountSummary", language)}
              </Text>
              <Text style={[styles.userName, { color: theme.colors.text }]}> 
                {user?.fullName || translate("guestUser", language)}
              </Text>
              <Text style={[styles.userEmail, { color: theme.colors.mutedText }]}> 
                {user?.email || "-"}
              </Text>
            </View>

            <View
              style={[
                styles.card,
                {
                  backgroundColor: theme.colors.card,
                  borderColor: theme.colors.border,
                },
              ]}
            >
              <Text style={[styles.cardTitle, { color: theme.colors.text }]}> 
                {translate("todaySummary", language)}
              </Text>
              <InfoLine
                label={translate("todayCalories", language)}
                value={`${todayCalories} / ${targetCalories} kcal`}
              />
              <InfoLine
                label={translate("protein", language)}
                value={`${todayProtein}g / ${targetProtein}g`}
              />
              <InfoLine
                label={translate("carbs", language)}
                value={`${todayCarbs}g / ${targetCarbs}g`}
              />
              <InfoLine
                label={translate("fat", language)}
                value={`${todayFat}g / ${targetFat}g`}
              />

              <View
                style={[
                  styles.progressTrack,
                  { backgroundColor: theme.colors.cardSoft },
                ]}
              >
                <View
                  style={[
                    styles.progressFill,
                    {
                      width: `${calorieProgress * 100}%`,
                      backgroundColor: theme.colors.primary,
                    },
                  ]}
                />
              </View>
            </View>

            <View
              style={[
                styles.card,
                {
                  backgroundColor: theme.colors.card,
                  borderColor: theme.colors.border,
                },
              ]}
            >
              <Text style={[styles.cardTitle, { color: theme.colors.text }]}> 
                {translate("goalSummary", language)}
              </Text>
              {goal ? (
                <View>
                  <InfoLine
                    label={translate("targetCalories", language)}
                    value={`${goal.targetCalories} kcal`}
                  />
                  <InfoLine
                    label={translate("targetProtein", language)}
                    value={`${targetProtein}g`}
                  />
                  <InfoLine
                    label={translate("targetCarbs", language)}
                    value={`${targetCarbs}g`}
                  />
                  <InfoLine
                    label={translate("targetFat", language)}
                    value={`${targetFat}g`}
                  />
                </View>
              ) : (
                <View style={styles.emptyGoalArea}>
                  <Text
                    style={[styles.emptyText, { color: theme.colors.mutedText }]}
                  >
                    {translate("noGoalYet", language)}
                  </Text>
                  <Pressable
                    onPress={() => openRoute("/goal" as Href)}
                    style={[
                      styles.setGoalButton,
                      { backgroundColor: theme.colors.primary },
                    ]}
                  >
                    <Text style={styles.setGoalText}>
                      {translate("setGoal", language)}
                    </Text>
                  </Pressable>
                </View>
              )}
            </View>

            <View style={styles.quickArea}>
              <Text style={[styles.quickTitle, { color: theme.colors.text }]}> 
                {translate("quickActions", language)}
              </Text>
              {quickActions.map((item) => (
                <Pressable
                  key={item.label}
                  onPress={() => openRoute(item.route)}
                  style={styles.quickItem}
                >
                  <View style={styles.quickLeft}>
                    <View
                      style={[
                        styles.quickIcon,
                        { backgroundColor: theme.colors.primarySoft },
                      ]}
                    >
                      <Ionicons
                        name={item.icon}
                        size={18}
                        color={theme.colors.primary}
                      />
                    </View>
                    <Text style={[styles.quickText, { color: theme.colors.text }]}> 
                      {item.label}
                    </Text>
                  </View>
                  <Ionicons
                    name="chevron-forward"
                    size={17}
                    color={theme.colors.mutedText}
                  />
                </Pressable>
              ))}
            </View>
          </ScrollView>
        </Animated.View>
      </View>
    </Modal>
  );
}

function InfoLine({ label, value }: { label: string; value: string }) {
  const themeMode = useAppStore((state) => state.themeMode);
  const theme = getTheme(themeMode);

  return (
    <View style={styles.infoLine}>
      <Text style={[styles.infoLabel, { color: theme.colors.mutedText }]}>{label}</Text>
      <Text style={[styles.infoValue, { color: theme.colors.text }]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  modalRoot: {
    flex: 1,
    flexDirection: "row",
  },
  overlay: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    backgroundColor: "rgba(0, 0, 0, 0.42)",
  },
  drawer: {
    height: "100%",
    maxHeight: "100%",
    borderRightWidth: 1,
    paddingHorizontal: 18,
    paddingTop: 48,
  },
  scrollContent: {
    paddingBottom: 48,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  brand: {
    fontSize: 26,
    fontWeight: "900",
    letterSpacing: -0.5,
  },
  menuLabel: {
    marginTop: 3,
    fontSize: 12,
    fontWeight: "800",
  },
  closeButton: {
    width: 38,
    height: 38,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  card: {
    borderWidth: 1,
    borderRadius: 22,
    padding: 14,
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 13,
    fontWeight: "900",
    marginBottom: 10,
  },
  userName: {
    fontSize: 18,
    fontWeight: "900",
  },
  userEmail: {
    marginTop: 4,
    fontSize: 12,
    fontWeight: "700",
  },
  infoLine: {
    minHeight: 25,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
  },
  infoLabel: {
    fontSize: 12,
    fontWeight: "700",
  },
  infoValue: {
    flexShrink: 1,
    fontSize: 12,
    fontWeight: "900",
    textAlign: "right",
  },
  progressTrack: {
    height: 8,
    borderRadius: 999,
    marginTop: 10,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 999,
  },
  emptyGoalArea: {
    gap: 10,
  },
  emptyText: {
    fontSize: 12,
    fontWeight: "700",
    lineHeight: 18,
  },
  setGoalButton: {
    height: 38,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  setGoalText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "900",
  },
  quickArea: {
    marginTop: 4,
  },
  quickTitle: {
    fontSize: 15,
    fontWeight: "900",
    marginBottom: 8,
  },
  quickItem: {
    minHeight: 48,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  quickLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 11,
  },
  quickIcon: {
    width: 34,
    height: 34,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
  },
  quickText: {
    fontSize: 13,
    fontWeight: "800",
  },
});
