import { Dimensions } from "react-native";

// レスポンシブデザイン用の定数
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");
export const IS_SMALL_DEVICE = SCREEN_WIDTH < 375;
export const IS_TABLET = SCREEN_WIDTH > 768;
export const IS_LARGE_TABLET = SCREEN_WIDTH > 1024;

// タブレット用のサイズ調整
export const getResponsiveSize = (
  smallSize: number,
  normalSize: number,
  tabletSize?: number,
  largeTabletSize?: number
): number => {
  if (IS_LARGE_TABLET && largeTabletSize !== undefined) {
    return largeTabletSize;
  }
  if (IS_TABLET && tabletSize !== undefined) {
    return tabletSize;
  }
  if (IS_SMALL_DEVICE) {
    return smallSize;
  }
  return normalSize;
};

// タブレット用のパディング
export const getResponsivePadding = (
  size: "small" | "medium" | "large" = "medium"
): number => {
  if (size === "small") {
    return getResponsiveSize(8, 12, 16, 20);
  }
  if (size === "large") {
    return getResponsiveSize(16, 24, 32, 40);
  }
  return getResponsiveSize(12, 16, 24, 32);
};

// フォントサイズ
export const getResponsiveFontSize = (
  size: "small" | "medium" | "large" = "medium"
): number => {
  if (size === "small") {
    return getResponsiveSize(12, 14, 16, 18);
  }
  if (size === "large") {
    return getResponsiveSize(16, 18, 22, 24);
  }
  return getResponsiveSize(14, 16, 20, 22);
};
