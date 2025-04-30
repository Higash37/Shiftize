/**
 * 時間フォーマット関連のユーティリティ関数
 */

/**
 * 日付オブジェクトから HH:mm 形式の文字列を生成
 */
export const formatTimeToString = (date: Date): string => {
  return date.toLocaleTimeString("ja-JP", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
};

/**
 * 時間範囲内の時間オプションを生成
 * @param startHour 開始時間（時）
 * @param endHour 終了時間（時）
 * @param interval 間隔（分）
 */
export const generateTimeOptions = (
  startHour: number = 9,
  endHour: number = 22,
  interval: number = 30
): Date[] => {
  const timeOptions: Date[] = [];

  for (let hour = startHour; hour <= endHour; hour++) {
    for (let minute = 0; minute < 60; minute += interval) {
      const time = new Date();
      time.setHours(hour, minute, 0, 0);
      timeOptions.push(time);
    }
  }

  return timeOptions;
};

/**
 * 文字列形式の時間から新しい日付オブジェクトを生成
 */
export const createDateFromTimeString = (
  timeString: string,
  baseDate: Date
): Date => {
  const [hours, minutes] = timeString.split(":").map(Number);
  const newDate = new Date(baseDate);
  newDate.setHours(hours, minutes, 0, 0);
  return newDate;
};
