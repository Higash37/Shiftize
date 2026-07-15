
import { colors, ColorsType } from "./ColorConstants";
import { typography, TypographyType } from "./TypographyConstants";
import { layout, LayoutType } from "./LayoutConstants";
import { shadows, ShadowsType } from "./ShadowConstants";

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

export { colors } from "./ColorConstants";
export { typography } from "./TypographyConstants";
export { layout } from "./LayoutConstants";
export { shadows } from "./ShadowConstants";
