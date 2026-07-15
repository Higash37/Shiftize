

import React, { useMemo, useRef, useEffect, useCallback } from "react";
import { FlatList, ListRenderItemInfo, View, NativeScrollEvent, NativeSyntheticEvent, StyleSheet } from "react-native";
import { GanttChartRow } from "./GanttChartRow";
import { GanttChartInfo } from "./components";
import {
  ShiftItem,
  ShiftStatusConfig,
} from "@/common/common-models/ModelIndex";
import { getOptimizedFlatListProps } from "@/common/common-utils/performance/webOptimization";

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
  styles: ReturnType<typeof StyleSheet.create>;
  userColorsMap: Record<string, string>;
  users?: Array<{ uid: string; role: string; nickname: string }>;
  statusStyles?: (status: string) => { borderColor: string; color: string };
  colorMode?: "status" | "user";

  allShifts?: ShiftItem[];
  selectedDate?: Date;
  onDateSelect?: (date: string) => void;
  onMonthChange?: (month: { year: number; month: number }) => void;
}

interface RowData {
  date: string;
  group: ShiftItem[];
}

const GanttChartBodyInner: React.FC<GanttChartBodyProps> = ({
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
  users = [],
  statusStyles,
  colorMode = "status",

  allShifts = [],
  selectedDate,
  onDateSelect,
  onMonthChange,
}) => {

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

      const result: (RowData & {
        isFirstInGroup: boolean;
        groupSize: number;
      })[] = [];
      const dateGroups = new Map<string, number>();

      baseData.forEach((item) => {
        dateGroups.set(item.date, (dateGroups.get(item.date) || 0) + 1);
      });

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

  const flatListRef = useRef<FlatList>(null);
  const lastScrollOffset = useRef(0);

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    lastScrollOffset.current = event.nativeEvent.contentOffset.y;
  };

  const scrollToDate = useCallback((targetDate: string) => {
    const targetIndex = data.findIndex(item => item.date === targetDate);
    if (targetIndex >= 0 && flatListRef.current) {
      flatListRef.current.scrollToIndex({
        index: targetIndex,
        animated: true,
        viewPosition: 0.5,
      });
    }
  }, [data]);

  useEffect(() => {
    let timerId: ReturnType<typeof setTimeout> | null = null;
    if (flatListRef.current && lastScrollOffset.current > 0) {
      timerId = setTimeout(() => {
        flatListRef.current?.scrollToOffset({
          offset: lastScrollOffset.current,
          animated: false
        });
      }, 50);
    }
    return () => {
      if (timerId) clearTimeout(timerId);
    };
  }, [data]);

  return (
    <View style={{ flexDirection: "row", flex: 1 }}>
      {}
      <View style={{ flex: 1 }}>
        <FlatList
          ref={flatListRef}
          data={data}
          onScroll={handleScroll}
          scrollEventThrottle={16}
          showsVerticalScrollIndicator={true}
          {...getOptimizedFlatListProps()}

          keyExtractor={(
            item: RowData & { isFirstInGroup: boolean; groupSize: number },
            _index: number
          ) => {

            if (item.group.length > 0) {
              return `${item.date}-${item.group.map(s => s.id).join('-')}`;
            }
            return `${item.date}-empty-${item.isFirstInGroup}`;
          }}
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
              infoColumnWidth={0}
              cellWidth={cellWidth}
              halfHourLines={halfHourLines}
              isClassTime={isClassTime}
              getStatusConfig={getStatusConfig}
              handleShiftPress={handleShiftPress}
              handleEmptyCellClick={handleEmptyCellClick}
              {...(onTimeChange && { onTimeChange })}
              styles={styles}
              userColorsMap={userColorsMap}
              users={users}
              {...(statusStyles && { statusStyles })}
              isFirstInGroup={item.isFirstInGroup}
              groupSize={item.groupSize}
              colorMode={colorMode}
            />
          )}
          maintainVisibleContentPosition={{
            minIndexForVisible: 0,
            autoscrollToTopThreshold: 0
          }}
        />
      </View>

      {}
      <View style={{ width: infoColumnWidth }}>
        <GanttChartInfo
          shifts={[]}
          getStatusConfig={getStatusConfig}
          onShiftPress={handleShiftPress}
          onDelete={() => {}}
          infoColumnWidth={infoColumnWidth}
          styles={styles}
          allShifts={allShifts}
          selectedDate={selectedDate || new Date()}
          onDateSelect={(date) => {
            scrollToDate(date);
            onDateSelect?.(date);
          }}
          {...(onMonthChange && { onMonthChange })}
        />
      </View>
    </View>
  );
};

export const GanttChartBody = React.memo(GanttChartBodyInner);
