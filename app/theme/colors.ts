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
  status: Record<ShiftStatus, string>;
};

export const colors: Colors = {
  primary: "#007AFF",
  secondary: "#5856D6",
  background: "#FFFFFF",
  surface: "#FFFFFF",
  text: {
    primary: "#000000",
    secondary: "#8E8E93",
    white: "#FFFFFF",
    disabled: "#C7C7CC",
  },
  border: "#C6C6C8",
  error: "#FF3B30",
  success: "#34C759",
  warning: "#FF9500",
  selected: "#E3F2FD",
  shift: {
    draft: "#9E9E9E",
    pending: "#FFA726",
    approved: "#66BB6A",
    rejected: "#EF5350",
    deleted: "#B0BEC5",
    completed: "#42A5F5",
  },
  status: {
    draft: "#B0BEC5", // 灰色
    approved: "#4CAF50", // 緑色
    pending: "#FFC107", // 黄色
    deleted: "#F44336", // 赤色
    completed: "#2196F3", // 青色
    rejected: "#EF5350", // 赤色
  },
};
