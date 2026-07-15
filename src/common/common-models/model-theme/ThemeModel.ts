
import { ColorsType } from "@/common/common-constants/ColorConstants";
import { LayoutType } from "@/common/common-constants/LayoutConstants";
import { ShadowsType } from "@/common/common-constants/ShadowConstants";
import { TypographyType } from "@/common/common-constants/TypographyConstants";

export interface Theme {

  colors: ColorsType;

  typography: TypographyType;

  layout: LayoutType;

  shadows: ShadowsType;
}

export type ExtendedTheme = Theme;
