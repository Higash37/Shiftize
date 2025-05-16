import { StyleSheet } from "react-native";
import { MultiDatePickerStyles } from "./types";

export const styles = StyleSheet.create<MultiDatePickerStyles>({
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

export const calendarTheme = {
  todayTextColor: "#CC0033",
  selectedDayBackgroundColor: "#4A90E2",
  selectedDayTextColor: "#fff",
  textDayFontWeight: "bold",
};
