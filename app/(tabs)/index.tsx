import { Redirect } from "expo-router";
import { useAppStore } from "../../src/stores/appStore";
import { useAuthStore } from "../../src/stores/authStore";

export default function TabsIndex() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const onboardingCompleted = useAppStore((state) => state.onboardingCompleted);

  if (!isAuthenticated && !onboardingCompleted) {
    return <Redirect href="/" />;
  }

  return <Redirect href="/(tabs)/home" />;
}
