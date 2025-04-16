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

// プラットフォーム固有のシャドウスタイルを生成するヘルパー関数
import { Platform } from "react-native";

export const getPlatformShadow = (elevation: number = 2) => {
  if (Platform.OS === "web") {
    return {
      boxShadow: `0px ${elevation}px ${elevation * 2}px rgba(0, 0, 0, 0.1)`,
    };
  }
  return {
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: elevation,
    },
    shadowOpacity: 0.1,
    shadowRadius: elevation,
    elevation,
  };
};
