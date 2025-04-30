import React from "react";
import { TouchableOpacity, Text, View, StyleSheet } from "react-native";
import { colors } from "@/theme/colors";
import { DayComponentProps } from "./types";
import { getDayColor } from "./utils";
import { DAY_WIDTH, DAY_HEIGHT } from "./constants";

export const DayComponent: React.FC<{
  date?: DayComponentProps["date"];
  state?: DayComponentProps["state"];
  marking?: DayComponentProps["marking"];
  onPress: (dateString: string) => void;
}> = ({ date, state, marking, onPress }) => {
  return (
    <TouchableOpacity
      style={[
        styles.dayContainer,
        {
          borderRightWidth: 1,
          borderRightColor: "#E5E5E5",
          borderBottomWidth: 1,
          borderBottomColor: "#E5E5E5",
        },
      ]}
      onPress={() => date && onPress(date.dateString)}
    >
      {marking?.selected && <View style={styles.selectedDay} />}
      <Text
        style={[
          styles.dayText,
          {
            color: getDayColor(date?.dateString, state, marking?.selected),
          },
          state === "today" && styles.todayText,
        ]}
      >
        {date?.day}
      </Text>
      {marking?.marked && <View style={[styles.dot, marking.dotStyle]} />}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  dayContainer: {
    width: DAY_WIDTH,
    height: DAY_HEIGHT,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "transparent",
    position: "relative",
  },
  selectedDay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: colors.selected,
    borderRadius: DAY_WIDTH / 2,
  },
  dayText: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#333",
    zIndex: 1,
  },
  todayText: {
    color: "#2196F3",
    fontWeight: "bold",
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    marginTop: 1,
    zIndex: 1,
  },
});
