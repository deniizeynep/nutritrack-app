import { Ionicons } from "@expo/vector-icons";
import {
  CameraView,
  useCameraPermissions,
  type BarcodeScanningResult,
} from "expo-camera";
import { router, type Href } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Button } from "../src/components/Button";
import { Screen } from "../src/components/Screen";
import { translate } from "../src/i18n/translations";
import {
  getProductByBarcode,
  type OpenFoodProduct,
} from "../src/services/openFoodFacts";
import { useAppStore } from "../src/stores/appStore";
import { useAuthStore } from "../src/stores/authStore";
import { useMealStore } from "../src/stores/mealStore";
import { getTheme } from "../src/theme/theme";

export default function ScanBarcodeScreen() {
  const themeMode = useAppStore((state) => state.themeMode);
  const language = useAppStore((state) => state.language);
  const theme = getTheme(themeMode);
  const token = useAuthStore((state) => state.token);

  const addMeal = useMealStore((state) => state.addMeal);

  const [permission, requestPermission] = useCameraPermissions();

  const [isScanning, setIsScanning] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [barcode, setBarcode] = useState("");
  const [product, setProduct] = useState<OpenFoodProduct | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [unsupportedBarcode, setUnsupportedBarcode] = useState(false);

  const handleBarcodeScanned = async (result: BarcodeScanningResult) => {
    if (!isScanning || isLoading) {
      return;
    }

    const scannedBarcode = result.data;

    const isUnsupportedBarcode =
      scannedBarcode.startsWith("978") ||
      scannedBarcode.startsWith("979") ||
      scannedBarcode.startsWith("977");

    if (isUnsupportedBarcode) {
      setIsScanning(false);
      setIsLoading(false);
      setBarcode(scannedBarcode);
      setProduct(null);
      setNotFound(false);
      setUnsupportedBarcode(true);
      return;
    }

    setIsScanning(false);
    setIsLoading(true);
    setBarcode(scannedBarcode);
    setProduct(null);
    setNotFound(false);
    setUnsupportedBarcode(false);

    try {
      const foundProduct = await getProductByBarcode(scannedBarcode);

      if (!foundProduct) {
        setNotFound(true);
        return;
      }

      setProduct(foundProduct);
    } catch {
      setNotFound(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleScanAgain = () => {
    setIsScanning(true);
    setIsLoading(false);
    setBarcode("");
    setProduct(null);
    setNotFound(false);
    setUnsupportedBarcode(false);
  };

  const handleAddAsMeal = async () => {
    if (!product) {
      return;
    }

    try {
      await addMeal(
        {
          title: product.name,
          description: product.brand
            ? `${product.brand} · ${translate("per100g", language)}`
            : translate("per100g", language),
          category: "snack",
          calories: product.calories,
          protein: product.protein,
          carbs: product.carbs,
          fat: product.fat,
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

  if (!permission) {
    return (
      <Screen>
        <View
          style={[
            styles.centerContainer,
            {
              backgroundColor: theme.colors.background,
            },
          ]}
        >
          <ActivityIndicator color={theme.colors.primary} />
        </View>
      </Screen>
    );
  }

  if (!permission.granted) {
    return (
      <Screen>
        <View
          style={[
            styles.centerContainer,
            {
              backgroundColor: theme.colors.background,
            },
          ]}
        >
          <View
            style={[
              styles.permissionCard,
              {
                backgroundColor: theme.colors.card,
                borderColor: theme.colors.border,
              },
            ]}
          >
            <View
              style={[
                styles.permissionIcon,
                {
                  backgroundColor: theme.colors.primarySoft,
                },
              ]}
            >
              <Ionicons
                name="camera-outline"
                size={34}
                color={theme.colors.primary}
              />
            </View>

            <Text
              style={[styles.permissionTitle, { color: theme.colors.text }]}
            >
              {translate("cameraPermissionTitle", language)}
            </Text>

            <Text
              style={[
                styles.permissionSubtitle,
                { color: theme.colors.mutedText },
              ]}
            >
              {translate("cameraPermissionSubtitle", language)}
            </Text>

            <Button onPress={requestPermission}>
              {translate("allowCamera", language)}
            </Button>
          </View>
        </View>
      </Screen>
    );
  }

  return (
    <Screen>
      <View
        style={[
          styles.container,
          {
            backgroundColor: theme.colors.background,
          },
        ]}
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
            {translate("barcodeScanner", language)}
          </Text>

          <Pressable
            onPress={handleScanAgain}
            style={[
              styles.iconButton,
              {
                backgroundColor: theme.colors.card,
                borderColor: theme.colors.border,
              },
            ]}
          >
            <Ionicons
              name="refresh-outline"
              size={20}
              color={theme.colors.text}
            />
          </Pressable>
        </View>

        <View style={styles.headerArea}>
          <Text style={[styles.title, { color: theme.colors.text }]}>
            {translate("scanBarcode", language)}
          </Text>

          <Text style={[styles.subtitle, { color: theme.colors.mutedText }]}>
            {translate("barcodeSubtitle", language)}
          </Text>
        </View>

        <View
          style={[
            styles.cameraCard,
            {
              backgroundColor: theme.colors.card,
              borderColor: theme.colors.border,
            },
          ]}
        >
          <CameraView
            style={styles.camera}
            facing="back"
            onBarcodeScanned={isScanning ? handleBarcodeScanned : undefined}
            barcodeScannerSettings={{
              barcodeTypes: ["ean13", "ean8", "upc_a", "upc_e"],
            }}
          />

          <View style={styles.overlay}>
            <View style={styles.scanFrame}>
              <View style={[styles.corner, styles.cornerTopLeft]} />
              <View style={[styles.corner, styles.cornerTopRight]} />
              <View style={[styles.corner, styles.cornerBottomLeft]} />
              <View style={[styles.corner, styles.cornerBottomRight]} />
            </View>

            <View style={styles.scanHint}>
              {isLoading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Ionicons name="barcode-outline" size={20} color="#FFFFFF" />
              )}

              <Text style={styles.scanHintText}>
                {isLoading
                  ? translate("scanning", language)
                  : translate("pointBarcode", language)}
              </Text>
            </View>
          </View>
        </View>

        {product ? (
          <View
            style={[
              styles.productCard,
              {
                backgroundColor: theme.colors.card,
                borderColor: theme.colors.border,
              },
            ]}
          >
            <View style={styles.productHeader}>
              <View
                style={[
                  styles.productIconBox,
                  {
                    backgroundColor: theme.colors.primarySoft,
                  },
                ]}
              >
                <Ionicons
                  name="checkmark-circle-outline"
                  size={26}
                  color={theme.colors.primary}
                />
              </View>

              <View style={styles.productTitleArea}>
                <Text
                  style={[styles.productLabel, { color: theme.colors.primary }]}
                >
                  {translate("productFound", language)}
                </Text>

                <Text
                  style={[styles.productName, { color: theme.colors.text }]}
                >
                  {product.name}
                </Text>

                {product.brand ? (
                  <Text
                    style={[
                      styles.productBrand,
                      { color: theme.colors.mutedText },
                    ]}
                  >
                    {product.brand}
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
                value={`${product.calories}`}
                unit="kcal"
              />

              <NutritionBox
                label={translate("protein", language)}
                value={`${product.protein}`}
                unit="g"
              />

              <NutritionBox
                label={translate("carbs", language)}
                value={`${product.carbs}`}
                unit="g"
              />

              <NutritionBox
                label={translate("fat", language)}
                value={`${product.fat}`}
                unit="g"
              />
            </View>

            <Text style={[styles.perText, { color: theme.colors.mutedText }]}>
              {translate("per100g", language)}
            </Text>

            <Button onPress={handleAddAsMeal} style={styles.addButton}>
              {translate("addAsMeal", language)}
            </Button>
          </View>
        ) : null}

        {unsupportedBarcode ? (
          <View
            style={[
              styles.productCard,
              {
                backgroundColor: theme.colors.card,
                borderColor: theme.colors.border,
              },
            ]}
          >
            <View style={styles.productHeader}>
              <View
                style={[
                  styles.productIconBox,
                  {
                    backgroundColor: theme.colors.cardSoft,
                  },
                ]}
              >
                <Ionicons
                  name="warning-outline"
                  size={26}
                  color={theme.colors.warning}
                />
              </View>

              <View style={styles.productTitleArea}>
                <Text
                  style={[styles.productName, { color: theme.colors.text }]}
                >
                  {translate("unsupportedBarcode", language)}
                </Text>

                <Text
                  style={[
                    styles.productBrand,
                    { color: theme.colors.mutedText },
                  ]}
                >
                  {translate("unsupportedBarcodeSubtitle", language)}
                </Text>
              </View>
            </View>

            {barcode ? (
              <Text
                style={[styles.barcodeText, { color: theme.colors.mutedText }]}
              >
                {translate("barcodeNumber", language)}: {barcode}
              </Text>
            ) : null}

            <Button
              variant="secondary"
              onPress={handleScanAgain}
              style={styles.addButton}
            >
              {translate("scanAgain", language)}
            </Button>
          </View>
        ) : null}

        {notFound ? (
          <View
            style={[
              styles.productCard,
              {
                backgroundColor: theme.colors.card,
                borderColor: theme.colors.border,
              },
            ]}
          >
            <View style={styles.productHeader}>
              <View
                style={[
                  styles.productIconBox,
                  {
                    backgroundColor: theme.colors.cardSoft,
                  },
                ]}
              >
                <Ionicons
                  name="alert-circle-outline"
                  size={26}
                  color={theme.colors.danger}
                />
              </View>

              <View style={styles.productTitleArea}>
                <Text
                  style={[styles.productName, { color: theme.colors.text }]}
                >
                  {translate("productNotFound", language)}
                </Text>

                <Text
                  style={[
                    styles.productBrand,
                    { color: theme.colors.mutedText },
                  ]}
                >
                  {translate("productNotFoundSubtitle", language)}
                </Text>
              </View>
            </View>

            {barcode ? (
              <Text
                style={[styles.barcodeText, { color: theme.colors.mutedText }]}
              >
                {translate("barcodeNumber", language)}: {barcode}
              </Text>
            ) : null}

            <Button
              variant="secondary"
              onPress={() => router.push("/add-meal" as Href)}
              style={styles.addButton}
            >
              {translate("addMeal", language)}
            </Button>
          </View>
        ) : null}
      </View>
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
    paddingHorizontal: 20,
    paddingTop: 4,
    paddingBottom: 24,
  },
  centerContainer: {
    flex: 1,
    padding: 20,
    alignItems: "center",
    justifyContent: "center",
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
    marginTop: 18,
    marginBottom: 18,
    alignItems: "center",
  },
  title: {
    fontSize: 30,
    fontWeight: "900",
    letterSpacing: -0.8,
    textAlign: "center",
  },
  subtitle: {
    marginTop: 8,
    fontSize: 13,
    lineHeight: 20,
    fontWeight: "600",
    textAlign: "center",
    maxWidth: 315,
  },
  cameraCard: {
    height: 280,
    borderWidth: 1,
    borderRadius: 28,
    overflow: "hidden",
  },
  camera: {
    flex: 1,
  },
  overlay: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.18)",
  },
  scanFrame: {
    width: 230,
    height: 130,
    position: "relative",
  },
  corner: {
    position: "absolute",
    width: 34,
    height: 34,
    borderColor: "#FFFFFF",
  },
  cornerTopLeft: {
    left: 0,
    top: 0,
    borderTopWidth: 4,
    borderLeftWidth: 4,
    borderTopLeftRadius: 14,
  },
  cornerTopRight: {
    right: 0,
    top: 0,
    borderTopWidth: 4,
    borderRightWidth: 4,
    borderTopRightRadius: 14,
  },
  cornerBottomLeft: {
    left: 0,
    bottom: 0,
    borderBottomWidth: 4,
    borderLeftWidth: 4,
    borderBottomLeftRadius: 14,
  },
  cornerBottomRight: {
    right: 0,
    bottom: 0,
    borderBottomWidth: 4,
    borderRightWidth: 4,
    borderBottomRightRadius: 14,
  },
  scanHint: {
    position: "absolute",
    bottom: 18,
    minHeight: 42,
    borderRadius: 999,
    paddingHorizontal: 15,
    backgroundColor: "rgba(0,0,0,0.45)",
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  scanHintText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "800",
  },
  productCard: {
    marginTop: 16,
    borderWidth: 1,
    borderRadius: 24,
    padding: 18,
  },
  productHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  productIconBox: {
    width: 48,
    height: 48,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
  },
  productTitleArea: {
    flex: 1,
  },
  productLabel: {
    fontSize: 12,
    fontWeight: "900",
    marginBottom: 4,
  },
  productName: {
    fontSize: 18,
    fontWeight: "900",
  },
  productBrand: {
    marginTop: 4,
    fontSize: 12,
    lineHeight: 18,
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
  perText: {
    marginTop: 10,
    fontSize: 11,
    fontWeight: "700",
    textAlign: "center",
  },
  addButton: {
    marginTop: 16,
  },
  barcodeText: {
    marginTop: 14,
    fontSize: 12,
    fontWeight: "700",
  },
  permissionCard: {
    width: "100%",
    borderWidth: 1,
    borderRadius: 26,
    padding: 22,
    alignItems: "center",
  },
  permissionIcon: {
    width: 68,
    height: 68,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 18,
  },
  permissionTitle: {
    fontSize: 22,
    fontWeight: "900",
    textAlign: "center",
  },
  permissionSubtitle: {
    marginTop: 8,
    marginBottom: 20,
    fontSize: 13,
    lineHeight: 20,
    fontWeight: "600",
    textAlign: "center",
  },
});
