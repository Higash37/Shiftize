import { ViewStyle, TextStyle } from "react-native";

/**
 * 基本的なUIコンポーネントのプロパティ
 */
export interface BaseUIProps {
  testID?: string;
  style?: ViewStyle;
}

/**
 * 入力系コンポーネントの基本プロパティ
 */
export interface BaseInputProps extends BaseUIProps {
  label?: string;
  error?: string;
  disabled?: boolean;
  onChange?: (value: any) => void;
  value?: any;
}

/**
 * 時間関連コンポーネントの基本プロパティ
 */
export interface BaseTimeProps extends BaseInputProps {
  timeFormat?: "24h" | "12h";
  minuteInterval?: 5 | 10 | 15 | 30;
}

/**
 * カレンダー関連コンポーネントの基本プロパティ
 */
export interface BaseCalendarProps extends BaseUIProps {
  selectedDates?: string[];
  onDateSelect?: (date: string) => void;
  minDate?: string;
  maxDate?: string;
}

/**
 * 共通スタイル定義
 */
export interface BaseStyles {
  container: ViewStyle;
  content?: ViewStyle;
  title?: TextStyle;
  label?: TextStyle;
  input?: ViewStyle;
  error?: TextStyle;
}
