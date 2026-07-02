import { LinearGradient } from "expo-linear-gradient";
import {
  Pressable,
  StyleSheet,
  Text,
  type ViewStyle,
} from "react-native";
import { useAppStore } from "../stores/appStore";
import { getTheme } from "../theme/theme";

type ButtonProps = {
  children: React.ReactNode;
  onPress: () => void;
  variant?: "primary" | "secondary";
  style?: ViewStyle;
  disabled?: boolean;
};

export function Button({
  children,
  onPress,
  variant = "primary",
  style,
  disabled = false,
}: ButtonProps) {
  const themeMode = useAppStore((state) => state.themeMode);
  const theme = getTheme(themeMode);

  const isPrimary = variant === "primary";

  if (isPrimary) {
    return (
      <Pressable
        style={({ pressed }) => [
          styles.pressable,
          {
            opacity: disabled ? 0.55 : pressed ? 0.86 : 1,
          },
          style,
        ]}
        onPress={onPress}
        disabled={disabled}
      >
        <LinearGradient
          colors={
            themeMode === "dark"
              ? ["#6ED28A", "#2F7D46"]
              : ["#43A65F", "#2F7D46"]
          }
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.button}
        >
          <Text style={styles.primaryText}>{children}</Text>
        </LinearGradient>
      </Pressable>
    );
  }

  return (
    <Pressable
      style={({ pressed }) => [
        styles.secondaryButton,
        {
          backgroundColor: theme.colors.card,
          borderColor: theme.colors.border,
          opacity: disabled ? 0.55 : pressed ? 0.8 : 1,
        },
        style,
      ]}
      onPress={onPress}
      disabled={disabled}
    >
      <Text style={[styles.secondaryText, { color: theme.colors.text }]}>
        {children}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pressable: {
    borderRadius: 20,
  },
  button: {
    height: 56,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#2F7D46",
    shadowOpacity: 0.25,
    shadowRadius: 14,
    shadowOffset: {
      width: 0,
      height: 8,
    },
    elevation: 6,
  },
  primaryText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "900",
  },
  secondaryButton: {
    height: 56,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },
  secondaryText: {
    fontSize: 16,
    fontWeight: "800",
  },
});
