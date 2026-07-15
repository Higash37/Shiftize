

import { colors } from "./ThemeColors";
import { typography } from "./ThemeTypography";
import { shadows } from "../common-constants/ShadowConstants";
import { md3Spacing } from "./md3/MD3Spacing";
import { md3Shape } from "./md3/MD3Shape";

export const theme = {
  colors,
  typography,
  spacing: {
    xs: md3Spacing.xs,
    sm: md3Spacing.sm,
    md: md3Spacing.lg,
    lg: md3Spacing.xxl,
    xl: md3Spacing.xxxl,
    xxl: md3Spacing.xxxxxl,
  },
  borderRadius: {
    xs: md3Shape.extraSmall,
    sm: md3Shape.small,
    md: md3Shape.medium,
    lg: md3Shape.large,
    xl: md3Shape.extraLarge,
    round: md3Shape.full,
  },
  shadows: {
    none: shadows.none,
    sm: shadows.small,
    md: shadows.medium,
    lg: shadows.large,
  },

  transitions: {
    fast: "0.2s",
    normal: "0.3s",
    slow: "0.5s",
  },
};

export type Theme = typeof theme;
export default theme;
