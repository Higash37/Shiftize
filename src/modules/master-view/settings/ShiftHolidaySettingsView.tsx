import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  Pressable,
  ScrollView,
} from "react-native";
import { Stack } from "expo-router";
import { ShiftCalendar } from "@/modules/child-components/calendar/calendar-components/calendar-main/ShiftCalendar";
import { shiftHolidaySettingsViewStyles as styles } from "./ShiftHolidaySettingsView.styles";
import type { ShiftHolidaySettingsViewProps } from "./ShiftHolidaySettingsView.types";

export const ShiftHolidaySettingsView: React.FC<
  ShiftHolidaySettingsViewProps
> = ({
  settings,
  loading,
  calendarMonth,
  selectedDate,
  showDayModal,
  setSettings,
  setCalendarMonth,
  setSelectedDate,
  setShowDayModal,
  saveSettings,
}) => {
  // 祝日・特別日追加/削除
  const toggleHoliday = (date: string) => {
    setSettings({
      ...settings,
      holidays: settings.holidays.includes(date)
        ? settings.holidays.filter((d) => d !== date)
        : [...settings.holidays, date],
    });
    setShowDayModal(false);
  };
  const toggleSpecial = (date: string) => {
    setSettings({
      ...settings,
      specialDays: settings.specialDays.includes(date)
        ? settings.specialDays.filter((d) => d !== date)
        : [...settings.specialDays, date],
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

  // カレンダーのマーク
  const markedDates = (() => {
    const marks: Record<string, any> = {};
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
    settings.holidays.forEach((d) => {
      marks[d] = {
        marked: true,
        dotColor: "#1976D2",
        customStyles: { container: { backgroundColor: "#e3f2fd" } },
      };
    });
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
  })();

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{ title: "祝日・特別日設定", headerShown: true }}
      />
      <View
        style={{
          flexDirection: "row",
          width: "100%",
          justifyContent: "center",
          alignItems: "flex-start",
          marginTop: 16,
          marginBottom: 8,
          gap: 32,
        }}
      >
        <View
          style={{
            flex: 1,
            minWidth: 320,
            maxWidth: 400,
            alignItems: "center",
            justifyContent: "flex-start",
          }}
        >
          <ShiftCalendar
            shifts={[]}
            selectedDate={selectedDate || ""}
            currentMonth={calendarMonth}
            onDayPress={({ dateString }) => {
              setSelectedDate(dateString);
              setShowDayModal(true);
            }}
            onMonthChange={({ dateString }) => {
              setCalendarMonth(dateString.slice(0, 7) + "-01");
              setSelectedDate(null);
            }}
            markedDates={markedDates}
          />
        </View>
        <View
          style={{
            flex: 1,
            minWidth: 240,
            maxWidth: 400,
            alignItems: "flex-start",
            justifyContent: "flex-start",
          }}
        >
          <View
            style={{
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
            }}
          >
            <Text
              style={{
                fontWeight: "bold",
                fontSize: 15,
                marginTop: 4,
                marginBottom: 2,
                color: "#1976D2",
              }}
            >
              {calendarMonth.slice(0, 7)} の祝日
            </Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={{ flexDirection: "row", marginBottom: 6 }}
            >
              {getMonthList("holidaysAll").length === 0 && (
                <Text
                  style={{ color: "#aaa", marginHorizontal: 8, fontSize: 14 }}
                >
                  祝日なし
                </Text>
              )}
              {getMonthList("holidaysAll").map((d) => (
                <View
                  key={d}
                  style={{
                    backgroundColor: "#e3f2fd",
                    borderRadius: 12,
                    paddingHorizontal: 10,
                    paddingVertical: 4,
                    margin: 2,
                  }}
                >
                  <Text style={{ color: "#1976D2", fontWeight: "bold" }}>
                    {d}
                  </Text>
                </View>
              ))}
            </ScrollView>
            <Text
              style={{
                fontWeight: "bold",
                fontSize: 15,
                marginTop: 4,
                marginBottom: 2,
                color: "#1976D2",
              }}
            >
              {calendarMonth.slice(0, 7)} の特別日
            </Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={{ flexDirection: "row", marginBottom: 6 }}
            >
              {getMonthList("specialDays").length === 0 && (
                <Text
                  style={{ color: "#aaa", marginHorizontal: 8, fontSize: 14 }}
                >
                  特別日なし
                </Text>
              )}
              {getMonthList("specialDays").map((d) => (
                <View
                  key={d}
                  style={{
                    backgroundColor: "#ffe0b2",
                    borderRadius: 12,
                    paddingHorizontal: 10,
                    paddingVertical: 4,
                    margin: 2,
                  }}
                >
                  <Text style={{ color: "#ff9800", fontWeight: "bold" }}>
                    {d}
                  </Text>
                </View>
              ))}
            </ScrollView>
          </View>
        </View>
      </View>
      <TouchableOpacity
        style={{
          backgroundColor: "#1976D2",
          borderRadius: 8,
          padding: 14,
          alignItems: "center",
          marginTop: 16,
          width: 240,
          alignSelf: "center",
          zIndex: 10,
        }}
        onPress={saveSettings}
      >
        <Text style={{ color: "#fff", fontWeight: "bold", fontSize: 16 }}>
          保存
        </Text>
      </TouchableOpacity>
      <Modal
        visible={showDayModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowDayModal(false)}
      >
        <Pressable
          style={{
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.4)",
            justifyContent: "center",
            alignItems: "center",
          }}
          onPress={() => setShowDayModal(false)}
        >
          <Pressable
            style={{
              backgroundColor: "#fff",
              borderRadius: 14,
              padding: 24,
              width: 320,
              maxWidth: "90%",
              maxHeight: "70%",
              alignItems: "center",
            }}
            onPress={(e) => e.stopPropagation()}
          >
            <Text
              style={{ fontSize: 18, fontWeight: "bold", marginBottom: 16 }}
            >
              {selectedDate} の設定
            </Text>
            <TouchableOpacity
              style={{
                backgroundColor: "#e3f2fd",
                borderRadius: 8,
                padding: 12,
                marginVertical: 8,
                width: 220,
                alignItems: "center",
              }}
              onPress={() => toggleHoliday(selectedDate!)}
            >
              <Text
                style={{ color: "#1976D2", fontWeight: "bold", fontSize: 16 }}
              >
                {settings.holidays.includes(selectedDate!)
                  ? "祝日設定を外す"
                  : "この日を祝日にする"}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={{
                backgroundColor: "#ffe0b2",
                borderRadius: 8,
                padding: 12,
                marginVertical: 8,
                width: 220,
                alignItems: "center",
              }}
              onPress={() => toggleSpecial(selectedDate!)}
            >
              <Text
                style={{ color: "#ff9800", fontWeight: "bold", fontSize: 16 }}
              >
                {settings.specialDays.includes(selectedDate!)
                  ? "特別日設定を外す"
                  : "この日を特別日にする"}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={{ marginTop: 8, padding: 10 }}
              onPress={() => setShowDayModal(false)}
            >
              <Text
                style={{ color: "#1976D2", fontSize: 16, fontWeight: "bold" }}
              >
                閉じる
              </Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
};
