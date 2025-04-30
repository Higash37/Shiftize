import { ViewStyle } from "react-native";
import { Size, Variant } from "../types";

// ButtonコンポーネントのProps型定義
export interface ButtonProps {
  onPress: () => void;
  title: string;
  variant?: Extract<Variant, "primary" | "secondary" | "outline">;
  size?: Size;
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  style?: ViewStyle;
}
