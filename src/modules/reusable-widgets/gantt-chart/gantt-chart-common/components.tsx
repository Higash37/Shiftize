

import React, { useState, useContext, useMemo, createContext } from "react";
import { useTimeSegmentTypesContext } from "@/common/common-context/TimeSegmentTypesContext";
import { usePendingShiftBadge } from "@/common/common-context/PendingShiftBadgeContext";
import type { TimeSegmentType } from "@/common/common-models/model-shift/shiftTypes";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  GestureResponderEvent,
} from "react-native";
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  getDay,
  addMonths,
  subMonths,
} from "date-fns";
import { ja } from "date-fns/locale";
import { ShiftItem } from "@/common/common-models/ModelIndex";
import { ShiftStatusConfig } from "../GanttChartTypes";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { CalendarHeader } from "../../calendar/CalendarHeader";
import { DatePickerModal } from "../../calendar/modals/DatePickerModal";
import { getStatusColor } from "../../calendar/calendar-utils/calendar.utils";
import { shadows } from "@/common/common-constants/ShadowConstants";
import { getDateTextColor } from "@/common/common-utils/util-date/dateUtils";
import type { MarkedDates } from "react-native-calendars/src/types";

interface ShiftSelectionContextType {
  selectedShiftIds: Set<string>;
  onToggleSelect: (shiftId: string) => void;
  clearSelection: () => void;
  selectedCount: number;
}

export const ShiftSelectionContext = createContext<ShiftSelectionContextType>({
  selectedShiftIds: new Set(),
  onToggleSelect: () => {},
  clearSelection: () => {},
  selectedCount: 0,
});

export const ShiftSelectionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {

  const [selectedShiftIds, setSelectedShiftIds] = useState<Set<string>>(new Set());

  const onToggleSelect = React.useCallback((shiftId: string) => {
    setSelectedShiftIds(prev => {
      const next = new Set(prev);
      if (next.has(shiftId)) {
        next.delete(shiftId);
      } else {
        next.add(shiftId);
      }
      return next;
    });
  }, []);

  const clearSelection = React.useCallback(() => {
    setSelectedShiftIds(new Set());
  }, []);

  const value = useMemo(() => ({
    selectedShiftIds,
    onToggleSelect,
    clearSelection,
    selectedCount: selectedShiftIds.size,
  }), [selectedShiftIds, onToggleSelect, clearSelection]);

  return (
    <ShiftSelectionContext.Provider value={value}>
      {children}
    </ShiftSelectionContext.Provider>
  );
};

export type DateCellProps = {
  date: string;
  dateColumnWidth: number;
  styles: ReturnType<typeof StyleSheet.create>;
};
export const DateCell: React.FC<DateCellProps> = ({
  date,
  dateColumnWidth,
  styles,
}) => {
  const formattedDate = new Date(date);
  const dayOfWeek = format(formattedDate, "E", { locale: ja });
  const dayOfMonth = format(formattedDate, "d");

  const holidayTextColor = getDateTextColor(date);
  const textColor =
    holidayTextColor || (dayOfWeek === "土" ? "#2196F3" : "#333333");
  return (
    <View
      style={[
        styles['dateCell'],
        {
          width: dateColumnWidth,
          borderWidth: 1,
          borderColor: "#ddd",
          borderRightWidth: 2,
          borderRightColor: "#bbb",
          backgroundColor: "#f8f9fa",
        },
      ]}
    >
      <Text style={[styles['dateDayText'], { color: textColor }]}>
        {dayOfMonth}
      </Text>
      <Text style={[styles['dateWeekText'], { color: textColor }]}>
        {dayOfWeek}
      </Text>
    </View>
  );
};

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
  styles: ReturnType<typeof StyleSheet.create>;
  userColorsMap: Record<string, string>;
  users?: Array<{ uid: string; role: string; nickname: string }>;
  getTimeWidth?: (time: string) => number;
  colorMode?: "status" | "user";
};

const findDefaultType = (typesMap?: Record<string, TimeSegmentType>) => {
  if (!typesMap) return undefined;
  return Object.values(typesMap).find((t) => t.name === "授業");
};

