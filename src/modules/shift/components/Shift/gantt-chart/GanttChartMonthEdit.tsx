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
} from "@/modules/shift/types/shift";
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
import { db } from "@/services/firebase/firebase";
import DateTimePicker from "@react-native-community/datetimepicker";
import { format, addMonths, subMonths } from "date-fns";
import { ja } from "date-fns/locale";
import { Ionicons } from "@expo/vector-icons";
import CustomScrollView from "@/common/common-ui/ui-scroll/ScrollViewComponent";
import { DatePickerModal } from "@/modules/calendar/components/calendar/DatePickerModal";
import { Picker } from "@react-native-picker/picker";
import { useAuth } from "@/services/auth/useAuth";

// インポートしたユーティリティ関数
import {
  hourLabels,
  halfHourLines,
  timeToPosition,
  positionToTime,
} from "./utils/time-utils";

// ユーティリティ関数（すでに別ファイルに移動済みだが、エラー解消のために残しておく）
function generateTimeOptions() {
  const options = [];
  for (let hour = 9; hour <= 22; hour++) {
    options.push(`${hour.toString().padStart(2, "0")}:00`);
    options.push(`${hour.toString().padStart(2, "0")}:30`);
  }
  return options;
}

interface GanttChartMonthEditProps {
  shifts: ShiftItem[];
  onShiftPress?: (shift: ShiftItem) => void;
  onShiftUpdate?: (shift: ShiftItem) => void;
  onMonthChange?: (year: number, month: number) => void;
  classTimes?: { start: string; end: string }[];
}

