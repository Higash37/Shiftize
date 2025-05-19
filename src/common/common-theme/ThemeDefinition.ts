/**
 * アプリケーションのテーマ設定
 */

import { colors } from "./ThemeColors";
import { typography } from "./ThemeTypography";

/**
 * アプリケーションのテーマ
 */
export const theme = {
  colors,
  typography,
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  },
  borderRadius: {
    xs: 2,
    sm: 4,
    md: 8,
    lg: 16,
    xl: 24,
    round: 1000, // 円形用
  },
  shadows: {
    none: {
      shadowColor: "transparent",
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0,
      shadowRadius: 0,
      elevation: 0,
    },
    sm: {
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.18,
      shadowRadius: 1.0,
      elevation: 1,
    },
    md: {
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.23,
      shadowRadius: 2.62,
      elevation: 4,
    },
    lg: {
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 4.65,
      elevation: 8,
    },
  },
  transitions: {
    fast: "0.2s",
    normal: "0.3s",
    slow: "0.5s",
  },
};

/**
 * テーマ型定義
 */
export type Theme = typeof theme;

/**
 * デフォルトテーマをエクスポート
 */
export default theme;