const convertClassesToTasks = (shift: ShiftItem, typesMap?: Record<string, TimeSegmentType>) => {
  if (!shift.classes || shift.classes.length === 0) return [];

  const defaultType = findDefaultType(typesMap);

  return shift.classes.map((classTime, index) => {
    const segType = classTime.typeId ? typesMap?.[classTime.typeId] : defaultType;
    const name = segType?.name || classTime.typeName || "授業";
    const icon = segType?.icon || "";
    return {
      id: `${shift.id}-class-${index}`,
      title: `${icon ? icon + " " : ""}${name} ${classTime.startTime}-${classTime.endTime}`,
      shortName: `${icon ? icon + " " : ""}${name}`,
      startTime: classTime.startTime,
      endTime: classTime.endTime,
      color: segType?.color || "#757575",
      icon: "book-outline",
      type: "custom",
    };
  });
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
  onTimeChange: _onTimeChange,
  styles,
  userColorsMap,
  users = [],
  getTimeWidth,
  colorMode = "status",
}) => {
  const { typesMap: segTypesMap } = useTimeSegmentTypesContext();

  function parseMinutes(timeStr: string): number {
    const parts = timeStr.split(":");
    const h = Number(parts[0]);
    const m = Number(parts[1]);

    return (Number.isNaN(h) ? 0 : h) * 60 + (Number.isNaN(m) ? 0 : m);
  }

  function getCellWidthAt(index: number): number {
    return getTimeWidth ? getTimeWidth(halfHourLines[index] ?? "00:00") : cellWidth;
  }

  function timeToPosition(time: string): number {
    let position = 0;
    const targetMinutes = parseMinutes(time);

    for (let i = 0; i < halfHourLines.length; i++) {
      const currentMinutes = parseMinutes(halfHourLines[i] ?? "0:00");

      if (currentMinutes === targetMinutes) {
        return position;
      }

      if (currentMinutes > targetMinutes) {
        const prevMinutes = i > 0 ? parseMinutes(halfHourLines[i - 1] ?? "0:00") : currentMinutes;
        const span = currentMinutes - prevMinutes;
        const ratio = span > 0 ? (targetMinutes - prevMinutes) / span : 0;
        const prevPosition = i > 0 ? position - getCellWidthAt(i) : 0;
        return prevPosition + ratio * getCellWidthAt(i);
      }

      position += getCellWidthAt(i);
    }
    return position;
  }

  return (
    <View
      style={[styles['ganttCell'], { width: ganttColumnWidth, height: "100%" }]}
    >
      {}
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
      <View style={styles['ganttBgRow']}>
        {halfHourLines.map((t, _i) => {
          const currentWidth = getTimeWidth ? getTimeWidth(t) : cellWidth;
          const isHourMark = t.endsWith(":00");
          return (
            <View
              key={t}
              style={[
                styles['ganttBgCell'],
                isClassTime(t) && styles['classTimeCell'],
                {
                  width: currentWidth,
                  borderRightWidth: isHourMark ? 1 : 0.5,
                },
              ]}
            />
          );
        })}
      </View>
      {}
      {}
      {shifts.map((shift, index) => {
        const statusConfig = getStatusConfig(shift.status);

        const startPos = timeToPosition(shift.startTime);
        const endPos = timeToPosition(shift.endTime);
        const barWidth = endPos - startPos;
        const totalShifts = shifts.length;
        const cellHeight = 48;

        const hasOverlap = shifts.some((otherShift, otherIndex) => {
          if (otherIndex === index) return false;
          const otherStartPos = timeToPosition(otherShift.startTime);
          const otherEndPos = timeToPosition(otherShift.endTime);
          return endPos > otherStartPos && startPos < otherEndPos;
        });

        let singleBarHeight;
        let barVerticalOffset;

        if (!hasOverlap) {

          singleBarHeight = cellHeight;
          barVerticalOffset = 0;
        } else {

          singleBarHeight = Math.floor(cellHeight / Math.min(totalShifts, 3));
          barVerticalOffset = index * singleBarHeight;
        }

        const borderColor =
          shift.status === "deletion_requested"
            ? statusConfig.color
            : colorMode === "status"
              ? statusConfig.color
              : userColorsMap?.[shift.userId] || statusConfig.color;

        const startTimeMinutes = (() => {
          const [h, m] = shift.startTime.split(":").map(Number);
          return (h ?? 0) * 60 + (m ?? 0);
        })();
        const endTimeMinutes = (() => {
          const [h, m] = shift.endTime.split(":").map(Number);
          return (h ?? 0) * 60 + (m ?? 0);
        })();
        const durationMinutes = endTimeMinutes - startTimeMinutes;
        const isShortShift = durationMinutes <= 120;

        const user = users.find((u) => u.uid === shift.userId);
        const isMaster = user?.role === "master";
        const userIcon = isMaster ? "person" : "school";

        const minWidthForShift = isShortShift ? 72 : 57;

        return (
          <ShiftBarWithCheckbox
            key={shift.id}
            shift={shift}
            startPos={startPos}
            barWidth={Math.max(barWidth, minWidthForShift)}
            singleBarHeight={singleBarHeight}
            barVerticalOffset={barVerticalOffset}
            borderColor={borderColor}
            {...(onShiftPress && { onShiftPress })}
            styles={styles}
          >
            <View
              style={{
                width: "100%",
                height: "100%",
                justifyContent: "flex-start",
                paddingHorizontal: 2,
                paddingVertical: 0,
                flexDirection: "column",
              }}
            >
              {isShortShift ? (

                <View
                  style={{
                    flex: 1,
                    justifyContent: "center",
                    flexDirection: "column",
                  }}
                >
                  {}
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "flex-start",
                    }}
                  >
                    <Ionicons
                      name={shift.status === "deletion_requested" ? "alert-circle-outline" as any : userIcon as any}
                      size={11}
                      color={borderColor}
                      style={{ marginRight: 2 }}
                    />
                    <Text
                      style={[
                        styles['shiftBarText'],
                        {
                          fontSize: 9,
                          fontWeight: "bold",
                          color: shift.status === "deletion_requested" ? borderColor : "#333",
                          textAlign: "left",
                          lineHeight: 11,
                        },
                      ]}
                      numberOfLines={1}
                    >
                      {shift.nickname}
                    </Text>
                  </View>

                  {}
                  <Text
                    style={[
                      styles['shiftTimeText'],
                      {
                        fontSize: 8,
                        color: shift.status === "deletion_requested" ? borderColor : "#666",
                        textAlign: "left",
                        lineHeight: 10,
                        paddingLeft: 13,
                        fontWeight: shift.status === "deletion_requested" ? "bold" : "normal",
                      },
                    ]}
                    numberOfLines={1}
                  >
                    {shift.status === "deletion_requested" ? "削除申請中" : `${shift.startTime}～${shift.endTime}`}
                  </Text>
                </View>
              ) : (

                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "flex-start",
                    flex: 1,
                    minHeight: 18,
                  }}
                >
                  {}
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "flex-start",
                      flex: 1,
                    }}
                  >
                    <Ionicons
                      name={shift.status === "deletion_requested" ? "alert-circle-outline" as any : userIcon as any}
                      size={11}
                      color={borderColor}
                      style={{ marginRight: 2 }}
                    />
                    <Text
                      style={[
                        styles['shiftBarText'],
                        {
                          fontSize: 13,
                          fontWeight: "bold",
                          color: shift.status === "deletion_requested" ? borderColor : "#333",
                          textAlign: "left",
                        },
                      ]}
                      numberOfLines={1}
                    >
                      {shift.nickname}
                    </Text>
                  </View>

                  {}
                  <View
                    style={{
                      flex: 1,
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    <Text
                      style={[
                        styles['shiftTimeText'],
                        {
                          fontSize: 13,
                          fontWeight: "bold",
                          color: shift.status === "deletion_requested" ? borderColor : "#555",
                          textAlign: "center",
                          marginRight: 26,
                        },
                      ]}
                      numberOfLines={1}
                    >
                      {shift.status === "deletion_requested" ? "削除申請中" : `${shift.startTime}～${shift.endTime}`}
                    </Text>
                  </View>
                </View>
              )}

              {}
              <View
                style={{
                  flex: 1.0,
                  backgroundColor: "rgba(240, 245, 251, 0.8)",
                  borderRadius: 2,
                  position: "relative",
                  overflow: "hidden",
                  borderTopWidth: 0.5,
                  borderTopColor: "rgba(0, 0, 0, 0.1)",
                }}
              >
                {}
                {(() => {
                  const allTasks = convertClassesToTasks(shift, segTypesMap);

                  return allTasks.length > 0 ? (
                    <View
                      style={{
                        flexDirection: "row",
                        height: "100%",
                        alignItems: "center",
                        paddingHorizontal: 0,
                      }}
                    >
                      {allTasks.map((task, taskIndex) => {

                        const taskStartPos = timeToPosition(task.startTime);
                        const taskEndPos = timeToPosition(task.endTime);
                        const taskWidth = taskEndPos - taskStartPos;
                        const shiftStartPos = timeToPosition(shift.startTime);

                        const relativeStartPos = Math.max(
                          0,
                          taskStartPos - shiftStartPos
                        );
                        const relativeWidth = Math.max(taskWidth, 8);

                        return (
                          <View
                            key={`${shift.id}-task-${taskIndex}`}
                            style={{
                              position: "absolute",
                              left: relativeStartPos + 2,
                              width: relativeWidth,
                              height: "100%",
                              backgroundColor: task.type === "auto" ? (task.color || "#4CAF50") + "CC" : (task.color || "#4CAF50"),
                              borderRadius: 4,

                              flexDirection: "row",
                              alignItems: "center",
                              justifyContent: "flex-start",
                              paddingHorizontal: 0,
                              ...shadows.small,
                              borderWidth: task.type === "auto" ? 1.5 : 0.5,
                              borderColor: task.type === "auto" ? task.color || "#4CAF50" : "rgba(255, 255, 255, 0.3)",
                              borderStyle: task.type === "auto" ? "dashed" : "solid",
                            }}
                          >
                            {}
                            {relativeWidth >= 20 && (
                              <Text
                                style={{
                                  fontSize: relativeWidth >= 40 ? 8 : 7,
                                  color: "white",
                                  fontWeight: "600",
                                  textShadowColor: "rgba(0, 0, 0, 0.5)",
                                  textShadowOffset: { width: 0, height: 0.5 },
                                  textShadowRadius: 1,
                                  flex: 1,
                                  textAlign: "center",
                                }}
                                numberOfLines={1}
                              >
                                {relativeWidth >= 40 && task.title
                                  ? task.title
                                  : task.shortName ||
                                    task.title?.substring(0, 2) ||
                                    "タ"}
                              </Text>
                            )}

                          </View>
                        );
                      })}
                    </View>
                  ) : (

                    <View
                      style={{
                        flex: 1,
                        justifyContent: "center",
                        alignItems: "center",
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 7,
                          color: "#aaa",
                          fontStyle: "italic",
                        }}
                      >
                        タスクなし
                      </Text>
                    </View>
                  );
                })()}
              </View>
            </View>
          </ShiftBarWithCheckbox>
        );
      })}
    </View>
  );
};

