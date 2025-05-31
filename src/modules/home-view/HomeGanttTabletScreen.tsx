import React from "react";
import { View, Text, ScrollView, useWindowDimensions } from "react-native";
import { styles } from "./home-view-styles";
import type { SampleScheduleColumn } from "./home-view-types";

interface Props {
  namesFirst: string[];
  namesSecond: string[];
  timesFirst: string[];
  timesSecond: string[];
  sampleSchedule: SampleScheduleColumn[];
  CELL_WIDTH: number;
  showFirst: boolean;
  onCellPress?: (userName: string) => void;
}

// レイアウト用定数
const HEADER_HEIGHT = 200; // タブレット用にやや小さめ
const FOOTER_HEIGHT = 80;
const TABBAR_HEIGHT = 56;
const VERTICAL_MARGIN = 5;
const MIN_CELL_WIDTH = 120;
const MIN_CELL_HEIGHT = 28;

function GanttHeaderRowTablet({
  names,
  cellWidth,
  cellHeight,
}: {
  names: string[];
  cellWidth: number;
  cellHeight: number;
}) {
  return (
    <View style={{ flexDirection: "row" }}>
      <View
        style={[styles.headerCell, { width: cellWidth, height: cellHeight }]}
      />
      {names.map((name) => (
        <View
          key={name}
          style={[styles.headerCell, { width: cellWidth, height: cellHeight }]}
        >
          <Text style={styles.headerText}>{name}</Text>
        </View>
      ))}
    </View>
  );
}

function GanttRowTablet({
  time,
  names,
  sampleSchedule,
  cellWidth,
  cellHeight,
  onCellPress,
}: {
  time: string;
  names: string[];
  sampleSchedule: SampleScheduleColumn[];
  cellWidth: number;
  cellHeight: number;
  onCellPress?: (userName: string) => void;
}) {
  return (
    <View
      style={{
        flexDirection: "row",
        borderBottomWidth: 1,
        borderBottomColor: "#e0e0e0",
      }}
    >
      <View
        style={[styles.positionCell, { width: cellWidth, height: cellHeight }]}
      >
        <Text style={styles.positionText}>{time}</Text>
      </View>
      {names.map((name) => {
        const slot = sampleSchedule
          .flatMap((col) => col.slots)
          .find((s) => s.name === name && time >= s.start && time < s.end);
        return (
          <View
            key={name}
            style={[
              styles.cell,
              {
                width: cellWidth,
                height: cellHeight,
                backgroundColor: slot ? "#e3f2fd" : undefined,
                borderColor: slot ? "#90caf9" : undefined,
                borderWidth: slot ? 1 : 0,
                opacity: slot ? 1 : 0.1,
                justifyContent: "center",
                alignItems: "center",
              },
            ]}
            onTouchEnd={() => onCellPress && onCellPress(name)}
          >
            {slot && <Text style={styles.taskText}>{slot.task}</Text>}
          </View>
        );
      })}
    </View>
  );
}

export const HomeGanttTabletScreen: React.FC<Props> = ({
  namesFirst,
  namesSecond,
  timesFirst,
  timesSecond,
  sampleSchedule,
  CELL_WIDTH,
  showFirst,
  onCellPress,
}) => {
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();
  const cellWidth = Math.max(CELL_WIDTH, MIN_CELL_WIDTH);
  const timeRowCount = timesFirst.length;
  const cellHeight = Math.max(
    MIN_CELL_HEIGHT,
    Math.floor(
      (windowWidth >= 768 && windowWidth <= 1024
        ? windowHeight -
          HEADER_HEIGHT -
          FOOTER_HEIGHT -
          TABBAR_HEIGHT -
          VERTICAL_MARGIN
        : 400) / timeRowCount
    )
  );
  const names = showFirst ? namesFirst : namesSecond;
  const times = showFirst ? timesFirst : timesSecond;

  return (
    <View style={{ flex: 1 }}>
      <ScrollView
        horizontal
        style={{ flex: 1 }}
        contentContainerStyle={{ flex: 1 }}
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
      >
        <View style={{ minWidth: windowWidth }}>
          <GanttHeaderRowTablet
            names={names}
            cellWidth={cellWidth}
            cellHeight={cellHeight}
          />
          {times.map((time) => (
            <GanttRowTablet
              key={time}
              time={time}
              names={names}
              sampleSchedule={sampleSchedule}
              cellWidth={cellWidth}
              cellHeight={cellHeight}
              onCellPress={onCellPress}
            />
          ))}
        </View>
      </ScrollView>
    </View>
  );
};
