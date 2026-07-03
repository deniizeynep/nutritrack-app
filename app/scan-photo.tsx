import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { router, type Href } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Button } from "../src/components/Button";
import { Screen } from "../src/components/Screen";
import { translate } from "../src/i18n/translations";
import { aiApi, type FoodPhotoEstimate } from "../src/services/aiApi";
import { useAppStore } from "../src/stores/appStore";
import { useAuthStore } from "../src/stores/authStore";
import { useMealStore } from "../src/stores/mealStore";
import { getTheme } from "../src/theme/theme";

type PhotoEstimate = FoodPhotoEstimate;

export default function ScanPhotoScreen() {
  const themeMode = useAppStore((state) => state.themeMode);
  const language = useAppStore((state) => state.language);
  const theme = getTheme(themeMode);
  const token = useAuthStore((state) => state.token);

  const addMeal = useMealStore((state) => state.addMeal);

  const [imageUri, setImageUri] = useState<string | null>(null);
  const [estimate, setEstimate] = useState<PhotoEstimate | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [permissionError, setPermissionError] = useState(false);

  const pickImage = async () => {
    setPermissionError(false);

    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      setPermissionError(true);
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.85,
    });

    if (!result.canceled) {
      setImageUri(result.assets[0]?.uri ?? null);
      setEstimate(null);
    }
  };

  const takePhoto = async () => {
    setPermissionError(false);

    const permission = await ImagePicker.requestCameraPermissionsAsync();

    if (!permission.granted) {
      setPermissionError(true);
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.85,
    });

    if (!result.canceled) {
      setImageUri(result.assets[0]?.uri ?? null);
      setEstimate(null);
    }
  };

  const analyzePhoto = async () => {
    if (!imageUri || isAnalyzing) {
      return;
    }

    if (!token) {
      Alert.alert(
        translate("loginRequired", language),
        translate("loginRequiredForAi", language),
      );
      return;
    }

    setIsAnalyzing(true);
    setEstimate(null);

    try {
      const result = await aiApi.analyzeFoodPhoto(imageUri, token);
      setEstimate(result);
    } catch (error) {
      Alert.alert(
        translate("error", language),
        error instanceof Error
          ? error.message
          : translate("aiEstimateFailed", language),
      );
    } finally {
      setIsAnalyzing(false);
    }
  };

  const addEstimateAsMeal = async () => {
    if (!estimate) {
      return;
    }

    try {
      await addMeal(
        {
          title: estimate.foodName[language],
          description:
            language === "tr"
              ? "Fotoğraftan tahmini olarak eklendi"
              : "Added from photo estimate",
          category: "lunch",
          calories: estimate.calories,
          protein: estimate.protein,
          carbs: estimate.carbs,
          fat: estimate.fat,
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
      <ScrollView
        style={[
          styles.container,
          {
            backgroundColor: theme.colors.background,
          },
        ]}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
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
            <Ionicons name="chevron-back" size={22} color={theme.colors.text} />
          </Pressable>

          <Text style={[styles.topTitle, { color: theme.colors.text }]}>
            {translate("photoScanner", language)}
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
              name="camera-outline"
              size={30}
              color={theme.colors.primary}
            />
          </View>

          <Text style={[styles.title, { color: theme.colors.text }]}>
            {translate("scanWithPhoto", language)}
          </Text>

          <Text style={[styles.subtitle, { color: theme.colors.mutedText }]}>
            {translate("photoScanSubtitle", language)}
          </Text>
        </View>

        <View
          style={[
            styles.photoCard,
            {
              backgroundColor: theme.colors.card,
              borderColor: theme.colors.border,
            },
          ]}
        >
          {imageUri ? (
            <Image source={{ uri: imageUri }} style={styles.selectedImage} />
          ) : (
            <View
              style={[
                styles.emptyPhoto,
                {
                  backgroundColor: theme.colors.cardSoft,
                },
              ]}
            >
              <Ionicons
                name="image-outline"
                size={42}
                color={theme.colors.mutedText}
              />

              <Text
                style={[
                  styles.emptyPhotoText,
                  { color: theme.colors.mutedText },
                ]}
              >
                {translate("noPhotoSelected", language)}
              </Text>
            </View>
          )}
        </View>

        {permissionError ? (
          <View
            style={[
              styles.warningCard,
              {
                backgroundColor: theme.colors.card,
                borderColor: theme.colors.border,
              },
            ]}
          >
            <Ionicons
              name="alert-circle-outline"
              size={22}
              color={theme.colors.warning}
            />

            <View style={styles.warningTextArea}>
              <Text style={[styles.warningTitle, { color: theme.colors.text }]}>
                {translate("photoPermissionTitle", language)}
              </Text>

              <Text
                style={[styles.warningText, { color: theme.colors.mutedText }]}
              >
                {translate("photoPermissionSubtitle", language)}
              </Text>
            </View>
          </View>
        ) : null}

        <View style={styles.actionRow}>
          <Pressable
            onPress={takePhoto}
            style={[
              styles.actionButton,
              {
                backgroundColor: theme.colors.card,
                borderColor: theme.colors.border,
              },
            ]}
          >
            <Ionicons
              name="camera-outline"
              size={22}
              color={theme.colors.primary}
            />

            <Text style={[styles.actionText, { color: theme.colors.text }]}>
              {translate("takePhoto", language)}
            </Text>
          </Pressable>

          <Pressable
            onPress={pickImage}
            style={[
              styles.actionButton,
              {
                backgroundColor: theme.colors.card,
                borderColor: theme.colors.border,
              },
            ]}
          >
            <Ionicons
              name="images-outline"
              size={22}
              color={theme.colors.primary}
            />

            <Text style={[styles.actionText, { color: theme.colors.text }]}>
              {translate("chooseFromGallery", language)}
            </Text>
          </Pressable>
        </View>

        <Button
          onPress={analyzePhoto}
          style={styles.analyzeButton}
          disabled={!imageUri || isAnalyzing}
        >
          {isAnalyzing
            ? translate("analyzingPhoto", language)
            : translate("analyzePhoto", language)}
        </Button>

        {isAnalyzing ? (
          <View
            style={[
              styles.loadingCard,
              {
                backgroundColor: theme.colors.card,
                borderColor: theme.colors.border,
              },
            ]}
          >
            <ActivityIndicator color={theme.colors.primary} />

            <Text
              style={[styles.loadingText, { color: theme.colors.mutedText }]}
            >
              {translate("analyzingPhoto", language)}
            </Text>
          </View>
        ) : null}

        {estimate ? (
          <View
            style={[
              styles.resultCard,
              {
                backgroundColor: theme.colors.card,
                borderColor: theme.colors.border,
              },
            ]}
          >
            <View style={styles.resultHeader}>
              <View
                style={[
                  styles.resultIconBox,
                  {
                    backgroundColor: theme.colors.primarySoft,
                  },
                ]}
              >
                <Ionicons
                  name="sparkles-outline"
                  size={24}
                  color={theme.colors.primary}
                />
              </View>

              <View style={styles.resultTitleArea}>
                <Text
                  style={[styles.resultLabel, { color: theme.colors.primary }]}
                >
                  {translate("estimatedResult", language)}
                </Text>

                <Text style={[styles.foodName, { color: theme.colors.text }]}>
                  {estimate.foodName[language]}
                </Text>

                <Text
                  style={[styles.confidence, { color: theme.colors.mutedText }]}
                >
                  {translate("confidence", language)}: {estimate.confidence}%
                </Text>

                {estimate.source === "mock" ? (
                  <Text
                    style={[
                      styles.sourceLabel,
                      { color: theme.colors.mutedText },
                    ]}
                  >
                    {translate("demoAiEstimate", language)}
                  </Text>
                ) : null}
              </View>
            </View>

            <View
              style={[styles.divider, { backgroundColor: theme.colors.border }]}
            />

            <View style={styles.nutritionRow}>
              <NutritionBox
                label={translate("calories", language)}
                value={`${estimate.calories}`}
                unit="kcal"
              />

              <NutritionBox
                label={translate("protein", language)}
                value={`${estimate.protein}`}
                unit="g"
              />

              <NutritionBox
                label={language === "tr" ? "Karb." : "Carbs"}
                value={`${estimate.carbs}`}
                unit="g"
              />

              <NutritionBox
                label={translate("fat", language)}
                value={`${estimate.fat}`}
                unit="g"
              />
            </View>

            <View
              style={[
                styles.noteBox,
                {
                  backgroundColor: theme.colors.cardSoft,
                },
              ]}
            >
              <Text
                style={[styles.noteText, { color: theme.colors.mutedText }]}
              >
                {translate("photoEstimateNote", language)}
              </Text>
            </View>

            <Button onPress={addEstimateAsMeal} style={styles.addButton}>
              {translate("addAsMeal", language)}
            </Button>
          </View>
        ) : null}
      </ScrollView>
    </Screen>
  );
}

type NutritionBoxProps = {
  label: string;
  value: string;
  unit: string;
};

function NutritionBox({ label, value, unit }: NutritionBoxProps) {
  const themeMode = useAppStore((state) => state.themeMode);
  const theme = getTheme(themeMode);

  return (
    <View
      style={[
        styles.nutritionBox,
        {
          backgroundColor: theme.colors.cardSoft,
        },
      ]}
    >
      <Text style={[styles.nutritionValue, { color: theme.colors.text }]}>
        {value}
      </Text>

      <Text style={[styles.nutritionUnit, { color: theme.colors.mutedText }]}>
        {unit}
      </Text>

      <Text
        numberOfLines={1}
        style={[styles.nutritionLabel, { color: theme.colors.mutedText }]}
      >
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
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
    marginTop: 18,
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
  photoCard: {
    height: 260,
    borderWidth: 1,
    borderRadius: 28,
    overflow: "hidden",
  },
  selectedImage: {
    width: "100%",
    height: "100%",
  },
  emptyPhoto: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  emptyPhotoText: {
    fontSize: 13,
    fontWeight: "800",
  },
  warningCard: {
    marginTop: 14,
    borderWidth: 1,
    borderRadius: 22,
    padding: 14,
    flexDirection: "row",
    gap: 12,
  },
  warningTextArea: {
    flex: 1,
  },
  warningTitle: {
    fontSize: 14,
    fontWeight: "900",
  },
  warningText: {
    marginTop: 4,
    fontSize: 12,
    lineHeight: 18,
    fontWeight: "600",
  },
  actionRow: {
    marginTop: 16,
    flexDirection: "row",
    gap: 12,
  },
  actionButton: {
    flex: 1,
    minHeight: 78,
    borderWidth: 1,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    padding: 10,
  },
  actionText: {
    fontSize: 12,
    fontWeight: "900",
    textAlign: "center",
  },
  analyzeButton: {
    marginTop: 16,
  },
  loadingCard: {
    marginTop: 16,
    borderWidth: 1,
    borderRadius: 22,
    padding: 18,
    alignItems: "center",
    gap: 10,
  },
  loadingText: {
    fontSize: 13,
    fontWeight: "800",
  },
  resultCard: {
    marginTop: 16,
    borderWidth: 1,
    borderRadius: 24,
    padding: 18,
  },
  resultHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  resultIconBox: {
    width: 48,
    height: 48,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
  },
  resultTitleArea: {
    flex: 1,
  },
  resultLabel: {
    fontSize: 12,
    fontWeight: "900",
    marginBottom: 4,
  },
  foodName: {
    fontSize: 19,
    fontWeight: "900",
  },
  confidence: {
    marginTop: 4,
    fontSize: 12,
    fontWeight: "700",
  },
  sourceLabel: {
    marginTop: 3,
    fontSize: 11,
    fontWeight: "700",
  },
  divider: {
    height: 1,
    marginVertical: 16,
  },
  nutritionRow: {
    flexDirection: "row",
    gap: 8,
  },
  nutritionBox: {
    flex: 1,
    borderRadius: 18,
    padding: 10,
    alignItems: "center",
  },
  nutritionValue: {
    fontSize: 17,
    fontWeight: "900",
  },
  nutritionUnit: {
    marginTop: 1,
    fontSize: 10,
    fontWeight: "800",
  },
  nutritionLabel: {
    marginTop: 5,
    fontSize: 10,
    fontWeight: "800",
  },
  noteBox: {
    marginTop: 16,
    borderRadius: 18,
    padding: 12,
  },
  noteText: {
    fontSize: 12,
    lineHeight: 18,
    fontWeight: "600",
  },
  addButton: {
    marginTop: 16,
  },
});