interface ShiftBarWithCheckboxProps {
  shift: ShiftItem;
  startPos: number;
  barWidth: number;
  singleBarHeight: number;
  barVerticalOffset: number;
  borderColor: string;
  onShiftPress?: (shift: ShiftItem) => void;
  styles: ReturnType<typeof StyleSheet.create>;
  children: React.ReactNode;
}

const ShiftBarWithCheckboxInner: React.FC<ShiftBarWithCheckboxProps> = ({
  shift,
  startPos,
  barWidth,
  singleBarHeight,
  barVerticalOffset,
  borderColor,
  onShiftPress,
  styles,
  children,
}) => {
  const { selectedShiftIds, onToggleSelect } = useContext(ShiftSelectionContext);
  const { isUnreadChange } = usePendingShiftBadge();
  const isSelected = selectedShiftIds.has(shift.id);
  const [hovered, setHovered] = useState(false);
  const showCheckbox = hovered || isSelected;
  const showUnreadChip = isUnreadChange(shift.id);

  return (
    <View
      // @ts-ignore: Web-only mouse events
      onMouseEnter={() => setHovered(true)}
      // @ts-ignore
      onMouseLeave={() => setHovered(false)}
      style={{
        position: "absolute",
        left: startPos,
        width: barWidth,
        height: singleBarHeight,
        top: barVerticalOffset,
        zIndex: showUnreadChip ? 100 : 2,
      }}
    >
      {}
      {showCheckbox && (
        <TouchableOpacity
          style={{
            position: "absolute",
            left: 2,
            top: (singleBarHeight - 20) / 2,
            width: 20,
            height: 20,
            borderRadius: 10,
            backgroundColor: isSelected ? "#2196F3" : "#FFFFFF",
            borderWidth: isSelected ? 0 : 1.5,
            borderColor: "#9E9E9E",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 10,
          }}
          onPress={(e) => {
            e.stopPropagation();
            onToggleSelect(shift.id);
          }}
          activeOpacity={0.7}
        >
          {isSelected && (
            <Text style={{ color: "#FFFFFF", fontSize: 12, fontWeight: "bold", lineHeight: 14 }}>
              ✓
            </Text>
          )}
        </TouchableOpacity>
      )}
      <TouchableOpacity
        style={[
          styles['shiftBar'],
          {
            left: 0,
            width: "100%",
            height: "100%",
            top: 0,
            backgroundColor: "rgba(255, 255, 255, 0.95)",
            borderLeftWidth: 1.5,
            borderLeftColor: borderColor,
            borderRightWidth: 1.5,
            borderRightColor: borderColor,
            borderTopWidth: 1.5,
            borderTopColor: borderColor,
            borderBottomWidth: 1.5,
            borderBottomColor: borderColor,
            opacity:
              shift.status === "deleted"
                ? 0.5
                : 1,
            borderRadius: 6,
          },
        ]}
        onPress={() => onShiftPress?.(shift)}
      >
        {children}
      </TouchableOpacity>
      {showUnreadChip && (
        <View style={{
          position: "absolute",
          top: 1,
          right: 2,
          backgroundColor: "#FF3B30",
          borderRadius: 4,
          paddingHorizontal: 3,
          paddingVertical: 0,
          zIndex: 9999,
          elevation: 9999,
        }}>
          <Text style={{ fontSize: 6, fontWeight: "bold", color: "#fff", lineHeight: 10 }}>
            変更あり
          </Text>
        </View>
      )}
    </View>
  );
};

