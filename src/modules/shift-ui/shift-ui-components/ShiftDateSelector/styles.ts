import { StyleSheet } from "react-native";
import { colors } from "@/common/common-theme/ThemeColors";
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
