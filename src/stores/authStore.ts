import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { authApi, type AuthUser } from "../services/authApi";
import {
  GoogleSignInError,
  signInWithGoogleProvider,
} from "../services/googleAuth";

type AuthState = {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  hasHydrated: boolean;
  hasCheckedSession: boolean;
  error: string | null;
  register: (
    fullName: string,
    email: string,
    password: string,
  ) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  loadMe: () => Promise<void>;
  deleteAccount: () => Promise<void>;
  logout: () => void;
  clearError: () => void;
  setHasHydrated: (hasHydrated: boolean) => void;
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      hasHydrated: false,
      hasCheckedSession: false,
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
            hasCheckedSession: true,
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
            hasCheckedSession: true,
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

      signInWithGoogle: async () => {
        try {
          set({
            isLoading: true,
            error: null,
          });

          const { idToken } = await signInWithGoogleProvider();
          const response = await authApi.signInWithGoogle(idToken);

          set({
            user: response.user,
            token: response.token,
            isAuthenticated: true,
            isLoading: false,
            hasCheckedSession: true,
            error: null,
          });
        } catch (error) {
          set({
            isLoading: false,
            error:
              error instanceof GoogleSignInError && error.code === "CANCELLED"
                ? null
                : error instanceof Error
                  ? error.message
                  : "Google ile giriş yapılamadı.",
          });

          throw error;
        }
      },

      loadMe: async () => {
        const token = get().token;

        if (!token) {
          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            hasCheckedSession: true,
          });
          return;
        }

        try {
          set({
            isLoading: true,
            error: null,
          });

          const response = await authApi.me(token);

          set({
            user: response.user,
            isAuthenticated: true,
            isLoading: false,
            hasCheckedSession: true,
            error: null,
          });
        } catch {
          set({
            user: null,
            token: null,
            isAuthenticated: false,
            isLoading: false,
            hasCheckedSession: true,
          });
        }
      },

      logout: () =>
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          hasCheckedSession: true,
          error: null,
        }),

      deleteAccount: async () => {
        const token = get().token;

        if (!token) {
          set({
            user: null,
            token: null,
            isAuthenticated: false,
            hasCheckedSession: true,
            error: null,
          });
          return;
        }

        try {
          set({
            isLoading: true,
            error: null,
          });

          await authApi.deleteAccount(token);

          set({
            user: null,
            token: null,
            isAuthenticated: false,
            isLoading: false,
            hasCheckedSession: true,
            error: null,
          });
        } catch (error) {
          set({
            isLoading: false,
            error:
              error instanceof Error ? error.message : "Hesap silinemedi.",
          });

          throw error;
        }
      },

      clearError: () =>
        set({
          error: null,
        }),

      setHasHydrated: (hasHydrated) =>
        set({
          hasHydrated,
        }),
    }),
    {
      name: "nutritrack-auth-storage",
      storage: createJSONStorage(() => AsyncStorage),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
      partialize: (state) => ({
        token: state.token,
      }),
    },
  ),
);
