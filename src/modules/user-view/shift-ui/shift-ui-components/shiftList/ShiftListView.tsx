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
import { ShiftService } from "@/services/firebase/firebase-shift";
import { ShiftRuleValuePicker } from "@/modules/master-view/settings/ShiftRuleValuePicker";
import { getTasks } from "@/services/firebase/firebase-task";

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
  const [taskCounts, setTaskCounts] = useState<{
    [key: string]: { count: number; time: number };
  }>({});
  const [comments, setComments] = useState("");
  const [selectedTask, setSelectedTask] = useState<string | null>(null);
  const [isTaskModalVisible, setTaskModalVisible] = useState(false);
  const [picker, setPicker] = useState<string | null>(null);
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

  const handleReportSubmit = async () => {
    if (modalShift) {
      try {
        // taskCounts を期待される形式に変換
        const formattedTasks = Object.keys(taskCounts).reduce((acc, key) => {
          acc[key] = {
            count: taskCounts[key].count,
            time: taskCounts[key].time,
          }; // count と time を含む形式に変換
          return acc;
        }, {} as { [key: string]: { count: number; time: number } });

        await ShiftService.updateShiftWithTasks(
          modalShift.id,
          formattedTasks,
          comments
        );
        console.log("報告が保存され、ステータスが完了に更新されました:", {
          taskCounts,
          comments,
        });
        fetchShifts(); // シフトデータを再取得して画面を更新
        setReportModalVisible(false);
      } catch (error) {
        console.error("報告の保存に失敗しました:", error);
      }
    }
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

  const handleTaskModalOpen = (task: string) => {
    setSelectedTask(task);
    setTaskModalVisible(true);
  };

  const handleTaskModalClose = () => {
    setSelectedTask(null);
    setTaskModalVisible(false);
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
              const taskData = taskCounts[task] || { count: 0, time: 0 };
              return (
                <View
                  key={task}
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginVertical: 5,
                  }}
                >
                  <Text style={{ flex: 1 }}>{task}</Text>
                  <View style={{ flexDirection: "row", alignItems: "center" }}>
                    <TouchableOpacity
                      onPress={() => handleTaskUpdate(task, "count", -1)}
                      style={{ marginHorizontal: 5 }}
                    >
                      <Text style={{ fontSize: 18 }}>-</Text>
                    </TouchableOpacity>
                    <Text>{taskData.count} 回</Text>
                    <TouchableOpacity
                      onPress={() => handleTaskUpdate(task, "count", 1)}
                      style={{ marginHorizontal: 5 }}
                    >
                      <Text style={{ fontSize: 18 }}>+</Text>
                    </TouchableOpacity>
                  </View>
                  <View style={{ flexDirection: "row", alignItems: "center" }}>
                    <TouchableOpacity
                      onPress={() =>
                        handleTaskUpdate(task, "time", taskData.time - 5)
                      }
                      style={{ marginHorizontal: 5 }}
                    >
                      <Text style={{ fontSize: 18 }}>-</Text>
                    </TouchableOpacity>
                    <Text>{taskData.time} 分</Text>
                    <TouchableOpacity
                      onPress={() =>
                        handleTaskUpdate(task, "time", taskData.time + 5)
                      }
                      style={{ marginHorizontal: 5 }}
                    >
                      <Text style={{ fontSize: 18 }}>+</Text>
                    </TouchableOpacity>
                  </View>
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
              onPress={handleReportSubmit}
            >
              <Text style={modalStyles.modalButtonText}>報告を送信</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>
      <Modal
        visible={isTaskModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={handleTaskModalClose}
      >
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: "rgba(0, 0, 0, 0.5)",
          }}
        >
          <View
            style={{
              width: "90%",
              backgroundColor: "white",
              borderRadius: 10,
              padding: 20,
              alignItems: "center",
            }}
          >
            <Text
              style={{ fontSize: 18, fontWeight: "bold", marginBottom: 20 }}
            >
              タスク設定: {selectedTask}
            </Text>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginBottom: 20,
              }}
            >
              <Text style={{ flex: 1, fontSize: 16 }}>回数:</Text>
              <TouchableOpacity
                onPress={() => handleTaskUpdate(selectedTask!, "count", -1)}
                style={{
                  padding: 10,
                  backgroundColor: "#f0f0f0",
                  borderRadius: 5,
                }}
              >
                <Text style={{ fontSize: 18 }}>-</Text>
              </TouchableOpacity>
              <Text style={{ marginHorizontal: 10, fontSize: 16 }}>
                {taskCounts[selectedTask!]?.count || 0} 回
              </Text>
              <TouchableOpacity
                onPress={() => handleTaskUpdate(selectedTask!, "count", 1)}
                style={{
                  padding: 10,
                  backgroundColor: "#f0f0f0",
                  borderRadius: 5,
                }}
              >
                <Text style={{ fontSize: 18 }}>+</Text>
              </TouchableOpacity>
            </View>
            <View style={{ marginBottom: 20, width: "100%" }}>
              <Text style={{ fontSize: 16, marginBottom: 10 }}>時間:</Text>
              <View
                style={{
                  flexDirection: "row",
                  flexWrap: "wrap",
                  justifyContent: "center",
                }}
              >
                {timeOptions.map((option) => (
                  <TouchableOpacity
                    key={option}
                    onPress={() =>
                      handleTaskUpdate(selectedTask!, "time", option)
                    }
                    style={{
                      padding: 10,
                      margin: 5,
                      backgroundColor:
                        taskCounts[selectedTask!]?.time === option
                          ? "#007BFF"
                          : "#f0f0f0",
                      borderRadius: 5,
                    }}
                  >
                    <Text
                      style={{
                        color:
                          taskCounts[selectedTask!]?.time === option
                            ? "white"
                            : "black",
                      }}
                    >
                      {option} 分
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
            <TouchableOpacity
              onPress={handleTaskModalClose}
              style={{
                padding: 10,
                backgroundColor: "#007BFF",
                borderRadius: 5,
                width: "100%",
              }}
            >
              <Text
                style={{ color: "white", textAlign: "center", fontSize: 16 }}
              >
                保存
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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

const modalStyles = {
  modalOverlay: {
    flex: 1,
    justifyContent: "center" as const,
    alignItems: "center" as const,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    width: "90%" as ViewStyle["width"],
    maxWidth: 500,
    backgroundColor: "#ffffff",
    borderRadius: 10,
    padding: 20,
    alignItems: "center" as const,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold" as const,
    marginBottom: 15,
    color: "#333",
  },
  taskRow: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    justifyContent: "space-between" as const,
    width: "100%" as ViewStyle["width"],
    marginVertical: 10,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },
  taskText: {
    fontSize: 16,
    color: "#555",
    flex: 1,
  },
  countControls: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
  },
  countButton: {
    padding: 10,
    backgroundColor: "#f0f0f0",
    borderRadius: 5,
    marginHorizontal: 5,
  },
  countText: {
    fontSize: 16,
    marginHorizontal: 10,
  },
  valueTouchable: {
    padding: 10,
    backgroundColor: "#f0f0f0",
    borderRadius: 5,
    marginLeft: 10,
  },
  valueText: {
    fontSize: 16,
    color: "#333",
  },
  modalButton: {
    backgroundColor: "#007bff",
    borderRadius: 5,
    paddingVertical: 12,
    paddingHorizontal: 20,
    marginTop: 20,
    width: "100%" as ViewStyle["width"],
    alignItems: "center" as const,
  },
  modalButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600" as const,
  },
};

