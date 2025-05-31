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
  showFirst: boolean; // 追加
}

export const HomeGanttWideScreen: React.FC<Props> = ({
  namesFirst,
  namesSecond,
  timesFirst,
  timesSecond,
  sampleSchedule,
  CELL_WIDTH,
  showFirst, // 追加
}) => {
  const { width: windowWidth } = useWindowDimensions();
  const totalColumnsFirst = timesFirst.length + 1;
  const totalColumnsSecond = timesSecond.length + 1;
  const cellWidthFirst = windowWidth / totalColumnsFirst;
  const cellWidthSecond = windowWidth / totalColumnsSecond;

  // セルの高さを半分に（PC画面専用）
  const cellHeightFirst = cellWidthFirst * 0.5;
  const cellHeightSecond = cellWidthSecond * 0.5;

  // テーブル描画
  const renderTable = (names: string[], times: string[], label: string) => (
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
        {times.map((time) => (
          <View
            key={time}
            style={[styles.headerCell, { width: cellWidthFirst }]}
          >
            <Text style={styles.headerText}>{time}</Text>
          </View>
        ))}
      </View>
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
          <View
            style={[
              styles.positionCell,
              { width: cellWidthFirst, height: cellHeightFirst },
            ]}
          >
            <Text style={styles.positionText}>{name}</Text>
          </View>
          {/* 横長バー描画ロジック */}
          {(() => {
            const timeList = times;
            const cells = [];
            let skip = 0;
            for (let i = 0; i < timeList.length; i++) {
              if (skip > 0) {
                skip--;
                continue;
              }
              // このセルの開始時刻
              const t = timeList[i];
              // この人のこの時間帯で開始するタスクを探す
              const slot = sampleSchedule
                .flatMap((col) => col.slots)
                .find((s) => s.name === name && s.start === t);
              if (slot) {
                // 終了時刻までのセル数を計算
                const startIdx = i;
                const endIdx = timeList.findIndex(
                  (tt, idx) => idx > i && tt === slot.end
                );
                const span = endIdx !== -1 ? endIdx - startIdx : 1;
                skip = span - 1;
                cells.push(
                  <View
                    key={t}
                    style={[
                      styles.cell,
                      {
                        width: cellWidthFirst * span,
                        height: cellHeightFirst,
                        backgroundColor: "#e3f2fd",
                        borderColor: "#90caf9",
                        borderWidth: 1,
                        justifyContent: "center",
                        alignItems: "center",
                      },
                    ]}
                  >
                    <Text style={styles.taskText}>
                      {slot.task} {slot.start}~{slot.end}
                    </Text>
                  </View>
                );
              } else {
                // 何もなければ空セル
                cells.push(
                  <View
                    key={t}
                    style={[
                      styles.cell,
                      {
                        width: cellWidthFirst,
                        height: cellHeightFirst,
                        opacity: 0.1,
                      },
                    ]}
                  />
                );
              }
            }
            return cells;
          })()}
        </View>
      ))}
    </View>
  );

  return (
    <View style={{ flex: 1 }}>
      {/* 前半/後半切り替えボタンは親で管理 */}
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ flex: 1 }}>
        {showFirst
          ? renderTable(namesFirst, timesFirst, "午前")
          : renderTable(namesSecond, timesSecond, "午後")}
      </ScrollView>
      {/* フッター */}
      <View
        style={{
          height: 48,
          backgroundColor: "#fafafa",
          borderTopWidth: 1,
          borderTopColor: "#e0e0e0",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Text style={{ color: "#888", fontSize: 13 }}>
          © Convenience Store Shift Scheduler
        </Text>
      </View>
    </View>
  );
};
