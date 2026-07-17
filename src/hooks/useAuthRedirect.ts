import { useEffect } from "react";
import { useRouter } from "expo-router";
import { useAuthStore } from "../stores/authStore";

export function useAuthRedirect() {
  const router = useRouter();
  const token = useAuthStore((s) => s.token);
  const hasHydrated = useAuthStore((s) => s.hasHydrated);

  useEffect(() => {
    if (hasHydrated && !token) {
      router.replace("/(auth)/login");
    }
  }, [hasHydrated, token, router]);
}
