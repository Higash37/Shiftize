import { StyleSheet, Platform, Dimensions } from "react-native";
import { colors } from "@/common/common-theme/ThemeColors";
import { getPlatformShadow } from "@/common/common-utils/util-style/StyleGenerator";

// レスポンシブデザイン用の定数
const { width: SCREEN_WIDTH } = Dimensions.get("window");
const IS_SMALL_DEVICE = SCREEN_WIDTH < 375;
const IS_TABLET = SCREEN_WIDTH > 768;

export const styles = StyleSheet.create({
  footer: {
    flexDirection: "row",
    backgroundColor: colors.background,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    width: "100%", // 画面端まで伸ばす
  },
  tab: {
    flex: 1,
    alignItems: "center",
    paddingVertical: IS_SMALL_DEVICE ? 6 : 8,
  },
  createTab: {
    marginTop: IS_SMALL_DEVICE ? -15 : -20,
  },
  disabledTab: {
    opacity: 0.5,
  },
  label: {
    fontSize: IS_SMALL_DEVICE ? 10 : 12,
    color: colors.text.secondary,
    marginTop: IS_SMALL_DEVICE ? 2 : 4,
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
    width: IS_SMALL_DEVICE ? 48 : 56,
    height: IS_SMALL_DEVICE ? 48 : 56,
    borderRadius: IS_SMALL_DEVICE ? 24 : 28,
    backgroundColor: colors.primary,
    justifyContent: "center",
    alignItems: "center",
    ...getPlatformShadow(4),
  },
});
