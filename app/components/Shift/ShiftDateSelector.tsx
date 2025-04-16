import React from "react";
import { View, StyleSheet } from "react-native";
import { Calendar } from "react-native-calendars";
import { colors } from "../../constants/theme";

interface ShiftDateSelectorProps {
  selectedDate: string;
  onSelect: (date: string) => void;
}

const ShiftDateSelector: React.FC<ShiftDateSelectorProps> = ({
  selectedDate,
  onSelect,
}) => {
  return (
    <View style={styles.container}>
      <Calendar
        current={selectedDate || undefined}
        onDayPress={(day: { dateString: string }) => onSelect(day.dateString)}
        markedDates={{
          [selectedDate]: {
            selected: true,
            selectedColor: colors.primary,
          },
        }}
        theme={{
          todayTextColor: colors.primary,
          selectedDayBackgroundColor: colors.primary,
          selectedDayTextColor: "#ffffff",
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 8,
    overflow: "hidden",
  },
});

export default ShiftDateSelector;
