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

export const HomeGanttMobileScreen: React.FC<Props> = ({
  namesFirst,
  namesSecond,
  timesFirst,
  timesSecond,
  sampleSchedule,
  CELL_WIDTH,
  showFirst, // 追加
}) => {
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();
  const MOBILE_CELL_WIDTH = Math.max(CELL_WIDTH, 45); // 以前は90、60に縮小
  // スマホ用の行の高さを画面サイズから自動計算
  // 例: (windowの高さ - ヘッダー - フッター) / 行数
  const HEADER_HEIGHT = 100; // ヘッダーの高さ（推定）
  const FOOTER_HEIGHT = 100; // フッターの高さ
  const TABBAR_HEIGHT = 56; // 下部ナビゲーションバーの高さ（必要に応じて調整）
  const VERTICAL_MARGIN = 5; // 上下マージン
  const timeRowCount = timesFirst.length; // 前半・後半とも同じ長さ想定
  const MOBILE_CELL_HEIGHT = Math.max(
    20,
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
          <View
            style={[
              styles.positionCell,
              { width: MOBILE_CELL_WIDTH, height: MOBILE_CELL_HEIGHT },
            ]}
          >
            <Text style={styles.positionText}>{name}</Text>
          </View>
          {/* ガントバー描画ロジック（start/end対応） */}
          {(() => {
            const timeList = times;
            const cells = [];
            let skip = 0;
            for (let i = 0; i < timeList.length; i++) {
              if (skip > 0) {
                skip--;
                continue;
              }
              const t = timeList[i];
              const slot = sampleSchedule
                .flatMap((col) => col.slots)
                .find((s) => s.name === name && s.start === t);
              if (slot) {
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
                        width: MOBILE_CELL_WIDTH * span,
                        height: MOBILE_CELL_HEIGHT,
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
                cells.push(
                  <View
                    key={t}
                    style={[
                      styles.cell,
                      {
                        width: MOBILE_CELL_WIDTH,
                        height: MOBILE_CELL_HEIGHT,
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

  // スマホ用：名前が列、時間が行になるテーブル
  const renderTransposedTable = (
    names: string[],
    times: string[],
    label: string
  ) => {
    return (
      <View style={{ marginBottom: 16, width: windowWidth }}>
        {/* ヘッダー（名前を横並び） */}
        <View style={{ flexDirection: "row", width: windowWidth }}>
          <View
            style={[
              styles.headerCell,
              { width: MOBILE_CELL_WIDTH, height: MOBILE_CELL_HEIGHT },
            ]}
          />
          {names.map((name) => (
            <View
              key={name}
              style={[
                styles.headerCell,
                { width: MOBILE_CELL_WIDTH, height: MOBILE_CELL_HEIGHT },
              ]}
            >
              <Text style={styles.headerText}>{name}</Text>
            </View>
          ))}
        </View>
        {/* 本体（時間ごとに1行） */}
        {times.map((time, rowIdx) => {
          return (
            <View
              key={time}
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
                  { width: MOBILE_CELL_WIDTH, height: MOBILE_CELL_HEIGHT },
                ]}
              >
                <Text style={styles.positionText}>{time}</Text>
              </View>
              {names.map((name, colIdx) => {
                // この時間帯に該当するシフトがあるか判定
                const slot = sampleSchedule
                  .flatMap((col) => col.slots)
                  .find(
                    (s) =>
                      s.name === name &&
                      // この時間帯がシフトの範囲内か
                      time >= s.start &&
                      time < s.end
                  );
                if (slot) {
                  return (
                    <View
                      key={name}
                      style={[
                        styles.cell,
                        {
                          width: MOBILE_CELL_WIDTH,
                          height: MOBILE_CELL_HEIGHT,
                          backgroundColor: "#e3f2fd",
                          borderColor: "#90caf9",
                          borderWidth: 1,
                          justifyContent: "center",
                          alignItems: "center",
                        },
                      ]}
                    >
                      <Text style={styles.taskText}>{slot.task}</Text>
                    </View>
                  );
                } else {
                  return (
                    <View
                      key={name}
                      style={[
                        styles.cell,
                        {
                          width: MOBILE_CELL_WIDTH,
                          height: MOBILE_CELL_HEIGHT,
                          opacity: 0.1,
                        },
                      ]}
                    />
                  );
                }
              })}
            </View>
          );
        })}
      </View>
    );
  };

  return (
    <View style={{ flex: 1 }}>
      {/* 前半/後半切り替えボタンは親で管理 */}
      <ScrollView
        horizontal
        style={{ flex: 1 }}
        contentContainerStyle={{ flex: 1 }}
      >
        {showFirst
          ? renderTransposedTable(namesFirst, timesFirst, "午前")
          : renderTransposedTable(namesSecond, timesSecond, "午後")}
      </ScrollView>
      {/* フッター */}
    </View>
  );
};
