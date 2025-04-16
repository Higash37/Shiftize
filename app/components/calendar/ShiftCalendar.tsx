import React, { useMemo, useState, useEffect } from "react";
import { Calendar } from "react-native-calendars";
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Modal,
  ScrollView,
} from "react-native";
import { colors } from "@/theme/colors";
import { AntDesign } from "@expo/vector-icons";
import { format } from "date-fns";
import { ja } from "date-fns/locale";
import { Shift, ShiftStatus } from "@/types/shift";
import { ShiftDetails } from "@/components/Shift/ShiftDetails";

// 画面幅に基づいてカレンダーのサイズを計算
const SCREEN_WIDTH = Dimensions.get("window").width;
const CALENDAR_WIDTH = SCREEN_WIDTH * 0.3;
const DAY_WIDTH = Math.floor(CALENDAR_WIDTH / 7);
const DAY_HEIGHT = Math.floor(DAY_WIDTH * 0.6);

// 日本の祝日（2024-2025年分）
const HOLIDAYS: { [key: string]: string } = {
  "2024-01-01": "元日",
  "2024-01-08": "成人の日",
  "2024-02-11": "建国記念日",
  "2024-02-23": "天皇誕生日",
  "2024-03-20": "春分の日",
  "2024-04-29": "昭和の日",
  "2024-05-03": "憲法記念日",
  "2024-05-04": "みどりの日",
  "2024-05-05": "こどもの日",
  "2024-07-15": "海の日",
  "2024-08-11": "山の日",
  "2024-09-16": "敬老の日",
  "2024-09-22": "秋分の日",
  "2024-10-14": "スポーツの日",
  "2024-11-03": "文化の日",
  "2024-11-23": "勤労感謝の日",
  "2025-01-01": "元日",
  "2025-01-13": "成人の日",
  "2025-02-11": "建国記念日",
  "2025-02-23": "天皇誕生日",
  "2025-03-20": "春分の日",
  "2025-04-29": "昭和の日",
  "2025-05-03": "憲法記念日",
  "2025-05-04": "みどりの日",
  "2025-05-05": "こどもの日",
};

// 日本語の曜日を定義
const WEEKDAYS = ["日", "月", "火", "水", "木", "金", "土"];

interface MarkedDate {
  selected?: boolean;
  marked?: boolean;
  dotColor?: string;
  dotStyle?: any;
}

interface ShiftCalendarProps {
  shifts: Shift[];
  selectedDate: string;
  currentMonth: string;
  onDayPress: (day: { dateString: string }) => void;
  onMonthChange?: (month: { dateString: string }) => void;
  markedDates?: Record<string, MarkedDate>;
  onMount?: () => void;
}

interface DayComponentProps {
  date?: {
    day: number;
    month: number;
    year: number;
    timestamp: number;
    dateString: string;
  };
  state?: "disabled" | "today" | "selected";
  marking?: {
    selected?: boolean;
    marked?: boolean;
    dotColor?: string;
    dotStyle?: any;
  };
}

// ステータスのテキストを取得する関数を追加
const getStatusText = (status: ShiftStatus) => {
  switch (status) {
    case "draft":
      return "下書き";
    case "pending":
      return "申請中";
    case "approved":
      return "承認済";
    case "completed":
      return "完了";
    case "deleted":
      return "削除済";
    default:
      return "";
  }
};

// ステータスに基づく色を取得する関数
const getStatusColor = (status: ShiftStatus) => {
  switch (status) {
    case "draft":
      return "#B0BEC5"; // 灰色
    case "approved":
      return "#4CAF50"; // 緑色
    case "pending":
      return "#FFC107"; // 黄色
    case "deleted":
      return "#F44336"; // 赤色
    default:
      return "#9E9E9E"; // デフォルトの灰色
  }
};

