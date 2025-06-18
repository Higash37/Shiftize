import React from "react";
import { View } from "react-native";
import { Stack } from "expo-router";
import { MasterHeader } from "@/common/common-ui/ui-layout";
import { GanttChartMonthView } from "@/modules/child-components/gantt-chart/GanttChartMonthView";
import { ganttViewViewStyles as styles } from "./GanttViewView.styles";
import type { GanttViewViewProps } from "./GanttViewView.types";

export const GanttViewView: React.FC<GanttViewViewProps> = ({
  shifts,
  users,
  days,
  currentYearMonth,
  onMonthChange,
  onShiftUpdate,
  onShiftPress,
}) => {
  return (
    <View style={styles.container}>
      <MasterHeader title="シフト確認" />
      <Stack.Screen
        options={{
          title: "シフト確認",
          headerShown: false,
        }}
      />
      <GanttChartMonthView
        shifts={shifts}
        days={days}
        users={users}
        onShiftPress={onShiftPress}
        onShiftUpdate={onShiftUpdate}
        onMonthChange={onMonthChange}
        classTimes={[]}
        selectedDate={
          new Date(currentYearMonth.year, currentYearMonth.month, 1)
        }
      />
    </View>
  );
};
