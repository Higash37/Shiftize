import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  GestureResponderEvent,
} from "react-native";
import { format } from "date-fns";
import { ja } from "date-fns/locale";
import { ShiftItem } from "@/common/common-models/ModelIndex";
import { ShiftStatusConfig } from "../gantt-chart-types/GanttChartTypes";
import CustomScrollView from "@/common/common-ui/ui-scroll/ScrollViewComponent";
import { Ionicons } from "@expo/vector-icons";

// --- DateCell ---
export type DateCellProps = {
  date: string;
  dateColumnWidth: number;
  styles: any;
};
export const DateCell: React.FC<DateCellProps> = ({
  date,
  dateColumnWidth,
  styles,
}) => {
  const formattedDate = new Date(date);
  const dayOfWeek = format(formattedDate, "E", { locale: ja });
  const dayOfMonth = format(formattedDate, "d");
  const isWeekend = dayOfWeek === "土" || dayOfWeek === "日";
  const textColor = isWeekend
    ? dayOfWeek === "土"
      ? "#0000FF"
      : "#FF0000"
    : "#000000";
  return (
    <View style={[styles.dateCell, { width: dateColumnWidth }]}>
      <Text style={[styles.dateDayText, { color: textColor }]}>
        {dayOfMonth}
      </Text>
      <Text style={[styles.dateWeekText, { color: textColor }]}>
        {dayOfWeek}
      </Text>
    </View>
  );
};

