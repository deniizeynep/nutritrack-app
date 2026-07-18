import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { Language } from "../i18n/translations";
import type { ThemeMode } from "../theme/theme";

type AppState = {
  themeMode: ThemeMode;
  language: Language;
  unitSystem: "metric" | "imperial";
  dataSharingEnabled: boolean;
  setThemeMode: (themeMode: ThemeMode) => void;
  toggleTheme: () => void;
  setLanguage: (language: Language) => void;
  setUnitSystem: (unitSystem: "metric" | "imperial") => void;
  setDataSharingEnabled: (enabled: boolean) => void;
};

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      themeMode: "light",
      language: "tr",
      unitSystem: "metric",
      dataSharingEnabled: false,

      setThemeMode: (themeMode) => set({ themeMode }),

      toggleTheme: () => {
        const currentTheme = get().themeMode;
        set({ themeMode: currentTheme === "light" ? "dark" : "light" });
      },

      setLanguage: (language) => set({ language }),

      setUnitSystem: (unitSystem) => set({ unitSystem }),

      setDataSharingEnabled: (dataSharingEnabled) => set({ dataSharingEnabled }),
    }),
    {
      name: "nutritrack-app-storage",
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
