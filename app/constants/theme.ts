import { ShiftStatus } from "@/types/shift";

type Colors = {
  primary: string;
  secondary: string;
  background: string;
  surface: string;
  text: {
    primary: string;
    secondary: string;
    white: string;
    disabled: string;
  };
  border: string;
  error: string;
  success: string;
  warning: string;
  selected: string;
  shift: Record<ShiftStatus, string>;
};

export const colors: Colors = {
  primary: "#1DA1F2", // メインカラー（トライワークスブルー）
  secondary: "#657786", // サブカラー
  background: "#FFFFFF", // 背景色
  surface: "#F5F8FA", // カード背景色
  text: {
    primary: "#14171A", // メインテキスト
    secondary: "#657786", // サブテキスト
    white: "#FFFFFF", // 白テキスト
    disabled: "#AAB8C2", // 無効テキスト
  },
  border: "#E1E8ED", // ボーダー
  error: "#E0245E", // エラー
  success: "#17BF63", // 成功
  warning: "#FFAD1F", // 警告
  selected: "#E3F2FD",
  shift: {
    draft: "#9E9E9E", // 灰色 - 下書き
    pending: "#FFA726", // 黄 - 変更申請中
    approved: "#66BB6A", // 緑 - 実施済み
    rejected: "#EF5350", // 赤 - 削除済み
    deleted: "#B0BEC5", // 青 - 承認済み（未完了）
    completed: "#42A5F5",
  },
};

export const shadows = {
  small: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.18,
    shadowRadius: 1.0,
  },
  medium: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
};

export const layout = {
  padding: {
    small: 8,
    medium: 16,
    large: 24,
  },
  borderRadius: {
    small: 4,
    medium: 8,
    large: 12,
  },
};

export const typography = {
  fontSize: {
    small: 12,
    medium: 14,
    large: 16,
    xlarge: 18,
    xxlarge: 24,
  },
  fontWeight: {
    regular: "400",
    medium: "500",
    bold: "700",
  },
};
