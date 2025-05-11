import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  PanResponder,
  Modal,
  TextInput,
  Dimensions,
  Alert,
  ActivityIndicator,
} from "react-native";
import {
  ShiftItem,
  ShiftStatusConfig,
  DEFAULT_SHIFT_STATUS_CONFIG,
  ShiftStatus,
} from "@/types/shift";
import {
  doc,
  onSnapshot,
  updateDoc,
  deleteDoc,
  addDoc,
  collection,
  serverTimestamp,
  getDocs,
  DocumentData,
} from "firebase/firestore";
import { db } from "@/services/firebase";
import DateTimePicker from "@react-native-community/datetimepicker";
import { format, addMonths, subMonths } from "date-fns";
import { ja } from "date-fns/locale";
import { Ionicons } from "@expo/vector-icons";
import CustomScrollView from "../CustomScrollView";
import { DatePickerModal } from "@/components/calendar/DatePickerModal";
import { Picker } from "@react-native-picker/picker";

interface GanttChartMonthEditProps {
  shifts: ShiftItem[];
  onShiftPress?: (shift: ShiftItem) => void;
  onShiftUpdate?: (shift: ShiftItem) => void;
  classTimes?: { start: string; end: string }[];
}

// 1時間ごとのラベル
const hourLabels = Array.from({ length: 22 - 9 + 1 }, (_, i) => {
  const hour = 9 + i;
  return `${hour}:00`;
});

// 30分ごとの線
const halfHourLines = Array.from({ length: (22 - 9) * 2 + 1 }, (_, i) => {
  const hour = 9 + Math.floor(i / 2);
  const min = i % 2 === 0 ? "00" : "30";
  return `${hour}:${min}`;
});

