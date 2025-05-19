import { ShiftStatus } from "@/features/shift/types/shift";

export const colors = {
  primary: "#007AFF",
  secondary: "#5856D6",
  background: "#F2F2F7",
  surface: "#FFFFFF",
  text: {
    primary: "#1C1C1E",
    secondary: "#8E8E93",
    white: "#FFFFFF",
    disabled: "#C7C7CC",
  },
  border: "#C7C7CC",
  error: "#FF3B30",
  success: "#34C759",
  warning: "#FF9500",
  selected: "#007AFF",
  shift: {
    available: "#34C759",
    unavailable: "#FF3B30",
    pending: "#FF9500",
    approved: "#007AFF",
    rejected: "#FF3B30",
  },
  // ShiftStatus型に準拠したステータスカラー
  status: {
    draft: "#B0BEC5",
    approved: "#4CAF50",
    pending: "#FFC107",
    deleted: "#F44336",
    rejected: "#EF5350",
    deletion_requested: "#FF7043",
    completed: "#2196F3", // 注: ShiftStatus型に含まれていないが互換性のために残す
  } as Record<ShiftStatus, string> & { completed: string },
};
