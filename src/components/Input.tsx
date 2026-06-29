import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import {
    Pressable,
    StyleSheet,
    Text,
    TextInput,
    type TextInputProps,
    View,
} from "react-native";
import { useAppStore } from "../stores/appStore";
import { getTheme } from "../theme/theme";

type IconName = keyof typeof Ionicons.glyphMap;

type InputProps = TextInputProps & {
  label: string;
  icon?: IconName;
  isPassword?: boolean;
};

export function Input({
  label,
  icon,
  isPassword = false,
  secureTextEntry,
  style,
  ...props
}: InputProps) {
  const themeMode = useAppStore((state) => state.themeMode);
  const theme = getTheme(themeMode);

  const [isFocused, setIsFocused] = useState(false);
  const [isSecure, setIsSecure] = useState(isPassword);

  return (
    <View style={styles.container}>
      <Text style={[styles.label, { color: theme.colors.mutedText }]}>
        {label}
      </Text>

      <View
        style={[
          styles.inputWrapper,
          {
            backgroundColor:
              themeMode === "dark" ? theme.colors.cardSoft : "#F7F4EC",
            borderColor: isFocused ? theme.colors.primary : theme.colors.border,
          },
        ]}
      >
        {icon ? (
          <View
            style={[
              styles.iconCircle,
              {
                backgroundColor: theme.colors.primarySoft,
              },
            ]}
          >
            <Ionicons name={icon} size={18} color={theme.colors.primary} />
          </View>
        ) : null}

        <TextInput
          placeholderTextColor={theme.colors.mutedText}
          style={[
            styles.input,
            {
              color: theme.colors.text,
            },
            style,
          ]}
          secureTextEntry={isPassword ? isSecure : secureTextEntry}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          {...props}
        />

        {isPassword ? (
          <Pressable onPress={() => setIsSecure((current) => !current)}>
            <Ionicons
              name={isSecure ? "eye-outline" : "eye-off-outline"}
              size={20}
              color={theme.colors.mutedText}
            />
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 8,
  },
  label: {
    fontSize: 13,
    fontWeight: "800",
    marginLeft: 4,
  },
  inputWrapper: {
    minHeight: 58,
    borderWidth: 1,
    borderRadius: 22,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  iconCircle: {
    width: 34,
    height: 34,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
  },
  input: {
    flex: 1,
    fontSize: 15,
    fontWeight: "700",
  },
});
