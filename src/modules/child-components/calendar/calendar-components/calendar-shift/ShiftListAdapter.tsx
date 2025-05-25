import React, { memo } from "react";
import { View, StyleSheet } from "react-native";
import { ShiftDetails } from "./ShiftDetails";
import { ShiftAdapterProps } from "../../calendar-types/shift.types";
import {
  Shift,
  ShiftItem,
} from "@/common/common-models/model-shift/shiftTypes";

const adaptShift = (shift: Shift): ShiftItem => {
  return {
    id: shift.id,
    userId: shift.userId,
    nickname: shift.nickname || "",
    date: shift.date,
    startTime: shift.startTime,
    endTime: shift.endTime,
    type: shift.type || "user",
    subject: shift.subject,
    isCompleted: shift.isCompleted || false,
    status: shift.status,
    duration: shift.duration?.toString() || "0",
    createdAt: shift.createdAt || new Date(),
    updatedAt: shift.updatedAt || new Date(),
    classes: shift.classes,
    requestedChanges: shift.requestedChanges?.[0],
  };
};

/**
 * シフト詳細表示用のアダプターコンポーネント
 */
export const ShiftDetailsAdapter = memo<ShiftAdapterProps>(
  ({ shift, isOpen }) => {
    // isOpenがfalseの場合は何も表示しない
    if (!isOpen) {
      return null;
    }

    const adaptedShift = adaptShift(shift);

    return (
      <View style={styles.detailsContainer}>
        <ShiftDetails shift={adaptedShift} isOpen={true} maxHeight={150} />
      </View>
    );
  }
);

// スタイルを定義
const styles = StyleSheet.create({
  detailsContainer: {
    marginHorizontal: 5,
    marginBottom: 10,
    borderRadius: 8,
    overflow: "hidden",
  },
});
