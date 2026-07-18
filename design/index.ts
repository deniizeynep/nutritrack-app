import { lightTheme } from "./light";
import { darkTheme } from "./dark";

export { lightTheme, darkTheme };
export type { LightTheme } from "./light";
export type { DarkTheme } from "./dark";

export type ThemeMode = "light" | "dark";

export type DesignTheme = typeof lightTheme | typeof darkTheme;

export const getDesignTheme = (mode: ThemeMode): DesignTheme => {
  return mode === "dark" ? darkTheme : lightTheme;
};
