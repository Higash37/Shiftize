// src/components/Shift/MultiDatePicker.tsx
import React from "react";
import { View, StyleSheet, Text } from "react-native";
import { Calendar } from "react-native-calendars";

interface Props {
  selectedDates: string[];
  setSelectedDates: (dates: string[]) => void;
}

export default function MultiDatePicker({
  selectedDates,
  setSelectedDates,
}: Props) {
  const toggleDate = (dateString: string) => {
    if (selectedDates.includes(dateString)) {
      setSelectedDates(selectedDates.filter((d) => d !== dateString));
    } else {
      setSelectedDates([...selectedDates, dateString]);
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
        onDayPress={(day: any) => toggleDate(day.dateString)}
        markedDates={marked}
        theme={{
          todayTextColor: "#CC0033",
          selectedDayBackgroundColor: "#4A90E2",
          selectedDayTextColor: "#fff",
          textDayFontWeight: "bold",
        }}
        style={styles.calendar}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    elevation: 2,
  },
  label: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 12,
    color: "#003366",
  },
  calendar: {
    borderRadius: 12,
    overflow: "hidden",
  },
});
