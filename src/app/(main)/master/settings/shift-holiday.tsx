import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Modal,
  Pressable,
  ScrollView,
} from "react-native";
import { Stack } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { db } from "@/services/firebase/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { ShiftCalendar } from "@/modules/calendar/calendar-components/calendar-main/ShiftCalendar";

export type ShiftAppSettings = {
  holidays: string[];
  specialDays: string[];
};

const DEFAULT_SETTINGS: ShiftAppSettings = {
  holidays: [],
  specialDays: [],
};

export default function ShiftHolidaySettingsScreen() {
  const [settings, setSettings] = useState<ShiftAppSettings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [calendarMonth, setCalendarMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(
      2,
      "0"
    )}-01`;
  });
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [showDayModal, setShowDayModal] = useState(false);

  useEffect(() => {
    (async () => {
      const ref = doc(db, "settings", "shiftApp");
      const snap = await getDoc(ref);
      if (snap.exists()) {
        setSettings((prev) => ({ ...prev, ...snap.data() }));
      }
      setLoading(false);
    })();
  }, []);

  const saveSettings = async (newSettings: ShiftAppSettings) => {
    setLoading(true);
    const ref = doc(db, "settings", "shiftApp");
    await setDoc(ref, newSettings, { merge: true });
    setSettings(newSettings);
    setLoading(false);
    Alert.alert("保存しました");
  };

  // 日付タップ時の処理
  const handleDayPress = ({ dateString }: { dateString: string }) => {
    setSelectedDate(dateString);
    setShowDayModal(true);
  };

  // 祝日・特別日追加/削除
  const toggleHoliday = (date: string) => {
    setSettings((prev) => {
      const exists = prev.holidays.includes(date);
      return {
        ...prev,
        holidays: exists
          ? prev.holidays.filter((d) => d !== date)
          : [...prev.holidays, date],
      };
    });
    setShowDayModal(false);
  };
  const toggleSpecial = (date: string) => {
    setSettings((prev) => {
      const exists = prev.specialDays.includes(date);
      return {
        ...prev,
        specialDays: exists
          ? prev.specialDays.filter((d) => d !== date)
          : [...prev.specialDays, date],
      };
    });
    setShowDayModal(false);
  };

  // 月ごとの祝日・特別日リスト（祝日定義も含める）
  const getMonthList = (type: "holidays" | "specialDays" | "holidaysAll") => {
    if (type === "holidaysAll") {
      let holidays = [...settings.holidays];
      try {
        const {
          HOLIDAYS,
        } = require("@/modules/calendar/calendar-constants/constants");
        holidays = Array.from(
          new Set([
            ...holidays,
            ...Object.keys(HOLIDAYS).filter((d) =>
              d.startsWith(calendarMonth.slice(0, 7))
            ),
          ])
        );
      } catch (e) {}
      return holidays
        .filter((d) => d.startsWith(calendarMonth.slice(0, 7)))
        .sort();
    }
    return settings[type].filter((d) =>
      d.startsWith(calendarMonth.slice(0, 7))
    );
  };

  if (loading)
    return (
      <View style={styles.container}>
        <Text>読み込み中...</Text>
      </View>
    );

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{ title: "祝日・特別日設定", headerShown: true }}
      />
      {/* カレンダー上部の独自年月テキストは削除。ShiftCalendarのヘッダーをそのまま使う */}
      <View style={styles.row2colBox}>
        <View style={styles.calendarCol}>
          <ShiftCalendar
            shifts={[]}
            selectedDate={selectedDate || ""}
            currentMonth={calendarMonth}
            onDayPress={handleDayPress}
            onMonthChange={({ dateString }) => {
              setCalendarMonth(dateString.slice(0, 7) + "-01");
              setSelectedDate(null);
            }}
            markedDates={(() => {
              const marks: Record<string, any> = {};
              // 祝日定義（constants/HOLIDAYS）も反映
              try {
                const {
                  HOLIDAYS,
                } = require("@/modules/calendar/calendar-constants/constants");
                Object.keys(HOLIDAYS).forEach((d) => {
                  marks[d] = {
                    marked: true,
                    dotColor: "#e57373",
                    customStyles: { container: { backgroundColor: "#ffeaea" } },
                  };
                });
              } catch (e) {}
              // Firestore設定の祝日
              settings.holidays.forEach((d) => {
                marks[d] = {
                  marked: true,
                  dotColor: "#1976D2",
                  customStyles: { container: { backgroundColor: "#e3f2fd" } },
                };
              });
              // Firestore設定の特別日
              settings.specialDays.forEach((d) => {
                marks[d] = {
                  marked: true,
                  dotColor: "#ff9800",
                  customStyles: { container: { backgroundColor: "#ffe0b2" } },
                };
              });
              if (selectedDate) {
                marks[selectedDate] = {
                  ...(marks[selectedDate] || {}),
                  selected: true,
                  customStyles: {
                    ...(marks[selectedDate]?.customStyles || {}),
                    container: { backgroundColor: "#1976D2" },
                    text: { color: "#fff", fontWeight: "bold" },
                  },
                };
              }
              return marks;
            })()}
          />
        </View>
        <View style={styles.listCol}>
          <View style={styles.monthListBox}>
            <Text style={styles.monthListTitle}>
              {calendarMonth.slice(0, 7)} の祝日
            </Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.monthListScroll}
            >
              {getMonthList("holidaysAll").length === 0 && (
                <Text style={styles.emptyText}>祝日なし</Text>
              )}
              {getMonthList("holidaysAll").map((d) => (
                <View key={d} style={styles.holidayTag}>
                  <Text style={styles.holidayTagText}>{d}</Text>
                </View>
              ))}
            </ScrollView>
            <Text style={styles.monthListTitle}>
              {calendarMonth.slice(0, 7)} の特別日
            </Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.monthListScroll}
            >
              {getMonthList("specialDays").length === 0 && (
                <Text style={styles.emptyText}>特別日なし</Text>
              )}
              {getMonthList("specialDays").map((d) => (
                <View key={d} style={styles.specialTag}>
                  <Text style={styles.specialTagText}>{d}</Text>
                </View>
              ))}
            </ScrollView>
          </View>
        </View>
      </View>
      <TouchableOpacity
        style={styles.saveButton2col}
        onPress={() => saveSettings(settings)}
      >
        <Text
          style={[
            styles.buttonText,
            { color: "#fff", fontWeight: "bold", fontSize: 16 },
          ]}
        >
          保存
        </Text>
      </TouchableOpacity>
      {/* 日付タップ時のモーダル */}
      <Modal
        visible={showDayModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowDayModal(false)}
      >
        <Pressable
          style={styles.overlay}
          onPress={() => setShowDayModal(false)}
        >
          <Pressable
            style={styles.modalContent}
            onPress={(e) => e.stopPropagation()}
          >
            <Text style={styles.modalTitle}>{selectedDate} の設定</Text>
            <TouchableOpacity
              style={styles.holidayButton}
              onPress={() => toggleHoliday(selectedDate!)}
            >
              <Text style={styles.holidayButtonText}>
                {settings.holidays.includes(selectedDate!)
                  ? "祝日設定を外す"
                  : "この日を祝日にする"}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.specialButton}
              onPress={() => toggleSpecial(selectedDate!)}
            >
              <Text style={styles.specialButtonText}>
                {settings.specialDays.includes(selectedDate!)
                  ? "特別日設定を外す"
                  : "この日を特別日にする"}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setShowDayModal(false)}
            >
              <Text style={styles.closeButtonText}>閉じる</Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F2F2F7",
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 32,
  },
  calendarBox: {
    width: "100%",
    alignItems: "center",
    marginTop: 8,
    marginBottom: 12,
  },
  monthListBox: {
    width: "100%",
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 12,
    marginTop: 8,
    marginBottom: 8,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  monthListTitle: {
    fontWeight: "bold",
    fontSize: 15,
    marginTop: 4,
    marginBottom: 2,
    color: "#1976D2",
  },
  monthListScroll: {
    flexDirection: "row",
    marginBottom: 6,
  },
  holidayTag: {
    backgroundColor: "#e3f2fd",
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    margin: 2,
  },
  holidayTagText: {
    color: "#1976D2",
    fontWeight: "bold",
  },
  specialTag: {
    backgroundColor: "#ffe0b2",
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    margin: 2,
  },
  specialTagText: {
    color: "#ff9800",
    fontWeight: "bold",
  },
  emptyText: {
    color: "#aaa",
    marginHorizontal: 8,
    fontSize: 14,
  },
  holidayButton: {
    backgroundColor: "#e3f2fd",
    borderRadius: 8,
    padding: 12,
    marginVertical: 8,
    width: 220,
    alignItems: "center",
  },
  holidayButtonText: {
    color: "#1976D2",
    fontWeight: "bold",
    fontSize: 16,
  },
  specialButton: {
    backgroundColor: "#ffe0b2",
    borderRadius: 8,
    padding: 12,
    marginVertical: 8,
    width: 220,
    alignItems: "center",
  },
  specialButtonText: {
    color: "#ff9800",
    fontWeight: "bold",
    fontSize: 16,
  },
  card: {
    width: "70%",
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 16,
    color: "#222",
  },
  rowBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  button: {
    backgroundColor: "#e0e0e0",
    borderRadius: 6,
    padding: 8,
    marginRight: 8,
  },
  iconButton: {
    backgroundColor: "#e0e0e0",
    borderRadius: 6,
    padding: 8,
    marginLeft: 4,
  },
  buttonText: { fontSize: 14 },
  label: { fontWeight: "bold", marginTop: 8, marginBottom: 2 },
  tagList: { flexDirection: "row", flexWrap: "wrap", marginVertical: 4 },
  tag: {
    backgroundColor: "#e3f2fd",
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    margin: 2,
  },
  saveButton: {
    backgroundColor: "#1976D2",
    borderRadius: 8,
    padding: 14,
    alignItems: "center",
    marginTop: 8,
    width: "100%",
    alignSelf: "center",
  },
  saveButton2col: {
    backgroundColor: "#1976D2",
    borderRadius: 8,
    padding: 14,
    alignItems: "center",
    marginTop: 16,
    width: 240,
    alignSelf: "center",
    zIndex: 10,
  },
  modalOpenButton: {
    backgroundColor: "#e3f2fd",
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 14,
    margin: 4,
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 24,
    width: 320,
    maxWidth: "90%",
    maxHeight: "70%",
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 16,
  },
  valueList: {
    width: "100%",
    marginBottom: 16,
    maxHeight: 240,
    flexGrow: 1,
  },
  closeButton: {
    marginTop: 8,
    padding: 10,
  },
  closeButtonText: {
    color: "#1976D2",
    fontSize: 16,
    fontWeight: "bold",
  },
  row2colBox: {
    flexDirection: "row",
    width: "100%",
    justifyContent: "center",
    alignItems: "flex-start",
    marginTop: 16,
    marginBottom: 8,
    gap: 32,
  },
  calendarCol: {
    flex: 1,
    minWidth: 320,
    maxWidth: 400,
    alignItems: "center",
    justifyContent: "flex-start",
  },
  listCol: {
    flex: 1,
    minWidth: 240,
    maxWidth: 400,
    alignItems: "flex-start",
    justifyContent: "flex-start",
  },
});
