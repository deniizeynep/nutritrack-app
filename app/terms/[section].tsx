import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Screen } from "../../src/components/Screen";
import { translate, type TranslationKey } from "../../src/i18n/translations";
import { useAppStore } from "../../src/stores/appStore";
import { getTheme } from "../../src/theme/theme";

type SectionId =
  | "introduction"
  | "acceptance"
  | "user-responsibilities"
  | "privacy"
  | "data-collection"
  | "health-disclaimer"
  | "liability"
  | "contact";

const SECTION_CONFIG: Record<
  SectionId,
  {
    icon: keyof typeof Ionicons.glyphMap;
    titleKey: TranslationKey;
    bodyKey: TranslationKey;
  }
> = {
  introduction: {
    icon: "document-text-outline",
    titleKey: "termsIntroductionTitle",
    bodyKey: "termsIntroductionBody",
  },
  acceptance: {
    icon: "people-outline",
    titleKey: "termsAcceptanceTitle",
    bodyKey: "termsAcceptanceBody",
  },
  "user-responsibilities": {
    icon: "person-outline",
    titleKey: "termsUserResponsibilitiesTitle",
    bodyKey: "termsUserResponsibilitiesBody",
  },
  privacy: {
    icon: "shield-checkmark-outline",
    titleKey: "termsPrivacyTitle",
    bodyKey: "termsPrivacyBody",
  },
  "data-collection": {
    icon: "server-outline",
    titleKey: "termsDataUsageTitle",
    bodyKey: "termsDataUsageBody",
  },
  "health-disclaimer": {
    icon: "fitness-outline",
    titleKey: "termsHealthDisclaimerTitle",
    bodyKey: "termsHealthDisclaimerBody",
  },
  liability: {
    icon: "information-circle-outline",
    titleKey: "termsLiabilityTitle",
    bodyKey: "termsLiabilityBody",
  },
  contact: {
    icon: "mail-outline",
    titleKey: "termsContactTitle",
    bodyKey: "termsContactBody",
  },
};

function isValidSection(id: unknown): id is SectionId {
  return typeof id === "string" && id in SECTION_CONFIG;
}

export default function TermsSectionDetailScreen() {
  const { section } = useLocalSearchParams<{ section: string }>();
  const themeMode = useAppStore((state) => state.themeMode);
  const language = useAppStore((state) => state.language);
  const theme = getTheme(themeMode);

  useEffect(() => {
    if (!isValidSection(section)) {
      router.replace("/terms");
    }
  }, [section]);

  if (!isValidSection(section)) {
    return null;
  }

  const config = SECTION_CONFIG[section];
  const title = translate(config.titleKey, language);
  const body = translate(config.bodyKey, language);
  const paragraphs = body.split("\n");

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
          <View style={styles.backButtonPlaceholder} />
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.titleRow}>
            <View
              style={[
                styles.titleIconCircle,
                { backgroundColor: theme.colors.primary },
              ]}
            >
              <Ionicons
                name={config.icon}
                size={24}
                color="#FFFFFF"
              />
            </View>
            <Text
              style={[
                styles.sectionTitle,
                {
                  color: theme.colors.text,
                  fontFamily: theme.typography.headlineLg.fontFamily,
                },
              ]}
              accessibilityRole="header"
            >
              {title}
            </Text>
          </View>

          <View
            style={[
              styles.bodyCard,
              {
                backgroundColor: theme.colors.card,
                borderColor: theme.colors.border,
                shadowColor: themeMode === "dark" ? "rgba(0,0,0,0.5)" : "#000",
              },
            ]}
          >
            {paragraphs.map((paragraph, index) => (
              <Text
                key={index}
                style={[
                  styles.paragraph,
                  index < paragraphs.length - 1 && styles.paragraphSpacing,
                  {
                    color: theme.colors.text,
                    fontFamily: theme.typography.bodyMd.fontFamily,
                  },
                ]}
              >
                {paragraph}
              </Text>
            ))}
          </View>

          {section === "health-disclaimer" && (
            <View
              style={[
                styles.warningBox,
                { backgroundColor: theme.colors.primarySoft },
              ]}
            >
              <Ionicons
                name="warning-outline"
                size={18}
                color={theme.colors.primary}
              />
              <Text
                style={[
                  styles.warningText,
                  { color: theme.colors.primary },
                ]}
              >
                {language === "tr"
                  ? "Bu bilgi tıbbi tavsiye niteliği taşımaz."
                  : "This information does not constitute medical advice."}
              </Text>
            </View>
          )}
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
    justifyContent: "space-between",
    paddingBottom: 16,
  },
  backButton: {
    width: 42,
    height: 42,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  backButtonPlaceholder: {
    width: 42,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    marginBottom: 20,
  },
  titleIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  sectionTitle: {
    flex: 1,
    fontSize: 22,
    fontWeight: "700",
    lineHeight: 30,
  },
  bodyCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 20,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 2,
  },
  paragraph: {
    fontSize: 14,
    lineHeight: 23,
    fontWeight: "400",
  },
  paragraphSpacing: {
    marginBottom: 16,
  },
  warningBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    marginTop: 20,
    padding: 16,
    borderRadius: 14,
  },
  warningText: {
    flex: 1,
    fontSize: 13,
    fontWeight: "600",
    lineHeight: 19,
  },
});
