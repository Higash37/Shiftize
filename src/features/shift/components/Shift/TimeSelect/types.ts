import { ViewStyle, TextStyle } from "react-native";

export interface TimeSelectProps {
  label?: string;
  value?: string;
  onChange?: (time: string) => void;
  startTime?: string;
  endTime?: string;
  onStartTimeChange?: (time: string) => void;
  onEndTimeChange?: (time: string) => void;
  zIndex?: number;
}

export interface TimeSelectStyles {
  container: ViewStyle;
  timeContainer: ViewStyle;
  timeSelect: ViewStyle;
  label: TextStyle;
  button: ViewStyle;
  buttonText: TextStyle;
  modalOverlay: ViewStyle;
  modalContent: ViewStyle;
  optionsContainer: ViewStyle;
  scrollContainer: ViewStyle;
  optionItem: ViewStyle;
  selectedOption: ViewStyle;
  optionText: TextStyle;
  selectedOptionText: TextStyle;
}
