// ガントチャートの時間関連のユーティリティ関数

/**
 * 30分ごとの時間選択リストを生成
 * @returns 9:00〜22:30までの30分間隔の時間オプション配列
 */
export function generateTimeOptions(): string[] {
  const options = [];
  for (let hour = 9; hour <= 22; hour++) {
    options.push(`${hour.toString().padStart(2, "0")}:00`);
    options.push(`${hour.toString().padStart(2, "0")}:30`);
  }
  return options;
}

/**
 * 1時間ごとのラベルを生成（9:00〜22:00）
 */
export const hourLabels = Array.from({ length: 22 - 9 + 1 }, (_, i) => {
  const hour = 9 + i;
  return `${hour}:00`;
});

/**
 * 30分ごとのライン位置を生成（9:00〜22:30）
 */
export const halfHourLines = Array.from(
  { length: (22 - 9) * 2 + 1 },
  (_, i) => {
    const hour = 9 + Math.floor(i / 2);
    const min = i % 2 === 0 ? "00" : "30";
    return `${hour}:${min}`;
  }
);

/**
 * 時間文字列を位置に変換
 * @param time 時間文字列 (例: "10:30")
 * @returns 相対位置 (9:00を0とする)
 */
export function timeToPosition(time: string): number {
  const [hours, minutes] = time.split(":").map(Number);
  return hours - 9 + minutes / 60;
}

/**
 * 位置を時間文字列に変換
 * @param position 相対位置 (9:00を0とする)
 * @returns 時間文字列 (例: "10:30")
 */
export function positionToTime(position: number): string {
  const hours = Math.floor(position) + 9;
  const minutes = Math.floor((position % 1) * 60);
  return `${hours.toString().padStart(2, "0")}:${minutes
    .toString()
    .padStart(2, "0")}`;
}
