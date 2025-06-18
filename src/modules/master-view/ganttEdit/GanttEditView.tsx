import React from "react";
import { View } from "react-native";
import { Stack } from "expo-router";
import { MasterHeader } from "@/common/common-ui/ui-layout";
import { GanttChartMonthView } from "@/modules/child-components/gantt-chart/GanttChartMonthView";
import { ganttEditViewStyles as styles } from "./GanttEditView.styles";
import type { GanttEditViewProps } from "./GanttEditView.types";

export const GanttEditView: React.FC<GanttEditViewProps> = ({
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
        users={users}
        selectedDate={
          new Date(currentYearMonth.year, currentYearMonth.month, 1)
        }
        onShiftPress={onShiftPress}
        onShiftUpdate={onShiftUpdate}
        onMonthChange={onMonthChange}
        classTimes={[]}
      />
    </View>
  );
};
