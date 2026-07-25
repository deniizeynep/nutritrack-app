import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Screen } from "../src/components/Screen";
import { translate } from "../src/i18n/translations";
import { useAppStore } from "../src/stores/appStore";
import { getTheme } from "../src/theme/theme";

function Section({
  title,
  body,
  textColor,
  mutedColor,
  titleFont,
  bodyFont,
  isLast,
}: {
  title: string;
  body: string;
  textColor: string;
  mutedColor: string;
  titleFont: string;
  bodyFont: string;
  isLast?: boolean;
}) {
  return (
    <View style={[styles.section, isLast && styles.sectionLast]}>
      <Text
        style={[
          styles.sectionTitle,
          { color: textColor, fontFamily: titleFont },
        ]}
        accessibilityRole="header"
      >
        {title}
      </Text>
      <Text
        style={[
          styles.sectionBody,
          { color: mutedColor, fontFamily: bodyFont },
        ]}
        accessibilityLabel={body}
      >
        {body}
      </Text>
    </View>
  );
}

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
          <Section
            title={translate("termsIntroductionTitle", language)}
            body={translate("termsIntroductionBody", language)}
            textColor={theme.colors.text}
            mutedColor={theme.colors.mutedText}
            titleFont={theme.typography.headlineMd.fontFamily}
            bodyFont={theme.typography.bodyMd.fontFamily}
          />
          <Section
            title={translate("termsAcceptanceTitle", language)}
            body={translate("termsAcceptanceBody", language)}
            textColor={theme.colors.text}
            mutedColor={theme.colors.mutedText}
            titleFont={theme.typography.headlineMd.fontFamily}
            bodyFont={theme.typography.bodyMd.fontFamily}
          />
          <Section
            title={translate("termsUserResponsibilitiesTitle", language)}
            body={translate("termsUserResponsibilitiesBody", language)}
            textColor={theme.colors.text}
            mutedColor={theme.colors.mutedText}
            titleFont={theme.typography.headlineMd.fontFamily}
            bodyFont={theme.typography.bodyMd.fontFamily}
          />
          <Section
            title={translate("termsPrivacyTitle", language)}
            body={translate("termsPrivacyBody", language)}
            textColor={theme.colors.text}
            mutedColor={theme.colors.mutedText}
            titleFont={theme.typography.headlineMd.fontFamily}
            bodyFont={theme.typography.bodyMd.fontFamily}
          />
          <Section
            title={translate("termsHealthDisclaimerTitle", language)}
            body={translate("termsHealthDisclaimerBody", language)}
            textColor={theme.colors.text}
            mutedColor={theme.colors.mutedText}
            titleFont={theme.typography.headlineMd.fontFamily}
            bodyFont={theme.typography.bodyMd.fontFamily}
          />
          <Section
            title={translate("termsDataUsageTitle", language)}
            body={translate("termsDataUsageBody", language)}
            textColor={theme.colors.text}
            mutedColor={theme.colors.mutedText}
            titleFont={theme.typography.headlineMd.fontFamily}
            bodyFont={theme.typography.bodyMd.fontFamily}
          />
          <Section
            title={translate("termsLiabilityTitle", language)}
            body={translate("termsLiabilityBody", language)}
            textColor={theme.colors.text}
            mutedColor={theme.colors.mutedText}
            titleFont={theme.typography.headlineMd.fontFamily}
            bodyFont={theme.typography.bodyMd.fontFamily}
          />
          <Section
            title={translate("termsContactTitle", language)}
            body={translate("termsContactBody", language)}
            textColor={theme.colors.text}
            mutedColor={theme.colors.mutedText}
            titleFont={theme.typography.headlineMd.fontFamily}
            bodyFont={theme.typography.bodyMd.fontFamily}
            isLast
          />
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
    paddingBottom: 12,
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
  section: {
    marginBottom: 28,
  },
  sectionLast: {
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: "700",
    lineHeight: 24,
    marginBottom: 8,
  },
  sectionBody: {
    fontSize: 14,
    lineHeight: 22,
    fontWeight: "400",
  },
});
