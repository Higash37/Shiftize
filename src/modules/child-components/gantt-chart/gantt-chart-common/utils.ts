// ガントチャート共通ユーティリティ
// 15分ごとの時間選択リストを生成
export function generateTimeOptions() {
  const options: string[] = [];
  for (let hour = 9; hour <= 22; hour++) {
    options.push(`${hour.toString().padStart(2, "0")}:00`);
    options.push(`${hour.toString().padStart(2, "0")}:15`);
    options.push(`${hour.toString().padStart(2, "0")}:30`);
    options.push(`${hour.toString().padStart(2, "0")}:45`);
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

// 時間(string)→位置(number) - 15分刻みに対応
export function timeToPosition(time: string): number {
  const [hours, minutes] = time.split(":").map(Number);
  // 15分刻みでの位置を計算 (0-51の範囲)
  const totalMinutesFromStart = (hours - 9) * 60 + minutes;
  return totalMinutesFromStart / 15;
}

// 位置(number)→時間(string) - 動的グリッドに対応
export function positionToTime(position: number, timeGrid?: string[]): string {
  if (!timeGrid) {
    // fallback: 15分刻みの従来ロジック
    const totalMinutesFromStart = Math.round(position) * 15;
    const hours = Math.floor(totalMinutesFromStart / 60) + 9;
    const minutes = totalMinutesFromStart % 60;
    return `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}`;
  }

  // 動的グリッドでの位置計算
  const index = Math.floor(position);
  if (index >= 0 && index < timeGrid.length) {
    return timeGrid[index];
  }

  // インデックスが範囲外の場合は最初または最後の時間を返す
  return index < 0 ? timeGrid[0] : timeGrid[timeGrid.length - 1];
}
