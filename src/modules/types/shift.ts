/**
 * @deprecated このファイルは今後削除される予定です。
 * 代わりに @/common/common-models/ModelIndex から直接インポートしてください。
 * 例: import { Shift, ShiftStatus } from "@/common/common-models/ModelIndex";
 *
 * このファイルは共通モデルへの橋渡し役でしたが、今後は不要になります。
 * モジュール固有の型定義が必要な場合は別のファイルを作成してください。
 * 基本的なシフト関連の型定義は @/common/common-models/model-shift/shiftTypes.ts に定義されています。
 */

import {
  ShiftStatus,
  RecurringSettings,
  ShiftData,
  ShiftItem,
  Shift,
  ShiftStatusConfig,
  DEFAULT_SHIFT_STATUS_CONFIG,
  ClassTimeSlot,
  TimeSlot,
  ShiftType,
  BaseShift,
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
  TimeSlot,
  ShiftType,
  BaseShift,
};

// 共通定数をエクスポート
export { DEFAULT_SHIFT_STATUS_CONFIG };
