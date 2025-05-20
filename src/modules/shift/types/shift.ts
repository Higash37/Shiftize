import { useShift } from "@/modules/shift/hooks/useShift";
import {
  ShiftStatus,
  RecurringSettings,
  ShiftData,
  ShiftItem,
  Shift,
  ShiftStatusConfig,
  DEFAULT_SHIFT_STATUS_CONFIG,
  ClassTimeSlot,
} from "@/common/common-models/ModelIndex";

// モジュール固有の追加型定義をここに記述
// 将来的に必要な場合はここに追加

// 共通型をエクスポート
export type {
  ShiftStatus,
  RecurringSettings,
  ShiftData,
  ShiftItem,
  Shift,
  ShiftStatusConfig,
  ClassTimeSlot,
};

// 共通定数をエクスポート
export { DEFAULT_SHIFT_STATUS_CONFIG };
