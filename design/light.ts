/**
 * Vitality Core — Light Theme (v2)
 * Düşük doygunluk, sakin sage paleti
 * Design tokens derived from the Vitality Core design system.
 */

export const lightTheme = {
  name: "Vitality Core Light v2" as const,

  colors: {
    primary: "#3e5b4b",
    onPrimary: "#ffffff",
    primaryContainer: "#dbe4dd",
    onPrimaryContainer: "#2b4237",

    secondary: "#5e6a58",
    onSecondary: "#ffffff",
    secondaryContainer: "#e2e6dc",
    onSecondaryContainer: "#3f4a3a",

    tertiary: "#3f6a5c",
    onTertiary: "#ffffff",
    tertiaryContainer: "#d5e6df",
    onTertiaryContainer: "#1a3d31",

    surfaceLowest: "#ffffff",
    surface: "#f9f9f6",
    surfaceLow: "#f2f2ee",
    surfaceHigh: "#eaebe5",
    surfaceHighest: "#e2e4dd",

    background: "#f9f9f6",
    onBackground: "#1c1e1a",

    text: "#1c1e1a",
    mutedText: "#6b6f66",

    border: "#e2e4dd",
    outline: "#c1c4ba",

    danger: "#ba1a1a",
    onDanger: "#ffffff",
    dangerContainer: "#ffdad6",
    onDangerContainer: "#93000a",

    warning: "#f6b84b",

    protein: "#5f7cb0",
    carbs: "#b17d47",
    fat: "#83678f",

    success: "#3e5b4b",
    successContainer: "#dbe4dd",
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
      fontFamily: "Manrope",
      fontSize: 32,
      fontWeight: "800" as const,
      lineHeight: 40,
      letterSpacing: -0.02,
    },
    headlineLg: {
      fontFamily: "Manrope",
      fontSize: 24,
      fontWeight: "700" as const,
      lineHeight: 32,
      letterSpacing: 0,
    },
    headlineMd: {
      fontFamily: "Manrope",
      fontSize: 20,
      fontWeight: "700" as const,
      lineHeight: 28,
      letterSpacing: 0,
    },
    bodyLg: {
      fontFamily: "Manrope",
      fontSize: 16,
      fontWeight: "500" as const,
      lineHeight: 24,
      letterSpacing: 0,
    },
    bodyMd: {
      fontFamily: "Manrope",
      fontSize: 14,
      fontWeight: "400" as const,
      lineHeight: 20,
      letterSpacing: 0,
    },
    labelMd: {
      fontFamily: "Manrope",
      fontSize: 12,
      fontWeight: "600" as const,
      lineHeight: 16,
      letterSpacing: 0.05,
    },
    dataNum: {
      fontFamily: "Manrope",
      fontSize: 40,
      fontWeight: "800" as const,
      lineHeight: 40,
      letterSpacing: -0.04,
    },
  },

  elevation: {
    card: {
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 12,
      elevation: 3,
    },
    modal: {
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.15,
      shadowRadius: 16,
      elevation: 5,
    },
  },
} as const;

export type LightTheme = typeof lightTheme;
