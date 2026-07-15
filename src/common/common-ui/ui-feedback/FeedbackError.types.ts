
import { StyleProp, TextStyle } from "react-native";
import { BaseComponentProps } from "../componentTypes";

export interface ErrorMessageProps extends BaseComponentProps {

  message?: string;

  textStyle?: StyleProp<TextStyle>;
}
