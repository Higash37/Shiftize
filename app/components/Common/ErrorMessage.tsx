import React from "react";
import { Text, StyleSheet } from "react-native";
import { colors, typography } from "../../constants/theme";

interface ErrorMessageProps {
  message: string;
}

const ErrorMessage: React.FC<ErrorMessageProps> = ({ message }) => {
  return <Text style={styles.error}>{message}</Text>;
};

const styles = StyleSheet.create({
  error: {
    color: colors.error,
    fontSize: typography.fontSize.small,
    marginTop: 4,
  },
});

export default ErrorMessage;
