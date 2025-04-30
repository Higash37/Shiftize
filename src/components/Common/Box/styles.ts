import { StyleSheet } from "react-native";
import { colors, shadows, layout } from "../../../constants/theme";
import { BoxStyleName } from "../types";

export const styles = StyleSheet.create({
  base: {
    borderRadius: layout.borderRadius.medium,
  },
  default: {
    backgroundColor: colors.background,
  },
  card: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  outlined: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
  },
  padding_small: {
    padding: layout.padding.small,
  },
  padding_medium: {
    padding: layout.padding.medium,
  },
  padding_large: {
    padding: layout.padding.large,
  },
  margin_small: {
    margin: layout.padding.small,
  },
  margin_medium: {
    margin: layout.padding.medium,
  },
  margin_large: {
    margin: layout.padding.large,
  },
  margin_none: {
    margin: 0,
  },
}) as Record<BoxStyleName, any>;
