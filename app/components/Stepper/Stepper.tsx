import React from "react";
import { View, Text, StyleSheet } from "react-native";

type Props = {
  currentStep: number;
  steps: {
    label: string;
    completed: boolean;
  }[];
};

export const Stepper: React.FC<Props> = ({ currentStep, steps }) => {
  return (
    <View style={styles.container}>
      {steps.map((step, index) => (
        <React.Fragment key={index}>
          <View style={styles.stepContainer}>
            <View
              style={[
                styles.circle,
                step.completed && styles.completedCircle,
                currentStep === index && styles.currentCircle,
              ]}
            >
              <Text
                style={[
                  styles.stepNumber,
                  (step.completed || currentStep === index) &&
                    styles.activeStepNumber,
                ]}
              >
                {index + 1}
              </Text>
            </View>
            <Text
              style={[
                styles.stepLabel,
                (step.completed || currentStep === index) &&
                  styles.activeStepLabel,
              ]}
            >
              {step.label}
            </Text>
          </View>
          {index < steps.length - 1 && (
            <View
              style={[styles.line, step.completed && styles.completedLine]}
            />
          )}
        </React.Fragment>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    gap: 4,
  },
  stepContainer: {
    alignItems: "center",
    gap: 4,
  },
  circle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#F2F4F9",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#E0E4E8",
  },
  completedCircle: {
    backgroundColor: "#4A90E2",
    borderColor: "#4A90E2",
  },
  currentCircle: {
    borderColor: "#4A90E2",
    backgroundColor: "white",
  },
  stepNumber: {
    fontSize: 14,
    fontWeight: "600",
    color: "#A0A4A8",
  },
  activeStepNumber: {
    color: "#4A90E2",
  },
  stepLabel: {
    fontSize: 12,
    color: "#A0A4A8",
    fontWeight: "500",
  },
  activeStepLabel: {
    color: "#4A90E2",
  },
  line: {
    width: 40,
    height: 2,
    backgroundColor: "#E0E4E8",
    marginTop: -24,
  },
  completedLine: {
    backgroundColor: "#4A90E2",
  },
});
