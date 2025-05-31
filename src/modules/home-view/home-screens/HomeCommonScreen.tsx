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
import { styles } from "../home-styles/home-view-styles";
import { sampleSchedule } from "../home-data/scheduleSample";
import { format, addDays } from "date-fns";
import ja from "date-fns/locale/ja";
import { DatePickerModal } from "@/modules/child-components/calendar/calendar-components/calendar-modal/DatePickerModal";
import type { SampleScheduleColumn } from "../home-types/home-view-types";
import { HomeGanttWideScreen } from "./HomeGanttWideScreen";
import { HomeGanttMobileScreen } from "./HomeGanttMobileScreen";
import { HomeGanttTabletScreen } from "./HomeGanttTabletScreen";
import { GanttHalfSwitch } from "../home-components/GanttHalfSwitch"; // 追加
import { UserDayGanttModal } from "../home-components/UserDayGanttModal";

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
// 時間帯を2分割
const mid = Math.ceil(allTimes.length / 2);
const timesFirst = allTimes.slice(0, mid);
const timesSecond = allTimes.slice(mid - 1);
// 2列目の先頭は必ず1列目の最後と重複させる
// 名前リストを午前・午後で分割（例: 前半2名、後半残り）
const namesFirst = [
  "石黒",
  "ウエノ",
  "里田",
  "作安",
  "午前追加1",
  "午前追加2",
  "午前追加3",
  "午前追加4",
  "午前追加5",
];
const namesSecond = [
  "午後追加1",
  "午後追加2",
  "午後追加3",
  "午後追加4",
  "午後追加5",
  "午後追加6",
  "午後追加7",
];

export default function HomeCommonScreen() {
  const { width, height: windowHeight } = useWindowDimensions();
  const isConsole = width > windowHeight && width < 1200; // 仮: 横長かつ1200px未満をコンソール画面とみなす
  // レイアウト判定
  const isMobile = width < 768; // 幅が狭ければスマホ扱い
  const isWide = width >= 768; // PC/タブレット
  const minCell = 36;
  const maxCell = isWide ? 50 : 56;
  const baseCell = Math.floor(width / (allTimes.length + 1));
  const CELL_WIDTH = Math.max(minCell, Math.min(maxCell, baseCell));

  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showFirst, setShowFirst] = useState(true); // 追加
  const [modalUser, setModalUser] = useState<string | null>(null);
  const handlePrevDay = () => setSelectedDate((d) => addDays(d, -1));
  const handleNextDay = () => setSelectedDate((d) => addDays(d, 1));
  const dateLabel = format(selectedDate, "yyyy年M月d日(E)", { locale: ja });
  const openDatePicker = () => setShowDatePicker(true);

  // スマホ・タブレット・PC・コンソールでレイアウトを正しく分岐
  // isWide: PC/タブレット横向き, isConsole: 横長な小型画面, それ以外はスマホ
  const isTablet = width >= 768 && width <= 1024;

  return (
    <View style={[styles.container, { flex: 1 }]}>
      {/* <Text style={styles.title}>作業スケジュール（講師・マスター共通）</Text> */}
      <View
        style={[
          styles.datePickerRow,
          {
            alignItems: "center",
            flexDirection: "row",
            justifyContent: "space-between",
          },
        ]}
      >
        {/* 左端：前半/後半ボタン */}
        {isMobile ? (
          // スマホ用：トグル型（1ボタンで表示が切り替わる）
          <View style={{ marginLeft: 4, marginRight: 8 }}>
            <Pressable
              onPress={() => setShowFirst((v) => !v)}
              style={{
                borderRadius: 16,
                borderWidth: 1,
                borderColor: "#90caf9",
                backgroundColor: "#e3f2fd",
                paddingHorizontal: 24,
                paddingVertical: 8,
              }}
            >
              <Text style={{ color: "#1976d2", fontWeight: "bold" }}>
                {showFirst ? "前半" : "後半"}
              </Text>
            </Pressable>
          </View>
        ) : (
          // PC/タブレット用：従来のスイッチ
          <GanttHalfSwitch showFirst={showFirst} onChange={setShowFirst} />
        )}
        {/* 中央：年月ピッカー＋日付ナビ */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            flex: 1,
            justifyContent: "center",
          }}
        >
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
        {/* 右端スペース調整用 */}
        <View style={{ width: 80 }} />
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
      {/* レイアウト分岐 */}
      {isTablet ? (
        <HomeGanttTabletScreen
          namesFirst={namesFirst}
          namesSecond={namesSecond}
          timesFirst={timesFirst}
          timesSecond={timesSecond}
          sampleSchedule={sampleSchedule}
          CELL_WIDTH={CELL_WIDTH}
          showFirst={showFirst}
          onCellPress={setModalUser} // 追加
        />
      ) : isWide ? (
        <HomeGanttWideScreen
          namesFirst={namesFirst}
          namesSecond={namesSecond}
          timesFirst={timesFirst}
          timesSecond={timesSecond}
          sampleSchedule={sampleSchedule}
          CELL_WIDTH={CELL_WIDTH}
          showFirst={showFirst}
          onCellPress={setModalUser} // 追加
        />
      ) : (
        <HomeGanttMobileScreen
          namesFirst={namesFirst}
          namesSecond={namesSecond}
          timesFirst={timesFirst}
          timesSecond={timesSecond}
          sampleSchedule={sampleSchedule}
          CELL_WIDTH={CELL_WIDTH}
          showFirst={showFirst}
          onCellPress={setModalUser} // 追加
        />
      )}
      {/* ユーザー1日ガントチャートモーダル */}
      <UserDayGanttModal
        visible={!!modalUser}
        onClose={() => setModalUser(null)}
        userName={modalUser || ""}
        times={showFirst ? timesFirst : timesSecond}
        sampleSchedule={sampleSchedule}
      />
    </View>
  );
}
