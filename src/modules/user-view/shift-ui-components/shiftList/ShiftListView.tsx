import React, { useState, useMemo, useEffect, useRef } from "react";
import {
  View,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Text,
  Pressable,
  TextInput,
  FlexAlignType,
  useWindowDimensions,
  Modal,
} from "react-native";
import { useRouter, useNavigation } from "expo-router";
import { AntDesign } from "@expo/vector-icons";
import { ShiftCalendar } from "@/modules/child-components/calendar/calendar-components/calendar-main/ShiftCalendar";
import { colors } from "@/common/common-theme/ThemeColors";
import { useShift } from "@/common/common-utils/util-shift/useShiftActions";
import { Header } from "@/common/common-ui/ui-layout/LayoutHeader";
import { useAuth } from "@/services/auth/useAuth";
import { format } from "date-fns";
import { ShiftListItem } from "./ShiftListItem";
import { ShiftDetailsView } from "../shiftDetail/ShiftDetailsView";
import { splitShiftIntoTimeSlots } from "../../shift-ui-utils/shift-time.utils";
import { shiftListViewStyles as styles } from "./styles";
import { ViewStyle } from "react-native";
import { ShiftService } from "@/services/firebase/firebase-shift";
import { ShiftRuleValuePicker } from "@/modules/master-view/settings/ShiftRuleValuePicker";
import { getTasks } from "@/services/firebase/firebase-task";
import { modalStyles } from "../ListModal/ModalStyles";
import ShiftModal from "../ListModal/ShiftModal";
import ShiftReportModal from "../ListModal/ShiftReportModal";
import TaskModal from "../ListModal/TaskModal";

