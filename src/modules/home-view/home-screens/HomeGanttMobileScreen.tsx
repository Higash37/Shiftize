import React from "react";
import { View, Text, ScrollView, useWindowDimensions } from "react-native";
import { styles } from "../home-styles/home-view-styles";
import type { SampleScheduleColumn } from "../home-types/home-view-types";
import { GanttHeaderRow } from "../home-components/GanttHeaderRow";
import { GanttRowMobile } from "../home-components/GanttRowMobile";

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
const HEADER_HEIGHT = 160; // ヘッダーの高さ（推定）
const FOOTER_HEIGHT = 100; // フッターの高さ
const TABBAR_HEIGHT = 56; // 下部ナビゲーションバーの高さ
const VERTICAL_MARGIN = 5; // 上下マージン
const MIN_CELL_WIDTH = 70;
const MIN_CELL_HEIGHT = 20;

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
            <GanttRowMobile
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
