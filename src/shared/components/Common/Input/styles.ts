import { StyleSheet } from "react-native";
import { colors, layout, typography } from "../../../constants/theme";

export const styles = StyleSheet.create({
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
