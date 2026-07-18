import { getDesignTheme, type ThemeMode } from "../../design";
import { lightColors, darkColors } from "../constants/colors";

export type { ThemeMode };

export const getTheme = (mode: ThemeMode) => {
  const design = getDesignTheme(mode);
  const colors = mode === "dark" ? darkColors : lightColors;

  return {
    mode,
    colors,
    design,
    spacing: design.spacing,
    radius: {
      sm: design.borderRadius.sm,
      md: design.borderRadius.lg,
      lg: design.borderRadius.xl,
      full: design.borderRadius.full,
    },
    typography: design.typography,
    elevation: design.elevation,
  };
};

export type AppTheme = ReturnType<typeof getTheme>;
