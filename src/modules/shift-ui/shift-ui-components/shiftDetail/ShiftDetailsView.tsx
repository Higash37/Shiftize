import React from "react";
import { View, StyleSheet, Dimensions } from "react-native";
import { colors } from "@/common/common-theme/ThemeColors";
import { ShiftTimeSlot } from "./ShiftTimeSlot";
import { getPlatformShadow } from "@/common/common-utils/util-style/StyleGenerator";

// レスポンシブデザイン用の定数
const { width: SCREEN_WIDTH } = Dimensions.get("window");
const IS_SMALL_DEVICE = SCREEN_WIDTH < 375;
const IS_TABLET = SCREEN_WIDTH > 768;

interface TimeSlot {
  type: "staff" | "class";
  startTime: string;
  endTime: string;
}

interface ShiftDetailsViewProps {
  timeSlots: TimeSlot[];
}

export const ShiftDetailsView: React.FC<ShiftDetailsViewProps> = ({
  timeSlots,
}) => {
  return (
    <View style={styles.detailsContainer}>
      {timeSlots.map((slot, index) => (
        <ShiftTimeSlot
          key={index}
          type={slot.type}
          startTime={slot.startTime}
          endTime={slot.endTime}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  detailsContainer: {
    width: "100%",
    maxWidth: IS_TABLET ? 600 : "95%",
    backgroundColor: colors.surface,
    borderRadius: 8,
    padding: IS_SMALL_DEVICE ? 8 : 12,
    marginTop: -8,
    marginBottom: 8,
    alignSelf: "center",
    borderWidth: 1,
    borderTopWidth: 0,
    borderColor: colors.border,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
});
