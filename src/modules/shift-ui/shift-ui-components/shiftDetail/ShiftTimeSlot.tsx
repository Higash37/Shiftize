import React from "react";
import { View, Text, StyleSheet, Dimensions } from "react-native";
import { colors } from "@/common/common-theme/ThemeColors";

// レスポンシブデザイン用の定数
const { width: SCREEN_WIDTH } = Dimensions.get("window");
const IS_SMALL_DEVICE = SCREEN_WIDTH < 375;

interface TimeSlotProps {
  type: "staff" | "class";
  startTime: string;
  endTime: string;
}

export const ShiftTimeSlot: React.FC<TimeSlotProps> = ({
  type,
  startTime,
  endTime,
}) => {
  return (
    <View style={styles.timeSlot}>
      <Text
        style={[
          styles.timeSlotText,
          styles.timeSlotType,
          {
            color: type === "class" ? colors.warning : colors.primary,
          },
        ]}
      >
        {type === "class" ? "授業" : "スタッフ"}
      </Text>
      <Text style={styles.timeSlotTime}>
        {startTime} ~ {endTime}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  timeSlot: {
    marginBottom: 8,
    flexDirection: "row",
    alignItems: "center",
  },
  timeSlotText: {
    fontSize: IS_SMALL_DEVICE ? 12 : 14,
    fontWeight: "500",
  },
  timeSlotType: {
    width: 60,
    fontSize: IS_SMALL_DEVICE ? 12 : 14,
    fontWeight: "500",
  },
  timeSlotTime: {
    fontSize: IS_SMALL_DEVICE ? 12 : 14,
    fontWeight: "500",
    color: colors.text.primary,
  },
});
