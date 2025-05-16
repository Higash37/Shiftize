/**
 * テーマシステム用の型定義
 */
import { ColorsType } from "@/shared/constants/colors";
import { LayoutType } from "@/shared/constants/layout";
import { ShadowsType } from "@/shared/constants/shadows";
import { TypographyType } from "@/shared/constants/typography";

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
