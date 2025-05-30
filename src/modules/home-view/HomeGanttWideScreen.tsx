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

export const HomeGanttWideScreen: React.FC<Props> = ({
  namesFirst,
  namesSecond,
  timesFirst,
  timesSecond,
  sampleSchedule,
  CELL_WIDTH,
}) => {
  const { width: windowWidth } = useWindowDimensions();
  const totalColumnsFirst = timesFirst.length + 1;
  const totalColumnsSecond = timesSecond.length + 1;
  const cellWidthFirst = windowWidth / totalColumnsFirst;
  const cellWidthSecond = windowWidth / totalColumnsSecond;

  return (
    <View style={[styles.centerContent, { flex: 1 }]}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ flexDirection: "column" }}
        keyboardShouldPersistTaps="handled"
      >
        {/* 午前テーブル */}
        <View style={{ marginBottom: 16, width: windowWidth }}>
          {/* ヘッダー */}
          <View style={{ flexDirection: "row", width: windowWidth }}>
            <View
              style={[
                styles.headerCell,
                styles.positionHeaderCell,
                { width: cellWidthFirst },
              ]}
            >
              <Text style={styles.headerText}>名前</Text>
            </View>
            {timesFirst.map((time) => (
              <View
                key={time}
                style={[styles.headerCell, { width: cellWidthFirst }]}
              >
                <Text style={styles.headerText}>{time}</Text>
              </View>
            ))}
          </View>
          {namesFirst.map((name) => (
            <View
              key={name}
              style={{
                flexDirection: "row",
                width: windowWidth,
                borderBottomWidth: 1,
                borderBottomColor: "#e0e0e0",
              }}
            >
              <View style={[styles.positionCell, { width: cellWidthFirst }]}>
                <Text style={styles.positionText}>{name}</Text>
              </View>
              {timesFirst.map((time) => {
                const slot = sampleSchedule
                  .flatMap((col) => col.slots)
                  .find((s) => s.name === name && s.time === time);
                return (
                  <View
                    key={time}
                    style={[
                      styles.cell,
                      {
                        width: cellWidthFirst,
                        height: cellWidthFirst,
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
        {/* 午後テーブル */}
        <View style={{ width: windowWidth }}>
          {/* ヘッダー */}
          <View style={{ flexDirection: "row", width: windowWidth }}>
            <View
              style={[
                styles.headerCell,
                styles.positionHeaderCell,
                { width: cellWidthSecond },
              ]}
            >
              <Text style={styles.headerText}>名前</Text>
            </View>
            {timesSecond.map((time) => (
              <View
                key={time}
                style={[styles.headerCell, { width: cellWidthSecond }]}
              >
                <Text style={styles.headerText}>{time}</Text>
              </View>
            ))}
          </View>
          {namesSecond.map((name) => (
            <View
              key={name}
              style={{
                flexDirection: "row",
                width: windowWidth,
                borderBottomWidth: 1,
                borderBottomColor: "#e0e0e0",
              }}
            >
              <View style={[styles.positionCell, { width: cellWidthSecond }]}>
                <Text style={styles.positionText}>{name}</Text>
              </View>
              {timesSecond.map((time) => {
                const slot = sampleSchedule
                  .flatMap((col) => col.slots)
                  .find((s) => s.name === name && s.time === time);
                return (
                  <View
                    key={time}
                    style={[
                      styles.cell,
                      {
                        width: cellWidthSecond,
                        height: cellWidthSecond,
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
      </ScrollView>
    </View>
  );
};
