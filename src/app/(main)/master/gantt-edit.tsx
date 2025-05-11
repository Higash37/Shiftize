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
  const { shifts, loading: shiftsLoading, error: shiftsError } = useShifts();
  const { users, loading: usersLoading, error: usersError } = useUsers();

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
      />
      <GanttChartMonthEdit
        shifts={shifts}
        onShiftPress={handleShiftPress}
        onShiftUpdate={handleShiftUpdate}
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
