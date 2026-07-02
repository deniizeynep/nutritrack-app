import { Ionicons } from "@expo/vector-icons";
import { router, type Href } from "expo-router";
import { useMemo, useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Button } from "../src/components/Button";
import { Input } from "../src/components/Input";
import { Screen } from "../src/components/Screen";
import { translate } from "../src/i18n/translations";
import { useAppStore } from "../src/stores/appStore";
import { useAuthStore } from "../src/stores/authStore";
import { useMealStore, type MealCategory } from "../src/stores/mealStore";
import { getTheme } from "../src/theme/theme";

export default function AddMealScreen() {
  const themeMode = useAppStore((state) => state.themeMode);
  const language = useAppStore((state) => state.language);
  const theme = getTheme(themeMode);
  const token = useAuthStore((state) => state.token);

  const addMeal = useMealStore((state) => state.addMeal);
  const isLoading = useMealStore((state) => state.isLoading);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<MealCategory>("breakfast");
  const [calories, setCalories] = useState("");
  const [protein, setProtein] = useState("");
  const [carbs, setCarbs] = useState("");
  const [fat, setFat] = useState("");
  const [selectedDateOffset, setSelectedDateOffset] = useState(0);

  const canSave = title.trim() && Number(calories) > 0;

  const selectedLoggedAt = useMemo(() => {
    const date = new Date();
    date.setDate(date.getDate() - selectedDateOffset);
    return date.toISOString();
  }, [selectedDateOffset]);

  const handleSave = async () => {
    if (!canSave) {
      return;
    }

    try {
      await addMeal(
        {
          title: title.trim(),
          description: description.trim(),
          category,
          calories: Number(calories),
          protein: Number(protein) || 0,
          carbs: Number(carbs) || 0,
          fat: Number(fat) || 0,
          loggedAt: selectedLoggedAt,
        },
        token,
      );

      router.replace("/(tabs)/home" as Href);
    } catch (error) {
      Alert.alert(
        translate("error", language),
        error instanceof Error ? error.message : translate("genericError", language),
      );
    }
  };

  return (
    <Screen>
      <KeyboardAvoidingView
        style={[
          styles.keyboardView,
          {
            backgroundColor: theme.colors.background,
          },
        ]}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.topBar}>
            <Pressable
              onPress={() => router.back()}
              style={[
                styles.iconButton,
                {
                  backgroundColor: theme.colors.card,
                  borderColor: theme.colors.border,
                },
              ]}
            >
              <Ionicons
                name="chevron-back"
                size={22}
                color={theme.colors.text}
              />
            </Pressable>

            <Text style={[styles.topTitle, { color: theme.colors.text }]}>
              {translate("addMeal", language)}
            </Text>

            <View style={styles.fakeSpace} />
          </View>

          <View style={styles.headerArea}>
            <View
              style={[
                styles.logoBox,
                {
                  backgroundColor: theme.colors.primarySoft,
                },
              ]}
            >
              <Ionicons
                name="restaurant-outline"
                size={30}
                color={theme.colors.primary}
              />
            </View>

            <Text style={[styles.title, { color: theme.colors.text }]}>
              {translate("addMeal", language)}
            </Text>

            <Text style={[styles.subtitle, { color: theme.colors.mutedText }]}>
              {translate("addMealSubtitle", language)}
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
            <Input
              label={translate("mealName", language)}
              icon="fast-food-outline"
              placeholder={translate("mealNamePlaceholder", language)}
              value={title}
              onChangeText={setTitle}
            />

            <Input
              label={translate("description", language)}
              icon="document-text-outline"
              placeholder={translate("descriptionPlaceholder", language)}
              value={description}
              onChangeText={setDescription}
            />

            <Text style={[styles.groupTitle, { color: theme.colors.text }]}>
              {translate("mealDate", language)}
            </Text>

            <View style={styles.chipWrap}>
              <DateChip
                label={translate("todayLabel", language)}
                selected={selectedDateOffset === 0}
                onPress={() => setSelectedDateOffset(0)}
              />

              <DateChip
                label={translate("yesterday", language)}
                selected={selectedDateOffset === 1}
                onPress={() => setSelectedDateOffset(1)}
              />

              <DateChip
                label={translate("twoDaysAgo", language)}
                selected={selectedDateOffset === 2}
                onPress={() => setSelectedDateOffset(2)}
              />
            </View>

            <Text style={[styles.groupTitle, { color: theme.colors.text }]}>
              {translate("mealCategory", language)}
            </Text>

            <View style={styles.chipWrap}>
              <CategoryChip
                label={translate("breakfast", language)}
                icon="sunny-outline"
                selected={category === "breakfast"}
                onPress={() => setCategory("breakfast")}
              />

              <CategoryChip
                label={translate("lunch", language)}
                icon="partly-sunny-outline"
                selected={category === "lunch"}
                onPress={() => setCategory("lunch")}
              />

              <CategoryChip
                label={translate("dinner", language)}
                icon="moon-outline"
                selected={category === "dinner"}
                onPress={() => setCategory("dinner")}
              />

              <CategoryChip
                label={translate("snack", language)}
                icon="cafe-outline"
                selected={category === "snack"}
                onPress={() => setCategory("snack")}
              />
            </View>

            <Input
              label={`${translate("calories", language)} (kcal)`}
              icon="flame-outline"
              placeholder="450"
              value={calories}
              onChangeText={setCalories}
              keyboardType="number-pad"
            />

            <View style={styles.macroRow}>
              <View style={styles.macroInput}>
                <Input
                  label={translate("protein", language)}
                  placeholder="30"
                  value={protein}
                  onChangeText={setProtein}
                  keyboardType="number-pad"
                />
              </View>

              <View style={styles.macroInput}>
                <Input
                  label={translate("carbs", language)}
                  placeholder="45"
                  value={carbs}
                  onChangeText={setCarbs}
                  keyboardType="number-pad"
                />
              </View>

              <View style={styles.macroInput}>
                <Input
                  label={translate("fat", language)}
                  placeholder="12"
                  value={fat}
                  onChangeText={setFat}
                  keyboardType="number-pad"
                />
              </View>
            </View>

            <Button
              onPress={handleSave}
              style={styles.saveButton}
              disabled={!canSave || isLoading}
            >
              {translate("saveMeal", language)}
            </Button>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}