// モーダル内のタスクリスト表示を改善
const renderTaskRows = (
  taskCounts: { [key: string]: { count: number; time: number } },
  handleTaskUpdate: Function,
  timeOptions: number[],
  setPicker: Function,
  picker: string | null,
  selectedTask: string | null,
  setSelectedTask: Function
) => {
  return Object.keys(taskCounts).map((task) => {
    const taskData = taskCounts[task] || { count: 0, time: 0 };
    return (
      <View key={task} style={modalStyles.taskRow}>
        <Text style={modalStyles.taskText}>{task}</Text>
        <View style={modalStyles.countControls}>
          <TouchableOpacity
            style={modalStyles.countButton}
            onPress={() => handleTaskUpdate(task, "count", taskData.count - 1)}
          >
            <Text style={modalStyles.taskText}>-</Text>
          </TouchableOpacity>
          <Text style={modalStyles.countText}>{taskData.count} 回</Text>
          <TouchableOpacity
            style={modalStyles.countButton}
            onPress={() => handleTaskUpdate(task, "count", taskData.count + 1)}
          >
            <Text style={modalStyles.taskText}>+</Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity
          style={modalStyles.valueTouchable}
          onPress={() => {
            setSelectedTask(task);
            setPicker("time");
          }}
        >
          <Text style={modalStyles.valueText}>{taskData.time} 分</Text>
        </TouchableOpacity>
      </View>
    );
  });
};