const ShiftBarWithCheckbox = React.memo(ShiftBarWithCheckboxInner);

export type GanttChartInfoProps = {
  shifts: ShiftItem[];
  getStatusConfig: (status: string) => ShiftStatusConfig;
  onShiftPress?: (shift: ShiftItem) => void;
  onDelete: (shift: ShiftItem) => void;
  infoColumnWidth: number;
  styles: ReturnType<typeof StyleSheet.create>;
  onToggleComplete?: (shift: ShiftItem) => void;
  allShifts?: ShiftItem[];
  selectedDate?: Date;
  onDateSelect?: (date: string) => void;
  onMonthChange?: (month: { year: number; month: number }) => void;
};
export const GanttChartInfo: React.FC<GanttChartInfoProps> = ({
  shifts: _shifts,
  getStatusConfig: _getStatusConfig,
  onShiftPress: _onShiftPress,
  onDelete: _onDelete,
  infoColumnWidth,
  styles,
  onToggleComplete: _onToggleComplete,
  allShifts = [],
  selectedDate,
  onDateSelect,
  onMonthChange,
}) => {
  const [showDatePicker, setShowDatePicker] = React.useState(false);
  const [currentMonth, setCurrentMonth] = React.useState(
    selectedDate || new Date()
  );
  const [internalSelectedDate, setInternalSelectedDate] = React.useState<
    string | null
  >(selectedDate ? format(selectedDate, "yyyy-MM-dd") : null);

  React.useEffect(() => {
    setInternalSelectedDate(
      selectedDate ? format(selectedDate, "yyyy-MM-dd") : null
    );
    if (selectedDate) {
      setCurrentMonth(new Date(selectedDate));
    }
  }, [selectedDate]);

  const calendarData = React.useMemo(() => {
    const start = startOfMonth(currentMonth);
    const end = endOfMonth(currentMonth);
    const monthDays = eachDayOfInterval({ start, end });

    const startDayOfWeek = getDay(start);
    const prevMonthDays = [];
    for (let i = startDayOfWeek - 1; i >= 0; i--) {
      const prevDay = new Date(start);
      prevDay.setDate(prevDay.getDate() - (i + 1));
      prevMonthDays.push({ date: prevDay, isCurrentMonth: false });
    }

    const currentMonthDays = monthDays.map((date) => ({
      date,
      isCurrentMonth: true,
    }));

    const totalCells = 42;
    const remainingCells =
      totalCells - prevMonthDays.length - currentMonthDays.length;
    const nextMonthDays = [];
    for (let i = 0; i < remainingCells; i++) {
      const nextDay = new Date(end);
      nextDay.setDate(nextDay.getDate() + (i + 1));
      nextMonthDays.push({ date: nextDay, isCurrentMonth: false });
    }

    return [...prevMonthDays, ...currentMonthDays, ...nextMonthDays];
  }, [currentMonth]);

  const markedDates = React.useMemo(() => {
    const marks: MarkedDates = {};
    const shiftsByDate: Record<string, ShiftItem[]> = {};

    allShifts.forEach((shift) => {
      if (shift.status !== "deleted" && shift.status !== "purged") {
        const date = shift.date;
        if (!shiftsByDate[date]) {
          shiftsByDate[date] = [];
        }
        shiftsByDate[date].push(shift);
      }
    });

    Object.entries(shiftsByDate).forEach(([date, dayShifts]) => {
      const shiftDots = dayShifts.slice(0, 3).map((shift, index) => ({
        key: `${shift.id}-${index}`,
        color: getStatusColor(shift.status),
        selectedDotColor: getStatusColor(shift.status),
      }));
      marks[date] = { dots: shiftDots };
    });

    return marks;
  }, [allShifts]);

  const handleDayPress = (dateString: string) => {
    setInternalSelectedDate(dateString);
    if (onDateSelect) {
      onDateSelect(dateString);
    }
  };

  const handleMonthChange = (direction: "prev" | "next") => {
    const newMonth =
      direction === "prev"
        ? subMonths(currentMonth, 1)
        : addMonths(currentMonth, 1);
    setCurrentMonth(newMonth);

    if (onMonthChange) {
      onMonthChange({ year: newMonth.getFullYear(), month: newMonth.getMonth() });
    }
  };

  const handleDateSelect = (date: Date) => {
    setCurrentMonth(date);
    if (onMonthChange) {
      onMonthChange({ year: date.getFullYear(), month: date.getMonth() });
    }
  };

  return (
    <View
      style={[
        styles['infoCell'],
        {
          width: infoColumnWidth,
          backgroundColor: "#ffffff",
          minHeight: 215,
          flex: 1,
          marginLeft: 0,
        },
      ]}
    >
      <View
        style={{ flex: 1, paddingLeft: 0, paddingRight: 2, paddingVertical: 4 }}
      >
        {}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            paddingVertical: 4,
          }}
        >
          <TouchableOpacity
            onPress={() => handleMonthChange("prev")}
            style={{ padding: 5, borderRadius: 6 }}
            activeOpacity={0.7}
          >
            <MaterialIcons name="chevron-left" size={18} color="#2196F3" />
          </TouchableOpacity>

          <CalendarHeader
            date={currentMonth}
            onYearMonthSelect={() => setShowDatePicker(true)}
            responsiveStyle={{ fontSize: 15 }}
          />

          <TouchableOpacity
            onPress={() => handleMonthChange("next")}
            style={{ padding: 5, borderRadius: 6 }}
            activeOpacity={0.7}
          >
            <MaterialIcons name="chevron-right" size={18} color="#2196F3" />
          </TouchableOpacity>
        </View>

        {}
        <View
          style={{
            flexDirection: "row",
            marginTop: 1,
            marginBottom: 1,
            borderBottomWidth: StyleSheet.hairlineWidth,
            borderBottomColor: "#E0E0E0",
          }}
        >
          {["日", "月", "火", "水", "木", "金", "土"].map((day, index) => (
            <View
              key={day}
              style={{
                flex: 1,
                alignItems: "center",
                paddingVertical: 1,
              }}
            >
              <Text
                style={{
                  fontSize: 13,
                  fontWeight: "500",
                  color:
                    index === 0 ? "#F44336" : index === 6 ? "#2196F3" : "#757575",
                }}
              >
                {day}
              </Text>
            </View>
          ))}
        </View>

        {}
        <View style={{ flex: 1 }}>
          {[0, 1, 2, 3, 4, 5].map((weekIndex) => (
            <View
              key={weekIndex}
              style={{
                flexDirection: "row",
                flex: 1,
              }}
            >
              {calendarData
                .slice(weekIndex * 7, weekIndex * 7 + 7)
                .map((dayData, _dayIndex) => {
                  const dateString = format(dayData.date, "yyyy-MM-dd");
                  const isSelected = internalSelectedDate === dateString;
                  const isToday =
                    format(dayData.date, "yyyy-MM-dd") ===
                    format(new Date(), "yyyy-MM-dd");
                  const marking = markedDates[dateString];

                  return (
                    <View
                      key={dateString}
                      style={{
                        flex: 1,
                      }}
                    >
                      <View
                        style={{
                          flex: 1,
                          alignItems: "center",
                          justifyContent: "center",
                          paddingVertical: 1,
                        }}
                      >
                        <TouchableOpacity
                          style={{
                            alignItems: "center",
                            justifyContent: "center",
                            backgroundColor: isSelected
                              ? "#2196F3"
                              : isToday
                              ? "#F5F5F5"
                              : "transparent",
                            borderRadius: 13,
                            width: 26,
                            height: 26,
                          }}
                          onPress={() => handleDayPress(dateString)}
                          activeOpacity={0.7}
                        >
                          <Text
                            style={{
                              fontSize: 14,
                              fontWeight: isToday ? "600" : "400",
                              color: isSelected
                                ? "#fff"
                                : !dayData.isCurrentMonth
                                ? "#BDBDBD"
                                : isToday
                                ? "#333333"
                                : dayData.date.getDay() === 0
                                ? "#F44336"
                                : dayData.date.getDay() === 6
                                ? "#2196F3"
                                : "#333333",
                              textAlign: "center",
                            }}
                          >
                            {format(dayData.date, "d")}
                          </Text>
                        </TouchableOpacity>

                        {}
                        {marking?.dots && marking.dots.length > 0 && (
                          <View
                            style={{
                              flexDirection: "row",
                              justifyContent: "center",
                              alignItems: "center",
                              marginTop: 2,
                            }}
                          >
                            {marking.dots.map((dot: { key?: string; color: string }, index: number) => (
                              <View
                                key={dot.key || index}
                                style={{
                                  width: 4,
                                  height: 4,
                                  borderRadius: 2,
                                  backgroundColor: dot.color,
                                  marginHorizontal: 0.5,
                                }}
                              />
                            ))}
                          </View>
                        )}
                      </View>
                    </View>
                  );
                })}
            </View>
          ))}
        </View>

        {}
        <DatePickerModal
          isVisible={showDatePicker}
          initialDate={currentMonth}
          onClose={() => setShowDatePicker(false)}
          onSelect={handleDateSelect}
        />
      </View>
    </View>
  );
};

