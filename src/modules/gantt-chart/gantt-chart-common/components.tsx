import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
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
        onPress={() => {
          if (shifts.length > 0 && onShiftPress) onShiftPress(shifts[0]);
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
          const isEditable = canEditStatus(shift.status);
          return (
            <View
              key={shift.id}
              style={[
                styles.infoContent,
                {
                  borderWidth: 0.5,
                  borderColor: statusConfig.color,
                  backgroundColor: isEditable ? "#f8fafd" : "#f3f3f3",
                  width: infoColumnWidth - 4,
                },
              ]}
            >
              <View style={styles.infoHeader}>
                <Text
                  style={styles.infoText}
                  numberOfLines={1}
                  ellipsizeMode="tail"
                >
                  {shift.nickname}
                </Text>
                {isEditable && (
                  <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={() => onDelete(shift)}
                  >
                    <Ionicons name="trash-outline" size={14} color="#FF4444" />
                  </TouchableOpacity>
                )}
              </View>
              <TouchableOpacity
                style={styles.timeButton}
                onPress={() => onShiftPress?.(shift)}
                disabled={!isEditable}
              >
                <View style={styles.infoTimeContainer}>
                  <Text
                    style={[
                      styles.infoTimeText,
                      !isEditable && styles.infoTimeTextDisabled,
                    ]}
                    numberOfLines={1}
                    ellipsizeMode="tail"
                  >
                    {shift.startTime}～{shift.endTime}
                  </Text>
                  {isEditable && (
                    <Ionicons name="pencil-outline" size={12} color="#4A90E2" />
                  )}
                </View>
              </TouchableOpacity>
              <Text
                style={styles.statusText}
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                {statusConfig.label}
              </Text>
            </View>
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
  halfHourLines: string[];
  isClassTime: (time: string) => boolean;
  styles: any;
  handleEmptyCellClick: (date: string, position: number) => void;
};
export const EmptyCell: React.FC<EmptyCellProps> = ({
  date,
  width,
  halfHourLines,
  isClassTime,
  styles,
  handleEmptyCellClick,
}) => {
  // タップ位置から30分単位のセル位置を算出
  const handlePress = (event: any) => {
    const x = event.nativeEvent.locationX;
    const position = ((x / width) * (halfHourLines.length - 1)) / 2; // 1時間=2セル
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
                width: width / halfHourLines.length,
                borderRightWidth: i % 2 === 0 ? 0.5 : 1,
              },
            ]}
          />
        ))}
      </View>
    </View>
  );
};
