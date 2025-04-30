/**
 * テーマシステム用の型定義
 */
import { ColorsType } from "@/constants/colors";
import { LayoutType } from "@/constants/layout";
import { ShadowsType } from "@/constants/shadows";
import { TypographyType } from "@/constants/typography";

export interface Theme {
  colors: ColorsType;
  typography: TypographyType;
  layout: LayoutType;
  shadows: ShadowsType;
}

// テーマの拡張を可能にするための型
export type ExtendedTheme = Theme & {
  [key: string]: any;
};
