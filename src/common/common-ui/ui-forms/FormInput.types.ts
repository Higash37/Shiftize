
import { TextInputProps, StyleProp, TextStyle } from "react-native";
import { BaseComponentProps } from "../componentTypes";

export type InputStyleName =
  | "container"
  | "label"
  | "input"
  | "inputError"
  | "helperText"
  | "errorText";

export interface InputProps
  extends Omit<TextInputProps, "style">,
    BaseComponentProps {

  label?: string;

  error?: string;

  helper?: string;

  labelStyle?: StyleProp<TextStyle>;

  helperStyle?: StyleProp<TextStyle>;
}
