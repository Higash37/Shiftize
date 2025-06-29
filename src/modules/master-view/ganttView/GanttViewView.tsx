import React from "react";
import { View, useWindowDimensions } from "react-native";
import { Stack } from "expo-router";
import { MasterHeader } from "@/common/common-ui/ui-layout";
import { GanttChartMonthView } from "@/modules/child-components/gantt-chart/GanttChartMonthView";
import { ShiftCardView } from "./ShiftCardView";
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
  const { width } = useWindowDimensions();
  const isTabletOrDesktop = width >= 768;

  return (
    <View
      style={styles.container}
      // @ts-ignore Web only prop
      className="gantt-view-container"
    >
      <MasterHeader title="シフト確認" />
      <Stack.Screen
        options={{
          title: "シフト確認",
          headerShown: false,
        }}
      />

      {/* レスポンシブ表示切り替え */}
      {isTabletOrDesktop ? (
        // タブレット・デスクトップ: ガントチャート表示
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
      ) : (
        // スマホ: カード表示
        <ShiftCardView
          shifts={shifts}
          users={users}
          days={days}
          currentYearMonth={currentYearMonth}
          onMonthChange={onMonthChange}
          onShiftUpdate={onShiftUpdate}
          onShiftPress={onShiftPress}
        />
      )}
    </View>
  );
};
