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
  onTaskAdd?: (shiftId: string) => void; // タスク追加ハンドラーを追加
  styles: any;
  userColorsMap: Record<string, string>;
  users?: Array<{ uid: string; role: string; nickname: string }>; // ユーザー情報を追加
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
  onTaskAdd,
  styles,
  userColorsMap,
  users = [], // デフォルト値を設定
  statusStyles,
}) => {
  // 日付ごとに行を生成し、シフトがない日も空のグループとして含める
  // 同じ日付の行をグループ化して、日付セルを結合表示するための情報を付与
  const data: (RowData & { isFirstInGroup: boolean; groupSize: number })[] =
    useMemo(() => {
      const baseData: RowData[] = days
        .map((date) => {
          const found = rows.filter(([rowDate]) => rowDate === date);
          return found.length > 0
            ? found.map(([rowDate, group]) => ({ date: rowDate, group }))
            : [{ date, group: [] }];
        })
        .flat();

      // 各日付の最初の行と、その日付の総行数を計算
      const result: (RowData & {
        isFirstInGroup: boolean;
        groupSize: number;
      })[] = [];
      const dateGroups = new Map<string, number>();

      // 各日付の行数をカウント
      baseData.forEach((item) => {
        dateGroups.set(item.date, (dateGroups.get(item.date) || 0) + 1);
      });

      // 各行に日付グループ情報を付与
      const dateFirstRowMap = new Map<string, boolean>();
      baseData.forEach((item) => {
        const isFirstInGroup = !dateFirstRowMap.has(item.date);
        if (isFirstInGroup) {
          dateFirstRowMap.set(item.date, true);
        }

        result.push({
          ...item,
          isFirstInGroup,
          groupSize: dateGroups.get(item.date) || 1,
        });
      });

      return result;
    }, [days, rows]);

  return (
    <FlatList
      data={data}
      showsVerticalScrollIndicator={false}
      // ユニークなキーを生成するために日付とインデックスを組み合わせる
      keyExtractor={(
        item: RowData & { isFirstInGroup: boolean; groupSize: number },
        index: number
      ) => `${item.date}-${index}`}
      renderItem={({
        item,
      }: ListRenderItemInfo<
        RowData & { isFirstInGroup: boolean; groupSize: number }
      >) => (
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
          onTaskAdd={onTaskAdd}
          styles={styles}
          userColorsMap={userColorsMap}
          users={users}
          statusStyles={statusStyles}
          isFirstInGroup={item.isFirstInGroup}
          groupSize={item.groupSize}
        />
      )}
      initialNumToRender={20}
      windowSize={21}
      removeClippedSubviews={true}
    />
  );
};
