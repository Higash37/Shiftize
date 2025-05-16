import { TextInputProps, StyleProp, TextStyle } from "react-native";

export interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  helper?: string;
}
