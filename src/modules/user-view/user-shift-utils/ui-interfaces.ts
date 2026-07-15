
import { ViewStyle, TextStyle } from "react-native";

export interface BaseUIProps {
  testID?: string;
  style?: ViewStyle;
}

export interface BaseInputProps<T = string> extends BaseUIProps {
  label?: string;
  error?: string;
  disabled?: boolean;
  onChange?: (value: T) => void;
  value?: T;
}

export interface BaseTimeProps<T = string> extends BaseInputProps<T> {
  timeFormat?: "24h" | "12h";
  minuteInterval?: 5 | 10 | 15 | 30;
}

export interface BaseCalendarProps extends BaseUIProps {
  selectedDates?: string[];
  onDateSelect?: (date: string) => void;
  minDate?: string;
  maxDate?: string;
}

export interface BaseStyles {
  container: ViewStyle;
  content?: ViewStyle;
  title?: TextStyle;
  label?: TextStyle;
  input?: ViewStyle;
  error?: TextStyle;
}