// --- GanttChartGrid ---
export type GanttChartGridProps = {
  shifts: ShiftItem[];
  cellWidth: number;
  ganttColumnWidth: number;
  halfHourLines: string[];
  isClassTime: (time: string) => boolean;
  getStatusConfig: (status: string) => ShiftStatusConfig;
  onShiftPress?: (shift: ShiftItem) => void;
  onBackgroundPress?: (x: number) => void;
  onTimeChange?: (
    shiftId: string,
    newStartTime: string,
    newEndTime: string
  ) => void;
  styles: any;
  userColorsMap: Record<string, string>;
  getTimeWidth?: (time: string) => number; // 動的幅計算用
};
export const GanttChartGrid: React.FC<GanttChartGridProps> = ({
  shifts,
  cellWidth,
  ganttColumnWidth,
  halfHourLines,
  isClassTime,
  getStatusConfig,
  onShiftPress,
  onBackgroundPress,
  onTimeChange,
  styles,
  userColorsMap,
  getTimeWidth,
}) => {
  // 動的時間位置の計算
  function timeToPosition(time: string): number {
    let position = 0;
    const [targetHour, targetMin] = time.split(":").map(Number);
    const targetMinutes = targetHour * 60 + targetMin;

    for (let i = 0; i < halfHourLines.length; i++) {
      const [hour, min] = halfHourLines[i].split(":").map(Number);
      const currentMinutes = hour * 60 + min;

      if (currentMinutes >= targetMinutes) {
        // 目標時間に到達または超えた場合
        if (currentMinutes === targetMinutes) {
          return position; // 正確に一致
        } else {
          // 前の時間からの補間計算
          const prevMinutes =
            i > 0
              ? (() => {
                  const [prevHour, prevMin] = halfHourLines[i - 1]
                    .split(":")
                    .map(Number);
                  return prevHour * 60 + prevMin;
                })()
              : currentMinutes;
          const ratio =
            (targetMinutes - prevMinutes) / (currentMinutes - prevMinutes);
          const prevPosition =
            i > 0
              ? position -
                (getTimeWidth ? getTimeWidth(halfHourLines[i]) : cellWidth)
              : 0;
          return (
            prevPosition +
            ratio * (getTimeWidth ? getTimeWidth(halfHourLines[i]) : cellWidth)
          );
        }
      }
      position += getTimeWidth ? getTimeWidth(halfHourLines[i]) : cellWidth;
    }
    return position;
  }

  // 位置から時間への逆変換関数
  function positionToTime(position: number): string {
    let currentPosition = 0;

    for (let i = 0; i < halfHourLines.length; i++) {
      const currentWidth = getTimeWidth
        ? getTimeWidth(halfHourLines[i])
        : cellWidth;
      const nextPosition = currentPosition + currentWidth;

      if (position <= nextPosition) {
        // この時間範囲内に位置がある
        const [hour, min] = halfHourLines[i].split(":").map(Number);
        const baseMinutes = hour * 60 + min;

        if (position <= currentPosition) {
          // 現在の時間ポイント
          return halfHourLines[i];
        } else {
          // 時間範囲内での補間
          const ratio = (position - currentPosition) / currentWidth;
          const intervalMinutes = 30; // 30分間隔
          const additionalMinutes = Math.round(ratio * intervalMinutes);
          const totalMinutes = baseMinutes + additionalMinutes;

          const newHour = Math.floor(totalMinutes / 60);
          const newMin = totalMinutes % 60;

          return `${newHour.toString().padStart(2, "0")}:${newMin
            .toString()
            .padStart(2, "0")}`;
        }
      }

      currentPosition = nextPosition;
    }

    // 範囲外の場合は最後の時間を返す
    return halfHourLines[halfHourLines.length - 1];
  }

  return (
    <View
      style={[styles.ganttCell, { width: ganttColumnWidth, height: "100%" }]}
    >
      {/* グリッド全体をタップ可能にする（View/編集共通） */}
      <TouchableOpacity
        style={[StyleSheet.absoluteFill, { zIndex: 1 }]}
        onPress={(e) => {
          if (onBackgroundPress) {
            const x = e.nativeEvent.locationX;
            onBackgroundPress(x);
          }
        }}
        activeOpacity={0.7}
      />
      <View style={styles.ganttBgRow}>
        {halfHourLines.map((t, i) => {
          const currentWidth = getTimeWidth ? getTimeWidth(t) : cellWidth;
          const isHourMark = t.endsWith(":00");
          return (
            <View
              key={t}
              style={[
                styles.ganttBgCell,
                isClassTime(t) && styles.classTimeCell,
                {
                  width: currentWidth,
                  borderRightWidth: isHourMark ? 1 : 0.5,
                },
              ]}
            />
          );
        })}
      </View>
      {/* 授業時間バー（クラスバー）を先に描画し、zIndexでシフトバーより上に */}
      {shifts.map((shift, index) => {
        const classes = shift.classes ?? [];
        if (classes.length === 0) return null;
        return classes.map((classTime, cidx) => {
          const startPos = timeToPosition(classTime.startTime);
          const endPos = timeToPosition(classTime.endTime);
          const barWidth = endPos - startPos;
          const totalShifts = shifts.length;
          const cellHeight = 65;
          let singleBarHeight;
          let barVerticalOffset;
          if (totalShifts === 1) {
            singleBarHeight = cellHeight;
            barVerticalOffset = 0;
          } else {
            singleBarHeight = Math.floor(cellHeight / Math.min(totalShifts, 3));
            barVerticalOffset = index * singleBarHeight;
          }
          return (
            <View
              key={shift.id + "-class-" + cidx}
              style={[
                styles.classBar,
                {
                  left: startPos,
                  width: Math.max(barWidth, 20), // 最小幅20px
                  height: singleBarHeight,
                  top: barVerticalOffset,
                },
              ]}
            />
          );
        });
      })}
      {/* シフトバー */}
      {shifts.map((shift, index) => {
        const statusConfig = getStatusConfig(shift.status);
        const startPos = timeToPosition(shift.startTime);
        const endPos = timeToPosition(shift.endTime);
        const barWidth = endPos - startPos;
        const totalShifts = shifts.length;
        const cellHeight = 65;
        let singleBarHeight;
        let barVerticalOffset;
        if (totalShifts === 1) {
          singleBarHeight = cellHeight;
          barVerticalOffset = 0;
        } else {
          singleBarHeight = Math.floor(cellHeight / Math.min(totalShifts, 3));
          barVerticalOffset = index * singleBarHeight;
        }
        // ユーザー色を取得（なければステータス色）
        const userColor = userColorsMap?.[shift.userId] || statusConfig.color;

        // 従来のタッチ可能なシフトバー（読み取り専用）
        return (
          <TouchableOpacity
            key={shift.id}
            style={[
              styles.shiftBar,
              {
                left: startPos,
                width: Math.max(barWidth, 30), // 最小幅30px
                height: singleBarHeight,
                top: barVerticalOffset,
                backgroundColor: userColor,
                opacity:
                  shift.status === "deleted" ||
                  shift.status === "deletion_requested"
                    ? 0.5
                    : 1,
                zIndex: 2, // シフトバーはグリッド全体より前面
              },
            ]}
            onPress={() => onShiftPress?.(shift)}
          >
            <View
              style={{
                width: "100%",
                height: "100%",
                justifyContent: "center",
                alignItems: "center",
                paddingHorizontal: 4,
                flexDirection: "column",
              }}
            >
              <Text style={styles.shiftBarText} numberOfLines={1}>
                {shift.nickname}
              </Text>
              <Text style={styles.shiftTimeText} numberOfLines={1}>
                {shift.startTime}～{shift.endTime}
              </Text>
            </View>
          </TouchableOpacity>
        );
      })}
      {/* --- 授業時間バー（classTime）を追加 --- */}
    </View>
  );
};

