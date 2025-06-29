import React from "react";
import {
  View,
  Text,
  ScrollView,
  useWindowDimensions,
  Pressable,
} from "react-native";
import { styles } from "../home-styles/home-view-styles";
import type { SampleScheduleColumn } from "../home-types/home-view-types";
import { GanttHeaderRow } from "../home-components/home-gantt/GanttHeaderRow";

interface Props {
  namesFirst: string[];
  namesSecond: string[];
  timesFirst: string[];
  timesSecond: string[];
  sampleSchedule: SampleScheduleColumn[];
  CELL_WIDTH: number;
  showFirst: boolean; // 追加
  onCellPress?: (userName: string) => void; // 追加
}

export const HomeGanttWideScreen: React.FC<Props> = ({
  namesFirst,
  namesSecond,
  timesFirst,
  timesSecond,
  sampleSchedule,
  CELL_WIDTH,
  showFirst, // 追加
  onCellPress, // 追加
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
            <Text style={[styles.headerText, { fontWeight: "bold" }]}>
              {time}
            </Text>
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
              // この人のこの時間帯で該当するタスクを探す（区間内判定）
              const slot = sampleSchedule
                .flatMap((col) => col.slots)
                .find((s) => {
                  if (s.name !== name) return false;
                  if (t === s.start && t === s.end && t === "22:00")
                    return true;
                  return t >= s.start && t < s.end;
                });
              if (slot) {
                // 終了時刻までのセル数を計算
                const startIdx = i;
                const endIdx = timeList.findIndex(
                  (tt, idx) => idx > i && tt === slot.end
                );
                const span = endIdx !== -1 ? endIdx - startIdx : 1;
                skip = span - 1;
                cells.push(
                  <Pressable
                    key={name + "-" + t + "-" + slot.start}
                    style={[
                      styles.cell,
                      {
                        width: cellWidthFirst * span,
                        height: cellHeightFirst,
                        backgroundColor:
                          slot.type === "class"
                            ? "#eee"
                            : slot.color || "#e3f2fd",
                        borderColor:
                          slot.type === "class"
                            ? "#bbb"
                            : slot.color || "#90caf9",
                        borderWidth: 1,
                        justifyContent: "center",
                        alignItems: "center",
                      },
                    ]}
                    onPress={() => onCellPress && onCellPress(name)}
                  >
                    <Text style={styles.taskText}>
                      {slot.task || ""} {slot.start}~{slot.end}
                    </Text>
                  </Pressable>
                );
              } else {
                // 何もなければ空セル
                cells.push(
                  <View
                    key={name + "-" + t + "-empty"}
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
    </View>
  );
};
