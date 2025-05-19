import { StyleSheet } from "react-native";
import { theme } from "../../../theme/theme";
import { ButtonStyleName } from "./types";

/**
 * ボタンコンポーネントのスタイル定義
 */
export const styles = StyleSheet.create({
  base: {
    borderRadius: theme.borderRadius.md,
    alignItems: "center",
    justifyContent: "center",
  },
  primary: {
    backgroundColor: theme.colors.primary,
  },
  secondary: {
    backgroundColor: theme.colors.secondary,
  },
  outline: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: theme.colors.primary,
  },
  size_small: {
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
  },
  size_medium: {
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
  },
  size_large: {
    paddingVertical: theme.spacing.lg,
    paddingHorizontal: theme.spacing.xl,
  },
  fullWidth: {
    width: "100%",
  },
  disabled: {
    opacity: 0.5,
  },
  text: {
    fontWeight: "700", // bold
  },
  text_primary: {
    color: theme.colors.text?.white || "#FFFFFF",
  },
  text_secondary: {
    color: theme.colors.text?.white || "#FFFFFF",
  },
  text_outline: {
    color: theme.colors.primary,
  },
  text_small: {
    fontSize: theme.typography.fontSize.small,
  },
  text_medium: {
    fontSize: theme.typography.fontSize.medium,
  },
  text_large: {
    fontSize: theme.typography.fontSize.large,
  },
}) as Record<ButtonStyleName, any>;
