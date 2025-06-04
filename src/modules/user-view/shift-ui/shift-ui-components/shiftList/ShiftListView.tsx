import React, { useState, useMemo, useEffect, useRef } from "react";
import {
  View,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Text,
  Modal,
  Pressable,
  TextInput,
  FlexAlignType,
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

export const UserShiftList = () => {
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
  const [isModalVisible, setModalVisible] = useState(false);
  const [modalShift, setModalShift] = useState<any>(null);
  const [reportModalVisible, setReportModalVisible] = useState(false);
  const [taskCounts, setTaskCounts] = useState<{ [key: string]: number }>({});
  const [comments, setComments] = useState("");
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
    if (shift.status === "approved") {
      setModalShift(shift);
      setModalVisible(true);
    } else {
      handleShiftEdit(shift);
    }
  };

  const handleReportShift = () => {
    if (modalShift) {
      setModalVisible(false);
      setReportModalVisible(true);
      setTaskCounts({
        タスク1: 0,
        タスク2: 0,
        タスク3: 0,
        その他: 0,
      });
    }
  };

  const handleEditShift = () => {
    if (modalShift) {
      handleShiftEdit(modalShift);
    }
    setModalVisible(false);
  };

  return (
    <>
      <View style={styles.container}>
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
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => router.push("/(main)/user/shifts/create")}
        >
          <AntDesign name="plus" size={24} color="white" />
        </TouchableOpacity>
      </View>
      <Modal
        visible={isModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <Pressable
          style={modalStyles.modalOverlay}
          onPress={() => setModalVisible(false)}
        >
          <View style={modalStyles.modalContent}>
            <Text style={modalStyles.modalTitle}>シフト操作</Text>
            <TouchableOpacity
              style={modalStyles.modalButton}
              onPress={handleReportShift}
            >
              <Text style={modalStyles.modalButtonText}>シフト報告をする</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={modalStyles.modalButton}
              onPress={handleEditShift}
            >
              <Text style={modalStyles.modalButtonText}>シフト変更をする</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>
      <Modal
        visible={reportModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setReportModalVisible(false)}
      >
        <Pressable
          style={modalStyles.modalOverlay}
          onPress={() => setReportModalVisible(false)}
        >
          <View style={modalStyles.modalContent}>
            <Text style={modalStyles.modalTitle}>シフト報告</Text>
            {Object.keys(taskCounts).map((task) => {
              return (
                <View
                  key={task}
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    marginVertical: 5,
                  }}
                >
                  <Text style={{ flex: 1 }}>{task}</Text>
                  <TouchableOpacity
                    onPress={() =>
                      setTaskCounts((prev) => ({
                        ...prev,
                        [task]: Math.max((prev[task] || 0) - 1, 0),
                      }))
                    }
                  >
                    <Text style={{ fontSize: 18, marginHorizontal: 10 }}>
                      -
                    </Text>
                  </TouchableOpacity>
                  <Text>{taskCounts[task] || 0} 分</Text>
                  <TouchableOpacity
                    onPress={() =>
                      setTaskCounts((prev) => ({
                        ...prev,
                        [task]: (prev[task] || 0) + 1,
                      }))
                    }
                  >
                    <Text style={{ fontSize: 18, marginHorizontal: 10 }}>
                      +
                    </Text>
                  </TouchableOpacity>
                </View>
              );
            })}
            <TextInput
              style={{
                borderWidth: 1,
                borderColor: "#ccc",
                borderRadius: 5,
                padding: 10,
                marginVertical: 10,
                width: "100%",
              }}
              placeholder="コメントを入力してください"
              value={comments}
              onChangeText={setComments}
            />
            <TouchableOpacity
              style={modalStyles.modalButton}
              onPress={() => {
                console.log("報告内容:", { taskCounts, comments });
                setReportModalVisible(false);
              }}
            >
              <Text style={modalStyles.modalButtonText}>報告を送信</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>
    </>
  );
};

const modalStyles = {
  modalOverlay: {
    flex: 1,
    justifyContent: "center" as const,
    alignItems: "center" as const,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
  },
  modalContent: {
    width: "80%" as ViewStyle["width"],
    backgroundColor: "white",
    borderRadius: 10,
    padding: 20,
    alignItems: "center" as const,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold" as const,
    marginBottom: 15,
  },
  modalButton: {
    backgroundColor: colors.primary,
    borderRadius: 5,
    paddingVertical: 10,
    paddingHorizontal: 15,
    marginVertical: 5,
    width: "100%" as ViewStyle["width"],
    alignItems: "center" as const,
  },
  modalButtonText: {
    color: "white",
    fontSize: 16,
  },
};
