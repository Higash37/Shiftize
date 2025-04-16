import React from "react";
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  TextInputProps,
  TextStyle,
  StyleProp,
} from "react-native";
import { colors, layout, typography } from "../../constants/theme";

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  helper?: string;
}

const Input: React.FC<InputProps> = ({
  label,
  error,
  helper,
  style,
  ...props
}) => {
  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      <TextInput
        style={
          [
            styles.input,
            error ? styles.inputError : undefined,
            style,
          ] as StyleProp<TextStyle>
        }
        placeholderTextColor={colors.text.secondary}
        {...props}
      />
      {(error || helper) && (
        <Text
          style={
            [
              styles.helperText,
              error ? styles.errorText : undefined,
            ] as StyleProp<TextStyle>
          }
        >
          {error || helper}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: layout.padding.medium,
  },
  label: {
    fontSize: typography.fontSize.medium,
    color: colors.text.secondary,
    marginBottom: layout.padding.small,
  },
  input: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: layout.borderRadius.medium,
    padding: layout.padding.medium,
    fontSize: typography.fontSize.large,
    color: colors.text.primary,
  },
  inputError: {
    borderColor: colors.error,
  },
  helperText: {
    fontSize: typography.fontSize.small,
    color: colors.text.secondary,
    marginTop: layout.padding.small,
  },
  errorText: {
    color: colors.error,
  },
});

export default Input;