export const GanttChartMonthEdit: React.FC<GanttChartMonthEditProps> = ({
  shifts,
  onShiftPress,
  onShiftUpdate,
  classTimes = [],
}) => {
  const [statusConfigs, setStatusConfigs] = useState<ShiftStatusConfig[]>(
    DEFAULT_SHIFT_STATUS_CONFIG
  );
  const [editingShift, setEditingShift] = useState<ShiftItem | null>(null);
  const [timeInput, setTimeInput] = useState({ start: "", end: "" });
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showYearMonthPicker, setShowYearMonthPicker] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [actionModalVisible, setActionModalVisible] = useState(false);
  const [classTimeInput, setClassTimeInput] = useState({ start: "", end: "" });
  const [showClassTimeModal, setShowClassTimeModal] = useState(false);
  const [showAddShiftModal, setShowAddShiftModal] = useState(false);
  const [newShift, setNewShift] = useState({
    userId: "",
    nickname: "",
    date: "",
    startTime: "",
    endTime: "",
    status: "pending" as const,
  });
  const [users, setUsers] = useState<Array<{ uid: string; nickname: string }>>(
    []
  );
  const [loading, setLoading] = useState(false);

  const screenWidth = Dimensions.get("window").width;
  const dateColumnWidth = 50;
  const infoColumnWidth = Math.max(screenWidth * 0.18, 150);
  const ganttColumnWidth = screenWidth - dateColumnWidth - infoColumnWidth;

  // 時間セル計算
  const cellWidth = ganttColumnWidth / (hourLabels.length - 1) / 2;

  const ganttContainerRef = useRef<View>(null);

  useEffect(() => {
    // Firestoreからステータス設定を取得
    const configRef = doc(db, "settings", "shiftStatus");
    const unsubscribe = onSnapshot(configRef, (doc) => {
      if (doc.exists()) {
        const data = doc.data();
        const updatedConfigs = DEFAULT_SHIFT_STATUS_CONFIG.map((config) => ({
          ...config,
          ...data[config.status],
        }));
        setStatusConfigs(updatedConfigs);
      }
    });

    return () => unsubscribe();
  }, []);

  // Firebase からユーザー一覧を取得
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const usersRef = collection(db, "users");
        const snapshot = await getDocs(usersRef);
        const usersData = snapshot.docs.map((doc: DocumentData) => ({
          uid: doc.id,
          nickname: doc.data().nickname || "名前なし",
        }));
        setUsers(usersData);
      } catch (error) {
        console.error("ユーザー取得エラー:", error);
      }
    };

    fetchUsers();
  }, []);

  const getStatusConfig = (status: string) => {
    return (
      statusConfigs.find((config) => config.status === status) ||
      statusConfigs[0]
    );
  };

  // 時間位置の計算ヘルパー関数
  function timeToPosition(time: string): number {
    const [hours, minutes] = time.split(":").map(Number);
    return hours - 9 + minutes / 60;
  }

  // 位置を時間に変換する関数
  function positionToTime(position: number): string {
    const hours = Math.floor(position) + 9;
    const minutes = Math.floor((position % 1) * 60);
    return `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}`;
  }

  const handleTimeUpdate = async () => {
    if (!editingShift) return;

    const [startHour, startMinute] = timeInput.start.split(":").map(Number);
    const [endHour, endMinute] = timeInput.end.split(":").map(Number);

    if (
      isNaN(startHour) ||
      isNaN(startMinute) ||
      isNaN(endHour) ||
      isNaN(endMinute)
    ) {
      return;
    }

    const updatedShift = {
      ...editingShift,
      startTime: timeInput.start,
      endTime: timeInput.end,
    };

    try {
      const shiftRef = doc(db, "shifts", editingShift.id);
      await updateDoc(shiftRef, {
        startTime: timeInput.start,
        endTime: timeInput.end,
      });
      onShiftUpdate?.(updatedShift);
    } catch (error) {
      console.error("Error updating shift time:", error);
    }

    setModalVisible(false);
    setEditingShift(null);
  };

  const handleDeleteShift = async (shift: ShiftItem) => {
    Alert.alert("シフト削除", "このシフトを削除してもよろしいですか？", [
      {
        text: "キャンセル",
        style: "cancel",
      },
      {
        text: "削除する",
        style: "destructive",
        onPress: async () => {
          try {
            const shiftRef = doc(db, "shifts", shift.id);
            await updateDoc(shiftRef, {
              status: "deletion_requested",
            });
            // もし完全に削除する場合はこちら
            // await deleteDoc(shiftRef);
            onShiftUpdate?.({
              ...shift,
              status: "deletion_requested",
            });
          } catch (error) {
            console.error("Error deleting shift:", error);
            Alert.alert("エラー", "シフトの削除に失敗しました");
          }
        },
      },
    ]);
  };

  const handleShiftPress = (shift: ShiftItem) => {
    const statusConfig = getStatusConfig(shift.status);
    if (!statusConfig.canEdit) {
      Alert.alert(
        "編集できません",
        `${statusConfig.label}状態のシフトは編集できません`,
        [{ text: "OK" }]
      );
      return;
    }

    setEditingShift(shift);
    setActionModalVisible(true);
  };

  const handleTimeEditPress = () => {
    if (!editingShift) return;

    setTimeInput({
      start: editingShift.startTime,
      end: editingShift.endTime,
    });

    setActionModalVisible(false);
    setModalVisible(true);
  };

  const handleClassTimePress = () => {
    if (!editingShift) return;

    // 最初の授業時間をセット（存在する場合）
    const firstClass =
      editingShift.classes && editingShift.classes.length > 0
        ? editingShift.classes[0]
        : { startTime: editingShift.startTime, endTime: editingShift.endTime };

    setClassTimeInput({
      start: firstClass.startTime,
      end: firstClass.endTime,
    });

    setActionModalVisible(false);
    setShowClassTimeModal(true);
  };

  const handleClassTimeUpdate = async () => {
    if (!editingShift) return;

    try {
      const shiftRef = doc(db, "shifts", editingShift.id);
      await updateDoc(shiftRef, {
        classes: [
          {
            startTime: classTimeInput.start,
            endTime: classTimeInput.end,
          },
        ],
      });

      onShiftUpdate?.({
        ...editingShift,
        classes: [
          {
            startTime: classTimeInput.start,
            endTime: classTimeInput.end,
          },
        ],
      });
    } catch (error) {
      console.error("Error updating class time:", error);
      Alert.alert("エラー", "授業時間の更新に失敗しました");
    }

    setShowClassTimeModal(false);
    setEditingShift(null);
  };

  // 前月に移動する関数
  const handlePrevMonth = () => {
    setSelectedDate(subMonths(selectedDate, 1));
  };

  // 翌月に移動する関数
  const handleNextMonth = () => {
    setSelectedDate(addMonths(selectedDate, 1));
  };

  // 月初～月末までの日付リストを生成
  const year = selectedDate.getFullYear();
  const month = selectedDate.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const days = Array.from({ length: daysInMonth }, (_, i) => {
    const date = new Date(year, month, i + 1);
    return date.toISOString().split("T")[0];
  });

  // 日付ごとにシフトを抽出
  const rows = days.map((date) => {
    const dayShifts = shifts.filter((s) => s.date === date);
    // シフトの重なりをグループ化
    const groups = groupShiftsByOverlap(dayShifts);
    // 空のグループを除外
    return { date, groups: groups.filter((group) => group.length > 0) };
  });

  // シフトの重なりをグループ化
  function groupShiftsByOverlap(shifts: ShiftItem[]) {
    if (shifts.length === 0) return [];

    const groups: ShiftItem[][] = [];
    shifts
      .sort((a, b) => a.startTime.localeCompare(b.startTime))
      .forEach((shift) => {
        let placed = false;
        for (const group of groups) {
          if (
            !group.some(
              (s) => s.startTime < shift.endTime && shift.startTime < s.endTime
            )
          ) {
            group.push(shift);
            placed = true;
            break;
          }
        }
        if (!placed) groups.push([shift]);
      });
    return groups;
  }

  // 授業時間帯のセル判定
  function isClassTime(time: string) {
    // クラスタイムの設定がある場合はそれを使用
    if (classTimes.length > 0) {
      return classTimes.some((ct) => ct.start <= time && time < ct.end);
    }

    // シフトに登録された授業時間をチェック
    return shifts.some(
      (shift) =>
        shift.classes &&
        shift.classes.some((cls) => cls.startTime <= time && time < cls.endTime)
    );
  }

  // --- ガントチャート本体 ---
  type GanttChartGridProps = {
    shifts: ShiftItem[];
    onShiftPress?: (shift: ShiftItem) => void;
    getStatusConfig: (status: string) => ShiftStatusConfig;
  };

  const GanttChartGrid: React.FC<GanttChartGridProps> = ({
    shifts,
    onShiftPress,
    getStatusConfig,
  }) => (
    <View
      style={[styles.ganttCell, { width: ganttColumnWidth }]}
      ref={ganttContainerRef}
    >
      <View style={styles.ganttBgRow}>
        {halfHourLines.map((t, i) => (
          <View
            key={t}
            style={[
              styles.ganttBgCell,
              isClassTime(t) && styles.classTimeCell,
              {
                width: cellWidth,
                borderRightWidth: i % 2 === 0 ? 0.5 : 1,
              },
            ]}
          />
        ))}
      </View>

      {shifts.map((shift) => {
        const statusConfig = getStatusConfig(shift.status);
        const startPos = timeToPosition(shift.startTime);
        const endPos = timeToPosition(shift.endTime);

        // セルに合わせて開始と終了位置を調整（より厳密に）
        const startCell = Math.floor(startPos * 2);
        const endCell = Math.ceil(endPos * 2);
        const cellSpan = endCell - startCell;

        return (
          <TouchableOpacity
            key={shift.id}
            style={[
              styles.shiftBar,
              {
                left: startCell * cellWidth,
                width: cellSpan * cellWidth,
                backgroundColor: statusConfig.color,
                opacity:
                  shift.status === "deleted" ||
                  shift.status === "deletion_requested"
                    ? 0.5
                    : 1,
                borderColor: statusConfig.color,
              },
            ]}
            onPress={() => onShiftPress?.(shift)}
          >
            <Text style={styles.shiftBarText} numberOfLines={1}>
              {shift.nickname}
            </Text>
            <Text style={styles.shiftTimeText} numberOfLines={1}>
              {shift.startTime}～{shift.endTime}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );

  // --- 情報表示 ---
  type GanttChartInfoProps = {
    shifts: ShiftItem[];
    getStatusConfig: (status: string) => ShiftStatusConfig;
    onShiftPress?: (shift: ShiftItem) => void;
    onDelete: (shift: ShiftItem) => void;
  };

  const GanttChartInfo: React.FC<GanttChartInfoProps> = ({
    shifts,
    getStatusConfig,
    onShiftPress,
    onDelete,
  }) => (
    <View
      style={[
        styles.infoCell,
        {
          width: infoColumnWidth,
          backgroundColor: "#f0f5fb",
          // 右側のパディングを削除
        },
      ]}
    >
      <CustomScrollView
        style={{ flex: 1, width: "100%" }}
        contentContainerStyle={{ paddingVertical: 0 }}
      >
        {shifts.map((shift) => {
          const statusConfig = getStatusConfig(shift.status);
          return (
            <View
              key={shift.id}
              style={[
                styles.infoContent,
                {
                  borderWidth: 0.5,
                  borderColor: statusConfig.color,
                  backgroundColor: statusConfig.canEdit ? "#f8fafd" : "#f3f3f3",
                  width: infoColumnWidth - 4, // スクロールバーのみ考慮
                },
              ]}
            >
              <View style={styles.infoHeader}>
                <Text
                  style={styles.infoText}
                  numberOfLines={1}
                  ellipsizeMode="tail"
                >
                  {shift.nickname}
                </Text>
                {statusConfig.canEdit && (
                  <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={() => onDelete(shift)}
                  >
                    <Ionicons name="trash-outline" size={14} color="#FF4444" />
                  </TouchableOpacity>
                )}
              </View>
              <TouchableOpacity
                style={styles.timeButton}
                onPress={() => onShiftPress?.(shift)}
                disabled={!statusConfig.canEdit}
              >
                <View style={styles.infoTimeContainer}>
                  <Text
                    style={[
                      styles.infoTimeText,
                      !statusConfig.canEdit && styles.infoTimeTextDisabled,
                    ]}
                    numberOfLines={1}
                    ellipsizeMode="tail"
                  >
                    {shift.startTime}～{shift.endTime}
                  </Text>
                  {statusConfig.canEdit && (
                    <Ionicons name="pencil-outline" size={12} color="#4A90E2" />
                  )}
                </View>
              </TouchableOpacity>
              <Text
                style={styles.statusText}
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                {statusConfig.label}
              </Text>
            </View>
          );
        })}
      </CustomScrollView>
    </View>
  );

  // --- 日付表示 ---
  type DateCellProps = {
    date: string;
  };

  const DateCell: React.FC<DateCellProps> = ({ date }) => {
    const formattedDate = new Date(date);
    const dayOfWeek = format(formattedDate, "E", { locale: ja });
    const dayOfMonth = format(formattedDate, "d");

    const isWeekend = dayOfWeek === "土" || dayOfWeek === "日";
    const textColor = isWeekend
      ? dayOfWeek === "土"
        ? "#0000FF"
        : "#FF0000"
      : "#000000";

    return (
      <View style={[styles.dateCell, { width: dateColumnWidth }]}>
        <Text style={[styles.dateDayText, { color: textColor }]}>
          {dayOfMonth}
        </Text>
        <Text style={[styles.dateWeekText, { color: textColor }]}>
          {dayOfWeek}
        </Text>
      </View>
    );
  };

  const renderEditModal = () => {
    if (!editingShift) return null;

    return (
      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>時間を編集</Text>
            <Text style={styles.modalSubtitle}>{editingShift.nickname}</Text>

            <View style={styles.timeInputContainer}>
              <View style={styles.timeInputGroup}>
                <Text style={styles.timeInputLabel}>開始時間</Text>
                <TextInput
                  style={styles.timeInput}
                  value={timeInput.start}
                  onChangeText={(text) =>
                    setTimeInput((prev) => ({ ...prev, start: text }))
                  }
                  placeholder="00:00"
                  keyboardType="numbers-and-punctuation"
                />
              </View>

              <Text style={styles.timeInputSeparator}>～</Text>

              <View style={styles.timeInputGroup}>
                <Text style={styles.timeInputLabel}>終了時間</Text>
                <TextInput
                  style={styles.timeInput}
                  value={timeInput.end}
                  onChangeText={(text) =>
                    setTimeInput((prev) => ({ ...prev, end: text }))
                  }
                  placeholder="00:00"
                  keyboardType="numbers-and-punctuation"
                />
              </View>
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>キャンセル</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton]}
                onPress={handleTimeUpdate}
              >
                <Text style={styles.saveButtonText}>保存</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    );
  };

  // シフトを追加する処理
  const handleAddShift = async () => {
    if (!newShift.userId || !newShift.startTime || !newShift.endTime) {
      Alert.alert("エラー", "必須項目を入力してください");
      return;
    }

    setLoading(true);
    try {
      // 選択されたユーザーのnicknameを取得
      const selectedUser = users.find((user) => user.uid === newShift.userId);

      // Firestoreにシフト追加
      const shiftsRef = collection(db, "shifts");
      await addDoc(shiftsRef, {
        ...newShift,
        nickname: selectedUser?.nickname || "名前なし",
        type: "staff",
        isCompleted: false,
        duration: "", // 一旦空文字で設定
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      Alert.alert("成功", "シフトを追加しました");
      setShowAddShiftModal(false);

      // 追加後に親コンポーネントに通知（必要に応じて）
      if (onShiftUpdate) {
        onShiftUpdate({
          ...newShift,
          id: "temp-id", // 一時的なID、実際には使用されない
          nickname: selectedUser?.nickname || "名前なし",
          type: "staff",
          isCompleted: false,
          duration: "",
          createdAt: new Date(),
          updatedAt: new Date(),
        } as ShiftItem);
      }
    } catch (error) {
      console.error("シフト追加エラー:", error);
      Alert.alert("エラー", "シフトの追加に失敗しました");
    } finally {
      setLoading(false);
    }
  };

  // シフトステータスを変更する処理
  const handleChangeStatus = async (
    shift: ShiftItem,
    newStatus: ShiftStatus
  ) => {
    try {
      const shiftRef = doc(db, "shifts", shift.id);
      await updateDoc(shiftRef, {
        status: newStatus,
        updatedAt: serverTimestamp(),
      });

      Alert.alert(
        "成功",
        `シフトを${getStatusConfig(newStatus).label}に変更しました`
      );

      if (onShiftUpdate) {
        onShiftUpdate({
          ...shift,
          status: newStatus,
        });
      }

      setActionModalVisible(false);
    } catch (error) {
      console.error("シフトステータス変更エラー:", error);
      Alert.alert("エラー", "シフトのステータス変更に失敗しました");
    }
  };

  // 空白セルをクリックした時の処理
  const handleEmptyCellClick = (date: string, position: number) => {
    // クリックした位置に基づいて時間を計算
    const startTime = positionToTime(position);
    // 終了時間は30分後
    const startHour = parseInt(startTime.split(":")[0]);
    const startMinute = parseInt(startTime.split(":")[1]);
    let endHour = startHour;
    let endMinute = startMinute + 30;

    if (endMinute >= 60) {
      endHour += 1;
      endMinute -= 60;
    }

    const endTime = `${endHour.toString().padStart(2, "0")}:${endMinute
      .toString()
      .padStart(2, "0")}`;

    // 新規シフト情報を設定
    setNewShift({
      userId: users.length > 0 ? users[0].uid : "",
      nickname: "",
      date,
      startTime,
      endTime,
      status: "pending",
    });

    setShowAddShiftModal(true);
  };

  // DatePickerModalで日付が選択されたときの処理
  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    setShowYearMonthPicker(false);
  };

  // 空白セルコンポーネント
  const EmptyCell: React.FC<{
    date: string;
    width: number;
    halfHourLines: string[];
    isClassTime: (time: string) => boolean;
  }> = ({ date, width, halfHourLines, isClassTime }) => (
    <View style={[styles.emptyCell, { width }]}>
      <View style={styles.ganttBgRow}>
        {halfHourLines.map((t, i) => (
          <TouchableOpacity
            key={t}
            style={[
              styles.ganttBgCell,
              isClassTime(t) && styles.classTimeCell,
              {
                width: cellWidth,
                borderRightWidth: i % 2 === 0 ? 0.5 : 1,
              },
            ]}
            onPress={() => handleEmptyCellClick(date, i / 2)}
          />
        ))}
      </View>
    </View>
  );

  // 新規シフト追加モーダル
  const renderAddShiftModal = () => (
    <Modal
      visible={showAddShiftModal}
      transparent
      animationType="fade"
      onRequestClose={() => setShowAddShiftModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>新規シフト追加</Text>
          <Text style={styles.modalSubtitle}>{newShift.date}</Text>

          <View style={styles.formGroup}>
            <Text style={styles.formLabel}>スタッフ</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={newShift.userId}
                onValueChange={(itemValue) =>
                  setNewShift({ ...newShift, userId: itemValue.toString() })
                }
                style={styles.picker}
              >
                <Picker.Item label="スタッフを選択" value="" />
                {users.map((user) => (
                  <Picker.Item
                    key={user.uid}
                    label={user.nickname}
                    value={user.uid}
                  />
                ))}
              </Picker>
            </View>
          </View>

          <View style={styles.timeInputContainer}>
            <View style={styles.timeInputGroup}>
              <Text style={styles.timeInputLabel}>開始時間</Text>
              <TextInput
                style={styles.timeInput}
                value={newShift.startTime}
                onChangeText={(text) =>
                  setNewShift((prev) => ({ ...prev, startTime: text }))
                }
                placeholder="00:00"
                keyboardType="numbers-and-punctuation"
              />
            </View>

            <Text style={styles.timeInputSeparator}>～</Text>

            <View style={styles.timeInputGroup}>
              <Text style={styles.timeInputLabel}>終了時間</Text>
              <TextInput
                style={styles.timeInput}
                value={newShift.endTime}
                onChangeText={(text) =>
                  setNewShift((prev) => ({ ...prev, endTime: text }))
                }
                placeholder="00:00"
                keyboardType="numbers-and-punctuation"
              />
            </View>
          </View>

          <View style={styles.modalButtons}>
            <TouchableOpacity
              style={[styles.modalButton, styles.cancelButton]}
              onPress={() => setShowAddShiftModal(false)}
            >
              <Text style={styles.cancelButtonText}>キャンセル</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.modalButton, styles.saveButton]}
              onPress={handleAddShift}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.saveButtonText}>追加</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  // シフトステータス変更部分を追加
  const renderActionModal = () => {
    if (!editingShift) return null;

    const statusConfig = getStatusConfig(editingShift.status);

    return (
      <Modal
        visible={actionModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setActionModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>シフト操作</Text>
            <Text style={styles.modalSubtitle}>{editingShift.nickname}</Text>
            <Text style={[styles.statusLabel, { color: statusConfig.color }]}>
              現在のステータス: {statusConfig.label}
            </Text>

            <View style={styles.actionButtons}>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={handleTimeEditPress}
              >
                <Ionicons name="time-outline" size={24} color="#4A90E2" />
                <Text style={styles.actionText}>時間変更</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.actionButton}
                onPress={handleClassTimePress}
              >
                <Ionicons name="school-outline" size={24} color="#50C878" />
                <Text style={styles.actionText}>授業時間</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => {
                  setActionModalVisible(false);
                  handleDeleteShift(editingShift);
                }}
              >
                <Ionicons name="trash-outline" size={24} color="#FF4444" />
                <Text style={styles.actionText}>削除</Text>
              </TouchableOpacity>
            </View>

            {/* ステータス変更ボタン */}
            <View style={styles.statusButtons}>
              <Text style={styles.statusSectionTitle}>ステータス変更：</Text>
              <View style={styles.statusButtonsRow}>
                {statusConfigs.map(
                  (config) =>
                    config.status !== editingShift.status && (
                      <TouchableOpacity
                        key={config.status}
                        style={[
                          styles.statusButton,
                          { backgroundColor: config.color },
                        ]}
                        onPress={() =>
                          handleChangeStatus(editingShift, config.status)
                        }
                      >
                        <Text style={styles.statusButtonText}>
                          {config.label}
                        </Text>
                      </TouchableOpacity>
                    )
                )}
              </View>
            </View>

            <TouchableOpacity
              style={[
                styles.modalButton,
                styles.cancelButton,
                { marginTop: 12 },
              ]}
              onPress={() => setActionModalVisible(false)}
            >
              <Text style={styles.cancelButtonText}>キャンセル</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    );
  };

  const renderClassTimeModal = () => {
    if (!editingShift) return null;

    return (
      <Modal
        visible={showClassTimeModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowClassTimeModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>授業時間を設定</Text>
            <Text style={styles.modalSubtitle}>{editingShift.nickname}</Text>

            <View style={styles.timeInputContainer}>
              <View style={styles.timeInputGroup}>
                <Text style={styles.timeInputLabel}>開始時間</Text>
                <TextInput
                  style={styles.timeInput}
                  value={classTimeInput.start}
                  onChangeText={(text) =>
                    setClassTimeInput((prev) => ({ ...prev, start: text }))
                  }
                  placeholder="00:00"
                  keyboardType="numbers-and-punctuation"
                />
              </View>

              <Text style={styles.timeInputSeparator}>～</Text>

              <View style={styles.timeInputGroup}>
                <Text style={styles.timeInputLabel}>終了時間</Text>
                <TextInput
                  style={styles.timeInput}
                  value={classTimeInput.end}
                  onChangeText={(text) =>
                    setClassTimeInput((prev) => ({ ...prev, end: text }))
                  }
                  placeholder="00:00"
                  keyboardType="numbers-and-punctuation"
                />
              </View>
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowClassTimeModal(false)}
              >
                <Text style={styles.cancelButtonText}>キャンセル</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton]}
                onPress={handleClassTimeUpdate}
              >
                <Text style={styles.saveButtonText}>保存</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    );
  };

  return (
    <View style={styles.container}>
      {/* 月選択 - 時間行の前に移動 */}
      <View style={styles.monthSelector}>
        <View style={styles.monthNavigator}>
          <TouchableOpacity
            style={styles.monthNavButton}
            onPress={handlePrevMonth}
          >
            <Text style={styles.monthNavButtonText}>＜</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.monthButton}
            onPress={() => {
              setShowYearMonthPicker(true);
            }}
          >
            <Text style={styles.monthText}>
              {format(selectedDate, "yyyy年M月")}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.monthNavButton}
            onPress={handleNextMonth}
          >
            <Text style={styles.monthNavButtonText}>＞</Text>
          </TouchableOpacity>
        </View>

        {/* DatePickerModalを使用した年月選択 */}
        <DatePickerModal
          isVisible={showYearMonthPicker}
          initialDate={selectedDate}
          onClose={() => setShowYearMonthPicker(false)}
          onSelect={handleDateSelect}
        />

        {showDatePicker && (
          <DateTimePicker
            value={selectedDate}
            mode="date"
            display="spinner"
            onChange={(event, date) => {
              setShowDatePicker(false);
              if (date) setSelectedDate(date);
            }}
          />
        )}
      </View>

      {/* ヘッダー - 月選択の後に移動 */}
      <View style={styles.headerRow}>
        <View style={[styles.headerDateCell, { width: dateColumnWidth }]}>
          {/* 「日付」ラベル削除 */}
        </View>
        <View style={[styles.headerGanttCell, { width: ganttColumnWidth }]}>
          {hourLabels.map((t, i) => {
            const isLast = i === hourLabels.length - 1;
            return (
              <View
                key={t}
                style={{
                  position: "absolute",
                  left: i * cellWidth * 2 - 44 - (isLast ? -1.7 : 0),
                  width: cellWidth * 2,
                }}
              >
                <Text style={styles.timeLabel}>{t}</Text>
              </View>
            );
          })}
        </View>
        <View style={[styles.headerInfoCell, { width: infoColumnWidth }]}>
          <Text style={styles.headerText}>情報</Text>
        </View>
      </View>

      {/* 本体 */}
      <CustomScrollView style={styles.content}>
        {rows.map((row) => (
          <View key={row.date} style={styles.dateSection}>
            {/* 日付エリア */}
            {row.groups.length > 0 ? (
              row.groups.map((group, idx) => (
                <View key={`${row.date}-${idx}`} style={styles.shiftRow}>
                  {idx === 0 ? (
                    <DateCell date={row.date} />
                  ) : (
                    <View
                      style={[styles.emptyCellDate, { width: dateColumnWidth }]}
                    />
                  )}
                  <GanttChartGrid
                    shifts={group}
                    onShiftPress={handleShiftPress}
                    getStatusConfig={getStatusConfig}
                  />
                  <GanttChartInfo
                    shifts={group}
                    getStatusConfig={getStatusConfig}
                    onShiftPress={handleShiftPress}
                    onDelete={handleDeleteShift}
                  />
                </View>
              ))
            ) : (
              // シフトがない日の表示 - グリッド線を表示
              <View style={styles.shiftRow}>
                <DateCell date={row.date} />
                <EmptyCell
                  date={row.date}
                  width={ganttColumnWidth}
                  halfHourLines={halfHourLines}
                  isClassTime={isClassTime}
                />
                <View
                  style={[styles.emptyInfoCell, { width: infoColumnWidth }]}
                />
              </View>
            )}
          </View>
        ))}
      </CustomScrollView>

      {renderEditModal()}
      {renderAddShiftModal()}
      {renderActionModal()}
      {renderClassTimeModal()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  headerRow: {
    flexDirection: "row",
    backgroundColor: "#f0f0f0",
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
    elevation: 2,
    zIndex: 10,
    height: 40,
  },
  headerDateCell: {
    padding: 8,
    justifyContent: "center",
    alignItems: "center",
    borderRightWidth: 1,
    borderRightColor: "#ddd",
  },
  headerGanttCell: {
    flexDirection: "row",
    position: "relative",
    borderRightWidth: 1,
    borderRightColor: "#ddd",
    height: 40,
  },
  headerInfoCell: {
    padding: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  headerText: {
    fontWeight: "bold",
    fontSize: 14,
  },
  timeLabel: {
    fontSize: 13,
    textAlign: "center",
    fontWeight: "bold",
    color: "#333",
    paddingTop: 12,
  },
  monthSelector: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    padding: 10,
    backgroundColor: "#f9f9f9",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  monthNavigator: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  monthNavButton: {
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  monthNavButtonText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#4A90E2",
  },
  monthButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
  },
  monthText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  content: {
    flex: 1,
  },
  dateSection: {
    marginBottom: 1,
  },
  shiftRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    minHeight: 60,
    height: 60,
  },
  dateCell: {
    padding: 6,
    justifyContent: "center",
    alignItems: "center",
    borderRightWidth: 1,
    borderRightColor: "#ddd",
    backgroundColor: "#f9f9f9",
  },
  dateDayText: {
    fontSize: 18,
    fontWeight: "bold",
  },
  dateWeekText: {
    fontSize: 12,
  },
  emptyCellDate: {
    borderRightWidth: 1,
    borderRightColor: "#ddd",
    backgroundColor: "#f9f9f9",
  },
  emptyCell: {
    height: 60,
    borderRightWidth: 1,
    borderRightColor: "#ddd",
    position: "relative", // グリッド線表示のため追加
  },
  emptyInfoCell: {
    height: 60,
    backgroundColor: "#f9f9f9", // 背景色を追加
  },
  ganttCell: {
    position: "relative",
    height: 60,
    borderRightWidth: 1,
    borderRightColor: "#ddd",
    overflow: "hidden",
  },
  ganttBgRow: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
  },
  ganttBgCell: {
    height: "100%",
    borderRightColor: "#e0e0e0",
  },
  classTimeCell: {
    backgroundColor: "rgba(180, 180, 180, 0.3)",
  },
  shiftBar: {
    position: "absolute",
    height: 50,
    top: 5,
    borderRadius: 3,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 2,
    elevation: 2,
    borderWidth: 1,
  },
  shiftBarText: {
    color: "#000",
    fontSize: 14,
    fontWeight: "bold",
    textAlign: "center",
  },
  shiftTimeText: {
    color: "#000",
    fontSize: 12,
    textAlign: "center",
  },
  infoCell: {
    padding: 0,
    justifyContent: "flex-start",
    height: 60,
    overflow: "hidden",
    backgroundColor: "#f9f9f9", // MonthViewと同じ背景色に変更
  },
  infoContent: {
    marginBottom: 0,
    padding: 3,
    borderRadius: 3,
    marginHorizontal: 0,
    marginTop: 1,
  },
  infoHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 1,
  },
  infoText: {
    fontSize: 12,
    fontWeight: "bold",
    flex: 1,
  },
  infoTimeContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 0,
  },
  infoTimeText: {
    fontSize: 11,
    color: "#333",
  },
  infoTimeTextDisabled: {
    color: "#999",
  },
  statusText: {
    fontSize: 9,
    fontWeight: "500",
    color: "#555",
  },
  timeButton: {
    paddingVertical: 0,
  },
  deleteButton: {
    padding: 0,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#fff",
    width: 280,
    borderRadius: 10,
    padding: 16,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 4,
    textAlign: "center",
  },
  modalSubtitle: {
    fontSize: 12,
    color: "#666",
    marginBottom: 14,
    textAlign: "center",
  },
  timeInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  timeInputGroup: {
    flex: 1,
  },
  timeInputLabel: {
    fontSize: 12,
    color: "#666",
    marginBottom: 4,
  },
  timeInput: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 5,
    padding: 6,
    fontSize: 14,
  },
  timeInputSeparator: {
    marginHorizontal: 8,
    fontSize: 16,
    color: "#666",
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  modalButton: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 5,
    alignItems: "center",
  },
  cancelButton: {
    marginRight: 8,
    backgroundColor: "#f0f0f0",
  },
  saveButton: {
    backgroundColor: "#4A90E2",
  },
  cancelButtonText: {
    color: "#666",
    fontWeight: "bold",
  },
  saveButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  actionButtons: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginVertical: 8,
  },
  actionButton: {
    alignItems: "center",
    padding: 8,
    borderRadius: 8,
    width: 70,
  },
  actionText: {
    fontSize: 12,
    marginTop: 4,
    color: "#333",
    textAlign: "center",
  },
  formGroup: {
    marginBottom: 12,
  },
  formLabel: {
    fontSize: 12,
    color: "#666",
    marginBottom: 4,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 5,
    marginBottom: 8,
  },
  picker: {
    height: 40,
  },
  statusLabel: {
    fontSize: 14,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 10,
  },
  statusSectionTitle: {
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 5,
  },
  statusButtons: {
    marginTop: 12,
  },
  statusButtonsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
  },
  statusButton: {
    padding: 5,
    borderRadius: 4,
    margin: 2,
    minWidth: 60,
  },
  statusButtonText: {
    color: "#fff",
    textAlign: "center",
    fontSize: 12,
    fontWeight: "bold",
  },
});