export type EmptyCellProps = {
  date: string;
  width: number;
  cellWidth: number;
  halfHourLines: string[];
  isClassTime: (time: string) => boolean;
  styles: Record<string, any>;
  handleEmptyCellClick: (date: string, position: number) => void;
  getTimeWidth?: (time: string) => number;
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

  const handlePress = (event: GestureResponderEvent) => {
    const x = event.nativeEvent.locationX;

    let position = 0;
    let currentX = 0;

    for (let i = 0; i < halfHourLines.length - 1; i++) {
      const currentWidth = getTimeWidth
        ? getTimeWidth(halfHourLines[i] || "")
        : cellWidth;
      if (x >= currentX && x < currentX + currentWidth) {

        const ratio = (x - currentX) / currentWidth;
        position = i + ratio;
        break;
      }
      currentX += currentWidth;
    }

    handleEmptyCellClick(date, position);
  };
  return (
    <View style={[styles['emptyCell'], { width }]}>
      <TouchableOpacity
        style={[StyleSheet.absoluteFill, { zIndex: 1 }]}
        onPress={handlePress}
        activeOpacity={0.7}
      />
      <View style={styles['ganttBgRow']}>
        {halfHourLines.map((t, _i) => {
          const currentWidth = getTimeWidth ? getTimeWidth(t) : cellWidth;
          const isHourMark = t.endsWith(":00");
          return (
            <View
              key={t}
              style={[
                styles['ganttBgCell'],
                isClassTime(t) && styles['classTimeCell'],
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
