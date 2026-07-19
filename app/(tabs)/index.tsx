import { Redirect } from "expo-router";
import { useAuthStore } from "../../src/stores/authStore";

export default function TabsIndex() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  if (!isAuthenticated) {
    return <Redirect href="/" />;
  }

  return <Redirect href="/(tabs)/home" />;
}
