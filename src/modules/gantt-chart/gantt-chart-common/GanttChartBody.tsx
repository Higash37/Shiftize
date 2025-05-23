import React, { useMemo } from "react";
import { FlatList, ListRenderItemInfo } from "react-native";
import { GanttChartRow } from "./GanttChartRow";
import { ShiftItem } from "@/common/common-models/ModelIndex";

interface GanttChartBodyProps {
  days: string[];
  rows: [string, ShiftItem[]][];
  dateColumnWidth: number;
  ganttColumnWidth: number;
  infoColumnWidth: number;
  cellWidth: number;
  halfHourLines: string[];
  isClassTime: (time: string) => boolean;
  getStatusConfig: (status: string) => any;
  handleShiftPress: (shift: ShiftItem) => void;
  handleEmptyCellClick: (date: string, position: number) => void;
  styles: any;
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
  styles,
}) => {
  // 日付ごとにgroupを紐付け
  const data: RowData[] = useMemo(
    () =>
      days.map((date: string) => {
        const found = rows.filter(([rowDate]) => rowDate === date);
        return { date, group: found.length > 0 ? found[0][1] : [] };
      }),
    [days, rows]
  );

  return (
    <FlatList
      data={data}
      keyExtractor={(item: RowData) => item.date}
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
          styles={styles}
        />
      )}
      initialNumToRender={20}
      windowSize={21}
      removeClippedSubviews={true}
      getItemLayout={(_, index) => ({ length: 70, offset: 70 * index, index })}
    />
  );
};
