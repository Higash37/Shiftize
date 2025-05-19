/**
 * 時間操作に関するユーティリティ関数
 */

/**
 * 開始時間と終了時間から所要時間を計算する
 * @param startTime "HH:mm"形式の開始時間
 * @param endTime "HH:mm"形式の終了時間
 * @returns "X時間Y分"形式の所要時間
 */
export const calculateDuration = (
  startTime: string,
  endTime: string
): string => {
  if (!startTime || !endTime) return "0時間";

  const [startHour, startMinute] = startTime.split(":").map(Number);
  const [endHour, endMinute] = endTime.split(":").map(Number);

  let durationMinutes =
    endHour * 60 + endMinute - (startHour * 60 + startMinute);

  // 日をまたぐ場合の処理
  if (durationMinutes < 0) {
    durationMinutes += 24 * 60;
  }

  const hours = Math.floor(durationMinutes / 60);
  const minutes = durationMinutes % 60;

  if (minutes === 0) {
    return `${hours}時間`;
  }
  return `${hours}時間${minutes}分`;
};

/**
 * 時間を分に変換する
 * @param time "HH:mm"形式の時間
 * @returns 分単位の時間
 */
export const timeToMinutes = (time: string): number => {
  if (!time) return 0;
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
};

/**
 * 分を時間形式に変換する
 * @param minutes 分単位の時間
 * @returns "HH:mm"形式の時間
 */
export const minutesToTime = (minutes: number): string => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours.toString().padStart(2, "0")}:${mins
    .toString()
    .padStart(2, "0")}`;
};

/**
 * 時間が範囲内にあるかチェックする
 * @param time 確認する時間 "HH:mm"
 * @param start 開始時間 "HH:mm"
 * @param end 終了時間 "HH:mm"
 * @returns 範囲内の場合 true
 */
export const isTimeInRange = (
  time: string,
  start: string,
  end: string
): boolean => {
  const timeMinutes = timeToMinutes(time);
  const startMinutes = timeToMinutes(start);
  const endMinutes = timeToMinutes(end);

  // 日をまたぐ場合の処理
  if (startMinutes > endMinutes) {
    return timeMinutes >= startMinutes || timeMinutes <= endMinutes;
  }

  return timeMinutes >= startMinutes && timeMinutes <= endMinutes;
};

/**
 * 時間の重複をチェックする
 * @param timeRange1 [開始時間, 終了時間]
 * @param timeRange2 [開始時間, 終了時間]
 * @returns 重複する場合 true
 */
export const doTimesOverlap = (
  timeRange1: [string, string],
  timeRange2: [string, string]
): boolean => {
  const [start1, end1] = timeRange1;
  const [start2, end2] = timeRange2;

  const start1Minutes = timeToMinutes(start1);
  const end1Minutes = timeToMinutes(end1);
  const start2Minutes = timeToMinutes(start2);
  const end2Minutes = timeToMinutes(end2);

  // 日をまたぐ場合の特別処理
  if (start1Minutes > end1Minutes && start2Minutes > end2Minutes) {
    // 両方とも日をまたぐ場合は必ず重複
    return true;
  } else if (start1Minutes > end1Minutes) {
    // timeRange1が日をまたぐ場合
    return !(end2Minutes <= start1Minutes && start2Minutes >= end1Minutes);
  } else if (start2Minutes > end2Minutes) {
    // timeRange2が日をまたぐ場合
    return !(end1Minutes <= start2Minutes && start1Minutes >= end2Minutes);
  }

  // 通常の重複チェック
  return start1Minutes < end2Minutes && start2Minutes < end1Minutes;
};

/**
 * 時間を30分単位に丸める
 * @param time "HH:mm"形式の時間
 * @param roundUp 切り上げる場合true、切り捨てる場合false
 * @returns 丸められた"HH:mm"形式の時間
 */
export const roundToNearestHalfHour = (
  time: string,
  roundUp: boolean = false
): string => {
  const [hours, minutes] = time.split(":").map(Number);
  const totalMinutes = hours * 60 + minutes;

  const remainder = totalMinutes % 30;
  const roundedMinutes =
    roundUp && remainder > 0
      ? totalMinutes + (30 - remainder)
      : totalMinutes - remainder;

  return minutesToTime(roundedMinutes);
};
