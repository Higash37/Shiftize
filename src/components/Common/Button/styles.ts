import { StyleSheet } from "react-native";
import { colors, layout, typography } from "../../../constants/theme";
import { ButtonStyleName } from "../types";

export const styles = StyleSheet.create({
  base: {
    borderRadius: layout.borderRadius.medium,
    alignItems: "center",
    justifyContent: "center",
  },
  primary: {
    backgroundColor: colors.primary,
  },
  secondary: {
    backgroundColor: colors.secondary,
  },
  outline: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: colors.primary,
  },
  size_small: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  size_medium: {
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  size_large: {
    paddingVertical: 16,
    paddingHorizontal: 32,
  },
  fullWidth: {
    width: "100%",
  },
  disabled: {
    opacity: 0.5,
  },
  text: {
    fontWeight: "700",
  },
  text_primary: {
    color: colors.text.white,
  },
  text_secondary: {
    color: colors.text.white,
  },
  text_outline: {
    color: colors.primary,
  },
  text_small: {
    fontSize: typography.fontSize.small,
  },
  text_medium: {
    fontSize: typography.fontSize.medium,
  },
  text_large: {
    fontSize: typography.fontSize.large,
  },
}) as Record<ButtonStyleName, any>;
