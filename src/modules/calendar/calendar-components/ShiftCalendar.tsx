import React, { useMemo, useState, useEffect } from "react";
import { Calendar } from "react-native-calendars";
import {
  View,
  StyleSheet,
  Dimensions,
  useWindowDimensions,
} from "react-native";
import { colors } from "@/common/common-theme/ThemeColors";
import { ShiftCalendarProps, DayComponentProps } from "../calendar-types/types";
import { DayComponent } from "./DayComponent";
import { CalendarHeader } from "./CalendarHeader";
import { ShiftList } from "./ShiftList";
import { DatePickerModal } from "./DatePickerModal";
import {
  useResponsiveCalendarSize,
  PLATFORM_SPECIFIC,
} from "../calendar-constants/constants";
import { getPlatformShadow } from "@/common/common-utils/util-style/StyleGenerator";

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
  const { calendarWidth, isSmallScreen } = useResponsiveCalendarSize();
  const { width: windowWidth } = useWindowDimensions();

  // レスポンシブなスタイルを生成
  const responsiveStyles = useMemo(
    () => ({
      calendar: {
        width: isSmallScreen ? "90%" : calendarWidth, // 85%に縮小
        maxWidth: 480,
        marginHorizontal: "auto", // 中央揃え
      },
    }),
    [calendarWidth, isSmallScreen]
  );

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
    <View
      style={[styles.container, isSmallScreen && styles.containerFullWidth]}
    >
      <Calendar
        current={currentMonth}
        onDayPress={onDayPress}
        onMonthChange={onMonthChange}
        markedDates={markedDates}
        enableSwipeMonths={true}
        style={[
          styles.calendar,
          styles.calendarShadow,
          responsiveStyles.calendar,
        ]}
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
          textSectionTitleColor: colors.text.secondary,
          dayTextColor: colors.text.primary,
          textDisabledColor: colors.text.secondary,
          selectedDayBackgroundColor: colors.primary + "20",
          selectedDayTextColor: colors.primary,
          todayTextColor: colors.primary,
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
    width: "100%",
  },
  containerFullWidth: {
    paddingHorizontal: 16, // 余白を増やして見切れないようにする
  },
  calendar: {
    backgroundColor: "transparent",
    borderRadius: 8,
    marginHorizontal: "auto", // 中央揃え
  },
  calendarShadow: {
    ...getPlatformShadow(2),
    marginBottom: 16, // 下の余白も少し増やす
  },
});
