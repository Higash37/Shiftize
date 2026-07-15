
import { ViewStyle, Platform } from "react-native";

export type ShadowsType = {
  none: ViewStyle;
  small: ViewStyle;
  medium: ViewStyle;
  large: ViewStyle;
  xlarge: ViewStyle;

  card: ViewStyle;
  header: ViewStyle;
  footer: ViewStyle;
  button: ViewStyle;
  modal: ViewStyle;

  listItem: ViewStyle;
  chip: ViewStyle;
  notification: ViewStyle;
  floatingButton: ViewStyle;

  pressed: ViewStyle;
  elevated: ViewStyle;
};

export const convertShadowForWeb = (_shadowStyle: {
  shadowColor?: string;
  shadowOffset?: { width: number; height: number };
  shadowOpacity?: number;
  shadowRadius?: number;
  elevation?: number;
}): ViewStyle => {
  if (Platform.OS === "web") {
    return { boxShadow: "none" } as ViewStyle;
  }
  return {
    shadowColor: "transparent",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  };
};

const createShadow = (
  _color: string,
  _x: number,
  _y: number,
  _blur: number,
  _opacity: number,
  _elevation: number
): ViewStyle => {
  if (Platform.OS === "web") {
    return { boxShadow: "none" } as ViewStyle;
  }
  return {
    shadowColor: "transparent",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  };
};

export const shadows: ShadowsType = {
  none:
    Platform.OS === "web"
      ? ({ boxShadow: "none" } as ViewStyle)
      : {
          shadowColor: "transparent",
          shadowOffset: { width: 0, height: 0 },
          shadowOpacity: 0,
          shadowRadius: 0,
          elevation: 0,
        },
  small: createShadow("#000", 0, 1, 1, 0.18, 1),
  medium: createShadow("#000", 0, 2, 3.84, 0.25, 3),
  large: createShadow("#000", 0, 4, 4.65, 0.3, 6),
  xlarge: createShadow("#000", 0, 8, 8, 0.35, 10),

  card: createShadow("#000", 0, 2, 8, 0.1, 4),
  header: createShadow("#000", 0, 2, 6, 0.15, 4),
  footer: createShadow("#000", 0, -2, 6, 0.15, 4),
  button: createShadow("#000", 0, 2, 4, 0.12, 2),
  modal: createShadow("#000", 0, 10, 20, 0.25, 15),

  listItem: createShadow("#000", 0, 1, 3, 0.08, 2),
  chip: createShadow("#000", 0, 1, 2, 0.1, 1),
  notification: createShadow("#000", 0, 4, 8, 0.2, 6),
  floatingButton: createShadow("#000", 0, 4, 12, 0.3, 8),

  pressed: createShadow("#000", 0, 1, 2, 0.05, 1),
  elevated: createShadow("#000", 0, 6, 12, 0.25, 8),
};
