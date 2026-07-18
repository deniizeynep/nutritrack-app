/**
 * Vitality Core — Dark Theme (v2)
 * Düşük doygunluk, sakin grafit zemin
 * Design tokens derived from the Vitality Core design system.
 */

export const darkTheme = {
  name: "Vitality Core Dark v2" as const,

  colors: {
    primary: "#8ba892",
    onPrimary: "#12251b",
    primaryContainer: "#293a2f",
    onPrimaryContainer: "#c3d4c6",

    secondary: "#a3a795",
    onSecondary: "#212418",
    secondaryContainer: "#3a3c30",
    onSecondaryContainer: "#c8ccb8",

    tertiary: "#7fa89a",
    onTertiary: "#0f2e24",
    tertiaryContainer: "#243b34",
    onTertiaryContainer: "#b4d4c7",

    surfaceLowest: "#0f100b",
    surface: "#15160f",
    surfaceLow: "#1a1c15",
    surfaceHigh: "#25261f",
    surfaceHighest: "#303228",

    background: "#15160f",
    onBackground: "#e4e4de",

    text: "#e4e4de",
    mutedText: "#9a9c92",

    border: "#34362c",
    outline: "#5a5d53",

    danger: "#ffb4ab",
    onDanger: "#690005",
    dangerContainer: "#93000a",
    onDangerContainer: "#ffdad6",

    warning: "#f8c765",

    protein: "#7c9bcf",
    carbs: "#c99a63",
    fat: "#a893c2",

    success: "#8ba892",
    successContainer: "#293a2f",
  },

  spacing: {
    unit: 4,
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 40,
    containerPadding: 20,
    stackGap: 16,
    elementGap: 8,
    sectionMargin: 32,
  },

  borderRadius: {
    sm: 4,
    md: 8,
    lg: 16,
    xl: 24,
    full: 9999,
  },

  typography: {
    displayLg: {
      fontFamily: "Hanken Grotesk",
      fontSize: 32,
      fontWeight: "700" as const,
      lineHeight: 40,
      letterSpacing: -0.02,
    },
    headlineLg: {
      fontFamily: "Hanken Grotesk",
      fontSize: 24,
      fontWeight: "600" as const,
      lineHeight: 32,
      letterSpacing: 0,
    },
    headlineMd: {
      fontFamily: "Hanken Grotesk",
      fontSize: 20,
      fontWeight: "600" as const,
      lineHeight: 28,
      letterSpacing: 0,
    },
    bodyLg: {
      fontFamily: "Inter",
      fontSize: 18,
      fontWeight: "400" as const,
      lineHeight: 28,
      letterSpacing: 0,
    },
    bodyMd: {
      fontFamily: "Inter",
      fontSize: 16,
      fontWeight: "400" as const,
      lineHeight: 24,
      letterSpacing: 0,
    },
    labelMd: {
      fontFamily: "JetBrains Mono",
      fontSize: 12,
      fontWeight: "500" as const,
      lineHeight: 16,
      letterSpacing: 0.05,
    },
    dataNum: {
      fontFamily: "Hanken Grotesk",
      fontSize: 40,
      fontWeight: "700" as const,
      lineHeight: 40,
      letterSpacing: -0.04,
    },
  },

  elevation: {
    card: {
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.25,
      shadowRadius: 12,
      elevation: 3,
    },
    modal: {
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.35,
      shadowRadius: 16,
      elevation: 5,
    },
  },
} as const;

export type DarkTheme = typeof darkTheme;
