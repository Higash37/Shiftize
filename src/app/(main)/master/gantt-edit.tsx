import React from "react";
import { View, StyleSheet } from "react-native";
import { Stack } from "expo-router";
import { GanttChartMonthEdit } from "@/components/Shift";
import { useShifts } from "@/hooks/useShifts";
import { useUsers } from "@/hooks/useUsers";
import { ShiftItem } from "@/types/shift";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/services/firebase";

export default function GanttEditScreen() {
  const {
    shifts,
    fetchShiftsByMonth,
    loading: shiftsLoading,
    error: shiftsError,
  } = useShifts();
  const { users, loading: usersLoading, error: usersError } = useUsers();

  // 現在の年月を状態として保持
  const [currentYearMonth, setCurrentYearMonth] = React.useState(() => {
    const today = new Date();
    return { year: today.getFullYear(), month: today.getMonth() };
  });

  // 月が変わったときの処理
  const handleMonthChange = async (year: number, month: number) => {
    setCurrentYearMonth({ year, month });
    // 新しい月のシフトデータを取得
    await fetchShiftsByMonth(year, month);
  };

  const handleShiftUpdate = async (updatedShift: ShiftItem) => {
    try {
      // Firestoreの更新
      const shiftRef = doc(db, "shifts", updatedShift.id);
      await updateDoc(shiftRef, {
        startTime: updatedShift.startTime,
        endTime: updatedShift.endTime,
        updatedAt: new Date(),
      });
    } catch (error) {
      console.error("Error updating shift:", error);
    }
  };

  const handleShiftPress = (shift: ShiftItem) => {
    // シフトの詳細表示や追加の編集機能を実装する場合はここに追加
    console.log("Shift pressed:", shift);
  };

  if (shiftsLoading || usersLoading) {
    return <View style={styles.container} />;
  }

  if (shiftsError || usersError) {
    return <View style={styles.container} />;
  }

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: "シフト編集",
          headerShown: true,
        }}
      />{" "}
      <GanttChartMonthEdit
        shifts={shifts}
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
