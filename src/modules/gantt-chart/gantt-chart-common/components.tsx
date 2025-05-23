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
  styles: any;
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
  styles,
}) => {
  // 時間位置の計算
  function timeToPosition(time: string): number {
    const [hours, minutes] = time.split(":").map(Number);
    return hours - 9 + minutes / 60;
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
        {halfHourLines.map((t, i) => (
          <View
            key={t}
            style={[
              styles.ganttBgCell,
              isClassTime(t) && styles.classTimeCell,
              {
                width: cellWidth,
                borderRightWidth: i % 2 === 0 ? 0.5 : 1,
              },
            ]}
          />
        ))}
      </View>
      {/* 授業時間バー（クラスバー）を先に描画し、zIndexでシフトバーより上に */}
      {shifts.map((shift, index) => {
        const classes = shift.classes ?? [];
        if (classes.length === 0) return null;
        return classes.map((classTime, cidx) => {
          const startPos = timeToPosition(classTime.startTime);
          const endPos = timeToPosition(classTime.endTime);
          const startCell = Math.floor(startPos * 2);
          const endCell = Math.ceil(endPos * 2);
          const cellSpan = Math.max(endCell - startCell, 2);
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
                  left: startCell * cellWidth,
                  width: cellSpan * cellWidth,
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
        const startCell = Math.floor(startPos * 2);
        const endCell = Math.ceil(endPos * 2);
        const cellSpan = Math.max(endCell - startCell, 2);
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
          <TouchableOpacity
            key={shift.id}
            style={[
              styles.shiftBar,
              {
                left: startCell * cellWidth,
                width: cellSpan * cellWidth,
                height: singleBarHeight,
                top: barVerticalOffset,
                backgroundColor: statusConfig.color,
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
};
export const EmptyCell: React.FC<EmptyCellProps> = ({
  date,
  width,
  cellWidth,
  halfHourLines,
  isClassTime,
  styles,
  handleEmptyCellClick,
}) => {
  // タップ位置から30分単位のセル位置を算出
  const handlePress = (event: GestureResponderEvent) => {
    const x = event.nativeEvent.locationX;
    // GanttChartGridと同じ計算式に統一
    const position = (x / width) * ((halfHourLines.length - 1) / 2);
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
        {halfHourLines.map((t, i) => (
          <View
            key={t}
            style={[
              styles.ganttBgCell,
              isClassTime(t) && styles.classTimeCell,
              {
                width: cellWidth,
                borderRightWidth: i % 2 === 0 ? 0.5 : 1,
              },
            ]}
          />
        ))}
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
