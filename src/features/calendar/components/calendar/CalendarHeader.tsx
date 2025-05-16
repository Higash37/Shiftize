import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { AntDesign } from "@expo/vector-icons";
import { colors } from "@/shared/constants/colors";

interface CalendarHeaderProps {
  date: Date;
  onYearMonthSelect: () => void;
}

export const CalendarHeader: React.FC<CalendarHeaderProps> = ({
  date,
  onYearMonthSelect,
}) => {
  const month = `${date.getFullYear()}年${date.getMonth() + 1}月`;

  return (
    <View style={styles.calendarHeader}>
      <TouchableOpacity
        style={styles.monthSelector}
        onPress={onYearMonthSelect}
      >
        <Text style={styles.monthText}>{month}</Text>
        <AntDesign
          name="calendar"
          size={20}
          color={colors.text.primary}
          style={styles.calendarIcon}
        />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  calendarHeader: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 4,
    backgroundColor: "transparent",
  },
  monthSelector: {
    flexDirection: "row",
    alignItems: "center",
  },
  monthText: {
    fontSize: 16,
    fontWeight: "bold",
    color: colors.text.primary,
  },
  calendarIcon: {
    marginLeft: 8,
  },
});
