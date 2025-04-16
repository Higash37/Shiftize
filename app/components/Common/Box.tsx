import React from "react";
import { View, StyleSheet, ViewProps } from "react-native";
import { colors, shadows, layout } from "../../constants/theme";

type Variant = "default" | "card" | "outlined";
type Padding = "small" | "medium" | "large";
type Margin = "small" | "medium" | "large" | "none";
type Shadow = "none" | "small" | "medium";

interface BoxProps extends ViewProps {
  variant?: Variant;
  padding?: Padding;
  margin?: Margin;
  shadow?: Shadow;
}

type StyleName = Variant | "base" | `padding_${Padding}` | `margin_${Margin}`;

const Box: React.FC<BoxProps> = ({
  variant = "default",
  padding = "medium",
  margin = "none",
  shadow = "none",
  style,
  children,
  ...props
}) => {
  return (
    <View
      style={[
        styles.base,
        styles[variant],
        styles[`padding_${padding}` as StyleName],
        styles[`margin_${margin}` as StyleName],
        shadow !== "none" && shadows[shadow],
        style,
      ]}
      {...props}
    >
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  base: {
    borderRadius: layout.borderRadius.medium,
  },
  default: {
    backgroundColor: colors.background,
  },
  card: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  outlined: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
  },
  padding_small: {
    padding: layout.padding.small,
  },
  padding_medium: {
    padding: layout.padding.medium,
  },
  padding_large: {
    padding: layout.padding.large,
  },
  margin_small: {
    margin: layout.padding.small,
  },
  margin_medium: {
    margin: layout.padding.medium,
  },
  margin_large: {
    margin: layout.padding.large,
  },
  margin_none: {
    margin: 0,
  },
}) as Record<StyleName, any>;

export default Box;
