import { StyleSheet } from "react-native";
import { theme } from "../../../common-theme/ThemeDefinition";

/**
 * ErrorMessageコンポーネントのスタイル定義
 */
export const styles = StyleSheet.create({
  error: {
    color: theme.colors.error,
    fontSize: theme.typography.fontSize.small,
    marginTop: theme.spacing.xs,
    fontWeight: "500",
  },
});
