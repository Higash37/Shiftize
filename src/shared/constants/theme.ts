/**
 * テーマ設定をまとめたファイル
 * 各種定数は個別のファイルに定義し、このファイルからエクスポートしています
 */
import { colors, ColorsType } from "./colors";
import { typography, TypographyType } from "./typography";
import { layout, LayoutType } from "./layout";
import { shadows, ShadowsType } from "./shadows";

export interface ThemeType {
  colors: ColorsType;
  typography: TypographyType;
  layout: LayoutType;
  shadows: ShadowsType;
}

export const theme: ThemeType = {
  colors,
  typography,
  layout,
  shadows,
};

// 個別のエクスポート
export { colors, typography, layout, shadows };
