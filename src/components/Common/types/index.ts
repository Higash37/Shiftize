import { ViewStyle, TextStyle } from "react-native";

// 共通の型定義
export type Size = "small" | "medium" | "large";
export type Variant =
  | "primary"
  | "secondary"
  | "outline"
  | "default"
  | "card"
  | "outlined";
export type Padding = "small" | "medium" | "large";
export type Margin = "small" | "medium" | "large" | "none";
export type Shadow = "none" | "small" | "medium";

// スタイル名の型定義
export type BoxStyleName =
  | Variant
  | "base"
  | `padding_${Padding}`
  | `margin_${Margin}`;
export type ButtonStyleName =
  | "base"
  | Variant
  | `size_${Size}`
  | `text_${Variant}`
  | `text_${Size}`
  | "fullWidth"
  | "disabled"
  | "text";
