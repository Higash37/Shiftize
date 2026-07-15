

import { ViewStyle, TextStyle } from "react-native";

export type TimeSlot = {
  start: string;
  end: string;
};

export type ClassTimeSlot = {
  startTime: string;
  endTime: string;
  id?: string;
};

export type ShiftType = "user" | "class" | "deleted";

export interface BaseShiftStyles {
  container: ViewStyle;
  label?: TextStyle;
  timeContainer?: ViewStyle;
  timeText?: TextStyle;
}

export interface BaseTimePickerProps {
  value?: string;
  onChange?: (time: string) => void;
  label?: string;
}
