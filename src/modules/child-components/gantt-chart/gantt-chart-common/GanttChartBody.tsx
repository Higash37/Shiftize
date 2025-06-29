import React, { useMemo } from "react";
import { FlatList, ListRenderItemInfo } from "react-native";
import { GanttChartRow } from "./GanttChartRow";
import {
  ShiftItem,
  ShiftStatus,
  ShiftStatusConfig,
} from "@/common/common-models/ModelIndex";

interface GanttChartBodyProps {
  days: string[];
  rows: [string, ShiftItem[]][];
  dateColumnWidth: number;
  ganttColumnWidth: number;
  infoColumnWidth: number;
  cellWidth: number;
  halfHourLines: string[];
  isClassTime: (time: string) => boolean;
  getStatusConfig: (status: string) => ShiftStatusConfig;
  handleShiftPress: (shift: ShiftItem) => void;
  handleEmptyCellClick: (date: string, position: number) => void;
  onTimeChange?: (
    shiftId: string,
    newStartTime: string,
    newEndTime: string
  ) => void;
  styles: any;
  userColorsMap: Record<string, string>;
  statusStyles?: (status: string) => { borderColor: string; color: string };
}

interface RowData {
  date: string;
  group: ShiftItem[];
}

export const GanttChartBody: React.FC<GanttChartBodyProps> = ({
  days,
  rows,
  dateColumnWidth,
  ganttColumnWidth,
  infoColumnWidth,
  cellWidth,
  halfHourLines,
  isClassTime,
  getStatusConfig,
  handleShiftPress,
  handleEmptyCellClick,
  onTimeChange,
  styles,
  userColorsMap,
  statusStyles,
}) => {
  // 日付ごとに行を生成し、シフトがない日も空のグループとして含める
  const data: RowData[] = useMemo(
    () =>
      days
        .map((date) => {
          const found = rows.filter(([rowDate]) => rowDate === date);
          return found.length > 0
            ? found.map(([rowDate, group]) => ({ date: rowDate, group }))
            : [{ date, group: [] }];
        })
        .flat(),
    [days, rows]
  );

  return (
    <FlatList
      data={data}
      // ユニークなキーを生成するために日付とインデックスを組み合わせる
      keyExtractor={(item: RowData, index: number) => `${item.date}-${index}`}
      renderItem={({ item }: ListRenderItemInfo<RowData>) => (
        <GanttChartRow
          date={item.date}
          group={item.group}
          dateColumnWidth={dateColumnWidth}
          ganttColumnWidth={ganttColumnWidth}
          infoColumnWidth={infoColumnWidth}
          cellWidth={cellWidth}
          halfHourLines={halfHourLines}
          isClassTime={isClassTime}
          getStatusConfig={getStatusConfig}
          handleShiftPress={handleShiftPress}
          handleEmptyCellClick={handleEmptyCellClick}
          onTimeChange={onTimeChange}
          styles={styles}
          userColorsMap={userColorsMap}
          statusStyles={statusStyles}
        />
      )}
      initialNumToRender={20}
      windowSize={21}
      removeClippedSubviews={true}
    />
  );
};
