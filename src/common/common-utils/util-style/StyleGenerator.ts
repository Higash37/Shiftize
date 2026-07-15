
import { ViewStyle } from "react-native";
import { layout } from "../../common-constants/LayoutConstants";
import { shadows } from "../../common-constants/ShadowConstants";
import { colors } from "../../common-constants/ColorConstants";

export const withBorderRadius = (
  baseStyle: ViewStyle,
  radius: keyof typeof layout.borderRadius = "medium"
): ViewStyle => ({
  ...baseStyle,
  borderRadius: layout.borderRadius[radius],
});

export const withShadow = (
  baseStyle: ViewStyle,
  shadowType: keyof typeof shadows = "medium"
): ViewStyle => ({
  ...baseStyle,
  ...shadows[shadowType],
});

export const withPadding = (
  baseStyle: ViewStyle,
  paddingSize: keyof typeof layout.padding = "medium"
): ViewStyle => ({
  ...baseStyle,
  padding: layout.padding[paddingSize],
});

export const createCardStyle = (
  borderRadius: keyof typeof layout.borderRadius = "medium",
  shadowType: keyof typeof shadows = "card",
  backgroundColor: string = colors.background
): ViewStyle => ({
  borderRadius: layout.borderRadius[borderRadius],
  backgroundColor,
  ...shadows[shadowType],
  padding: layout.padding.medium,
});

export const createButtonStyle = (
  variant: "primary" | "secondary" | "outline" = "primary",
  size: "small" | "medium" | "large" = "medium"
): ViewStyle => {

  const sizeMap = {
    small: {
      paddingVertical: layout.padding.small,
      paddingHorizontal: layout.padding.medium,
    },
    medium: {
      paddingVertical: layout.padding.medium,
      paddingHorizontal: layout.padding.large,
    },
    large: {
      paddingVertical: layout.padding.large,
      paddingHorizontal: layout.padding.xlarge,
    },
  };

  const variantMap = {
    primary: {
      backgroundColor: colors.primary,
      ...shadows.button,
    },
    secondary: {
      backgroundColor: colors.secondary,
      ...shadows.button,
    },
    outline: {
      backgroundColor: "transparent",
      borderWidth: 1,
      borderColor: colors.primary,
    },
  };

  return {
    borderRadius: layout.components.button,
    alignItems: "center",
    justifyContent: "center",
    ...sizeMap[size],
    ...variantMap[variant],
  };
};

export const createHeaderStyle = (
  backgroundColor: string = colors.primary,
  withTopRadius: boolean = false
): ViewStyle => ({
  backgroundColor,

  borderTopLeftRadius: withTopRadius
    ? layout.headerFooter.borderRadius.header
    : 0,
  borderTopRightRadius: withTopRadius
    ? layout.headerFooter.borderRadius.header
    : 0,
  borderBottomLeftRadius: layout.headerFooter.borderRadius.header,
  borderBottomRightRadius: layout.headerFooter.borderRadius.header,
  ...shadows.header,
  padding: layout.padding.large,
});

export const createFooterStyle = (
  backgroundColor: string = colors.background,
  withBottomRadius: boolean = false
): ViewStyle => ({
  backgroundColor,
  borderTopLeftRadius: layout.headerFooter.borderRadius.footer,
  borderTopRightRadius: layout.headerFooter.borderRadius.footer,
  borderBottomLeftRadius: withBottomRadius
    ? layout.headerFooter.borderRadius.footer
    : 0,
  borderBottomRightRadius: withBottomRadius
    ? layout.headerFooter.borderRadius.footer
    : 0,
  ...shadows.footer,
  padding: layout.padding.medium,
});

export const createInputStyle = (
  focused: boolean = false,
  error: boolean = false
): ViewStyle => {

  let borderColor = colors.border;
  if (error) {
    borderColor = colors.error;
  } else if (focused) {
    borderColor = colors.primary;
  }

  return {
    borderRadius: layout.components.input,
    borderWidth: focused ? 2 : 1,
    borderColor,
    backgroundColor: colors.background,
    paddingVertical: layout.padding.medium,
    paddingHorizontal: layout.padding.medium,
    ...shadows.small,
  };
};

export const createModalStyle = (fullScreen: boolean = false): ViewStyle => ({
  borderRadius: fullScreen ? 0 : layout.components.modal,
  backgroundColor: colors.background,
  ...shadows.modal,
  margin: fullScreen ? 0 : layout.padding.large,
});
