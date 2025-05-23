import React from "react";
import { View, StyleSheet } from "react-native";
import { Stack } from "expo-router";
import { GanttChartMonthView } from "@/modules/gantt-chart/GanttChartMonthView";
import { useShifts } from "@/common/common-utils/util-shift/useShiftQueries";
import { useUsers } from "@/modules/user-management/user-hooks/useUserList";
import { ShiftItem } from "@/common/common-models/ModelIndex";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/services/firebase/firebase";
import { MasterHeader } from "@/common/common-ui/ui-layout";

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

  // 一括承認や編集後のリロード用: 引数なしで月のシフト再取得
  const handleShiftUpdate = async () => {
    await fetchShiftsByMonth(currentYearMonth.year, currentYearMonth.month);
  };

  const handleShiftPress = (shift: ShiftItem) => {
    // シフトの詳細表示や追加の編集機能を実装する場合はここに追加
    console.log("Shift pressed:", shift);
  };

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

  if (shiftsLoading || usersLoading) {
    return <View style={styles.container} />;
  }

  if (shiftsError || usersError) {
    return <View style={styles.container} />;
  }

  return (
    <View style={styles.container}>
      <MasterHeader title="シフト編集" />
      <Stack.Screen
        options={{
          title: "シフト編集",
          headerShown: false,
        }}
      />
      <GanttChartMonthView
        shifts={shifts}
        days={days}
        users={users.map((user) => ({
          uid: user.uid,
          nickname: user.nickname,
        }))}
        selectedDate={
          new Date(currentYearMonth.year, currentYearMonth.month, 1)
        }
        onShiftPress={handleShiftPress}
        onShiftUpdate={handleShiftUpdate}
        onMonthChange={handleMonthChange}
        classTimes={[]}
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
