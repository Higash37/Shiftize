// 共通ホーム画面（リファクタリング後）
// 旧: app/(main)/HomeCommonScreen.tsx
// スタイル分割済み（home-view-styles.ts）
// 型定義分割済み（home-view-types.ts）
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  useWindowDimensions,
  Pressable,
} from "react-native";
import { styles } from "../home-styles/home-view-styles";
import { format, addDays } from "date-fns";
import ja from "date-fns/locale/ja";
import { DatePickerModal } from "@/modules/child-components/calendar/calendar-components/calendar-modal/DatePickerModal";
import type { SampleScheduleColumn } from "../home-types/home-view-types";
import { HomeGanttWideScreen } from "./HomeGanttWideScreen";
import { HomeGanttMobileScreen } from "./HomeGanttMobileScreen";
import { HomeGanttTabletScreen } from "./HomeGanttTabletScreen";
import { GanttHalfSwitch } from "../home-components/GanttHalfSwitch"; // 追加
import { UserDayGanttModal } from "../home-components/UserDayGanttModal";
import { useShifts } from "@/common/common-utils/util-shift/useShiftQueries";
import { useUsers } from "@/modules/child-components/user-management/user-hooks/useUserList";

// 9:00～22:00の30分刻みの時間ラベルを生成
const allTimes: string[] = [];
for (let h = 9; h <= 22; h++) {
  allTimes.push(`${h}:00`);
  if (h !== 22) allTimes.push(`${h}:30`);
}

// 時間ラベルの太字スタイル
export const timeLabelTextStyle = { fontWeight: "bold" };

// 型定義のimport
// sampleSchedule: SampleScheduleColumn[]
// const allNames: string[] = Array.from(
//   new Set(sampleSchedule.flatMap((col) => col.slots.map((s) => s.name)))
// );

