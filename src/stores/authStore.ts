import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { authApi, type AuthUser } from "../services/authApi";

type AuthState = {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  register: (
    fullName: string,
    email: string,
    password: string,
  ) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  loadMe: () => Promise<void>;
  logout: () => void;
  clearError: () => void;
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      register: async (fullName, email, password) => {
        try {
          set({
            isLoading: true,
            error: null,
          });

          const response = await authApi.register({
            fullName,
            email,
            password,
          });

          set({
            user: response.user,
            token: response.token,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
        } catch (error) {
          set({
            isLoading: false,
            error:
              error instanceof Error
                ? error.message
                : "Kayıt işlemi başarısız.",
          });

          throw error;
        }
      },

      login: async (email, password) => {
        try {
          set({
            isLoading: true,
            error: null,
          });

          const response = await authApi.login({
            email,
            password,
          });

          set({
            user: response.user,
            token: response.token,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
        } catch (error) {
          set({
            isLoading: false,
            error:
              error instanceof Error
                ? error.message
                : "Giriş işlemi başarısız.",
          });

          throw error;
        }
      },

      loadMe: async () => {
        const token = get().token;

        if (!token) {
          return;
        }

        try {
          const response = await authApi.me(token);

          set({
            user: response.user,
            isAuthenticated: true,
            error: null,
          });
        } catch {
          set({
            user: null,
            token: null,
            isAuthenticated: false,
          });
        }
      },

      logout: () =>
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          error: null,
        }),

      clearError: () =>
        set({
          error: null,
        }),
    }),
    {
      name: "nutritrack-auth-storage",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    },
  ),
);
