import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Screen } from "../src/components/Screen";
import { useAppStore } from "../src/stores/appStore";
import { getTheme } from "../src/theme/theme";

export default function ProductDetailScreen() {
  const themeMode = useAppStore((state) => state.themeMode);
  const language = useAppStore((state) => state.language);
  const theme = getTheme(themeMode);

  return (
    <Screen>
      <View
        style={[styles.container, { backgroundColor: theme.colors.background }]}
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
            {language === "tr" ? "Ürün Detayı" : "Product Detail"}
          </Text>

          <View style={styles.fakeSpace} />
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
          <View
            style={[
              styles.iconBox,
              {
                backgroundColor: theme.colors.primarySoft,
              },
            ]}
          >
            <Ionicons
              name="cube-outline"
              size={32}
              color={theme.colors.primary}
            />
          </View>

          <Text style={[styles.title, { color: theme.colors.text }]}>
            {language === "tr"
              ? "Ürün detayı yakında"
              : "Product detail coming soon"}
          </Text>

          <Text style={[styles.subtitle, { color: theme.colors.mutedText }]}>
            {language === "tr"
              ? "Barkodla bulunan ürünleri daha detaylı göstermek için bu ekranı birazdan geliştireceğiz."
              : "We will improve this screen soon to show barcode product details."}
          </Text>
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 4,
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
  card: {
    marginTop: 28,
    borderWidth: 1,
    borderRadius: 24,
    padding: 24,
    alignItems: "center",
  },
  iconBox: {
    width: 68,
    height: 68,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 18,
  },
  title: {
    fontSize: 22,
    fontWeight: "900",
    textAlign: "center",
  },
  subtitle: {
    marginTop: 8,
    fontSize: 13,
    lineHeight: 20,
    fontWeight: "600",
    textAlign: "center",
  },
});
