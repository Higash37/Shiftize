import { StyleSheet } from "react-native";
import { colors } from "@/shared/theme/colors";
import { ShiftDateSelectorStyles } from "./types";

export const styles = StyleSheet.create<ShiftDateSelectorStyles>({
  container: {
    borderRadius: 8,
    overflow: "hidden",
  },
});

export const calendarTheme = {
  todayTextColor: colors.primary,
  selectedDayBackgroundColor: colors.primary,
  selectedDayTextColor: "#ffffff",
};
