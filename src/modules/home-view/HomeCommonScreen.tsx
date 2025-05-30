// 共通ホーム画面（リファクタリング後）
// 旧: app/(main)/HomeCommonScreen.tsx
// スタイル分割済み（home-view-styles.ts）
// 型定義分割済み（home-view-types.ts）
import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  useWindowDimensions,
  Pressable,
} from "react-native";
import { styles } from "./home-view-styles";
import { sampleSchedule } from "./scheduleSample";
import { format, addDays } from "date-fns";
import ja from "date-fns/locale/ja";
import { DatePickerModal } from "@/modules/child-components/calendar/calendar-components/calendar-modal/DatePickerModal";
import type { SampleScheduleColumn } from "./home-view-types";

// 型定義のimport
// sampleSchedule: SampleScheduleColumn[]
const allNames: string[] = Array.from(
  new Set(sampleSchedule.flatMap((col) => col.slots.map((s) => s.name)))
);
// 9:00～22:00の30分刻みの時間ラベルを生成
const allTimes: string[] = [];
for (let h = 9; h <= 22; h++) {
  allTimes.push(`${h}:00`);
  if (h !== 22) allTimes.push(`${h}:30`);
}

export default function HomeCommonScreen() {
  const { width, height } = useWindowDimensions();
  const isConsole = width > height && width < 1200; // 仮: 横長かつ1200px未満をコンソール画面とみなす
  // レイアウト判定
  const isMobile = width < 768; // 幅が狭ければスマホ扱い
  const isWide = width >= 768; // PC/タブレット
  const minCell = 36;
  const maxCell = isWide ? 80 : 56;
  const baseCell = Math.floor(width / (allTimes.length + 1));
  const CELL_WIDTH = Math.max(minCell, Math.min(maxCell, baseCell));

  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const handlePrevDay = () => setSelectedDate((d) => addDays(d, -1));
  const handleNextDay = () => setSelectedDate((d) => addDays(d, 1));
  const dateLabel = format(selectedDate, "yyyy年M月d日(E)", { locale: ja });
  const openDatePicker = () => setShowDatePicker(true);

  // スマホ・タブレット・PC・コンソールでレイアウトを正しく分岐
  // isWide: PC/タブレット横向き, isConsole: 横長な小型画面, それ以外はスマホ
  const isTablet = width >= 768 && width <= 1024;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>作業スケジュール（講師・マスター共通）</Text>
      <View style={styles.datePickerRow}>
        <Text style={styles.dateNavBtn} onPress={handlePrevDay}>
          {"<"}
        </Text>
        <Pressable onPress={openDatePicker}>
          <Text style={styles.dateLabel}>
            {format(selectedDate, "yyyy年M月d日")}
          </Text>
        </Pressable>
        <Text style={styles.dateNavBtn} onPress={handleNextDay}>
          {">"}
        </Text>
      </View>
      <DatePickerModal
        isVisible={showDatePicker}
        initialDate={selectedDate}
        onClose={() => setShowDatePicker(false)}
        onSelect={(date) => {
          setSelectedDate(date);
          setShowDatePicker(false);
        }}
      />
      <View style={styles.centerContent}>
        {/* ヘッダー行 */}
        <View style={{ flexDirection: "row", width: "100%" }}>
          {isWide ? (
            <>
              <View
                style={[
                  styles.headerCell,
                  styles.positionHeaderCell,
                  { width: CELL_WIDTH },
                ]}
              >
                <Text style={styles.headerText}>名前</Text>
              </View>
              {allTimes.map((time) => (
                <View
                  key={time}
                  style={[styles.headerCell, { width: CELL_WIDTH }]}
                >
                  <Text style={styles.headerText}>{time}</Text>
                </View>
              ))}
            </>
          ) : (
            <>
              <View
                style={[
                  styles.headerCell,
                  styles.timeHeaderCell,
                  { width: CELL_WIDTH },
                ]}
              >
                <Text style={styles.headerText}>時間</Text>
              </View>
              {allNames.map((name) => (
                <View
                  key={name}
                  style={[styles.headerCell, { width: CELL_WIDTH }]}
                >
                  <Text style={styles.headerText}>{name}</Text>
                </View>
              ))}
            </>
          )}
        </View>
        {/* 本体 */}
        <ScrollView
          horizontal={isWide}
          contentContainerStyle={
            isWide ? { flexDirection: "column" } : undefined
          }
        >
          {isWide
            ? allNames.map((name) => (
                <View key={name} style={{ flexDirection: "row" }}>
                  <View style={[styles.positionCell, { width: CELL_WIDTH }]}>
                    <Text style={styles.positionText}>{name}</Text>
                  </View>
                  {allTimes.map((time) => {
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
                        {slot && (
                          <Text style={styles.taskText}>{slot.task}</Text>
                        )}
                      </View>
                    );
                  })}
                </View>
              ))
            : allTimes.map((time) => (
                <View key={time} style={{ flexDirection: "row" }}>
                  <View style={[styles.timeCell, { width: CELL_WIDTH }]}>
                    <Text style={styles.timeText}>{time}</Text>
                  </View>
                  {allNames.map((name) => {
                    const slot = sampleSchedule
                      .flatMap((col) => col.slots)
                      .find((s) => s.name === name && s.time === time);
                    return (
                      <View
                        key={name}
                        style={[
                          styles.cell,
                          {
                            width: CELL_WIDTH,
                            height: CELL_WIDTH,
                            opacity: slot ? 1 : 0.2,
                          },
                        ]}
                      >
                        {slot && (
                          <Text style={styles.taskText}>{slot.task}</Text>
                        )}
                      </View>
                    );
                  })}
                </View>
              ))}
        </ScrollView>
      </View>
    </View>
  );
}
