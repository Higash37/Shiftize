/**
 * コンポーネント共通の型定義
 */
import { ViewStyle, TextStyle } from "react-native";

/**
 * サイズバリエーション
 */
export type Size = "small" | "medium" | "large" | "compact";

/**
 * スタイルバリエーション
 */
export type Variant =
  | "primary"
  | "secondary"
  | "outline"
  | "outlined"
  | "default"
  | "card";

/**
 * パディングサイズ
 */
export type Padding = "small" | "medium" | "large" | "none";

/**
 * マージンサイズ
 */
export type Margin = "small" | "medium" | "large" | "none";

/**
 * 影の強さ
 */
export type Shadow = "none" | "small" | "medium" | "large";

/**
 * 配置位置
 */
export type Alignment =
  | "start"
  | "center"
  | "end"
  | "between"
  | "around"
  | "evenly";

/**
 * 方向
 */
export type Direction = "row" | "column";

/**
 * フレックスコンテナプロパティ
 */
export interface FlexContainerProps {
  /**
   * フレックスの方向
   */
  direction?: Direction;

  /**
   * 横方向の配置
   */
  justify?: Alignment;

  /**
   * 縦方向の配置
   */
  align?: Alignment;

  /**
   * フレックスラップ
   */
  wrap?: "wrap" | "nowrap" | "wrap-reverse";

  /**
   * フレックス値
   */
  flex?: number;

  /**
   * アイテム間のギャップ
   */
  gap?: number;
}

/**
 * 基本コンポーネントプロパティ
 */
export interface BaseComponentProps {
  /**
   * スタイルのオーバーライド
   */
  style?: any;

  /**
   * テスト用ID
   */
  testID?: string;
}
