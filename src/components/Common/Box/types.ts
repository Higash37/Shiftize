import { ViewProps } from "react-native";
import { Shadow, Variant, Padding, Margin } from "../types";

export interface BoxProps extends ViewProps {
  variant?: Variant;
  padding?: Padding;
  margin?: Margin;
  shadow?: Shadow;
}
