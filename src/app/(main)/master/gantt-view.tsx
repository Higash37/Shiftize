import React from "react";
import { View, StyleSheet } from "react-native";
import { Stack } from "expo-router";
import { GanttChartMonthView } from "@components/Shift";
import { useShifts } from "@/hooks/useShifts";
import { useUsers } from "@/hooks/useUsers";

interface User {
  id: string;
  nickname: string;
  role: string;
}

export default function GanttViewScreen() {
  const { shifts } = useShifts();
  const { users } = useUsers();

  // 今月の日付リストを生成
  const today = new Date();
  const days = Array.from({ length: 30 }, (_, i) => {
    const date = new Date(today.getFullYear(), today.getMonth(), i + 1);
    return date.toISOString().split("T")[0];
  });

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
        users={users.map((user: User) => user.nickname)}
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
