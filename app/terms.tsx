import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useMemo } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Screen } from "../src/components/Screen";
import {
  translate,
  type Language,
  type TranslationKey,
} from "../src/i18n/translations";
import { useAppStore } from "../src/stores/appStore";
import { getTheme } from "../src/theme/theme";

type SectionId =
  | "introduction"
  | "acceptance"
  | "user-responsibilities"
  | "privacy"
  | "data-collection"
  | "health-disclaimer"
  | "liability"
  | "contact";

interface TermSection {
  id: SectionId;
  icon: keyof typeof Ionicons.glyphMap;
  titleKey: TranslationKey;
  descKey: TranslationKey;
  bodyKey: TranslationKey;
}

const TERM_SECTIONS: TermSection[] = [
  {
    id: "introduction",
    icon: "document-text-outline",
    titleKey: "termsIntroductionTitle",
    descKey: "termsIntroductionShort",
    bodyKey: "termsIntroductionBody",
  },
  {
    id: "acceptance",
    icon: "people-outline",
    titleKey: "termsAcceptanceTitle",
    descKey: "termsAcceptanceShort",
    bodyKey: "termsAcceptanceBody",
  },
  {
    id: "user-responsibilities",
    icon: "person-outline",
    titleKey: "termsUserResponsibilitiesTitle",
    descKey: "termsUserResponsibilitiesShort",
    bodyKey: "termsUserResponsibilitiesBody",
  },
  {
    id: "privacy",
    icon: "shield-checkmark-outline",
    titleKey: "termsPrivacyTitle",
    descKey: "termsPrivacyShort",
    bodyKey: "termsPrivacyBody",
  },
  {
    id: "data-collection",
    icon: "server-outline",
    titleKey: "termsDataUsageTitle",
    descKey: "termsDataCollectionShort",
    bodyKey: "termsDataUsageBody",
  },
  {
    id: "health-disclaimer",
    icon: "fitness-outline",
    titleKey: "termsHealthDisclaimerTitle",
    descKey: "termsHealthDisclaimerShort",
    bodyKey: "termsHealthDisclaimerBody",
  },
  {
    id: "liability",
    icon: "information-circle-outline",
    titleKey: "termsLiabilityTitle",
    descKey: "termsLiabilityShort",
    bodyKey: "termsLiabilityBody",
  },
  {
    id: "contact",
    icon: "mail-outline",
    titleKey: "termsContactTitle",
    descKey: "termsContactShort",
    bodyKey: "termsContactBody",
  },
];

function TermCard({
  section,
  language,
  onPress,
  cardColor,
  borderColor,
  textColor,
  mutedColor,
  primaryColor,
  shadowStyle,
}: {
  section: TermSection;
  language: Language;
  onPress: () => void;
  cardColor: string;
  borderColor: string;
  textColor: string;
  mutedColor: string;
  primaryColor: string;
  shadowStyle: object;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        {
          backgroundColor: cardColor,
          borderColor,
          opacity: pressed ? 0.8 : 1,
          transform: [{ scale: pressed ? 0.985 : 1 }],
        },
        shadowStyle,
      ]}
      accessibilityLabel={translate(section.titleKey, language)}
      accessibilityRole="button"
    >
      <View
        style={[styles.cardIconCircle, { backgroundColor: primaryColor }]}
      >
        <Ionicons
          name={section.icon}
          size={20}
          color="#FFFFFF"
        />
      </View>
      <View style={styles.cardText}>
        <Text style={[styles.cardTitle, { color: textColor }]}>
          {translate(section.titleKey, language)}
        </Text>
        <Text style={[styles.cardDesc, { color: mutedColor }]}>
          {translate(section.descKey, language)}
        </Text>
      </View>
      <Ionicons
        name="chevron-forward"
        size={18}
        color={mutedColor}
        style={styles.cardChevron}
      />
    </Pressable>
  );
}

export default function TermsOverviewScreen() {
  const themeMode = useAppStore((state) => state.themeMode);
  const language = useAppStore((state) => state.language);
  const theme = getTheme(themeMode);

  const shadowStyle = useMemo(
    () => ({
      shadowColor: themeMode === "dark" ? "rgba(0,0,0,0.4)" : "#000",
      shadowOffset: { width: 0, height: 2 } as const,
      shadowOpacity: themeMode === "dark" ? 0.3 : 0.06,
      shadowRadius: themeMode === "dark" ? 10 : 12,
      elevation: themeMode === "dark" ? 3 : 2,
    }),
    [themeMode],
  );

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
          <View style={styles.backButtonPlaceholder} />
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {TERM_SECTIONS.map((section) => (
            <TermCard
              key={section.id}
              section={section}
              language={language}
              onPress={() =>
                router.push({
                  pathname: "/terms/[section]" as never,
                  params: {
                    section: section.id,
                  },
                })
              }
              cardColor={theme.colors.card}
              borderColor={theme.colors.border}
              textColor={theme.colors.text}
              mutedColor={theme.colors.mutedText}
              primaryColor={theme.colors.primary}
              shadowStyle={shadowStyle}
            />
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
  pageTitle: {
    fontSize: 20,
    fontWeight: "700",
    textAlign: "center",
  },
  scrollContent: {
    paddingBottom: 40,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    gap: 14,
    marginBottom: 12,
  },
  cardIconCircle: {
    width: 42,
    height: 42,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  cardText: {
    flex: 1,
    gap: 3,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: "700",
    lineHeight: 20,
  },
  cardDesc: {
    fontSize: 12,
    fontWeight: "400",
    lineHeight: 17,
  },
  cardChevron: {
    opacity: 0.5,
  },
});
