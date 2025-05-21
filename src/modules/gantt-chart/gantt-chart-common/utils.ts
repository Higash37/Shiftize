// ガントチャート共通ユーティリティ
// 30分ごとの時間選択リストを生成
export function generateTimeOptions() {
  const options: string[] = [];
  for (let hour = 9; hour <= 22; hour++) {
    options.push(`${hour.toString().padStart(2, "0")}:00`);
    options.push(`${hour.toString().padStart(2, "0")}:30`);
  }
  return options;
}

// シフトの重なりをグループ化（1人1行表示のため、各シフトを別グループに）
import { ShiftItem } from "@/common/common-models/ModelIndex";
export function groupShiftsByOverlap(shifts: ShiftItem[]): ShiftItem[][] {
  if (!shifts || shifts.length === 0) return [];
  return shifts
    .sort((a, b) => a.startTime.localeCompare(b.startTime))
    .map((shift) => [shift]);
}
