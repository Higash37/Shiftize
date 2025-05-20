import React, { memo } from "react";
import { View, StyleSheet } from "react-native";
import {
  Shift as CommonShift,
  ShiftType,
} from "@/common/common-models/ModelIndex";
import { Shift as ModuleShift } from "@/common/common-models/ModelIndex";
import { ShiftDetails } from "@/modules/components/Shift/ShiftDetails";

interface ShiftAdapterProps {
  shift: CommonShift;
  isOpen: boolean;
}

/**
 * 異なる型定義のシフトデータを変換するアダプターコンポーネント
 * CommonShift型をModuleShift型に変換してShiftDetailsに渡す
 */
export const ShiftDetailsAdapter = memo<ShiftAdapterProps>(
  ({ shift, isOpen }) => {
    // ShiftStatusの変換（"completed"を考慮）
    let adaptedStatus: ModuleShift["status"] = "pending";

    if (shift.status === "completed") {
      // "completed"はModuleShiftでは対応する値がないので"approved"にマッピング
      adaptedStatus = "approved";
    } else {
      // その他のステータスは直接変換可能
      adaptedStatus = shift.status as ModuleShift["status"];
    }

    // common-models/ModelIndex からの Shift 型を modules/shift/types/shift の Shift 型に変換
    const adaptedShift: ModuleShift = {
      id: shift.id,
      userId: shift.userId,
      nickname: shift.nickname || "ユーザー", // nicknameがundefinedの場合のフォールバック
      date: shift.date,
      startTime: shift.startTime,
      endTime: shift.endTime,
      type: shift.type || ("staff" as ShiftType),
      subject: shift.subject,
      isCompleted: shift.status === "completed" || shift.isCompleted || false, // completedステータスの場合はisCompletedをtrueに
      status: adaptedStatus,
      classes: shift.classes,
      // その他の必要なフィールドを適宜変換
    }; // isOpenがfalseの場合は何も表示しない（表示・非表示の切り替えをより確実に）
    if (!isOpen) {
      return null;
    }

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
