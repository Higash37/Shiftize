
import React, { useMemo } from "react";
import { View, Text } from "react-native";
import { Calendar } from "react-native-calendars";
import { createMultiDatePickerStyles, createCalendarTheme } from "./MultiDatePicker.styles";
import { MultiDatePickerProps } from "./types";
import type { DateData } from "react-native-calendars";
import { useThemedStyles } from "@/common/common-theme/md3/useThemedStyles";
import { useMD3Theme } from "@/common/common-theme/md3/MD3ThemeContext";

const MultiDatePicker: React.FC<MultiDatePickerProps> = ({
  selectedDates,
  onDatesChange,
  setSelectedDates,
}) => {
  const theme = useMD3Theme();
  const styles = useThemedStyles(createMultiDatePickerStyles);
  const calendarTheme = useMemo(() => createCalendarTheme(theme), [theme]);

  const toggleDate = (dateString: string) => {
    if (selectedDates.includes(dateString)) {
      const newDates = selectedDates.filter((d) => d !== dateString);
      onDatesChange(newDates);
      setSelectedDates?.(newDates);
    } else {
      const newDates = [...selectedDates, dateString];
      onDatesChange(newDates);
      setSelectedDates?.(newDates);
    }
  };

  const marked: Record<string, any> = {};
  selectedDates.forEach((date) => {
    marked[date] = {
      selected: true,
      marked: true,
      selectedColor: "#4A90E2",
    };
  });

  return (
    <View style={styles.container}>
      <Text style={styles.label}>📅 指導予定日を選択（複数可）</Text>
      <Calendar
        onDayPress={(day: DateData) => toggleDate(day.dateString)}
        markedDates={marked}
        theme={calendarTheme}
        style={styles.calendar}
      />
    </View>
  );
};

export default MultiDatePicker;
