

import React, { useState, useMemo, useCallback } from "react";
import {
  View,
  ScrollView,
  Text,
  TouchableOpacity,
  Dimensions,
  StyleSheet,
} from "react-native";
import { ShiftItem } from "@/common/common-models/ModelIndex";
import { SHIFT_HOURS } from "@/common/common-constants/BoundaryConstants";
import { format, addDays, subDays } from "date-fns";
import { ja } from "date-fns/locale";
import { getStatusColor } from "../../calendar/calendar-utils/calendar.utils";
import { ShiftCalendar } from "../../calendar/main-calendar/ShiftCalendar";
import { colors } from "@/common/common-constants/ThemeConstants";
import type { MarkedDates } from "react-native-calendars/src/types";
import { DateNavigator, SUB_HEADER_HEIGHT } from "@/common/common-ui/ui-navigation/DateNavigator";

function timeToMinutesLocal(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return (h ?? 0) * 60 + (m ?? 0);
}

function isTimeInRange(time: string, startTime: string, endTime: string): boolean {
  const current = timeToMinutesLocal(time);
  return current >= timeToMinutesLocal(startTime) && current < timeToMinutesLocal(endTime);
}

const STATUS_COLORS: Record<string, string> = {
  approved: "#90caf9",
  pending: "#FFD700",
  rejected: "#ffcdd2",
  completed: "#4CAF50",
  deleted: "#9e9e9e",
};

function getShiftStatusColor(
  status: string,
  getStatusConfig?: ((status: string) => { color?: string } | null)
): string {
  if (getStatusConfig) return getStatusConfig(status)?.color || "#90caf9";
  return STATUS_COLORS[status] || "#90caf9";
}

interface MobileVerticalViewProps {
  shifts: ShiftItem[];
  users: Array<{
    uid: string;
    nickname: string;
    color?: string;
    hourlyWage?: number;
  }>;
  selectedDate: Date;
  onShiftPress?: (shift: ShiftItem) => void;
  onMonthChange?: (year: number, month: number) => void;
  onEmptyCellClick?: (date: string, time: string, userId: string) => void;
  onClassAdd?: (shift: ShiftItem) => void;
  colorMode: "status" | "user";
  getStatusConfig?: (status: string) => { color: string };
  styles: ReturnType<typeof StyleSheet.create>;
}

