

export type Size = "small" | "medium" | "large" | "compact";

export type Variant =
  | "primary"
  | "secondary"
  | "outline"
  | "outlined"
  | "default"
  | "card"
  | "surface"
  | "surfaceContainer"
  | "surfaceContainerHigh"
  | "surfaceContainerLow";

export type Padding = "small" | "medium" | "large" | "none";

export type Margin = "small" | "medium" | "large" | "none";

export type Shadow = "none" | "small" | "medium" | "large";

export type JustifyContent =
  | "start"
  | "center"
  | "end"
  | "between"
  | "around"
  | "evenly";

export type AlignItems = "start" | "center" | "end" | "stretch" | "baseline";

export type Direction = "row" | "column";

export interface FlexContainerProps {

  direction?: Direction;

  justify?: JustifyContent;

  align?: AlignItems;

  wrap?: "wrap" | "nowrap" | "wrap-reverse";

  flex?: number;

  gap?: number;
}

export interface BaseComponentProps {

  style?: any;

  testID?: string | undefined;
}