export const UserShiftList = () => {
  const router = useRouter();
  const navigation = useNavigation();
  const { user } = useAuth();
  const { shifts, loading: shiftsLoading, fetchShifts } = useShift(); // storeIdを削除
  const [selectedDate, setSelectedDate] = useState("");
  const [currentMonth, setCurrentMonth] = useState(() => {
    const today = new Date();
    return format(today, "yyyy-MM-dd");
  });
  const [displayMonth, setDisplayMonth] = useState<string | null>(null);
  const [selectedShiftId, setSelectedShiftId] = useState<string | null>(null);
  const [isCalendarMounted, setIsCalendarMounted] = useState(false);
  const [isModalVisible, setModalVisible] = useState(false);
  const [modalShift, setModalShift] = useState<any>(null);
  const [reportModalVisible, setReportModalVisible] = useState(false);
  const [taskCounts, setTaskCounts] = useState<{
    [key: string]: { count: number; time: number };
  }>({});
  const [comments, setComments] = useState("");
  const [selectedTask, setSelectedTask] = useState<string | null>(null);
  const [isTaskModalVisible, setTaskModalVisible] = useState(false);
  const [picker, setPicker] = useState<string | null>(null);
  const scrollViewRef = useRef<ScrollView>(null);
  const shiftRefs = useRef<{ [key: string]: any }>({}).current;
  const { width, height } = useWindowDimensions();
  const isTablet = width >= 768 && width < 1024; // タブレット判定

  // 画面がフォーカスされた時にデータを更新
  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", () => {
      fetchShifts();
    });

    return unsubscribe;
  }, [navigation, fetchShifts]);

  // 初回マウント時にデータを取得
  useEffect(() => {
    console.log("UserShiftList debug:", {
      userStoreId: user?.storeId,
      userUid: user?.uid,
      shiftsCount: shifts.length,
    });
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
    if (!displayMonth || !user) {
      console.log("monthlyShifts: no displayMonth or user", {
        displayMonth,
        userUid: user?.uid,
      });
      return [];
    }

    const displayMonthDate = new Date(displayMonth);
    const year = displayMonthDate.getFullYear();
    const month = displayMonthDate.getMonth();

    // 月の最初の日と最後の日を取得
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    // 月の最後の日を週末まで拡張
    const adjustedLastDay = new Date(lastDay);
    adjustedLastDay.setDate(
      adjustedLastDay.getDate() + (7 - adjustedLastDay.getDay())
    );

    const filteredShifts = shifts
      .filter((shift) => {
        const shiftDate = new Date(shift.date);
        const isInDateRange =
          shiftDate >= firstDay &&
          shiftDate <= adjustedLastDay &&
          shiftDate.getMonth() === month;
        const isUserShift = shift.userId === user.uid;
        const isNotDeleted =
          shift.status !== "deleted" && shift.status !== "purged";

        return isInDateRange && isUserShift && isNotDeleted;
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

    console.log("monthlyShifts debug:", {
      displayMonth,
      totalShifts: shifts.length,
      userShifts: shifts.filter((s) => s.userId === user.uid).length,
      filteredShifts: filteredShifts.length,
      firstShift: filteredShifts[0],
    });

    return filteredShifts;
  }, [shifts, displayMonth, user]);

  if (shiftsLoading) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </View>
    );
  }
  const handleDayPress = (day: { dateString: string }) => {
    // 同じ日付をもう一度押したときに選択を解除
    if (selectedDate === day.dateString) {
      setSelectedDate("");
      return;
    }

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
      pathname: "/(main)/user/shifts/create",
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

  const handleShiftPress = (shift: any) => {
    console.log("Shift status:", shift.status); // デバッグ用ログ
    console.log("handleShiftPress called with shift:", shift);
    if (shift.status === "approved") {
      setModalShift(shift);
      setModalVisible(true);
    } else {
      handleShiftEdit(shift);
    }
  };

  const handleReportShift = async () => {
    if (modalShift) {
      setModalVisible(false);
      setReportModalVisible(true);

      try {
        const tasks = await getTasks();
        const taskCountsData = tasks.reduce(
          (
            acc: { [key: string]: { count: number; time: number } },
            task: { title: string }
          ) => {
            acc[task.title] = { count: 0, time: 0 };
            return acc;
          },
          {}
        );

        setTaskCounts(taskCountsData);
      } catch (error) {
        console.error("タスクの取得に失敗しました:", error);
      }
    }
  };

  const handleEditShift = () => {
    if (modalShift) {
      handleShiftEdit(modalShift);
    }
    setModalVisible(false);
  };

  const timeOptions = [5, 10, 20, 30, 60];

  const handleTaskUpdate = (
    task: string,
    field: "count" | "time",
    value: number
  ) => {
    setTaskCounts((prev) => ({
      ...prev,
      [task]: {
        count: prev[task]?.count || 0,
        time: prev[task]?.time || 0,
        [field]:
          field === "time"
            ? value
            : Math.max((prev[task]?.[field] || 0) + value, 0),
      },
    }));
  };

  const handleTaskModalClose = () => {
    setSelectedTask(null);
    setTaskModalVisible(false);
  };

  const containerStyle = isTablet
    ? {
        width: width * 0.8,
        height: height * 0.8,
        alignSelf: "center" as FlexAlignType,
      } // タブレット用スタイル
    : { flex: 1 }; // スマホやPC用スタイル

  return (
    <>
      <View style={containerStyle}>
        <View style={styles.calendarContainer}>
          <ShiftCalendar
            shifts={monthlyShifts}
            selectedDate={selectedDate}
            currentMonth={currentMonth}
            onDayPress={handleDayPress}
            onMonthChange={handleMonthChange}
            onMount={handleCalendarMount} // レスポンシブ対応のプロパティを追加
            responsiveSize={{
              container: {
                width: "96%",
                maxWidth: 480, // カレンダーの最大幅を明示的に設定
              },
              day: { fontSize: 13 },
            }}
          />
        </View>
        {isCalendarMounted && displayMonth && (
          <ScrollView
            ref={scrollViewRef}
            style={styles.listContainer} // スタイル定義を使用
            contentContainerStyle={styles.listContentContainer}
            showsVerticalScrollIndicator={false} // スクロールバーを非表示に
          >
            {monthlyShifts.length > 0 ? (
              monthlyShifts.map((shift) => {
                // シフトの表示
                const isSelected = selectedShiftId === shift.id;
                const timeSlots = isSelected
                  ? splitShiftIntoTimeSlots(shift)
                  : null;
                return (
                  <View
                    key={shift.id}
                    ref={(ref) => (shiftRefs[shift.id] = ref)}
                    style={{ width: "100%" }} // 親Viewの幅を100%に設定
                  >
                    <ShiftListItem
                      shift={shift}
                      isSelected={isSelected}
                      selectedDate={selectedDate}
                      onPress={() => handleShiftPress(shift)}
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
              <View style={[styles.noShiftContainer, { width: "100%" }]}>
                <Text style={styles.noShiftText}>
                  この月のシフトはありません
                </Text>
              </View>
            )}
          </ScrollView>
        )}
      </View>
      <ShiftModal
        isModalVisible={isModalVisible}
        setModalVisible={setModalVisible}
        handleReportShift={handleReportShift}
        handleEditShift={handleEditShift}
      />
      <ShiftReportModal
        reportModalVisible={reportModalVisible}
        setReportModalVisible={setReportModalVisible}
        taskCounts={taskCounts}
        comments={comments}
        setComments={setComments}
        modalShift={modalShift}
        fetchShifts={fetchShifts}
        setTaskCounts={setTaskCounts}
      />
      <TaskModal
        isTaskModalVisible={isTaskModalVisible}
        handleTaskModalClose={handleTaskModalClose}
        selectedTask={selectedTask}
        taskCounts={taskCounts}
        handleTaskUpdate={handleTaskUpdate}
        timeOptions={timeOptions}
      />
      <ShiftRuleValuePicker
        visible={picker === "time"}
        values={timeOptions}
        value={taskCounts[selectedTask!]?.time || 0}
        unit="分"
        title="時間選択"
        onSelect={(v: number) => handleTaskUpdate(selectedTask!, "time", v)}
        onClose={() => setPicker(null)}
      />
    </>
  );
};