// --- GanttChartInfo ---
export type GanttChartInfoProps = {
  shifts: ShiftItem[];
  getStatusConfig: (status: string) => ShiftStatusConfig;
  onShiftPress?: (shift: ShiftItem) => void;
  onDelete: (shift: ShiftItem) => void;
  infoColumnWidth: number;
  styles: any;
};
export const GanttChartInfo: React.FC<GanttChartInfoProps> = ({
  shifts,
  getStatusConfig,
  onShiftPress,
  onDelete,
  infoColumnWidth,
  styles,
}) => {
  const canEditStatus = (status: string) => {
    const statusConfig = getStatusConfig(status);
    return statusConfig.canEdit || status === "approved";
  };
  return (
    <View
      style={[
        styles.infoCell,
        {
          width: infoColumnWidth,
          backgroundColor: "#f0f5fb",
          height: "100%",
        },
      ]}
    >
      <CustomScrollView
        style={{ flex: 1, width: "100%" }}
        contentContainerStyle={{ paddingVertical: 0 }}
      >
        {shifts.map((shift) => {
          const statusConfig = getStatusConfig(shift.status);
          return (
            <TouchableOpacity
              key={shift.id}
              activeOpacity={onShiftPress ? 0.7 : 1}
              onPress={() => onShiftPress?.(shift)}
              onLongPress={() => {
                // 削除済みシフトのみ長押しで完全削除ダイアログ
                if (shift.status === "deleted") {
                  onDelete(shift);
                }
              }}
              style={[
                styles.infoContent,
                {
                  borderColor: statusConfig.color,
                  // 下線を消して全周枠だけに
                  borderBottomWidth: undefined,
                  borderBottomColor: undefined,
                  // 他の枠線設定はstylesで一元化
                },
              ]}
            >
              {/* 1行目: 名前＋時間 */}
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "flex-start",
                  minHeight: 28,
                }}
              >
                <Text
                  style={[
                    styles.infoText,
                    { fontSize: 15, fontWeight: "bold", flexShrink: 1 },
                  ]}
                  numberOfLines={1}
                  ellipsizeMode="tail"
                >
                  {shift.nickname}
                </Text>
                <Text
                  style={[
                    styles.infoTimeText,
                    {
                      fontSize: 15,
                      fontWeight: "bold",
                      marginLeft: 30,
                      textAlignVertical: "center",
                      textAlign: "left",
                      alignSelf: "center",
                      minWidth: 80,
                    },
                  ]}
                  numberOfLines={1}
                  ellipsizeMode="tail"
                >
                  {shift.startTime}～{shift.endTime}
                </Text>
              </View>
              {/* 2行目: ステータス */}
              <Text
                style={[
                  styles.statusText,
                  { fontSize: 13, fontWeight: "bold" },
                ]}
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                {statusConfig.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </CustomScrollView>
    </View>
  );
};

// --- EmptyCell ---
export type EmptyCellProps = {
  date: string;
  width: number;
  cellWidth: number; // 各セルの幅
  halfHourLines: string[];
  isClassTime: (time: string) => boolean;
  styles: Record<string, any>; // より厳密な型
  handleEmptyCellClick: (date: string, position: number) => void;
  getTimeWidth?: (time: string) => number; // 動的幅計算用
};
export const EmptyCell: React.FC<EmptyCellProps> = ({
  date,
  width,
  cellWidth,
  halfHourLines,
  isClassTime,
  styles,
  handleEmptyCellClick,
  getTimeWidth,
}) => {
  // タップ位置から動的セル位置を算出
  const handlePress = (event: GestureResponderEvent) => {
    const x = event.nativeEvent.locationX;
    // 動的幅を考慮した位置計算
    let position = 0;
    let currentX = 0;

    for (let i = 0; i < halfHourLines.length - 1; i++) {
      const currentWidth = getTimeWidth
        ? getTimeWidth(halfHourLines[i])
        : cellWidth;
      if (x >= currentX && x < currentX + currentWidth) {
        // このセル内でクリックされた
        const ratio = (x - currentX) / currentWidth;
        position = i + ratio;
        break;
      }
      currentX += currentWidth;
    }

    handleEmptyCellClick(date, position);
  };
  return (
    <View style={[styles.emptyCell, { width }]}>
      <TouchableOpacity
        style={[StyleSheet.absoluteFill, { zIndex: 1 }]}
        onPress={handlePress}
        activeOpacity={0.7}
      />
      <View style={styles.ganttBgRow}>
        {halfHourLines.map((t, i) => {
          const currentWidth = getTimeWidth ? getTimeWidth(t) : cellWidth;
          const isHourMark = t.endsWith(":00");
          return (
            <View
              key={t}
              style={[
                styles.ganttBgCell,
                isClassTime(t) && styles.classTimeCell,
                {
                  width: currentWidth,
                  borderRightWidth: isHourMark ? 1 : 0.5,
                },
              ]}
            />
          );
        })}
      </View>
    </View>
  );
};

// --- スタイル追加 ---
// styles.classBar を追加（灰色、角丸、重なり優先）
const styles = StyleSheet.create({
  // ...既存のstyle定義...
  classBar: {
    position: "absolute",
    backgroundColor: "#b0b0b0",
    borderRadius: 6,
    opacity: 0.85,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 2,
    zIndex: 3,
  },
  // ...既存のstyle定義の後ろに追加...
});
