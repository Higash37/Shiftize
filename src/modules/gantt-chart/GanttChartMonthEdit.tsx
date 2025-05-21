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
  Shift,
  ShiftItem,
  ShiftStatus,
  ClassTimeSlot,
  TimeSlot,
  ShiftType,
} from "@/common/common-models/ModelIndex";
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
import { DatePickerModal } from "@/modules/calendar/calendar-components/calendar-modal/DatePickerModal";
import { Picker } from "@react-native-picker/picker";
import { useAuth } from "@/services/auth/useAuth";
import styles from "./gantt-chart-styles/GanttChartMonthEdit.styles";
import { GanttChartMonthEditProps } from "./gantt-chart-types/GanttChartProps";
import { ShiftStatusConfig } from "./gantt-chart-types/GanttChartTypes";
import {
  generateTimeOptions,
  groupShiftsByOverlap,
} from "./gantt-chart-common/utils";
import {
  DateCell,
  GanttChartGrid,
  GanttChartInfo,
  EmptyCell,
} from "./gantt-chart-common/components";
import { AddShiftModal } from "./edit-modals/AddShiftModal";
import { ActionModal } from "./edit-modals/ActionModal";
import { ClassTimeModal } from "./edit-modals/ClassTimeModal";
import { EditModal } from "./edit-modals/EditModal";
import { GanttChartEditRow } from "./GanttChartMonthEdit/GanttChartEditRow";

// シフトステータスの設定
const DEFAULT_SHIFT_STATUS_CONFIG = [
  {
    status: "pending" as ShiftStatus,
    label: "申請中",
    color: "#FFA500",
    canEdit: true,
  },
  {
    status: "approved" as ShiftStatus,
    label: "承認済み",
    color: "#4CAF50",
    canEdit: true,
  },
  {
    status: "rejected" as ShiftStatus,
    label: "却下",
    color: "#FF4444",
    canEdit: true,
  },
  {
    status: "deleted" as ShiftStatus,
    label: "削除済み",
    color: "#999999",
    canEdit: false,
  },
  {
    status: "deletion_requested" as ShiftStatus,
    label: "削除申請中",
    color: "#FF9800",
    canEdit: false,
  },
];

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
  onMonthChange,
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
  // 授業時間帯のセル判定
  function isClassTime(time: string) {
    // 授業時間の表示を無効化（灰色の縦線を表示しない）
    return false;
  }

  // --- シフトステータス変更部分を追加 ---

  // --- 年月選択 ---
  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    setShowYearMonthPicker(false);
    if (onMonthChange) {
      onMonthChange(date.getFullYear(), date.getMonth());
    }
  };

  // --- 新規シフト追加 ---
  const handleAddShift = async () => {
    if (!newShift.userId || !newShift.startTime || !newShift.endTime) {
      Alert.alert("エラー", "必須項目を入力してください");
      return;
    }
    setLoading(true);
    try {
      await addDoc(collection(db, "shifts"), {
        ...newShift,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      setShowAddShiftModal(false);
      setNewShift({
        userId: "",
        nickname: "",
        date: "",
        startTime: "",
        endTime: "",
        status: "pending",
      });
      refreshScreen();
    } catch (error) {
      Alert.alert("エラー", "シフトの追加に失敗しました");
    } finally {
      setLoading(false);
    }
  };

  // --- ステータス変更 ---
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
      onShiftUpdate?.({ ...shift, status: newStatus });
      refreshScreen();
      setActionModalVisible(false);
    } catch (error) {
      Alert.alert("エラー", "ステータス変更に失敗しました");
    }
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
          <GanttChartEditRow
            key={row.date}
            row={row}
            dateColumnWidth={dateColumnWidth}
            ganttColumnWidth={ganttColumnWidth}
            infoColumnWidth={infoColumnWidth}
            cellWidth={cellWidth}
            halfHourLines={halfHourLines}
            isClassTime={isClassTime}
            getStatusConfig={getStatusConfig}
            handleShiftPress={handleShiftPress}
            handleDeleteShift={handleDeleteShift}
            styles={styles}
            handleEmptyCellClick={handleEmptyCellClick}
          />
        ))}
      </CustomScrollView>

      <ClassTimeModal
        visible={showClassTimeModal}
        editingShift={editingShift}
        classTimeInput={classTimeInput}
        onChange={(field, value) =>
          setClassTimeInput((prev) => ({ ...prev, [field]: value }))
        }
        onClose={() => setShowClassTimeModal(false)}
        onSave={handleClassTimeUpdate}
      />
      <EditModal
        visible={modalVisible}
        editingShift={editingShift}
        timeInput={timeInput}
        onChange={(field, value) =>
          setTimeInput((prev) => ({ ...prev, [field]: value }))
        }
        onClose={() => setModalVisible(false)}
        onSave={handleTimeUpdate}
      />
      <ActionModal
        visible={actionModalVisible}
        editingShift={editingShift}
        statusConfigs={statusConfigs}
        getStatusConfig={getStatusConfig}
        onTimeEdit={handleTimeEditPress}
        onClassTime={handleClassTimePress}
        onDelete={() => {
          if (editingShift) handleDeleteShift(editingShift);
          setActionModalVisible(false);
        }}
        onChangeStatus={(status) => {
          if (editingShift)
            handleChangeStatus(editingShift, status as ShiftStatus);
        }}
        onClose={() => setActionModalVisible(false)}
      />
    </View>
  );
};
