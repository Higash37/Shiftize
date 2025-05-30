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
}

export const HomeGanttMobileScreen: React.FC<Props> = ({
  namesFirst,
  namesSecond,
  timesFirst,
  timesSecond,
  sampleSchedule,
  CELL_WIDTH,
}) => {
  const { width: windowWidth } = useWindowDimensions();
  // テーブル描画用関数
  const renderTable = (names: string[], times: string[], label: string) => (
    <View style={{ marginBottom: 16, width: windowWidth }}>
      {/* ヘッダー */}
      <View style={{ flexDirection: "row", width: windowWidth }}>
        <View
          style={[
            styles.headerCell,
            styles.positionHeaderCell,
            { width: CELL_WIDTH },
          ]}
        >
          <Text style={styles.headerText}>名前</Text>
        </View>
        {times.map((time) => (
          <View key={time} style={[styles.headerCell, { width: CELL_WIDTH }]}>
            <Text style={styles.headerText}>{time}</Text>
          </View>
        ))}
      </View>
      {/* 本体 */}
      {names.map((name) => (
        <View
          key={name}
          style={{
            flexDirection: "row",
            width: windowWidth,
            borderBottomWidth: 1,
            borderBottomColor: "#e0e0e0",
          }}
        >
          <View style={[styles.positionCell, { width: CELL_WIDTH }]}>
            <Text style={styles.positionText}>{name}</Text>
          </View>
          {times.map((time) => {
            const slot = sampleSchedule
              .flatMap((col) => col.slots)
              .find((s) => s.name === name && s.time === time);
            return (
              <View
                key={time}
                style={[
                  styles.cell,
                  {
                    width: CELL_WIDTH,
                    height: CELL_WIDTH,
                    opacity: slot ? 1 : 0.2,
                  },
                ]}
              >
                {slot && <Text style={styles.taskText}>{slot.task}</Text>}
              </View>
            );
          })}
        </View>
      ))}
    </View>
  );

  return (
    <ScrollView horizontal>
      <View>
        {/* 午前テーブル */}
        {renderTable(namesFirst, timesFirst, "午前")}
        {/* 午後テーブル */}
        {renderTable(namesSecond, timesSecond, "午後")}
      </View>
    </ScrollView>
  );
};
