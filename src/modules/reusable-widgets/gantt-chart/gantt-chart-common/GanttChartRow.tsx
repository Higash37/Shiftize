

import React from "react";
import { View, StyleSheet } from "react-native";
import {
  ShiftItem,
  ShiftStatus,
  ShiftStatusConfig,
} from "@/common/common-models/ModelIndex";
import {
  DateCell,
  GanttChartGrid,
  GanttChartInfo,
  EmptyCell,
} from "./components";
import { getDateBackgroundColor } from "@/common/common-utils/util-date/dateUtils";

interface GanttChartRowProps {
  date: string;
  group: ShiftItem[];
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
  statusStyles?: (status: ShiftStatus) => {
    borderColor: string;
    color: string;
  };
  isFirstInGroup?: boolean;
  groupSize?: number;
  colorMode?: "status" | "user";
}

export { GanttChartRowProps };

const GanttChartRowComponent: React.FC<GanttChartRowProps> = ({
  date,
  group,
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
  statusStyles: _statusStyles,
  isFirstInGroup = true,
  groupSize = 1,
  colorMode = "status",
}) => {

  const rowHeight = styles['shiftRow']?.height || 65;
  const mergedCellHeight =
    typeof rowHeight === "number" ? rowHeight * groupSize : 65 * groupSize;

  const dateBackgroundColor = getDateBackgroundColor(date);

  if (group && group.length > 0) {

    return (
      <View key={date} style={[styles['shiftRow'], { backgroundColor: dateBackgroundColor, flexDirection: "row", alignItems: "flex-start" }]}>
        {}
        {isFirstInGroup && (
          <View style={{ position: "absolute", left: 0, top: 0, zIndex: 10 }}>
            <DateCell
              date={date}
              dateColumnWidth={dateColumnWidth}
              styles={{
                ...styles,
                dateCell: {
                  ...styles['dateCell'],
                  height: mergedCellHeight,
                },
              }}
            />
          </View>
        )}
        {}
        <View style={{ width: dateColumnWidth }} />
        <View style={{ height: rowHeight, borderBottomWidth: 1, borderBottomColor: "#E0E0E0" }}>
          <GanttChartGrid
            shifts={group}
            cellWidth={cellWidth}
            ganttColumnWidth={ganttColumnWidth}
            halfHourLines={halfHourLines}
            isClassTime={isClassTime}
            getStatusConfig={getStatusConfig}
            onShiftPress={handleShiftPress}
            onBackgroundPress={(x) => {
              const position =
                (x / ganttColumnWidth) * ((halfHourLines.length - 1) / 2);
              handleEmptyCellClick(date, position);
            }}
            {...(onTimeChange && { onTimeChange })}
            styles={styles}
            userColorsMap={userColorsMap}
            users={users}
            colorMode={colorMode}
          />
        </View>
        <View style={{ borderBottomWidth: 1, borderBottomColor: "#E0E0E0" }}>
          <GanttChartInfo
            shifts={group}
            getStatusConfig={getStatusConfig}
            onShiftPress={handleShiftPress}
            onDelete={() => {}}
            infoColumnWidth={infoColumnWidth}
            styles={styles}
          />
        </View>
      </View>
    );
  } else {

    return (
      <View key={date} style={[styles['shiftRow'], { backgroundColor: dateBackgroundColor, flexDirection: "row", alignItems: "flex-start" }]}>
        {}
        {isFirstInGroup && (
          <View style={{ position: "absolute", left: 0, top: 0, zIndex: 10 }}>
            <DateCell
              date={date}
              dateColumnWidth={dateColumnWidth}
              styles={{
                ...styles,
                dateCell: {
                  ...styles['dateCell'],
                  height: mergedCellHeight,
                },
              }}
            />
          </View>
        )}
        {}
        <View style={{ width: dateColumnWidth }} />
        <View style={{ height: rowHeight, borderBottomWidth: 1, borderBottomColor: "#E0E0E0" }}>
          <EmptyCell
            date={date}
            width={ganttColumnWidth}
            cellWidth={cellWidth}
            halfHourLines={halfHourLines}
            isClassTime={isClassTime}
            styles={styles}
            handleEmptyCellClick={handleEmptyCellClick}
          />
        </View>
        <View style={[styles['emptyInfoCell'], { width: infoColumnWidth, height: rowHeight, borderBottomWidth: 1, borderBottomColor: "#E0E0E0" }]} />
      </View>
    );
  }
};

export const GanttChartRow = React.memo(GanttChartRowComponent);
