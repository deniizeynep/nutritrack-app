import { darkColors, lightColors } from "../constants/colors";

export type ThemeMode = "light" | "dark";

export const getTheme = (mode: ThemeMode) => {
  const colors = mode === "dark" ? darkColors : lightColors;

  return {
    mode,
    colors,
    spacing: {
      xs: 6,
      sm: 10,
      md: 16,
      lg: 24,
      xl: 32,
    },
    radius: {
      sm: 10,
      md: 16,
      lg: 24,
      full: 999,
    },
  };
};

export type AppTheme = ReturnType<typeof getTheme>;
