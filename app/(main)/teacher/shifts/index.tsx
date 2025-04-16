import React, { useState, useMemo, useEffect, useRef } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Text,
  Dimensions,
  Animated,
} from "react-native";
import { useRouter, useNavigation } from "expo-router";
import { AntDesign } from "@expo/vector-icons";
import { ShiftCalendar } from "@/components/calendar/ShiftCalendar";
import { ShiftList } from "@/components/Shift/ShiftList";
import { colors } from "@/theme/colors";
import { useShift } from "@/hooks/useShift";
import { Header } from "@/components/Layout/Header";
import { useAuth } from "@/providers/AuthContext";
import { format } from "date-fns";
import { ja } from "date-fns/locale";
import { getPlatformShadow } from "@/utils/time";

const SCREEN_WIDTH = Dimensions.get("window").width;
const CALENDAR_WIDTH = SCREEN_WIDTH * 0.35;
const LIST_WIDTH = CALENDAR_WIDTH * 1.1;

interface TimeSlot {
  type: "staff" | "class";
  startTime: string;
  endTime: string;
}

// シフト時間を分割する関数
const splitShiftIntoTimeSlots = (shift: any): TimeSlot[] => {
  const slots: TimeSlot[] = [];
  const startTime = new Date(`2000-01-01T${shift.startTime}`);
  const endTime = new Date(`2000-01-01T${shift.endTime}`);
  let currentTime = startTime;

  // 授業時間を時間順にソート
  const classes =
    shift.classes?.sort((a: any, b: any) => {
      const timeA = new Date(`2000-01-01T${a.startTime}`);
      const timeB = new Date(`2000-01-01T${b.startTime}`);
      return timeA.getTime() - timeB.getTime();
    }) || [];

  classes.forEach((classTime: any) => {
    const classStart = new Date(`2000-01-01T${classTime.startTime}`);
    const classEnd = new Date(`2000-01-01T${classTime.endTime}`);

    // 授業開始前のスタッフ時間
    if (currentTime < classStart) {
      slots.push({
        type: "staff",
        startTime: currentTime.toTimeString().slice(0, 5),
        endTime: classStart.toTimeString().slice(0, 5),
      });
    }

    // 授業時間
    slots.push({
      type: "class",
      startTime: classStart.toTimeString().slice(0, 5),
      endTime: classEnd.toTimeString().slice(0, 5),
    });

    currentTime = classEnd;
  });

  // 最後の授業後のスタッフ時間
  if (currentTime < endTime) {
    slots.push({
      type: "staff",
      startTime: currentTime.toTimeString().slice(0, 5),
      endTime: endTime.toTimeString().slice(0, 5),
    });
  }

  return slots;
};

