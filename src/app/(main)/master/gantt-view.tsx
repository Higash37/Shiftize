import React from "react";
import { View, StyleSheet, Alert } from "react-native";
import { Stack } from "expo-router";
import { GanttChartMonthView } from "@/modules";
import { useShifts } from "@/common/common-utils/util-shift/useShiftQueries";
import { useUsers } from "@/modules/user-management/user-hooks/useUserList";
import { ShiftItem } from "@/common/common-models/ModelIndex";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/services/firebase/firebase";
import type { ExtendedUser } from "@/modules/user-management/user-types/components";

export default function GanttViewScreen() {
  const { shifts, fetchShiftsByMonth } = useShifts();
  const { users } = useUsers();

  // 現在の年月を状態として保持
  const [currentYearMonth, setCurrentYearMonth] = React.useState(() => {
    const today = new Date();
    return { year: today.getFullYear(), month: today.getMonth() };
  });

  // 指定された年月の日付リストを生成する関数
  const generateDaysForMonth = (year: number, month: number) => {
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    return Array.from({ length: daysInMonth }, (_, i) => {
      const date = new Date(year, month, i + 1);
      return date.toISOString().split("T")[0];
    });
  };

  // 現在の年月に基づいて日付リストを生成
  const days = generateDaysForMonth(
    currentYearMonth.year,
    currentYearMonth.month
  );

  // 月が変わったときの処理
  const handleMonthChange = async (year: number, month: number) => {
    setCurrentYearMonth({ year, month });
    // 新しい月のシフトデータを取得
    await fetchShiftsByMonth(year, month);
  };

  // シフト更新ハンドラを実装
  const handleShiftUpdate = async (updatedShift: ShiftItem) => {
    try {
      // Firestoreの更新
      const shiftRef = doc(db, "shifts", updatedShift.id);
      await updateDoc(shiftRef, {
        startTime: updatedShift.startTime,
        endTime: updatedShift.endTime,
        updatedAt: new Date(),
      });
      Alert.alert("更新完了", "シフトを更新しました");
    } catch (error) {
      console.error("Error updating shift:", error);
      Alert.alert("エラー", "シフトの更新に失敗しました");
    }
  };

  // シフト選択ハンドラ
  const handleShiftPress = (shift: ShiftItem) => {
    // シフトの詳細表示や追加の編集機能を実装する場合はここに追加
    console.log("Shift pressed:", shift);
  };

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: "シフト確認",
          headerShown: true,
        }}
      />
      <GanttChartMonthView
        shifts={shifts}
        days={days}
        users={users.map((user: ExtendedUser) => user.nickname)}
        onShiftPress={handleShiftPress}
        onShiftUpdate={handleShiftUpdate}
        onMonthChange={handleMonthChange}
        classTimes={[]} /* 授業時間帯を空に設定して灰色の縦線を表示しない */
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
});