export const ShiftCalendar: React.FC<ShiftCalendarProps> = ({
  shifts,
  selectedDate,
  currentMonth,
  onDayPress,
  onMonthChange,
  markedDates: propMarkedDates,
  onMount,
}) => {
  const [showYearPicker, setShowYearPicker] = useState(false);
  const [showMonthPicker, setShowMonthPicker] = useState(false);
  const [tempDate, setTempDate] = useState<Date>(new Date(currentMonth));
  const [holidays, setHolidays] = useState<{ [key: string]: string }>({});
  const [expandedShifts, setExpandedShifts] = useState<{
    [key: string]: boolean;
  }>({});

  useEffect(() => {
    if (onMount) {
      onMount();
    }
  }, []);

  // 年の配列を生成（2020年から2030年まで）
  const years = Array.from({ length: 11 }, (_, i) => 2020 + i);
  // 月の配列を生成（1月から12月まで）
  const months = Array.from({ length: 12 }, (_, i) => i + 1);

  const handleYearSelect = (year: number) => {
    const newDate = new Date(tempDate);
    newDate.setFullYear(year);
    setTempDate(newDate);
    setShowYearPicker(false);
    setShowMonthPicker(true);
  };

  const handleMonthSelect = (month: number) => {
    const newDate = new Date(tempDate);
    newDate.setMonth(month - 1);
    setTempDate(newDate);
    setShowMonthPicker(false);
    if (onMonthChange) {
      onMonthChange({ dateString: newDate.toISOString().split("T")[0] });
    }
  };

  // カレンダーのマーカー用のデータを作成
  const markedDates = useMemo(() => {
    const marks: { [key: string]: any } = {};
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // 選択中の日付のスタイル
    if (selectedDate) {
      marks[selectedDate] = {
        selected: true,
        selectedColor: colors.primary + "20",
        selectedTextColor: colors.text.primary,
      };
    }

    // 予定がある日付にドットマーカーを追加
    shifts.forEach((shift) => {
      const shiftDate = new Date(shift.date);
      shiftDate.setHours(0, 0, 0, 0);
      const isPastShift = shiftDate < today;

      const existingMark = marks[shift.date] || {};
      marks[shift.date] = {
        ...existingMark,
        marked: true,
        dotColor: colors.primary,
        dotStyle: {
          width: 4,
          height: 4,
          borderRadius: 2,
          backgroundColor: isPastShift ? colors.primary : "transparent",
          borderWidth: isPastShift ? 0 : 1,
          borderColor: colors.primary,
        },
        selected: selectedDate === shift.date,
        selectedColor: colors.primary + "20",
      };
    });

    return marks;
  }, [selectedDate, shifts]);

  // 日付の色を判定する関数
  const getDayColor = (
    date: string | undefined,
    state?: string,
    isSelected?: boolean
  ) => {
    if (!date || state === "disabled") return "#d9e1e8";

    const day = new Date(date).getDay();
    if (day === 0 || HOLIDAYS[date]) return "#f44336"; // 日曜日または祝日は常に赤色
    if (state === "today") return "#2196F3"; // 今日の日付は青色
    return colors.text.primary; // その他の日付
  };

  const renderHeader = (date: Date) => {
    const month = `${date.getFullYear()}年${date.getMonth() + 1}月`;
    return (
      <View style={styles.calendarHeader}>
        <TouchableOpacity
          style={styles.monthSelector}
          onPress={() => {
            setTempDate(date);
            setShowYearPicker(true);
          }}
        >
          <Text style={styles.monthText}>{month}</Text>
          <AntDesign
            name="calendar"
            size={20}
            color={colors.text.primary}
            style={styles.calendarIcon}
          />
        </TouchableOpacity>
      </View>
    );
  };

  const toggleShiftDetails = (shiftId: string) => {
    setExpandedShifts((prev) => ({
      ...prev,
      [shiftId]: !prev[shiftId],
    }));
  };

  return (
    <View style={styles.container}>
      <Calendar
        current={currentMonth}
        onDayPress={onDayPress}
        onMonthChange={onMonthChange}
        markedDates={markedDates}
        enableSwipeMonths={true}
        style={styles.calendar}
        renderHeader={renderHeader}
        theme={{
          backgroundColor: "transparent",
          calendarBackground: "transparent",
          textSectionTitleColor: "#666",
          dayTextColor: colors.text.primary,
          textDisabledColor: colors.text.secondary,
          selectedDayBackgroundColor: "#E3F2FD",
          selectedDayTextColor: "#2196F3",
          todayTextColor: "#2196F3",
          dotColor: colors.primary,
          selectedDotColor: colors.primary,
          monthTextColor: colors.text.primary,
          "stylesheet.calendar.main": {
            week: {
              marginTop: 0,
              marginBottom: 0,
              flexDirection: "row",
              justifyContent: "space-around",
              borderWidth: 0,
            },
            dayContainer: {
              borderWidth: 0,
            },
          },
        }}
        dayComponent={({ date, state, marking }: DayComponentProps) => (
          <TouchableOpacity
            style={[
              styles.dayContainer,
              {
                borderRightWidth: 1,
                borderRightColor: "#E5E5E5",
                borderBottomWidth: 1,
                borderBottomColor: "#E5E5E5",
              },
            ]}
            onPress={() => date && onDayPress({ dateString: date.dateString })}
          >
            {marking?.selected && <View style={styles.selectedDay} />}
            <Text
              style={[
                styles.dayText,
                {
                  color: getDayColor(
                    date?.dateString,
                    state,
                    marking?.selected
                  ),
                },
                state === "today" && styles.todayText,
              ]}
            >
              {date?.day}
            </Text>
            {marking?.marked && <View style={[styles.dot, marking.dotStyle]} />}
          </TouchableOpacity>
        )}
      />

      {selectedDate &&
        shifts.filter((shift) => shift.date === selectedDate).length > 0 && (
          <ScrollView style={styles.shiftList}>
            {shifts
              .filter((shift) => shift.date === selectedDate)
              .map((shift) => {
                const borderColor = getStatusColor(shift.status);
                return (
                  <View key={shift.id}>
                    <TouchableOpacity
                      style={[styles.shiftHeader, { borderColor: borderColor }]}
                      onPress={() => toggleShiftDetails(shift.id)}
                    >
                      <View style={styles.shiftHeaderContent}>
                        <AntDesign name="user" size={20} color={borderColor} />
                        <Text style={styles.dateText}>
                          {format(new Date(shift.date), "d日(E)", {
                            locale: ja,
                          })}
                        </Text>
                        <Text
                          style={[styles.statusText, { color: borderColor }]}
                        >
                          {getStatusText(shift.status)}
                        </Text>
                        <Text style={styles.shiftTime}>
                          {shift.startTime} ~ {shift.endTime}
                        </Text>
                      </View>
                      <AntDesign
                        name={expandedShifts[shift.id] ? "up" : "down"}
                        size={16}
                        color={colors.text.primary}
                      />
                    </TouchableOpacity>
                    <ShiftDetails
                      shift={shift}
                      isOpen={expandedShifts[shift.id] || false}
                    />
                  </View>
                );
              })}
          </ScrollView>
        )}

      <Modal
        visible={showYearPicker}
        transparent
        animationType="fade"
        onRequestClose={() => setShowYearPicker(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{tempDate.getFullYear()}年</Text>
            <ScrollView style={styles.pickerContainer}>
              {years.map((year) => (
                <TouchableOpacity
                  key={year}
                  style={[
                    styles.pickerItem,
                    year === tempDate.getFullYear() && styles.selectedItem,
                  ]}
                  onPress={() => handleYearSelect(year)}
                >
                  <Text
                    style={[
                      styles.pickerText,
                      year === tempDate.getFullYear() && styles.selectedText,
                    ]}
                  >
                    {year}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.modalButton}
                onPress={() => setShowYearPicker(false)}
              >
                <Text style={styles.modalButtonText}>キャンセル</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal
        visible={showMonthPicker}
        transparent
        animationType="fade"
        onRequestClose={() => setShowMonthPicker(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{tempDate.getFullYear()}年</Text>
            <View style={styles.monthGrid}>
              {months.map((month) => (
                <TouchableOpacity
                  key={month}
                  style={[
                    styles.monthItem,
                    month === tempDate.getMonth() + 1 && styles.selectedItem,
                  ]}
                  onPress={() => handleMonthSelect(month)}
                >
                  <Text
                    style={[
                      styles.monthItemText,
                      month === tempDate.getMonth() + 1 && styles.selectedText,
                    ]}
                  >
                    {month}月
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.modalButton}
                onPress={() => setShowMonthPicker(false)}
              >
                <Text style={styles.modalButtonText}>キャンセル</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    paddingVertical: 0,
    backgroundColor: "transparent",
  },
  calendar: {
    width: CALENDAR_WIDTH,
    backgroundColor: "transparent",
  },
  calendarHeader: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 4,
    backgroundColor: "transparent",
  },
  monthSelector: {
    flexDirection: "row",
    alignItems: "center",
  },
  monthText: {
    fontSize: 16,
    fontWeight: "bold",
    color: colors.text.primary,
  },
  calendarIcon: {
    marginLeft: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    width: "80%",
    maxHeight: "80%",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 16,
  },
  pickerContainer: {
    maxHeight: 300,
  },
  pickerItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  selectedItem: {
    backgroundColor: colors.primary + "20",
  },
  pickerText: {
    fontSize: 16,
    textAlign: "center",
  },
  selectedText: {
    color: colors.primary,
    fontWeight: "bold",
  },
  monthGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  monthItem: {
    width: "30%",
    padding: 12,
    marginBottom: 8,
    borderRadius: 8,
    alignItems: "center",
  },
  monthItemText: {
    fontSize: 16,
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 10,
  },
  modalButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  modalButtonText: {
    color: colors.primary,
    fontSize: 16,
  },
  dayContainer: {
    width: DAY_WIDTH,
    height: DAY_HEIGHT,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "transparent",
    position: "relative",
  },
  selectedDay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: colors.selected,
    borderRadius: DAY_WIDTH / 2,
  },
  today: {
    backgroundColor: "transparent",
  },
  dayText: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#333",
    zIndex: 1,
  },
  selectedDayText: {
    color: colors.text.primary,
    fontWeight: "bold",
  },
  todayText: {
    color: "#2196F3",
    fontWeight: "bold",
  },
  disabledText: {
    color: "#d9e1e8",
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    marginTop: 1,
    zIndex: 1,
  },
  shiftList: {
    width: "100%",
    padding: 10,
  },
  shiftHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 12,
    backgroundColor: colors.surface,
    borderRadius: 8,
    marginBottom: 1,
    borderWidth: 2,
  },
  shiftHeaderContent: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "bold",
  },
  shiftTime: {
    fontSize: 14,
    fontWeight: "bold",
    color: colors.text.primary,
  },
  dateText: {
    fontSize: 16,
    fontWeight: "bold",
    color: colors.text.primary,
    marginLeft: 8, // アイコンとの間隔を調整
  },
  staffLabel: {
    fontSize: 14,
    color: colors.text.secondary,
    marginLeft: 8, // 日付との間隔を調整
  },
});
