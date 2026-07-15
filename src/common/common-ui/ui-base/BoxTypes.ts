
import { ViewProps } from "react-native";
import {
  Shadow,
  Variant,
  Padding,
  Margin,
  FlexContainerProps,
  BaseComponentProps,
} from "../componentTypes";

export type BoxStyleName =
  | Variant
  | `padding_${Padding}`
  | `margin_${Margin}`
  | `shadow_${Shadow}`
  | "base";

export interface BoxProps extends Omit<ViewProps, 'style'>, FlexContainerProps, BaseComponentProps {

  variant?: Variant;

  padding?: Padding;

  margin?: Margin;

  shadow?: Shadow;

  children?: React.ReactNode;
}
