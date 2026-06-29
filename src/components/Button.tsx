import type { ReactNode } from "react";
import {
    Pressable,
    StyleSheet,
    Text,
    type PressableProps,
    type ViewStyle,
} from "react-native";
import { useAppStore } from "../stores/appStore";
import { getTheme } from "../theme/theme";

type ButtonProps = PressableProps & {
  children: ReactNode;
  variant?: "primary" | "secondary";
  style?: ViewStyle;
};

export function Button({
  children,
  variant = "primary",
  style,
  ...props
}: ButtonProps) {
  const themeMode = useAppStore((state) => state.themeMode);
  const theme = getTheme(themeMode);

  const isPrimary = variant === "primary";

  return (
    <Pressable
      style={({ pressed }) => [
        styles.button,
        {
          backgroundColor: isPrimary ? theme.colors.primary : theme.colors.card,
          borderColor: theme.colors.border,
          opacity: pressed ? 0.8 : 1,
        },
        style,
      ]}
      {...props}
    >
      <Text
        style={[
          styles.text,
          {
            color: isPrimary ? "#FFFFFF" : theme.colors.text,
          },
        ]}
      >
        {children}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    height: 54,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },
  text: {
    fontSize: 16,
    fontWeight: "700",
  },
});
