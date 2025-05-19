import { StyleSheet } from "react-native";
import { theme } from "../../../theme/theme";
import { InputStyleName } from "./types";

/**
 * Inputコンポーネントのスタイル定義
 */
export const styles = StyleSheet.create({
  container: {
    marginBottom: theme.spacing.md,
  },
  label: {
    fontSize: theme.typography.fontSize.medium,
    color: theme.colors.text?.secondary,
    marginBottom: theme.spacing.sm,
  },
  input: {
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    fontSize: theme.typography.fontSize.medium,
    color: theme.colors.text?.primary,
  },
  inputError: {
    borderColor: theme.colors.error,
  },
  helperText: {
    fontSize: theme.typography.fontSize.small,
    color: theme.colors.text?.secondary,
    marginTop: theme.spacing.sm,
  },
  errorText: {
    color: theme.colors.error,
  },
});