export default function TeacherShiftsScreen() {
  const router = useRouter();
  const navigation = useNavigation();
  const { shifts, loading: shiftsLoading, fetchShifts } = useShift();
  const { user } = useAuth();
  const [selectedDate, setSelectedDate] = useState("");
  const [currentMonth, setCurrentMonth] = useState(() => {
    const today = new Date();
    return format(today, "yyyy-MM-dd");
  });
  const [displayMonth, setDisplayMonth] = useState<string | null>(null);
  const [selectedShiftId, setSelectedShiftId] = useState<string | null>(null);
  const [isCalendarMounted, setIsCalendarMounted] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);
  const shiftRefs = useRef<{ [key: string]: View | null }>({}).current;

  // 画面がフォーカスされた時にデータを更新
  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", () => {
      fetchShifts();
    });

    return unsubscribe;
  }, [navigation, fetchShifts]);

  // 初回マウント時にデータを取得
  useEffect(() => {
    fetchShifts();
  }, []);

  // カレンダーがマウントされた時に現在の月を設定
  const handleCalendarMount = () => {
    setIsCalendarMounted(true);
    setDisplayMonth(currentMonth);
  };

  const handleMonthChange = (month: { dateString: string }) => {
    setCurrentMonth(month.dateString);
    setDisplayMonth(month.dateString);
    setSelectedDate("");
    setSelectedShiftId(null);
  };

  // 月ごとにシフトをグループ化
  const monthlyShifts = useMemo(() => {
    if (!displayMonth || !user) return [];

    const displayMonthDate = new Date(displayMonth);
    const year = displayMonthDate.getFullYear();
    const month = displayMonthDate.getMonth();

    // 月の最初の日と最後の日を取得
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    // 現在のユーザーのシフトのみをフィルタリング
    return shifts
      .filter((shift) => {
        const shiftDate = new Date(shift.date);
        return (
          shiftDate >= firstDay &&
          shiftDate <= lastDay &&
          shift.userId === user.uid
        );
      })
      .sort((a, b) => {
        const dateCompare =
          new Date(a.date).getTime() - new Date(b.date).getTime();
        if (dateCompare === 0) {
          return (
            new Date(`2000-01-01T${a.startTime}`).getTime() -
            new Date(`2000-01-01T${b.startTime}`).getTime()
          );
        }
        return dateCompare;
      });
  }, [shifts, displayMonth, user]);

  // 選択されているシフトの詳細を取得
  const selectedShiftDetails = useMemo(() => {
    if (!selectedShiftId) return null;
    const shift = monthlyShifts.find((s) => s.id === selectedShiftId);
    return shift ? splitShiftIntoTimeSlots(shift) : null;
  }, [selectedShiftId, monthlyShifts]);

  if (shiftsLoading) {
    return (
      <View style={styles.container}>
        <Header title="シフト一覧" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </View>
    );
  }

  const handleDayPress = (day: { dateString: string }) => {
    setSelectedDate(day.dateString);

    // 選択された日付のシフトまでスクロール
    const selectedShift = monthlyShifts.find(
      (shift) => shift.date === day.dateString
    );
    if (selectedShift && shiftRefs[selectedShift.id]) {
      // 少し遅延を入れてスクロールを実行（レイアウト計算のため）
      setTimeout(() => {
        shiftRefs[selectedShift.id]?.measureLayout(
          // @ts-ignore
          scrollViewRef.current?._nativeRef,
          (x: number, y: number) => {
            scrollViewRef.current?.scrollTo({ y, animated: true });
          },
          () => {}
        );
      }, 100);
    }
  };

  const handleShiftEdit = (shift: any) => {
    router.push({
      pathname: "/teacher/shifts/create",
      params: {
        mode: "edit",
        shiftId: shift.id,
        date: shift.date,
        startTime: shift.startTime,
        endTime: shift.endTime,
        classes: JSON.stringify(shift.classes || []),
      },
    });
  };

  return (
    <View style={styles.container}>
      <Header title="シフト一覧" />
      <View style={styles.calendarContainer}>
        <ShiftCalendar
          shifts={monthlyShifts}
          selectedDate={selectedDate}
          currentMonth={currentMonth}
          onDayPress={handleDayPress}
          onMonthChange={handleMonthChange}
          onMount={handleCalendarMount}
        />
      </View>
      {isCalendarMounted && displayMonth && (
        <ScrollView
          ref={scrollViewRef}
          style={styles.listContainer}
          contentContainerStyle={styles.listContentContainer}
        >
          {monthlyShifts.length > 0 ? (
            monthlyShifts.map((shift) => {
              // シフトの表示
              const isSelected = selectedShiftId === shift.id;
              const timeSlots = isSelected
                ? splitShiftIntoTimeSlots(shift)
                : null;

              return (
                <View key={shift.id} ref={(ref) => (shiftRefs[shift.id] = ref)}>
                  <View
                    style={[
                      styles.shiftItem,
                      { borderColor: colors.status[shift.status] }, // 状態に応じた外枠の色
                      shift.date === selectedDate && styles.selectedShiftItem,
                    ]}
                  >
                    <TouchableOpacity
                      style={styles.shiftContent}
                      onPress={() => handleShiftEdit(shift)}
                    >
                      <AntDesign
                        name="user"
                        size={20}
                        color={colors.primary}
                        style={styles.icon}
                      />
                      <View style={styles.textContainer}>
                        <Text style={styles.shiftText}>
                          {format(new Date(shift.date), "d日(E)", {
                            locale: ja,
                          })}
                          {"  "}
                          <Text
                            style={[
                              styles.staffLabel,
                              {
                                backgroundColor:
                                  colors.status[shift.status] + "20",
                                color: colors.status[shift.status],
                              },
                            ]}
                          >
                            {shift.status === "draft"
                              ? "下書き"
                              : shift.status === "approved"
                              ? "承認済"
                              : shift.status === "pending"
                              ? "承認待ち"
                              : ""}
                          </Text>
                          {"  "}
                          {shift.startTime} ~ {shift.endTime}
                        </Text>
                      </View>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.detailsButton}
                      onPress={() => {
                        setSelectedShiftId(isSelected ? null : shift.id);
                      }}
                    >
                      <Text style={styles.detailsText}>詳細</Text>
                      <AntDesign
                        name={isSelected ? "down" : "right"}
                        size={16}
                        color={colors.text.secondary}
                        style={styles.detailsIcon}
                      />
                    </TouchableOpacity>
                  </View>
                  {isSelected && timeSlots && (
                    <View style={styles.detailsContainer}>
                      {timeSlots.map((slot, index) => (
                        <View key={index} style={styles.timeSlot}>
                          <Text
                            style={[
                              styles.timeSlotText,
                              styles.timeSlotType,
                              {
                                color:
                                  slot.type === "class"
                                    ? colors.warning
                                    : colors.primary,
                              },
                            ]}
                          >
                            {slot.type === "class" ? "授業" : "スタッフ"}
                          </Text>
                          <Text style={styles.timeSlotTime}>
                            {slot.startTime} ~ {slot.endTime}
                          </Text>
                        </View>
                      ))}
                    </View>
                  )}
                </View>
              );
            })
          ) : (
            <View style={styles.noShiftContainer}>
              <Text style={styles.noShiftText}>この月のシフトはありません</Text>
            </View>
          )}
        </ScrollView>
      )}

      <TouchableOpacity
        style={styles.addButton}
        onPress={() => router.push("/(main)/teacher/shifts/create")}
      >
        <AntDesign name="plus" size={24} color="white" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  calendarContainer: {
    marginTop: 0,
    marginBottom: 8,
    alignItems: "center",
  },
  mainContent: {
    flex: 1,
    display: "flex",
  },
  listContainer: {
    flex: 1,
  },
  listContentContainer: {
    alignItems: "center",
  },
  shiftItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 12,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    borderRadius: 8,
    marginBottom: 8,
    width: LIST_WIDTH,
    ...getPlatformShadow(2),
  },
  shiftContent: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  textContainer: {
    flex: 1,
  },
  icon: {
    marginRight: 8,
  },
  shiftText: {
    fontSize: 16,
    fontWeight: "bold",
    color: colors.text.primary,
  },
  staffLabel: {
    color: colors.primary,
    backgroundColor: colors.primary + "20",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  statusLabel: {
    fontSize: 14,
    fontWeight: "500",
  },
  detailsButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  detailsText: {
    fontSize: 14,
    color: colors.text.secondary,
  },
  detailsContainer: {
    width: LIST_WIDTH,
    backgroundColor: colors.surface,
    borderRadius: 8,
    padding: 12,
    marginTop: -8,
    marginBottom: 8,
    alignSelf: "center",
    borderWidth: 1,
    borderTopWidth: 0,
    borderColor: colors.border,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  timeSlot: {
    marginBottom: 8,
    flexDirection: "row",
    alignItems: "center",
  },
  timeSlotText: {
    fontSize: 14,
    fontWeight: "500",
  },
  timeSlotType: {
    width: 60,
    fontSize: 14,
    fontWeight: "500",
  },
  timeSlotTime: {
    fontSize: 14,
    fontWeight: "500",
    color: colors.text.primary,
  },
  detailsIcon: {
    marginLeft: 4,
  },
  addButton: {
    position: "absolute",
    right: 20,
    bottom: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary,
    justifyContent: "center",
    alignItems: "center",
    ...getPlatformShadow(4),
  },
  noShiftContainer: {
    padding: 16,
    alignItems: "center",
    backgroundColor: colors.surface,
    borderRadius: 8,
    width: LIST_WIDTH,
  },
  noShiftText: {
    fontSize: 14,
    color: colors.text.secondary,
  },
  monthLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.text.primary,
    textAlign: "center",
    marginBottom: 12,
  },
  selectedShiftItem: {
    backgroundColor: colors.selected,
  },
});
