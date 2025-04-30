import { ShiftStatus } from "@/types/shift";
import { colors } from "@/theme/colors";
import { HOLIDAYS } from "./constants";

// ステータスのテキストを取得する関数
export const getStatusText = (status: ShiftStatus) => {
  switch (status) {
    case "draft":
      return "下書き";
    case "pending":
      return "申請中";
    case "approved":
      return "承認済";
    case "completed":
      return "完了";
    case "deleted":
      return "削除済";
    default:
      return "";
  }
};

// ステータスに基づく色を取得する関数
export const getStatusColor = (status: ShiftStatus) => {
  switch (status) {
    case "draft":
      return "#B0BEC5"; // 灰色
    case "approved":
      return "#4CAF50"; // 緑色
    case "pending":
      return "#FFC107"; // 黄色
    case "deleted":
      return "#F44336"; // 赤色
    default:
      return "#9E9E9E"; // デフォルトの灰色
  }
};

// 日付の色を判定する関数
export const getDayColor = (
  date: string | undefined,
  state?: string,
  isSelected?: boolean
) => {
  if (!date || state === "disabled") return "#d9e1e8";

  const day = new Date(date).getDay();
  if (day === 0 || HOLIDAYS[date]) return "#f44336"; // 日曜日または祝日は常に赤色
  if (state === "today") return "#2196F3"; // 今日の日付は青色
  return colors.text.primary; // その他の日付
};
