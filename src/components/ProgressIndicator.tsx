import { StyleSheet, Text, View } from "react-native";
import { useAppStore } from "../stores/appStore";
import { getTheme } from "../theme/theme";

type ProgressIndicatorProps = {
  currentStep: number;
  totalSteps: number;
  stepLabel?: string;
};

export function ProgressIndicator({
  currentStep,
  totalSteps,
  stepLabel = "ADIM",
}: ProgressIndicatorProps) {
  const themeMode = useAppStore((state) => state.themeMode);
  const theme = getTheme(themeMode);

  return (
    <View style={styles.container}>
      <View style={styles.barsContainer}>
        {Array.from({ length: totalSteps }, (_, i) => (
          <View
            key={i}
            style={[
              styles.bar,
              {
                backgroundColor:
                  i < currentStep
                    ? theme.colors.primary
                    : theme.colors.border,
                marginRight: i < totalSteps - 1 ? 8 : 0,
              },
            ]}
          />
        ))}
      </View>

      <Text
        style={[
          styles.stepText,
          {
            color: theme.colors.mutedText,
            fontFamily: theme.typography.labelMd.fontFamily,
          },
        ]}
        accessibilityLabel={`${stepLabel} ${currentStep} / ${totalSteps}`}
        accessibilityRole="text"
      >
        {`${stepLabel} ${currentStep} / ${totalSteps}`}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  barsContainer: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  bar: {
    flex: 1,
    height: 4,
    borderRadius: 2,
  },
  stepText: {
    fontSize: 11,
    fontWeight: "600",
    letterSpacing: 1.5,
    marginLeft: 16,
  },
});
