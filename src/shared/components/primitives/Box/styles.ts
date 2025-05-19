import { StyleSheet } from "react-native";
import { theme } from "../../../theme/theme";
import { BoxStyleName } from "./types";

/**
 * Box コンポーネントのスタイル定義
 */
export const styles = StyleSheet.create({
  base: {
    borderRadius: theme.borderRadius.md,
  },
  default: {
    backgroundColor: theme.colors.background,
  },
  primary: {
    backgroundColor: theme.colors.primary,
  },
  secondary: {
    backgroundColor: theme.colors.secondary,
  },
  card: {
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  outlined: {
    backgroundColor: theme.colors.background,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  outline: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  padding_small: {
    padding: theme.spacing.sm,
  },
  padding_medium: {
    padding: theme.spacing.md,
  },
  padding_large: {
    padding: theme.spacing.lg,
  },
  padding_none: {
    padding: 0,
  },
  margin_small: {
    margin: theme.spacing.sm,
  },
  margin_medium: {
    margin: theme.spacing.md,
  },
  margin_large: {
    margin: theme.spacing.lg,
  },
  margin_none: {
    margin: 0,
  },
}) as Record<BoxStyleName, any>;
