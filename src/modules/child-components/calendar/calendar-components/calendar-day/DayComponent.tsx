import React, { memo, useMemo } from "react";
import { TouchableOpacity, Text, View, StyleSheet } from "react-native";
import { colors } from "@/common/common-theme/ThemeColors";
import { DayComponentProps } from "../../calendar-types/common.types";
import { getDayColor } from "../../calendar-utils/calendar.utils";
import {
  useResponsiveCalendarSize,
  HOLIDAYS,
} from "../../calendar-constants/constants";

/**
 * カレンダーの日付コンポーネント
 * メモ化して不要な再レンダリングを防止
 */
// iOSカレンダー風：曜日ごとに色分け
function getIOSDayColor(
  dateString?: string,
  state?: string,
  isSelected?: boolean
) {
  if (!dateString) return colors.text.primary;
  const day = new Date(dateString).getDay();
  if (isSelected) return "#fff";
  if (state === "disabled") return "#C0C0C0";
  if (state === "today") return colors.primary;
  // 祝日チェックを追加
  if (HOLIDAYS[dateString]) return "#FF3B30"; // 祝日:赤
  if (day === 0) return "#FF3B30"; // 日曜:赤
  if (day === 6) return "#007AFF"; // 土曜:青
  return "#222"; // 平日:濃いグレー
}

export const DayComponent = memo<{
  date?: DayComponentProps["date"];
  state?: DayComponentProps["state"];
  marking?: DayComponentProps["marking"];
  onPress: (dateString: string) => void;
  responsiveSize?: any;
}>(({ date, state, marking, onPress, responsiveSize }) => {
  // レスポンシブサイズの取得
  const { dayWidth, dayHeight, isSmallScreen } = useResponsiveCalendarSize(); // スタイルの動的生成
  const dynamicStyles = useMemo(() => {
    return {
      dayContainer: {
        width: dayWidth,
        height: dayHeight,
        padding: 0, // パディングを0に設定して余白をなくす
      },
      selectedDay: {
        borderRadius: Math.min(dayWidth, dayHeight) / 2,
      },
      dayText: {
        fontSize: isSmallScreen ? 12 : 14, // フォントサイズをさらに小さく
        letterSpacing: -1.0, // 文字間隔を狭める
        ...(responsiveSize?.day || {}),
      },
    };
  }, [dayWidth, dayHeight, isSmallScreen, responsiveSize]);

  // 選択中の日付かどうか
  const isSelected = marking?.selected;
  // 今日の日付かどうか
  const isToday = state === "today";
  // ドットマーカーの有無
  const hasMarker = marking?.marked;
  // 日付の色を取得（iOS風）
  const dayColor = getIOSDayColor(date?.dateString, state, isSelected);

  return (
    <TouchableOpacity
      style={[
        styles.dayContainer,
        dynamicStyles.dayContainer,
        {
          // 最左列（日曜）は縦線なし、それ以外は縦線
          borderLeftWidth:
            date && date.dateString && new Date(date.dateString).getDay() === 0
              ? 0
              : 1,
          borderLeftColor: "#E5E5E5",
          borderRightWidth: 0,
          borderBottomWidth: 0,
          borderRadius: 0,
          backgroundColor: isSelected ? "#007AFF" : "transparent",
        },
      ]}
      onPress={() => date && onPress(date.dateString)}
      activeOpacity={isSelected ? 0.8 : 0.6} // iOS風にやや弱め
    >
      <Text
        style={[
          styles.dayText,
          dynamicStyles.dayText,
          {
            color: isSelected ? "#fff" : dayColor,
            fontFamily:
              "SF Pro Text, San Francisco, Helvetica Neue, Arial, sans-serif",
            fontWeight: isToday ? "700" : "500",
            fontSize: isToday ? 16 : 14,
            backgroundColor: isToday && !isSelected ? "#F2F6FF" : "transparent", // 今日のセルを淡色でハイライト
            borderRadius: 8,
            paddingHorizontal: 2,
            paddingVertical: 1,
          },
        ]}
      >
        {date?.day}
      </Text>
      {hasMarker && <View style={[styles.dot, marking.dotStyle]} />}
    </TouchableOpacity>
  );
});

const styles = StyleSheet.create({
  dayContainer: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "transparent",
    position: "relative",
    paddingVertical: 0,
    paddingHorizontal: 0,
    borderRadius: 0,
    margin: 0, // 隙間を完全になくす
  },
  dayText: {
    fontWeight: "500",
    color: "#222",
    zIndex: 1,
    margin: 0,
    fontFamily: "SF Pro Text, San Francisco, Helvetica Neue, Arial, sans-serif",
  },
  todayText: {
    color: "#007AFF",
    fontWeight: "700",
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginTop: 2,
    zIndex: 1,
  },
  selectedDay: {
    // 旧selectedDayは不要
  },
});