export const GanttChartMonthEdit: React.FC<GanttChartMonthEditProps> = ({
  shifts,
  onShiftPress,
  onShiftUpdate,
  onMonthChange,
  classTimes = [],
}) => {
  const [statusConfigs, setStatusConfigs] = useState<ShiftStatusConfig[]>(
    DEFAULT_SHIFT_STATUS_CONFIG
  );
  const [editingShift, setEditingShift] = useState<ShiftItem | null>(null);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showYearMonthPicker, setShowYearMonthPicker] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [actionModalVisible, setActionModalVisible] = useState(false);
  const [timeInput, setTimeInput] = useState({ start: "", end: "" });
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
  const { role } = useAuth(); // ユーザーロールを取得
  const isMaster = role === "master"; // マスター権限かどうかを判定
  const [refreshKey, setRefreshKey] = useState(0); // 再描画用のキー

  // 画面をリフレッシュする関数
  const refreshScreen = () => {
    setRefreshKey((prevKey) => prevKey + 1); // 再描画をトリガー
  };

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

    // ピッカーからの選択なので、バリデーションは不要

    const updatedShift = {
      ...editingShift,
      startTime: timeInput.start,
      endTime: timeInput.end,
    };

    try {
      const shiftRef = doc(db, "shifts", editingShift.id);

      if (isMaster) {
        // マスター権限の場合はすぐに反映
        await updateDoc(shiftRef, {
          startTime: timeInput.start,
          endTime: timeInput.end,
          status: "approved", // 承認済みに変更
          updatedAt: serverTimestamp(),
        });

        Alert.alert("成功", "シフト時間を更新しました");
      } else {
        // マスター以外は申請として保存
        await updateDoc(shiftRef, {
          status: "pending", // 申請中に変更
          requestedChanges: {
            startTime: timeInput.start,
            endTime: timeInput.end,
            requestedAt: serverTimestamp(),
          },
          updatedAt: serverTimestamp(),
        });

        Alert.alert("申請完了", "シフト時間変更の申請を送信しました");
      }
      onShiftUpdate?.(updatedShift);
      refreshScreen(); // 画面をリフレッシュ
    } catch (error) {
      console.error("Error updating shift time:", error);
      Alert.alert("エラー", "シフト時間の更新に失敗しました");
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
            if (isMaster) {
              // マスター権限の場合は物理的に削除
              await deleteDoc(shiftRef);

              Alert.alert("成功", "シフトを完全に削除しました");
              onShiftUpdate?.({
                ...shift,
                status: "deleted",
              });
              refreshScreen(); // 画面をリフレッシュ
            } else {
              // マスター以外は削除申請
              await updateDoc(shiftRef, {
                status: "deletion_requested", // 削除申請中に変更
                updatedAt: serverTimestamp(),
              });

              Alert.alert("申請完了", "シフト削除の申請を送信しました");

              onShiftUpdate?.({
                ...shift,
                status: "deletion_requested",
              });
              refreshScreen(); // 画面をリフレッシュ
            }
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
    // マスター権限を持つ場合は承認済みでも編集可能
    // 講師ユーザーも承認済みシフトを編集申請できるように
    const canEdit = statusConfig.canEdit || shift.status === "approved";

    if (!canEdit) {
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
      const newClasses = [
        {
          startTime: classTimeInput.start,
          endTime: classTimeInput.end,
        },
      ];

      if (isMaster) {
        // マスター権限の場合はすぐに反映
        await updateDoc(shiftRef, {
          classes: newClasses,
          status: "approved", // 承認済みに変更
          updatedAt: serverTimestamp(),
        });

        Alert.alert("成功", "授業時間を更新しました");
      } else {
        // マスター以外は申請として保存
        await updateDoc(shiftRef, {
          status: "pending", // 申請中に変更
          requestedChanges: {
            classes: newClasses,
            requestedAt: serverTimestamp(),
          },
          updatedAt: serverTimestamp(),
        });

        Alert.alert("申請完了", "授業時間変更の申請を送信しました");
      }
      onShiftUpdate?.({
        ...editingShift,
        classes: newClasses,
      });
      refreshScreen(); // 画面をリフレッシュ
    } catch (error) {
      console.error("Error updating class time:", error);
      Alert.alert("エラー", "授業時間の更新に失敗しました");
    }

    setShowClassTimeModal(false);
    setEditingShift(null);
  }; // 空白セルをクリックした時の処理
  const handleEmptyCellClick = (date: string, position: number) => {
    // クリックした位置に基づいて時間を計算
    const startTime = positionToTime(position);
    // 終了時間は1時間後をデフォルトにする
    const startHour = parseInt(startTime.split(":")[0]);
    const startMinute = parseInt(startTime.split(":")[1]);
    let endHour = startHour + 1;
    let endMinute = startMinute;

    if (endHour > 22) {
      endHour = 22;
      endMinute = 0;
    }

    const endTime = `${endHour.toString().padStart(2, "0")}:${endMinute
      .toString()
      .padStart(2, "0")}`;

    // 新規シフト情報を設定
    setNewShift({
      userId: users.length > 0 ? users[0].uid : "",
      nickname: "",
      date,
      startTime: startTime,
      endTime: endTime,
      status: "pending",
    });

    setShowAddShiftModal(true);
  };

  // 前月に移動する関数
  const handlePrevMonth = () => {
    const newDate = subMonths(selectedDate, 1);
    setSelectedDate(newDate);

    // 親コンポーネントに月の変更を通知
    if (onMonthChange) {
      onMonthChange(newDate.getFullYear(), newDate.getMonth());
    }
  };

  // 翌月に移動する関数
  const handleNextMonth = () => {
    const newDate = addMonths(selectedDate, 1);
    setSelectedDate(newDate);

    // 親コンポーネントに月の変更を通知
    if (onMonthChange) {
      onMonthChange(newDate.getFullYear(), newDate.getMonth());
    }
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
  }); // シフトの重なりをグループ化
  function groupShiftsByOverlap(shifts: ShiftItem[]) {
    if (shifts.length === 0) return [];

    // 1人1行表示のために、各シフトを別々のグループとして返す
    return shifts
      .sort((a, b) => a.startTime.localeCompare(b.startTime))
      .map((shift) => [shift]);
  }
  // 授業時間帯のセル判定
  function isClassTime(time: string) {
    // 授業時間の表示を無効化（灰色の縦線を表示しない）
    return false;
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
      style={[
        styles.ganttCell,
        {
          width: ganttColumnWidth,
          height: "100%", // 親コンテナの高さに合わせる
        },
      ]}
      ref={ganttContainerRef}
    >
      {/* クリック可能な背景レイヤー */}
      <TouchableOpacity
        style={[StyleSheet.absoluteFill, { zIndex: 1 }]}
        onPress={() => {
          // シフトの日付情報を取得
          const date = shifts.length > 0 ? shifts[0].date : "";
          if (date) handleEmptyCellClick(date, 0);
        }}
        activeOpacity={0.7}
      />

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

      {shifts.map((shift, index) => {
        const statusConfig = getStatusConfig(shift.status);
        const startPos = timeToPosition(shift.startTime);
        const endPos = timeToPosition(shift.endTime);

        // セルに合わせて開始と終了位置を調整
        // 厳密に開始時間に合わせる
        const startCell = Math.floor(startPos * 2);
        // 終了時間は必ず次のセルまでとする
        const endCell = Math.ceil(endPos * 2); // 最低幅を確保（少なくとも2セル分）
        const cellSpan = Math.max(endCell - startCell, 2); // ガントチャートの高さを均等に分割

        // シフトが1つだけの場合はセル全体を埋める、複数ある場合は分割表示
        const totalShifts = shifts.length;
        const cellHeight = 65; // セルの高さ

        let singleBarHeight;
        let barVerticalOffset;

        if (totalShifts === 1) {
          // シフトが1つの場合、セル全体を埋める
          singleBarHeight = cellHeight;
          barVerticalOffset = 0;
        } else {
          // 複数シフトがある場合は分割表示（最大3つ想定）
          singleBarHeight = Math.floor(cellHeight / Math.min(totalShifts, 3));
          barVerticalOffset = index * singleBarHeight;
        }

        return (
          <TouchableOpacity
            key={shift.id}
            style={[
              styles.shiftBar,
              {
                left: startCell * cellWidth,
                width: cellSpan * cellWidth,
                height: singleBarHeight,
                top: barVerticalOffset,
                backgroundColor: statusConfig.color,
                opacity:
                  shift.status === "deleted" ||
                  shift.status === "deletion_requested"
                    ? 0.5
                    : 1,
              },
            ]}
            onPress={() => onShiftPress?.(shift)}
          >
            {" "}
            <View
              style={{
                width: "100%",
                height: "100%",
                justifyContent: "center", // 中央揃え
                alignItems: "center",
                paddingHorizontal: 4, // パディングを調整
                flexDirection: "column", // 縦並びに変更
              }}
            >
              <Text style={styles.shiftBarText} numberOfLines={1}>
                {shift.nickname}
              </Text>
              <Text style={styles.shiftTimeText} numberOfLines={1}>
                {shift.startTime}～{shift.endTime}
              </Text>
            </View>
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
  }) => {
    // マスター権限を持つ場合の追加チェック
    // 講師ユーザーも承認済みシフトを編集申請できるように
    const canEditStatus = (status: string) => {
      const statusConfig = getStatusConfig(status);
      return statusConfig.canEdit || status === "approved";
    };

    return (
      <View
        style={[
          styles.infoCell,
          {
            width: infoColumnWidth,
            backgroundColor: "#f0f5fb",
            height: "100%", // 親コンテナの高さに合わせる
          },
        ]}
      >
        <CustomScrollView
          style={{ flex: 1, width: "100%" }}
          contentContainerStyle={{ paddingVertical: 0 }}
        >
          {shifts.map((shift) => {
            const statusConfig = getStatusConfig(shift.status);
            const isEditable = canEditStatus(shift.status);
            return (
              <View
                key={shift.id}
                style={[
                  styles.infoContent,
                  {
                    borderWidth: 0.5,
                    borderColor: statusConfig.color,
                    backgroundColor: isEditable ? "#f8fafd" : "#f3f3f3",
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
                  {isEditable && (
                    <TouchableOpacity
                      style={styles.deleteButton}
                      onPress={() => onDelete(shift)}
                    >
                      <Ionicons
                        name="trash-outline"
                        size={14}
                        color="#FF4444"
                      />
                    </TouchableOpacity>
                  )}
                </View>
                <TouchableOpacity
                  style={styles.timeButton}
                  onPress={() => onShiftPress?.(shift)}
                  disabled={!isEditable}
                >
                  <View style={styles.infoTimeContainer}>
                    <Text
                      style={[
                        styles.infoTimeText,
                        !isEditable && styles.infoTimeTextDisabled,
                      ]}
                      numberOfLines={1}
                      ellipsizeMode="tail"
                    >
                      {shift.startTime}～{shift.endTime}
                    </Text>
                    {isEditable && (
                      <Ionicons
                        name="pencil-outline"
                        size={12}
                        color="#4A90E2"
                      />
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
          })}{" "}
        </CustomScrollView>
      </View>
    );
  };

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
            <Text style={styles.modalSubtitle}>
              {editingShift.nickname}
            </Text>{" "}
            <View style={styles.timeInputContainer}>
              <View style={styles.timeInputGroup}>
                <Text style={styles.timeInputLabel}>開始時間</Text>
                <View style={styles.pickerContainer}>
                  <Picker
                    selectedValue={timeInput.start}
                    onValueChange={(itemValue) =>
                      setTimeInput((prev) => ({ ...prev, start: itemValue }))
                    }
                    style={styles.picker}
                  >
                    {generateTimeOptions().map((time) => (
                      <Picker.Item key={time} label={time} value={time} />
                    ))}
                  </Picker>
                </View>
              </View>

              <Text style={styles.timeInputSeparator}>～</Text>

              <View style={styles.timeInputGroup}>
                <Text style={styles.timeInputLabel}>終了時間</Text>
                <View style={styles.pickerContainer}>
                  <Picker
                    selectedValue={timeInput.end}
                    onValueChange={(itemValue) =>
                      setTimeInput((prev) => ({ ...prev, end: itemValue }))
                    }
                    style={styles.picker}
                  >
                    {generateTimeOptions().map((time) => (
                      <Picker.Item key={time} label={time} value={time} />
                    ))}
                  </Picker>
                </View>
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
        type: "user",
          isCompleted: false,
          duration: "",
          createdAt: new Date(),
          updatedAt: new Date(),
        } as ShiftItem);
      }

      refreshScreen(); // 画面をリフレッシュ
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
        onShiftUpdate({ ...shift, status: newStatus });
      }

      refreshScreen(); // 画面をリフレッシュ
      setActionModalVisible(false);
    } catch (error) {
      console.error("シフトステータス変更エラー:", error);
      Alert.alert("エラー", "シフトのステータス変更に失敗しました");
    }
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
      {/* 背景全体をクリック可能にする */}
      <TouchableOpacity
        style={[StyleSheet.absoluteFill, { zIndex: 1 }]}
        onPress={() => handleEmptyCellClick(date, 0)} // デフォルトは9:00から
        activeOpacity={0.7}
      />
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
          </View>{" "}
          <View style={styles.timeInputContainer}>
            <View style={styles.timeInputGroup}>
              <Text style={styles.timeInputLabel}>開始時間</Text>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={newShift.startTime}
                  onValueChange={(itemValue) =>
                    setNewShift((prev) => ({ ...prev, startTime: itemValue }))
                  }
                  style={styles.picker}
                >
                  {generateTimeOptions().map((time) => (
                    <Picker.Item key={time} label={time} value={time} />
                  ))}
                </Picker>
              </View>
            </View>

            <Text style={styles.timeInputSeparator}>～</Text>

            <View style={styles.timeInputGroup}>
              <Text style={styles.timeInputLabel}>終了時間</Text>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={newShift.endTime}
                  onValueChange={(itemValue) =>
                    setNewShift((prev) => ({ ...prev, endTime: itemValue }))
                  }
                  style={styles.picker}
                >
                  {generateTimeOptions().map((time) => (
                    <Picker.Item key={time} label={time} value={time} />
                  ))}
                </Picker>
              </View>
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
            <Text style={styles.modalSubtitle}>
              {editingShift.nickname}
            </Text>{" "}
            <View style={styles.timeInputContainer}>
              <View style={styles.timeInputGroup}>
                <Text style={styles.timeInputLabel}>開始時間</Text>
                <View style={styles.pickerContainer}>
                  <Picker
                    selectedValue={classTimeInput.start}
                    onValueChange={(itemValue) =>
                      setClassTimeInput((prev) => ({
                        ...prev,
                        start: itemValue,
                      }))
                    }
                    style={styles.picker}
                  >
                    {generateTimeOptions().map((time) => (
                      <Picker.Item key={time} label={time} value={time} />
                    ))}
                  </Picker>
                </View>
              </View>

              <Text style={styles.timeInputSeparator}>～</Text>

              <View style={styles.timeInputGroup}>
                <Text style={styles.timeInputLabel}>終了時間</Text>
                <View style={styles.pickerContainer}>
                  <Picker
                    selectedValue={classTimeInput.end}
                    onValueChange={(itemValue) =>
                      setClassTimeInput((prev) => ({ ...prev, end: itemValue }))
                    }
                    style={styles.picker}
                  >
                    {generateTimeOptions().map((time) => (
                      <Picker.Item key={time} label={time} value={time} />
                    ))}
                  </Picker>
                </View>
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
    <View style={styles.container} key={refreshKey}>
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
                <View
                  key={`${row.date}-${idx}`}
                  style={[
                    styles.shiftRow,
                    {
                      // シフトの数に応じて高さを調整
                      height: Math.max(65, group.length * 20 + 20),
                      minHeight: Math.max(65, group.length * 20 + 20),
                    },
                  ]}
                >
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
    minHeight: 65, // 高さを調整
    height: 65, // 高さを調整
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
    height: 65, // 高さを調整
    borderRightWidth: 1,
    borderRightColor: "#ddd",
    position: "relative", // グリッド線表示のため追加
  },
  emptyInfoCell: {
    height: 65, // 高さを調整
    backgroundColor: "#f9f9f9", // 背景色を追加
  },
  ganttCell: {
    position: "relative",
    height: 65, // 高さを調整
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
    backgroundColor: "rgba(180, 180, 180, 0.15)", // 透明度を下げて目立たなくする
  },
  shiftBar: {
    position: "absolute",
    // 高さはコード内で動的に設定する（shifts.lengthに応じて）
    borderRadius: 0, // 角を丸めない
    justifyContent: "center",
    alignItems: "flex-start", // 左寄せ
    paddingHorizontal: 0, // パディングをなくす
    paddingVertical: 0, // パディングをなくす
    elevation: 3,
    borderWidth: 0, // 枠線を消す
  },
  shiftBarText: {
    color: "#000", // 黒色テキストに変更
    fontSize: 14, // フォントサイズを調整
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 2, // 下に少しマージンを追加
  },
  shiftTimeText: {
    color: "#000", // 黒色テキストに変更
    fontSize: 12, // 時間表示のフォントサイズを調整
    fontWeight: "500", // やや太く
    textAlign: "center",
    textShadowColor: "rgba(0, 0, 0, 0.5)", // テキストシャドウを追加
    textShadowOffset: { width: 0.5, height: 0.5 },
    textShadowRadius: 1,
  },
  infoCell: {
    padding: 0,
    justifyContent: "flex-start",
    height: 65, // 高さを調整
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
