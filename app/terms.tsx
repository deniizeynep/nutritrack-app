import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Screen } from "../src/components/Screen";
import { translate, type TranslationKey } from "../src/i18n/translations";
import { useAppStore } from "../src/stores/appStore";
import { getTheme } from "../src/theme/theme";

interface TermSection {
  icon: keyof typeof Ionicons.glyphMap;
  titleKey: TranslationKey;
  descKey: TranslationKey;
  bodyKey: TranslationKey;
}

const SECTIONS: TermSection[] = [
  {
    icon: "document-text-outline",
    titleKey: "termsIntroductionTitle",
    descKey: "termsIntroductionShort",
    bodyKey: "termsIntroductionBody",
  },
  {
    icon: "people-outline",
    titleKey: "termsAcceptanceTitle",
    descKey: "termsAcceptanceShort",
    bodyKey: "termsAcceptanceBody",
  },
  {
    icon: "person-outline",
    titleKey: "termsUserResponsibilitiesTitle",
    descKey: "termsUserResponsibilitiesShort",
    bodyKey: "termsUserResponsibilitiesBody",
  },
  {
    icon: "shield-checkmark-outline",
    titleKey: "termsPrivacyTitle",
    descKey: "termsPrivacyShort",
    bodyKey: "termsPrivacyBody",
  },
  {
    icon: "server-outline",
    titleKey: "termsDataUsageTitle",
    descKey: "termsDataCollectionShort",
    bodyKey: "termsDataUsageBody",
  },
  {
    icon: "fitness-outline",
    titleKey: "termsHealthDisclaimerTitle",
    descKey: "termsHealthDisclaimerShort",
    bodyKey: "termsHealthDisclaimerBody",
  },
  {
    icon: "information-circle-outline",
    titleKey: "termsLiabilityTitle",
    descKey: "termsLiabilityShort",
    bodyKey: "termsLiabilityBody",
  },
];

export default function TermsScreen() {
  const themeMode = useAppStore((state) => state.themeMode);
  const language = useAppStore((state) => state.language);
  const theme = getTheme(themeMode);

  return (
    <Screen>
      <View style={styles.wrapper}>
        <View style={styles.topBar}>
          <Pressable
            onPress={() => router.back()}
            style={[
              styles.backButton,
              {
                backgroundColor: theme.colors.card,
                borderColor: theme.colors.border,
              },
            ]}
            accessibilityLabel={translate("back", language)}
            accessibilityRole="button"
            hitSlop={8}
          >
            <Ionicons
              name="chevron-back"
              size={22}
              color={theme.colors.text}
            />
          </Pressable>
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <Text
            style={[
              styles.pageTitle,
              {
                color: theme.colors.text,
                fontFamily: theme.typography.headlineLg.fontFamily,
              },
            ]}
            accessibilityRole="header"
          >
            {translate("termsOfUse", language)}
          </Text>
          <Text
            style={[
              styles.pageSubtitle,
              {
                color: theme.colors.mutedText,
                fontFamily: theme.typography.bodyMd.fontFamily,
              },
            ]}
          >
            {language === "tr"
              ? "NutriTrack uygulamasını kullanırken geçerli olan kurallar ve politikalar."
              : "Rules and policies that apply when using the NutriTrack app."}
          </Text>

          {SECTIONS.map((section, index) => (
            <View key={section.titleKey} style={styles.section}>
              <View style={styles.sectionHeader}>
                <View
                  style={[
                    styles.iconCircle,
                    { backgroundColor: theme.colors.primarySoft },
                  ]}
                >
                  <Ionicons
                    name={section.icon}
                    size={20}
                    color={theme.colors.primary}
                  />
                </View>
                <Text
                  style={[
                    styles.sectionTitle,
                    {
                      color: theme.colors.text,
                      fontFamily: theme.typography.headlineMd.fontFamily,
                    },
                  ]}
                  accessibilityRole="header"
                >
                  {translate(section.titleKey, language)}
                </Text>
              </View>

              <Text
                style={[
                  styles.sectionDesc,
                  {
                    color: theme.colors.mutedText,
                    fontFamily: theme.typography.bodyMd.fontFamily,
                  },
                ]}
              >
                {translate(section.descKey, language)}
              </Text>

              <Text
                style={[
                  styles.sectionBody,
                  {
                    color: theme.colors.text,
                    fontFamily: theme.typography.bodyMd.fontFamily,
                  },
                ]}
              >
                {translate(section.bodyKey, language)}
              </Text>

              {index < SECTIONS.length - 1 && (
                <View
                  style={[
                    styles.divider,
                    { backgroundColor: theme.colors.border },
                  ]}
                />
              )}
            </View>
          ))}
        </ScrollView>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    paddingHorizontal: 20,
  },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    paddingBottom: 8,
  },
  backButton: {
    width: 42,
    height: 42,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  scrollContent: {
    paddingBottom: 48,
  },
  pageTitle: {
    fontSize: 24,
    fontWeight: "700",
    lineHeight: 32,
    marginBottom: 8,
  },
  pageSubtitle: {
    fontSize: 13,
    lineHeight: 20,
    marginBottom: 32,
  },
  section: {
    marginBottom: 8,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 10,
  },
  iconCircle: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  sectionTitle: {
    flex: 1,
    fontSize: 17,
    fontWeight: "700",
    lineHeight: 24,
  },
  sectionDesc: {
    fontSize: 13,
    lineHeight: 19,
    marginBottom: 8,
  },
  sectionBody: {
    fontSize: 14,
    lineHeight: 22,
    fontWeight: "400",
  },
  divider: {
    height: 1,
    marginTop: 28,
    marginBottom: 8,
  },
});
