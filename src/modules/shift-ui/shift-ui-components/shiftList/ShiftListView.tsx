import React, { useState, useMemo, useEffect, useRef } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Text,
  Dimensions,
} from "react-native";
import { useRouter, useNavigation } from "expo-router";
import { AntDesign } from "@expo/vector-icons";
import { ShiftCalendar } from "@/modules/calendar/calendar-components/calendar-main/ShiftCalendar";
import { colors } from "@/common/common-theme/ThemeColors";
import { useShift } from "@/common/common-utils/util-shift/useShiftActions";
import { Header } from "@/common/common-ui/ui-layout/LayoutHeader";
import { useAuth } from "@/services/auth/useAuth";
import { format } from "date-fns";
import { getPlatformShadow } from "@/common/common-utils/util-style/StyleGenerator";
import { ShiftListItem } from "./ShiftListItem";
import { ShiftDetailsView } from "../shiftDetail/ShiftDetailsView";
import { splitShiftIntoTimeSlots } from "../../shift-ui-utils/shift-time.utils";

// レスポンシブデザイン用の定数
const { width: SCREEN_WIDTH } = Dimensions.get("window");
const IS_SMALL_DEVICE = SCREEN_WIDTH < 375;
const IS_TABLET = SCREEN_WIDTH > 768;

export const TeacherShiftList: React.FC = () => {
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
  const shiftRefs = useRef<{ [key: string]: any }>({}).current;

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

    // 現在のユーザーのシフトのみをフィルタリング（削除済みを除外）
    return shifts
      .filter((shift) => {
        const shiftDate = new Date(shift.date);
        return (
          shiftDate >= firstDay &&
          shiftDate <= lastDay &&
          shift.userId === user.uid &&
          shift.status !== "deleted" && // 削除済みシフトを除外
          shift.status !== "purged" // 完全非表示シフトを除外
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
          // レスポンシブ対応のプロパティを追加
          responsiveSize={{
            container: { width: "100%" },
            day: { fontSize: IS_SMALL_DEVICE ? 12 : 14 },
          }}
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
                  <ShiftListItem
                    shift={shift}
                    isSelected={isSelected}
                    selectedDate={selectedDate}
                    onPress={() => handleShiftEdit(shift)}
                    onDetailsPress={() => {
                      setSelectedShiftId(isSelected ? null : shift.id);
                    }}
                  >
                    {isSelected && timeSlots && (
                      <ShiftDetailsView timeSlots={timeSlots} />
                    )}
                  </ShiftListItem>
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
};

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
    width: "100%",
  },
  listContainer: {
    flex: 1,
    width: "100%",
  },
  listContentContainer: {
    alignItems: "center",
    paddingHorizontal: IS_SMALL_DEVICE ? 8 : 16,
  },
  noShiftContainer: {
    padding: 16,
    alignItems: "center",
    backgroundColor: colors.surface,
    borderRadius: 8,
    width: "100%",
    maxWidth: IS_TABLET ? 600 : "95%",
  },
  noShiftText: {
    fontSize: IS_SMALL_DEVICE ? 12 : 14,
    color: colors.text.secondary,
  },
  addButton: {
    position: "absolute",
    right: 20,
    bottom: 20,
    width: IS_SMALL_DEVICE ? 48 : 56,
    height: IS_SMALL_DEVICE ? 48 : 56,
    borderRadius: IS_SMALL_DEVICE ? 24 : 28,
    backgroundColor: colors.primary,
    justifyContent: "center",
    alignItems: "center",
    ...getPlatformShadow(4),
  },
});