export default function HomeCommonScreen() {
  const { width, height: windowHeight } = useWindowDimensions();
  const isConsole = width > windowHeight && width < 1200;
  const isMobile = width < 768;
  const isWide = width >= 768;
  const minCell = 36;
  const maxCell = isWide ? 50 : 56;
  const baseCell = Math.floor(width / (allTimes.length + 1));
  const CELL_WIDTH = Math.max(minCell, Math.min(maxCell, baseCell));

  // Firestoreからシフトデータ取得
  const { shifts, loading, fetchShiftsByMonth } = useShifts();
  const { users } = useUsers();

  // 日付・月状態
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showFirst, setShowFirst] = useState(true);
  const [modalUser, setModalUser] = useState<string | null>(null);
  const [currentYearMonth, setCurrentYearMonth] = useState(() => ({
    year: new Date().getFullYear(),
    month: new Date().getMonth(),
  }));

  // 月が変わったらその月のシフトを取得
  useEffect(() => {
    fetchShiftsByMonth(currentYearMonth.year, currentYearMonth.month);
  }, [currentYearMonth.year, currentYearMonth.month, fetchShiftsByMonth]);

  // 日付変更時に月も自動で切り替え
  useEffect(() => {
    setCurrentYearMonth({
      year: selectedDate.getFullYear(),
      month: selectedDate.getMonth(),
    });
  }, [selectedDate]);

  // ★ 選択日付でシフトをフィルタ
  const selectedDateStr = format(selectedDate, "yyyy-MM-dd");
  // FirestoreのdateはUTC基準のstringの可能性があるため、時差を考慮してローカル日付も許容
  const pad = (n: number) => n.toString().padStart(2, "0");
  const localDateStr = `${selectedDate.getFullYear()}-${pad(
    selectedDate.getMonth() + 1
  )}-${pad(selectedDate.getDate())}`;
  const shiftsForDate = shifts.filter(
    (s) =>
      (s.date === selectedDateStr || s.date === localDateStr) &&
      s.status !== "deleted" &&
      s.status !== "purged"
  );

  // ユーザー名リスト
  const allNames: string[] = Array.from(
    new Set(shiftsForDate.map((s) => s.nickname))
  );

  // SampleScheduleColumn型に変換
  function buildScheduleColumns(names: string[]): SampleScheduleColumn[] {
    return names.map((name) => {
      // そのユーザーの全シフト
      const userShifts = shiftsForDate.filter((s) => s.nickname === name);
      // スタッフシフト（type: user または staff）
      const staffShifts = userShifts.filter(
        (s) => s.type === "user" || s.type === "staff"
      );
      // 授業時間（type: class or classes配列）
      const classShifts = userShifts.filter(
        (s) => s.type === "class" || (s.classes && s.classes.length > 0)
      );
      // 30分刻みでslotを生成
      const slots: any[] = [];
      for (let i = 0; i < allTimes.length - 1; i++) {
        const start = allTimes[i];
        const end = allTimes[i + 1];
        // スタッフシフト該当
        const staff = staffShifts.find(
          (s) => start >= s.startTime && start < s.endTime
        );
        // 授業時間該当
        let classSlot = null;
        for (const s of classShifts) {
          if (s.classes) {
            for (const c of s.classes) {
              if (start >= c.startTime && start < c.endTime) {
                classSlot = { ...s, classTime: c };
                break;
              }
            }
          }
        }
        // 授業時間優先でslotをpush
        if (classSlot) {
          slots.push({
            name,
            start,
            end,
            task: (
              <Text style={{ color: "black", fontWeight: "bold" }}>授業</Text>
            ),
            date: selectedDateStr,
            color: "#888", // グレー
            type: "class",
            textColor: "black", // 黒文字
          });
        } else if (staff) {
          slots.push({
            name,
            start,
            end,
            task: (
              <Text style={{ color: "#ffffff", fontWeight: "bold" }}>
                スタッフ
              </Text>
            ),
            date: selectedDateStr,
            color: "#1976d2", // 青
            type: staff.type || "user",
            textColor: "#fff", // 白文字
          });
        } // elseは何もpushしない
      }
      return { position: name, slots };
    });
  }

  // 時間帯を2分割
  const mid = Math.ceil(allTimes.length / 2);
  const timesFirst = allTimes.slice(0, mid);
  const timesSecond = allTimes.slice(mid - 1);

  // 午前・午後でシフトがある人だけ抽出
  const hasSlotInTimes = (name: string, times: string[]) =>
    buildScheduleColumns([name])[0].slots.some((s) =>
      times.some((t) => t >= s.start && t < s.end && s.task)
    );
  const filteredNamesFirst = allNames.filter((name) =>
    hasSlotInTimes(name, timesFirst)
  );
  const filteredNamesSecond = allNames.filter((name) =>
    hasSlotInTimes(name, timesSecond)
  );

  // 表示用スケジュール
  const scheduleForSelectedDate = buildScheduleColumns(allNames);

  // スマホ・タブレット・PC・コンソールでレイアウトを正しく分岐
  // isWide: PC/タブレット横向き, isConsole: 横長な小型画面, それ以外はスマホ
  const isTablet = width >= 768 && width <= 1024;

  // 日付ナビの前/次ボタン
  const handlePrevDay = () =>
    setSelectedDate((d: Date) => {
      const prev = new Date(d);
      prev.setDate(prev.getDate() - 1);
      return prev;
    });
  const handleNextDay = () =>
    setSelectedDate((d: Date) => {
      const next = new Date(d);
      next.setDate(next.getDate() + 1);
      return next;
    });

  const dateLabel = format(selectedDate, "yyyy年M月d日(E)", { locale: ja });
  const openDatePicker = () => setShowDatePicker(true);

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
          namesFirst={filteredNamesFirst}
          namesSecond={filteredNamesSecond}
          timesFirst={timesFirst}
          timesSecond={timesSecond}
          sampleSchedule={scheduleForSelectedDate}
          CELL_WIDTH={CELL_WIDTH}
          showFirst={showFirst}
          onCellPress={setModalUser} // 追加
        />
      ) : isWide ? (
        <HomeGanttWideScreen
          namesFirst={filteredNamesFirst}
          namesSecond={filteredNamesSecond}
          timesFirst={timesFirst}
          timesSecond={timesSecond}
          sampleSchedule={scheduleForSelectedDate}
          CELL_WIDTH={CELL_WIDTH}
          showFirst={showFirst}
          onCellPress={setModalUser} // 追加
        />
      ) : (
        <HomeGanttMobileScreen
          namesFirst={filteredNamesFirst}
          namesSecond={filteredNamesSecond}
          timesFirst={timesFirst}
          timesSecond={timesSecond}
          sampleSchedule={scheduleForSelectedDate}
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
        sampleSchedule={scheduleForSelectedDate}
      />
    </View>
  );
}
