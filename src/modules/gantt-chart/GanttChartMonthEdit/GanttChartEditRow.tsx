import React from "react";
import { View } from "react-native";
import {
  DateCell,
  GanttChartGrid,
  GanttChartInfo,
  EmptyCell,
} from "../gantt-chart-common/components";

interface GanttChartEditRowProps {
  row: { date: string; groups: any[][] };
  dateColumnWidth: number;
  ganttColumnWidth: number;
  infoColumnWidth: number;
  cellWidth: number;
  halfHourLines: string[];
  isClassTime: (time: string) => boolean;
  getStatusConfig: (status: string) => any;
  handleShiftPress: (shift: any) => void;
  handleDeleteShift: (shift: any) => void;
  styles: any;
  handleEmptyCellClick: (date: string, position: number) => void;
}

export const GanttChartEditRow: React.FC<GanttChartEditRowProps> = ({
  row,
  dateColumnWidth,
  ganttColumnWidth,
  infoColumnWidth,
  cellWidth,
  halfHourLines,
  isClassTime,
  getStatusConfig,
  handleShiftPress,
  handleDeleteShift,
  styles,
  handleEmptyCellClick,
}) => {
  if (row.groups.length > 0) {
    return (
      <>
        {row.groups.map((group, idx) => (
          <View
            key={`${row.date}-${idx}`}
            style={[
              styles.shiftRow,
              {
                height: Math.max(65, group.length * 20 + 20),
                minHeight: Math.max(65, group.length * 20 + 20),
              },
            ]}
          >
            {idx === 0 ? (
              <DateCell
                date={row.date}
                dateColumnWidth={dateColumnWidth}
                styles={styles}
              />
            ) : (
              <View
                style={[styles.emptyCellDate, { width: dateColumnWidth }]}
              />
            )}
            <GanttChartGrid
              shifts={group}
              cellWidth={cellWidth}
              ganttColumnWidth={ganttColumnWidth}
              halfHourLines={halfHourLines}
              isClassTime={isClassTime}
              getStatusConfig={getStatusConfig}
              onShiftPress={handleShiftPress}
              styles={styles}
            />
            <GanttChartInfo
              shifts={group}
              getStatusConfig={getStatusConfig}
              onShiftPress={handleShiftPress}
              onDelete={handleDeleteShift}
              infoColumnWidth={infoColumnWidth}
              styles={styles}
            />
          </View>
        ))}
      </>
    );
  } else {
    return (
      <View style={styles.shiftRow}>
        <DateCell
          date={row.date}
          dateColumnWidth={dateColumnWidth}
          styles={styles}
        />
        <EmptyCell
          date={row.date}
          width={ganttColumnWidth}
          halfHourLines={halfHourLines}
          isClassTime={isClassTime}
          styles={styles}
          handleEmptyCellClick={handleEmptyCellClick}
        />
        <View style={[styles.emptyInfoCell, { width: infoColumnWidth }]} />
      </View>
    );
  }
};
