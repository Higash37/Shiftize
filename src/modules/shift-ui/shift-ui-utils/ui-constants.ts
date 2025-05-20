import { colors } from "@/common/common-theme/ThemeColors";
import { StyleSheet } from "react-native";

/**
 * シフトUI用の共通スタイル定数
 */
export const shiftUIConstants = {
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
  },
  borderRadius: {
    sm: 4,
    md: 8,
    lg: 16,
  },
  fontSize: {
    sm: 12,
    md: 14,
    lg: 16,
    xl: 18,
  },
};

/**
 * 共通のスタイルミキシン
 */
export const shiftUIStyles = StyleSheet.create({
  container: {
    backgroundColor: colors.background,
    borderRadius: shiftUIConstants.borderRadius.md,
    padding: shiftUIConstants.spacing.md,
  },
  section: {
    marginBottom: shiftUIConstants.spacing.lg,
  },
  title: {
    fontSize: shiftUIConstants.fontSize.lg,
    fontWeight: "bold",
    color: colors.text.primary,
    marginBottom: shiftUIConstants.spacing.sm,
  },
  label: {
    fontSize: shiftUIConstants.fontSize.md,
    color: colors.text.secondary,
    marginBottom: shiftUIConstants.spacing.xs,
  },
  input: {
    padding: shiftUIConstants.spacing.md,
    backgroundColor: colors.surface,
    borderRadius: shiftUIConstants.borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  button: {
    padding: shiftUIConstants.spacing.md,
    backgroundColor: colors.primary,
    borderRadius: shiftUIConstants.borderRadius.md,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: {
    color: colors.text.white,
    fontSize: shiftUIConstants.fontSize.md,
    fontWeight: "bold",
  },
  icon: {
    color: colors.text.primary,
  },
});
