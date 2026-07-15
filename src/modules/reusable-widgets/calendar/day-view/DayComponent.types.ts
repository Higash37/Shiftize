

import { TextStyle, ViewStyle } from "react-native";
import { DayComponentProps } from "../calendar-types/common.types";

export interface DayComponentPropsExtended {
  date?: DayComponentProps["date"];
  state?: DayComponentProps["state"];
  marking?: DayComponentProps["marking"];
  onPress: (dateString: string) => void;
  responsiveSize?: any;
}

export interface DynamicStyles {
  dayContainer: ViewStyle;
  selectedDay: ViewStyle;
  dayText: TextStyle;
}