export const MobileVerticalView: React.FC<MobileVerticalViewProps> = ({
  shifts,
  users,
  selectedDate,
  onShiftPress,
  onMonthChange,
  onEmptyCellClick,
  onClassAdd,
  colorMode,
  getStatusConfig,
  styles: _styles,
}) => {
  const [selectedCalendarDate, setSelectedCalendarDate] = useState(
    format(selectedDate, "yyyy-MM-dd")
  );
  const [calendarDisplayMonth, setCalendarDisplayMonth] = useState(
    format(selectedDate, "yyyy-MM-dd")
  );
  const [hideEarlyHours, setHideEarlyHours] = useState(true);

  const screenWidth = Dimensions.get("window").width;

  const displayDate =
    selectedCalendarDate || format(selectedDate, "yyyy-MM-dd");

  const selectedDayShifts = useMemo(() => {
    const targetDate = displayDate;
    return shifts.filter(
      (shift) =>
        shift.date === targetDate &&
        shift.status !== "deleted" &&
        shift.status !== "purged"
    );
  }, [shifts, displayDate]);

  const usersWithShifts = useMemo(() => {
    const userIdsWithShifts = new Set(
      selectedDayShifts.map((shift) => shift.userId)
    );
    return users.filter((user) => userIdsWithShifts.has(user.uid));
  }, [users, selectedDayShifts]);

  const markedDates = useMemo(() => {
    const marks: MarkedDates = {};

    if (selectedCalendarDate) {
      marks[selectedCalendarDate] = {
        selected: true,
        selectedColor: "#2196f3" + "20",
        selectedTextColor: "#333",
      };
    }

    const shiftsByDate: Record<string, ShiftItem[]> = {};
    shifts.forEach((shift) => {
      if (shift.status !== "deleted" && shift.status !== "purged") {
        const date = shift.date;
        if (!shiftsByDate[date]) {
          shiftsByDate[date] = [];
        }
        shiftsByDate[date].push(shift);
      }
    });

    Object.entries(shiftsByDate).forEach(([date, dayShifts]) => {
      const existingMark = marks[date] || {};

      const shiftDots = dayShifts.map((shift, index) => ({
        key: `${shift.id}-${index}`,
        color: getStatusColor(shift.status),
        selectedDotColor: getStatusColor(shift.status),
      }));

      marks[date] = {
        ...existingMark,
        dots: shiftDots,
        selected: selectedCalendarDate === date,
        selectedColor: "#2196f3" + "20",
        selectedTextColor: "#333",
      };
    });

    return marks;
  }, [shifts, selectedCalendarDate]);

  const convertedShifts = useMemo(() => {
    return shifts.map((shift) => ({
      ...shift,
      duration:
        typeof shift.duration === "string"
          ? Number.parseFloat(shift.duration)
          : shift.duration,
    }));
  }, [shifts]);

  const timeLabels = useMemo(() => {
    const labels = [];
    const startHour = hideEarlyHours
      ? SHIFT_HOURS.AFTERNOON_START_HOUR_INCLUSIVE
      : SHIFT_HOURS.START_HOUR_INCLUSIVE;
    for (let hour = startHour; hour <= SHIFT_HOURS.END_HOUR_INCLUSIVE; hour++) {
      labels.push(`${hour}:00`);
      if (hour < SHIFT_HOURS.END_HOUR_INCLUSIVE) {

        labels.push(`${hour}:30`);
      }
    }
    return labels;
  }, [hideEarlyHours]);

  const getShiftForUser = (userId: string) => {
    return selectedDayShifts.find((shift) => shift.userId === userId);
  };

  const getShiftColor = useCallback(
    (shift: ShiftItem) => {
      if (colorMode === "user") {
        const user = users.find((u) => u.uid === shift.userId);
        return user?.color || "#90caf9";
      }
      return getStatusColor(shift.status);
    },
    [colorMode, users]
  );

  const handleDayPress = (day: { dateString: string }) => {
    const targetDate = day.dateString;
    const selectedDateObj = new Date(targetDate);
    const currentDisplayMonth = new Date(calendarDisplayMonth);

    if (selectedCalendarDate === targetDate) {
      setSelectedCalendarDate("");
      return;
    }

    setSelectedCalendarDate(targetDate);

    if (selectedDateObj.getMonth() !== currentDisplayMonth.getMonth() ||
        selectedDateObj.getFullYear() !== currentDisplayMonth.getFullYear()) {
      setCalendarDisplayMonth(format(selectedDateObj, "yyyy-MM-dd"));
      if (onMonthChange) {
        onMonthChange(selectedDateObj.getFullYear(), selectedDateObj.getMonth());
      }
    }
  };

  const handleCalendarMonthChange = (month: { dateString: string }) => {
    const date = new Date(month.dateString);
    if (onMonthChange) {
      onMonthChange(date.getFullYear(), date.getMonth());
    }

    setCalendarDisplayMonth(format(date, "yyyy-MM-dd"));

    const firstDayOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
    const firstDayStr = format(firstDayOfMonth, "yyyy-MM-dd");
    setSelectedCalendarDate(firstDayStr);
  };

  const handlePrevDay = () => {
    if (selectedCalendarDate) {
      const currentDate = new Date(selectedCalendarDate);
      const prevDate = subDays(currentDate, 1);
      const prevDateStr = format(prevDate, "yyyy-MM-dd");
      setSelectedCalendarDate(prevDateStr);

      if (currentDate.getMonth() !== prevDate.getMonth()) {
        setCalendarDisplayMonth(format(prevDate, "yyyy-MM-dd"));
        if (onMonthChange) {
          onMonthChange(prevDate.getFullYear(), prevDate.getMonth());
        }
      }
    }
  };

  const handleNextDay = () => {
    if (selectedCalendarDate) {
      const currentDate = new Date(selectedCalendarDate);
      const nextDate = addDays(currentDate, 1);
      const nextDateStr = format(nextDate, "yyyy-MM-dd");
      setSelectedCalendarDate(nextDateStr);

      if (currentDate.getMonth() !== nextDate.getMonth()) {
        setCalendarDisplayMonth(format(nextDate, "yyyy-MM-dd"));
        if (onMonthChange) {
          onMonthChange(nextDate.getFullYear(), nextDate.getMonth());
        }
      }
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.surface }}>
      {}
      <View style={{ flexDirection: "row", flex: 1, height: "100%" }}>
        {}
        <View
          style={{
            flex: 1,
            backgroundColor: colors.surface,
            paddingRight: 2,
            borderRightWidth: 1,
            borderRightColor: colors.border,
          }}
        >
          <View style={{ height: 310, overflow: "hidden" }}>
            <View
              style={{
                transform: [{ scale: 0.6 }],
                height: 330,
                marginTop: -50,
              }}
            >
              <ShiftCalendar
                key={calendarDisplayMonth}
                shifts={convertedShifts as any}
                selectedDate={selectedCalendarDate}
                currentMonth={calendarDisplayMonth}
                currentUserStoreId={""}
                onDayPress={handleDayPress}
                onMonthChange={handleCalendarMonthChange}
                markedDates={markedDates}
                hideMonthNav
              />
            </View>
          </View>
        </View>

        {}
        <View
          style={{
            flex: 1,
            backgroundColor: colors.surface,
            paddingLeft: 2,
          }}
        >
          {}
          <View
            style={{
              backgroundColor: colors.surfaceElevated,
              borderBottomWidth: 1,
              borderBottomColor: colors.border,
              height: SUB_HEADER_HEIGHT,
              paddingHorizontal: 8,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            {}
            <View
              style={{
                flex: 1,
                alignItems: "center",
                marginRight: -60,
              }}
            >
              <DateNavigator
                label={
                  displayDate
                    ? format(new Date(displayDate), "M月d日(E)", { locale: ja })
                    : "日付を選択"
                }
                onPrev={handlePrevDay}
                onNext={handleNextDay}
              />
            </View>

            {}
            <TouchableOpacity
              style={{
                paddingHorizontal: 8,
                paddingVertical: 4,
                backgroundColor: hideEarlyHours
                  ? colors.warning
                  : colors.surfaceElevated,
                borderRadius: 12,
              }}
              onPress={() => setHideEarlyHours(!hideEarlyHours)}
            >
              <Text
                style={{
                  color: hideEarlyHours ? colors.text.white : colors.text.primary,
                  fontWeight: hideEarlyHours ? "bold" : "normal",
                  fontSize: 10,
                }}
              >
                {hideEarlyHours ? "13:00-22:00" : "9:00-12:30省略"}
              </Text>
            </TouchableOpacity>
          </View>

          {}
          <ScrollView style={{ flex: 1 }}>
            <View style={{ flexDirection: "row" }}>
              {}
              <View style={{ width: 30 }}>
                <View style={{ height: 30 }} />
                {timeLabels.map((time) => (
                  <View
                    key={time}
                    style={{
                      height: 20,
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 10,
                        color: "#666",
                        fontWeight: "bold",
                      }}
                    >
                      {time}
                    </Text>
                  </View>
                ))}
              </View>

              {}
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={{ flexDirection: "row" }}>
                  {usersWithShifts.length > 0 ? (
                    usersWithShifts
                      .sort((a, b) => {
                        const shiftA = getShiftForUser(a.uid);
                        const shiftB = getShiftForUser(b.uid);
                        if (!shiftA || !shiftB) return 0;
                        return shiftA.startTime.localeCompare(shiftB.startTime);
                      })
                      .map((user, _userIndex) => {
                        const userShift = getShiftForUser(user.uid);

                        return (
                          <View
                            key={user.uid}
                            style={{
                              width: Math.max(
                                45,
                                (screenWidth / 2 - 30) * 0.25
                              ),
                            }}
                          >
                            {}
                            <View
                              style={{
                                height: 30,
                                borderRightWidth: 1,
                                borderRightColor: colors.border,
                                borderBottomWidth: 1,
                                borderBottomColor: colors.border,
                                justifyContent: "center",
                                alignItems: "center",
                                backgroundColor: colors.surface,
                              }}
                            >
                              <Text
                                style={{
                                  fontSize: 13,
                                  fontWeight: "bold",
                                  color: colors.text.primary,
                                  textAlign: "center",
                                }}
                                numberOfLines={1}
                              >
                                {user.nickname}
                              </Text>
                            </View>

                            {}
                            <View style={{ position: "relative" }}>
                              {timeLabels.map((time) => {
                                const isClassTime = userShift?.classes?.some(
                                  (ct: any) => isTimeInRange(time, ct.startTime, ct.endTime)
                                );
                                const isShiftTime = userShift && isTimeInRange(time, userShift.startTime, userShift.endTime);

                                const backgroundColor = isShiftTime && userShift
                                  ? getShiftStatusColor(userShift.status, getStatusConfig) + "30"
                                  : "transparent";

                                return (
                                  <View key={time} style={{ position: "relative" }}>
                                    <TouchableOpacity
                                      style={{
                                        height: 20,
                                        borderRightWidth: 1,
                                        borderRightColor: colors.border,
                                        borderBottomWidth: 1,
                                        borderBottomColor: colors.border,
                                        backgroundColor,
                                        zIndex: 1,
                                      }}
                                      onPress={() =>
                                        onEmptyCellClick?.(displayDate, time, "")
                                      }
                                    />
                                    {}
                                    {isClassTime && userShift && (
                                      <View
                                        style={{
                                          position: "absolute",
                                          top: 0,
                                          left: 0,
                                          right: 0,
                                          bottom: 0,
                                          backgroundColor: getShiftStatusColor(userShift.status, getStatusConfig) + "60",
                                          zIndex: 2,
                                        }}
                                      />
                                    )}
                                  </View>
                                );
                              })}

                              {}
                              {userShift &&
                                (() => {
                                  const [startHour, startMin] =
                                    userShift.startTime.split(":").map(Number);
                                  const [endHour, endMin] = userShift.endTime
                                    .split(":")
                                    .map(Number);

                                  const baseHour = hideEarlyHours
                                    ? SHIFT_HOURS.AFTERNOON_START_HOUR_INCLUSIVE
                                    : SHIFT_HOURS.START_HOUR_INCLUSIVE;
                                  const startSlots =
                                    ((startHour ?? 0) - baseHour) * 2 +
                                    ((startMin ?? 0) >= 30 ? 1 : 0);
                                  const endSlots =
                                    ((endHour ?? 0) - baseHour) * 2 +
                                    ((endMin ?? 0) >= 30 ? 1 : 0);
                                  const top = startSlots * 20;
                                  const height = (endSlots - startSlots) * 20;

                                  return (
                                    <TouchableOpacity
                                      style={{
                                        position: "absolute",
                                        top,
                                        left: 1,
                                        right: 1,
                                        height,
                                        backgroundColor:
                                          getShiftColor(userShift),
                                        borderRadius: 2,
                                        padding: 1,
                                        justifyContent: "center",
                                        alignItems: "center",
                                        elevation: 0,
                                        zIndex: 10,
                                      }}
                                      onPress={() => onShiftPress?.(userShift)}
                                    >
                                      <Text
                                        style={{
                                          fontSize: 11,
                                          fontWeight: "bold",
                                          color: "#000",
                                          textAlign: "center",
                                        }}
                                        numberOfLines={1}
                                      >
                                        {user.nickname}
                                      </Text>
                                      <Text
                                        style={{
                                          fontSize: 10,
                                          fontWeight: "bold",
                                          color: "#000",
                                          textAlign: "center",
                                        }}
                                        numberOfLines={1}
                                      >
                                        {userShift.startTime}
                                      </Text>
                                      <Text
                                        style={{
                                          fontSize: 10,
                                          fontWeight: "bold",
                                          color: "#000",
                                          textAlign: "center",
                                        }}
                                        numberOfLines={1}
                                      >
                                        {userShift.endTime}
                                      </Text>

                                      {}
                                      <TouchableOpacity
                                        style={{
                                          position: 'absolute',
                                          top: 2,
                                          right: 2,
                                          backgroundColor: 'rgba(255,255,255,0.8)',
                                          borderRadius: 8,
                                          width: 16,
                                          height: 16,
                                          justifyContent: 'center',
                                          alignItems: 'center',
                                        }}
                                        onPress={(e) => {
                                          e.stopPropagation();
                                          onClassAdd?.(userShift);
                                        }}
                                      >
                                        <Text style={{ fontSize: 10, color: '#007AFF', fontWeight: 'bold' }}>+</Text>
                                      </TouchableOpacity>
                                    </TouchableOpacity>
                                  );
                                })()}
                            </View>
                          </View>
                        );
                      })
                  ) : (

                    <TouchableOpacity
                      style={{
                        width: screenWidth / 2 - 30,
                        height: 100,
                        justifyContent: "center",
                        alignItems: "center",
                      }}
                      onPress={() =>
                        onEmptyCellClick?.(displayDate, "09:00", "")
                      }
                    >
                      <Text
                        style={{
                          fontSize: 10,
                          color: "#999",
                          textAlign: "center",
                          marginBottom: 4,
                        }}
                      >
                        この日はシフトがありません
                      </Text>
                      <Text
                        style={{
                          fontSize: 9,
                          color: "#2196f3",
                          textAlign: "center",
                        }}
                      >
                        タップしてシフトを追加
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
              </ScrollView>
            </View>
          </ScrollView>
        </View>
      </View>
    </View>
  );
};
