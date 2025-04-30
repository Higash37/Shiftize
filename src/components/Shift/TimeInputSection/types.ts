import { ViewStyle, TextStyle } from "react-native";

export type TimeSlot = {
  start: string;
  end: string;
};

export interface TimeInputSectionProps {
  value: TimeSlot[];
  onChange: (newValue: TimeSlot[]) => void;
}

export interface TimeInputSectionStyles {
  container: ViewStyle;
  label: TextStyle;
  timeContainer: ViewStyle;
  timeInput: ViewStyle;
  timeLabel: TextStyle;
  separator: TextStyle;
  timeButton: ViewStyle;
  timeButtonText: TextStyle;
  pickerContainer: ViewStyle;
  pickerHeader: ViewStyle;
  pickerCancelText: TextStyle;
  pickerDoneText: TextStyle;
  picker: ViewStyle;
}