type DateChipProps = {
  label: string;
  selected: boolean;
  onPress: () => void;
};

function DateChip({ label, selected, onPress }: DateChipProps) {
  const themeMode = useAppStore((state) => state.themeMode);
  const theme = getTheme(themeMode);

  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.dateChip,
        {
          backgroundColor: selected
            ? theme.colors.primary
            : theme.colors.cardSoft,
          borderColor: selected ? theme.colors.primary : theme.colors.border,
        },
      ]}
    >
      <Text
        style={[
          styles.chipText,
          {
            color: selected ? "#FFFFFF" : theme.colors.text,
          },
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

type CategoryChipProps = {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  selected: boolean;
  onPress: () => void;
};

function CategoryChip({ label, icon, selected, onPress }: CategoryChipProps) {
  const themeMode = useAppStore((state) => state.themeMode);
  const theme = getTheme(themeMode);

  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.chip,
        {
          backgroundColor: selected
            ? theme.colors.primary
            : theme.colors.cardSoft,
          borderColor: selected ? theme.colors.primary : theme.colors.border,
        },
      ]}
    >
      <Ionicons
        name={icon}
        size={16}
        color={selected ? "#FFFFFF" : theme.colors.primary}
      />

      <Text
        style={[
          styles.chipText,
          {
            color: selected ? "#FFFFFF" : theme.colors.text,
          },
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  keyboardView: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 4,
    paddingBottom: 34,
  },
  topBar: {
    height: 46,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 15,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  topTitle: {
    fontSize: 16,
    fontWeight: "900",
  },
  fakeSpace: {
    width: 40,
  },
  headerArea: {
    marginTop: 20,
    marginBottom: 24,
    alignItems: "center",
  },
  logoBox: {
    width: 64,
    height: 64,
    borderRadius: 23,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 18,
  },
  title: {
    fontSize: 32,
    fontWeight: "900",
    letterSpacing: -0.8,
    textAlign: "center",
  },
  subtitle: {
    marginTop: 10,
    fontSize: 13,
    lineHeight: 20,
    fontWeight: "600",
    textAlign: "center",
    maxWidth: 315,
  },
  card: {
    borderWidth: 1,
    borderRadius: 24,
    padding: 18,
    gap: 15,
  },
  groupTitle: {
    fontSize: 14,
    fontWeight: "900",
  },
  chipWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  chip: {
    minHeight: 40,
    paddingHorizontal: 13,
    borderRadius: 999,
    borderWidth: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
  },
  chipText: {
    fontSize: 13,
    fontWeight: "900",
  },
  macroRow: {
    flexDirection: "row",
    gap: 10,
  },
  macroInput: {
    flex: 1,
  },
  saveButton: {
    marginTop: 4,
  },
  dateChip: {
    minHeight: 40,
    paddingHorizontal: 14,
    borderRadius: 999,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});
