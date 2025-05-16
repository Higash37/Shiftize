import React, { useMemo, useState, useEffect } from "react";
import { Calendar } from "react-native-calendars";
import { View, StyleSheet } from "react-native";
import { colors } from "@/shared/theme/colors";
import { ShiftCalendarProps, DayComponentProps } from "./types";
import { DayComponent } from "./DayComponent";
import { CalendarHeader } from "./CalendarHeader";
import { ShiftList } from "./ShiftList";
import { DatePickerModal } from "./DatePickerModal";
import { CALENDAR_WIDTH } from "./constants";

// react-native-calendars の型定義を拡張
interface CalendarHeaderInfo {
  month: number;
  year: number;
  timestamp: number;
  dateString: string;
  monthName: string;
}

export const ShiftCalendar: React.FC<ShiftCalendarProps> = ({
  shifts,
  selectedDate,
  currentMonth,
  onDayPress,
  onMonthChange,
  markedDates: propMarkedDates,
  onMount,
}) => {
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [tempDate, setTempDate] = useState<Date>(new Date(currentMonth));

  useEffect(() => {
    if (onMount) {
      onMount();
    }
  }, []);

  // カレンダーのマーカー用のデータを作成
  const markedDates = useMemo(() => {
    const marks: { [key: string]: any } = {};
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // 選択中の日付のスタイル
    if (selectedDate) {
      marks[selectedDate] = {
        selected: true,
        selectedColor: colors.primary + "20",
        selectedTextColor: colors.text.primary,
      };
    }

    // 予定がある日付にドットマーカーを追加
    shifts.forEach((shift) => {
      const shiftDate = new Date(shift.date);
      shiftDate.setHours(0, 0, 0, 0);
      const isPastShift = shiftDate < today;

      const existingMark = marks[shift.date] || {};
      marks[shift.date] = {
        ...existingMark,
        marked: true,
        dotColor: colors.primary,
        dotStyle: {
          width: 4,
          height: 4,
          borderRadius: 2,
          backgroundColor: isPastShift ? colors.primary : "transparent",
          borderWidth: isPastShift ? 0 : 1,
          borderColor: colors.primary,
        },
        selected: selectedDate === shift.date,
        selectedColor: colors.primary + "20",
      };
    });

    return marks;
  }, [selectedDate, shifts]);

  const handleDateSelect = (date: Date) => {
    setTempDate(date);
    if (onMonthChange) {
      onMonthChange({ dateString: date.toISOString().split("T")[0] });
    }
  };

  return (
    <View style={styles.container}>
      <Calendar
        current={currentMonth}
        onDayPress={onDayPress}
        onMonthChange={onMonthChange}
        markedDates={markedDates}
        enableSwipeMonths={true}
        style={styles.calendar}
        renderHeader={(date: CalendarHeaderInfo) => (
          <CalendarHeader
            date={new Date(date.timestamp)}
            onYearMonthSelect={() => {
              setTempDate(new Date(date.timestamp));
              setShowDatePicker(true);
            }}
          />
        )}
        theme={{
          backgroundColor: "transparent",
          calendarBackground: "transparent",
          textSectionTitleColor: "#666",
          dayTextColor: colors.text.primary,
          textDisabledColor: colors.text.secondary,
          selectedDayBackgroundColor: "#E3F2FD",
          selectedDayTextColor: "#2196F3",
          todayTextColor: "#2196F3",
          dotColor: colors.primary,
          selectedDotColor: colors.primary,
          monthTextColor: colors.text.primary,
          "stylesheet.calendar.main": {
            week: {
              marginTop: 0,
              marginBottom: 0,
              flexDirection: "row",
              justifyContent: "space-around",
              borderWidth: 0,
            },
            dayContainer: {
              borderWidth: 0,
            },
          },
        }}
        dayComponent={({ date, state, marking }: DayComponentProps) => (
          <DayComponent
            date={date}
            state={state}
            marking={marking}
            onPress={(dateString) => onDayPress({ dateString })}
          />
        )}
      />

      {selectedDate && (
        <ShiftList shifts={shifts} selectedDate={selectedDate} />
      )}

      <DatePickerModal
        isVisible={showDatePicker}
        initialDate={tempDate}
        onClose={() => setShowDatePicker(false)}
        onSelect={handleDateSelect}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    paddingVertical: 0,
    backgroundColor: "transparent",
  },
  calendar: {
    width: CALENDAR_WIDTH,
    backgroundColor: "transparent",
  },
});
