import { StyleSheet } from "react-native";
import { colors } from "@/common/common-theme/ThemeColors";
import { Platform } from "react-native";

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    maxWidth: Platform.OS === "web" ? 160 : 120,
  },
  select: {
    WebkitAppearance: "none",
    appearance: "none",
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    padding: Platform.OS === "web" ? 14 : 10,
    fontSize: Platform.OS === "web" ? 16 : 14,
    fontWeight: "600",
    color: colors.text.primary,
    width: "100%",
    minWidth: Platform.OS === "web" ? 120 : 90,
    maxWidth: Platform.OS === "web" ? 160 : 120,
    cursor: "pointer",
    textAlign: "center",
    userSelect: "none",
    WebkitUserSelect: "none",
    outlineStyle: "none",
  } as any,
});
