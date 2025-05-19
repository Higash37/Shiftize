import React, { memo, useMemo } from "react";
import { TouchableOpacity, Text, View, StyleSheet } from "react-native";
import { colors } from "@/common/common-theme/ThemeColors";
import { DayComponentProps } from "./types";
import { getDayColor } from "./utils";
import { useResponsiveCalendarSize } from "./constants";

/**
 * カレンダーの日付コンポーネント
 * メモ化して不要な再レンダリングを防止
 */
export const DayComponent = memo<{
  date?: DayComponentProps["date"];
  state?: DayComponentProps["state"];
  marking?: DayComponentProps["marking"];
  onPress: (dateString: string) => void;
}>(({ date, state, marking, onPress }) => {
  // レスポンシブサイズの取得
  const { dayWidth, dayHeight, isSmallScreen } = useResponsiveCalendarSize();

  // スタイルの動的生成
  const dynamicStyles = useMemo(() => {
    return {
      dayContainer: {
        width: dayWidth,
        height: dayHeight,
      },
      selectedDay: {
        borderRadius: Math.min(dayWidth, dayHeight) / 2,
      },
      dayText: {
        fontSize: isSmallScreen ? 12 : 14,
      },
    };
  }, [dayWidth, dayHeight, isSmallScreen]);

  // 選択中の日付かどうか
  const isSelected = marking?.selected;
  // 今日の日付かどうか
  const isToday = state === "today";
  // ドットマーカーの有無
  const hasMarker = marking?.marked;
  // 日付の色を取得
  const dayColor = getDayColor(date?.dateString, state, isSelected);

  return (
    <TouchableOpacity
      style={[
        styles.dayContainer,
        dynamicStyles.dayContainer,
        {
          borderRightWidth: 1,
          borderRightColor: "#E5E5E5",
          borderBottomWidth: 1,
          borderBottomColor: "#E5E5E5",
        },
      ]}
      onPress={() => date && onPress(date.dateString)}
      activeOpacity={0.6}
    >
      {isSelected && (
        <View style={[styles.selectedDay, dynamicStyles.selectedDay]} />
      )}
      <Text
        style={[
          styles.dayText,
          dynamicStyles.dayText,
          { color: dayColor },
          isToday && styles.todayText,
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
  },
  selectedDay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: colors.selected,
  },
  dayText: {
    fontWeight: "bold",
    color: "#333",
    zIndex: 1,
  },
  todayText: {
    color: "#2196F3",
    fontWeight: "bold",
  },
  dot: {
    width: 6, // サイズを少し大きく
    height: 6,
    borderRadius: 3,
    marginTop: 2, // 少し下に
    zIndex: 1,
  },
});
