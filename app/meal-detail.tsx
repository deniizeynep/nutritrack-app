import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
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

export default function MealDetailScreen() {
  const params = useLocalSearchParams<{ mealId?: string }>();

  const themeMode = useAppStore((state) => state.themeMode);
  const language = useAppStore((state) => state.language);
  const theme = getTheme(themeMode);
  const token = useAuthStore((state) => state.token);

  const meals = useMealStore((state) => state.meals);
  const isLoading = useMealStore((state) => state.isLoading);
  const updateMeal = useMealStore((state) => state.updateMeal);
  const deleteMeal = useMealStore((state) => state.deleteMeal);

  const meal = meals.find((item) => item.id === params.mealId);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<MealCategory>("breakfast");
  const [calories, setCalories] = useState("");
  const [protein, setProtein] = useState("");
  const [carbs, setCarbs] = useState("");
  const [fat, setFat] = useState("");

  useEffect(() => {
    if (!meal) {
      return;
    }

    setTitle(meal.title);
    setDescription(meal.description);
    setCategory(meal.category);
    setCalories(String(meal.calories));
    setProtein(String(meal.protein));
    setCarbs(String(meal.carbs));
    setFat(String(meal.fat));
  }, [meal]);

  const canSave = meal && title.trim() && Number(calories) > 0;

  const handleSave = async () => {
    if (!meal || !canSave) {
      return;
    }

    try {
      await updateMeal(
        meal.id,
        {
          title: title.trim(),
          description: description.trim(),
          category,
          calories: Number(calories),
          protein: Number(protein) || 0,
          carbs: Number(carbs) || 0,
          fat: Number(fat) || 0,
        },
        token,
      );

      router.back();
    } catch (error) {
      Alert.alert(
        translate("error", language),
        error instanceof Error ? error.message : translate("genericError", language),
      );
    }
  };

  const handleDelete = () => {
    if (!meal) {
      return;
    }

    Alert.alert(
      translate("confirmDeleteMeal", language),
      translate("confirmDeleteMealMessage", language),
      [
        {
          text: translate("cancel", language),
          style: "cancel",
        },
        {
          text: translate("deleteMeal", language),
          style: "destructive",
          onPress: async () => {
            try {
              await deleteMeal(meal.id, token);
              router.back();
            } catch (error) {
              Alert.alert(
                translate("error", language),
                error instanceof Error
                  ? error.message
                  : translate("genericError", language),
              );
            }
          },
        },
      ],
    );
  };

  if (!meal) {
    return (
      <Screen>
        <View
          style={[
            styles.emptyContainer,
            {
              backgroundColor: theme.colors.background,
            },
          ]}
        >
          <View
            style={[
              styles.emptyCard,
              {
                backgroundColor: theme.colors.card,
                borderColor: theme.colors.border,
              },
            ]}
          >
            <View
              style={[
                styles.logoBox,
                {
                  backgroundColor: theme.colors.primarySoft,
                },
              ]}
            >
              <Ionicons
                name="alert-circle-outline"
                size={32}
                color={theme.colors.primary}
              />
            </View>

            <Text style={[styles.title, { color: theme.colors.text }]}>
              {translate("mealNotFound", language)}
            </Text>

            <Text style={[styles.subtitle, { color: theme.colors.mutedText }]}>
              {translate("mealNotFoundSubtitle", language)}
            </Text>

            <Button onPress={() => router.back()}>
              {translate("back", language)}
            </Button>
          </View>
        </View>
      </Screen>
    );
  }

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
              {translate("editMeal", language)}
            </Text>

            <Pressable
              onPress={handleDelete}
              style={[
                styles.iconButton,
                {
                  backgroundColor: theme.colors.card,
                  borderColor: theme.colors.border,
                },
              ]}
            >
              <Ionicons
                name="trash-outline"
                size={20}
                color={theme.colors.danger}
              />
            </Pressable>
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
              {translate("editMeal", language)}
            </Text>

            <Text style={[styles.subtitle, { color: theme.colors.mutedText }]}>
              {translate("editMealSubtitle", language)}
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
              {translate("saveChanges", language)}
            </Button>

            <Button
              variant="secondary"
              onPress={handleDelete}
              style={styles.deleteButton}
              disabled={isLoading}
            >
              {translate("deleteMeal", language)}
            </Button>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
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
  emptyContainer: {
    flex: 1,
    padding: 20,
    justifyContent: "center",
  },
  emptyCard: {
    borderWidth: 1,
    borderRadius: 24,
    padding: 24,
    alignItems: "center",
    gap: 12,
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
    fontSize: 30,
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
  deleteButton: {
    marginTop: 2,
  },
});
