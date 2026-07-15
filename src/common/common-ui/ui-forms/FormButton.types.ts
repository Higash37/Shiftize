
import { Size, BaseComponentProps } from "../componentTypes";

export type ButtonVariant = "primary" | "secondary" | "outline" | "text";

export type ButtonStyleName =
  | ButtonVariant
  | `size_${Size}`
  | `text_${ButtonVariant}`
  | `text_${Size}`
  | "base"
  | "text_base"
  | "fullWidth"
  | "disabled";

export interface ButtonProps extends BaseComponentProps {

  onPress: () => void;

  title: string;

  variant?: ButtonVariant;

  size?: Size;

  disabled?: boolean;

  loading?: boolean;

  fullWidth?: boolean;
}
