import { StyleSheet, Platform } from "react-native";
import { colors } from "@/common/common-theme/ThemeColors";
import { getPlatformShadow } from "@/common/common-utils/util-style/StyleGenerator";

export const styles = StyleSheet.create({
  footer: {
    flexDirection: "row",
    backgroundColor: colors.background,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingBottom: Platform.OS === "ios" ? 20 : 0,
  },
  tab: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 8,
  },
  createTab: {
    marginTop: -20,
  },
  disabledTab: {
    opacity: 0.5,
  },
  label: {
    fontSize: 12,
    color: colors.text.secondary,
    marginTop: 4,
  },
  activeLabel: {
    color: colors.primary,
  },
  createLabel: {
    color: colors.primary,
  },
  disabledLabel: {
    color: colors.text.secondary,
  },
  addButtonContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary,
    justifyContent: "center",
    alignItems: "center",
    ...getPlatformShadow(4),
  },
});
