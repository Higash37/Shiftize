import React from "react";
import { View, Text, ScrollView, useWindowDimensions } from "react-native";
import { styles } from "../home-styles/home-view-styles";
import type { SampleScheduleColumn } from "../home-types/home-view-types";

interface Props {
  namesFirst: string[];
  namesSecond: string[];
  timesFirst: string[];
  timesSecond: string[];
  sampleSchedule: SampleScheduleColumn[];
  CELL_WIDTH: number;
  showFirst: boolean;
  onCellPress?: (userName: string) => void; // 追加
}

// レイアウト用定数
const HEADER_HEIGHT = 100; // ヘッダーの高さ（推定）
const FOOTER_HEIGHT = 100; // フッターの高さ
const TABBAR_HEIGHT = 56; // 下部ナビゲーションバーの高さ
const VERTICAL_MARGIN = 5; // 上下マージン
const MIN_CELL_WIDTH = 45;
const MIN_CELL_HEIGHT = 20;

// ヘッダー行（名前ラベル）
function GanttHeaderRow({
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

// 1行分のガントチャート
function GanttRow({
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
        // ここでslotの判定を修正: time >= s.start && time < s.end だと 22:00が含まれない
        const slot = sampleSchedule
          .flatMap((col) => col.slots)
          .find((s) => {
            // 通常: time >= s.start && time < s.end
            // ただし、time==s.start==s.end==22:00 の場合も含める
            if (time === s.start && time === s.end && time === "22:00")
              return true;
            return time >= s.start && time < s.end;
          });
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

export const HomeGanttMobileScreen: React.FC<Props> = ({
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
      (windowWidth < 768
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
          <GanttHeaderRow
            names={names}
            cellWidth={cellWidth}
            cellHeight={cellHeight}
          />
          {times.map((time) => (
            <GanttRow
              key={time}
              time={time}
              names={names}
              sampleSchedule={sampleSchedule}
              cellWidth={cellWidth}
              cellHeight={cellHeight}
              onCellPress={onCellPress} // 追加
            />
          ))}
        </View>
      </ScrollView>
    </View>
  );
};
