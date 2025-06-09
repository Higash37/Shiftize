import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Modal,
  TextInput,
  Alert,
  ActivityIndicator,
  Platform,
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
} from "firebase/firestore";
import { db } from "@/services/firebase/firebase";
import { format, addMonths, subMonths } from "date-fns";
import { ja } from "date-fns/locale";
import { Ionicons } from "@expo/vector-icons";
import CustomScrollView from "@/common/common-ui/ui-scroll/ScrollViewComponent";
import { DatePickerModal } from "@/modules/child-components/calendar/calendar-components/calendar-modal/DatePickerModal";
import { Picker } from "@react-native-picker/picker";
import { useAuth } from "@/services/auth/useAuth";
import {
  DEFAULT_SHIFT_STATUS_CONFIG,
  ShiftStatusConfig,
} from "@/common/common-models/model-shift/shiftTypes";
import styles from "./gantt-chart-styles/GanttChartMonthView.styles";
import { GanttChartMonthViewProps } from "./gantt-chart-types/GanttChartProps";
import {
  generateTimeOptions,
  groupShiftsByOverlap,
  positionToTime,
  timeToPosition,
} from "./gantt-chart-common/utils";
import {
  DateCell,
  GanttChartGrid,
  GanttChartInfo,
  EmptyCell,
} from "./gantt-chart-common/components";
import { EditShiftModalView } from "./view-modals/EditShiftModalView";
import { AddShiftModalView } from "./view-modals/AddShiftModalView";
import { MonthSelectorBar } from "./gantt-chart-common/MonthSelectorBar";
import { GanttHeader } from "./gantt-chart-common/GanttHeader";
import { GanttChartBody } from "./gantt-chart-common/GanttChartBody";
import { useGanttShiftActions } from "./gantt-chart-common/useGanttShiftActions";
import { ConfirmBatchModalView } from "./view-modals/ConfirmBatchModalView";

export const GanttChartMonthView: React.FC<GanttChartMonthViewProps> = ({
  shifts,
  days,
  users,
  selectedDate,
  onShiftPress,
  onShiftUpdate,
  onMonthChange,
  classTimes = [],
}) => {
  const [statusConfigs, setStatusConfigs] = useState<ShiftStatusConfig[]>(
    DEFAULT_SHIFT_STATUS_CONFIG
  );
  const [showYearMonthPicker, setShowYearMonthPicker] = useState(false);
  const [editingShift, setEditingShift] = useState<ShiftItem | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newShiftData, setNewShiftData] = useState<{
    date: string;
    startTime: string;
    endTime: string;
    userId: string;
    nickname: string;
    status: ShiftStatus;
    classes: ClassTimeSlot[];
  }>({
    date: "",
    startTime: "09:00",
    endTime: "11:00",
    userId: "",
    nickname: "",
    status: "approved",
    classes: [], // 授業時間の初期値
  });
  const [selectedUserId, setSelectedUserId] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [batchModal, setBatchModal] = useState<{
    visible: boolean;
    type: "approve" | "delete" | null;
  }>({ visible: false, type: null });
  const { user } = useAuth();
  const { saveShift, deleteShift, updateShiftStatus } = useGanttShiftActions({
    user,
    onShiftUpdate,
  });

  // 時間選択オプションを生成
  const timeOptions = generateTimeOptions();

  const screenWidth = Dimensions.get("window").width;
  const dateColumnWidth = 50;
  const infoColumnWidth = Math.max(screenWidth * 0.18, 150);
  const ganttColumnWidth = screenWidth - dateColumnWidth - infoColumnWidth;

  useEffect(() => {
    // Firestoreからステータス設定を取得
    const configRef = doc(db, "settings", "shiftStatus");
    const unsubscribe = onSnapshot(configRef, (doc) => {
      if (doc.exists()) {
        const data = doc.data();
        const updatedConfigs: ShiftStatusConfig[] =
          DEFAULT_SHIFT_STATUS_CONFIG.map((config) => ({
            ...config,
            ...data[config.status],
          }));
        setStatusConfigs(updatedConfigs);
      }
    });

    return () => unsubscribe();
  }, []);

  const getStatusConfig = (status: string) => {
    return (
      statusConfigs.find((config) => config.status === status) ||
      statusConfigs[0]
    );
  };

  // 表示対象のシフト（deleted, purgedは除外）
  const visibleShifts = shifts.filter(
    (s) => s.status !== "deleted" && s.status !== "purged"
  );

  // 日付ごとにシフトをグループ化
  const rows: [string, ShiftItem[]][] = days.flatMap((date) => {
    const dayShifts = visibleShifts.filter((s) => s.date === date);
    if (dayShifts.length === 0) return [[date, []]];
    const groups = groupShiftsByOverlap(dayShifts);
    // 空のグループを除外
    return groups
      .filter((group) => group.length > 0)
      .map((group) => [date, group] as [string, ShiftItem[]]);
  });
  // 授業時間帯のセル判定
  function isClassTime(time: string) {
    // Viewモードでは縦線を一切表示しない
    return false;
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

  // 時間セル計算
  const cellWidth = ganttColumnWidth / (hourLabels.length - 1) / 2;
  // 前月に移動する関数
  const handlePrevMonth = () => {
    const newDate = subMonths(selectedDate, 1);
    if (onMonthChange) {
      onMonthChange(newDate.getFullYear(), newDate.getMonth());
    }
  };
  // 翌月に移動する関数
  const handleNextMonth = () => {
    const newDate = addMonths(selectedDate, 1);
    if (onMonthChange) {
      onMonthChange(newDate.getFullYear(), newDate.getMonth());
    }
  };
  // DatePickerModalで日付が選択されたときの処理
  const handleDateSelect = (date: Date) => {
    setShowYearMonthPicker(false);
    if (onMonthChange) {
      onMonthChange(date.getFullYear(), date.getMonth());
    }
  };

  // シフト編集
  const handleEditShift = useCallback((shift: ShiftItem) => {
    setEditingShift(shift);
    setNewShiftData({
      date: shift.date,
      startTime: shift.startTime,
      endTime: shift.endTime,
      userId: shift.userId,
      nickname: shift.nickname,
      status: shift.status,
      classes: shift.classes || [],
    });
    setShowEditModal(true);
  }, []);

  // シフト削除
  const handleDeleteShift = async (shiftId: string) => {
    setIsLoading(true); // ローディング開始
    const newStatus: ShiftStatus = "deleted"; // 状態に関係なく削除済みに変更
    await updateShiftStatus(shiftId, newStatus);
    setShowEditModal(false); // モーダルを閉じる
    setIsLoading(false); // ローディング終了
  };

  const handleBatchDelete = () => {
    const rejectedShifts = shifts.filter(
      (shift) => shift.status === "rejected"
    );
    rejectedShifts.forEach((shift) => {
      updateShiftStatus(shift.id, "deleted"); // 一括削除で削除済みに変更
    });
  };

  // シフト保存
  const handleSaveShift = useCallback(async () => {
    if (
      !newShiftData.date ||
      !newShiftData.startTime ||
      !newShiftData.endTime
    ) {
      Alert.alert("エラー", "日付と時間を正しく入力してください。");
      return;
    }
    setIsLoading(true);
    try {
      await saveShift(editingShift, newShiftData);
      setEditingShift(null);
      setNewShiftData({
        date: "",
        startTime: "09:00",
        endTime: "11:00",
        userId: "",
        nickname: "",
        status: "approved",
        classes: [],
      });
      setShowEditModal(false);
      setShowAddModal(false);
    } catch (error) {
      console.error("シフト保存エラー:", error);
    } finally {
      setIsLoading(false);
    }
  }, [editingShift, newShiftData, saveShift]);

  // --- シフトバー・グリッド全体押下時のモーダル表示 ---
  const handleShiftPress = useCallback(
    (shift: ShiftItem) => {
      const userObj = users.find((u) => u.uid === shift.userId);
      setEditingShift(shift);
      setNewShiftData({
        date: shift.date,
        startTime: shift.startTime,
        endTime: shift.endTime,
        userId: shift.userId,
        nickname: userObj ? userObj.nickname : "",
        status: shift.status,
        classes: shift.classes || [],
      });
      setShowEditModal(true);
    },
    [users]
  );

  // 空白セルをクリックした時の処理
  const handleEmptyCellClick = useCallback(
    (date: string, position: number) => {
      const startTime = positionToTime(position);
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
      setNewShiftData({
        date,
        startTime,
        endTime,
        userId: "",
        nickname: "",
        status: "pending",
        classes: [],
      });
      setShowAddModal(true);
    },
    [positionToTime]
  );

  // シフト追加
  const handleAddShift = useCallback(() => {
    setNewShiftData({
      date: format(selectedDate, "yyyy-MM-dd"),
      startTime: "09:00",
      endTime: "11:00",
      userId: "",
      nickname: "",
      status: "approved",
      classes: [],
    });
    setShowAddModal(true);
  }, [selectedDate]);

  // ユーザーID→colorマップを作成
  const userColorsMap = React.useMemo(() => {
    const map: Record<string, string> = {};
    users.forEach((u) => {
      if (u.uid && u.color) map[u.uid] = u.color;
    });
    return map;
  }, [users]);

  // --- 本体 ---
  return (
    <View style={styles.container}>
      {/* 月選択バー＋右上ボタン群 */}
      <MonthSelectorBar
        selectedDate={selectedDate}
        onPrevMonth={handlePrevMonth}
        onNextMonth={handleNextMonth}
        onShowYearMonthPicker={() => setShowYearMonthPicker(true)}
        onReload={() => {
          if (typeof window !== "undefined" && window.location) {
            window.location.reload();
          } else if (Platform.OS !== "web") {
            try {
              const { AppRegistry } = require("react-native");
              if (AppRegistry && AppRegistry.reload) {
                AppRegistry.reload();
              }
            } catch (e) {}
          }
        }}
        onBatchApprove={() => setBatchModal({ visible: true, type: "approve" })}
        onBatchDelete={() => setBatchModal({ visible: true, type: "delete" })}
        isLoading={isLoading}
      />
      {/* 年月ピッカーモーダル */}
      <DatePickerModal
        isVisible={showYearMonthPicker}
        initialDate={selectedDate}
        onClose={() => setShowYearMonthPicker(false)}
        onSelect={handleDateSelect}
      />
      {/* --- バッチ確認モーダル --- */}
      <ConfirmBatchModalView
        visible={batchModal.visible}
        title={
          batchModal.type === "approve"
            ? "一括承認"
            : batchModal.type === "delete"
            ? "完全削除"
            : ""
        }
        description={
          batchModal.type === "approve"
            ? (() => {
                const targets = shifts.filter((s) => s.status === "pending");
                return `${targets.length}件の未承認シフトを一括で承認します。本当によろしいですか？`;
              })()
            : batchModal.type === "delete"
            ? (() => {
                const targets = shifts.filter((s) => s.status === "deleted");
                return `${targets.length}件の削除済みシフトを画面から消します。本当によろしいですか？`;
              })()
            : ""
        }
        isLoading={isLoading}
        styles={styles}
        onCancel={() => setBatchModal({ visible: false, type: null })}
        onConfirm={async () => {
          setIsLoading(true);
          if (batchModal.type === "approve") {
            const targets = shifts.filter((s) => s.status === "pending");
            try {
              for (const shift of targets) {
                await updateDoc(doc(db, "shifts", shift.id), {
                  status: "approved",
                  updatedAt: serverTimestamp(),
                });
              }
            } catch (error) {
              setIsLoading(false);
              setBatchModal({ visible: false, type: null });
              return;
            }
          } else if (batchModal.type === "delete") {
            const targets = shifts.filter((s) => s.status === "deleted");
            try {
              for (const shift of targets) {
                await updateDoc(doc(db, "shifts", shift.id), {
                  status: "purged",
                  updatedAt: serverTimestamp(),
                });
              }
            } catch (error) {
              setIsLoading(false);
              setBatchModal({ visible: false, type: null });
              return;
            }
          }
          setIsLoading(false);
          setBatchModal({ visible: false, type: null });
          if (typeof window !== "undefined" && window.location) {
            window.location.reload();
          } else if (Platform.OS !== "web") {
            try {
              const { AppRegistry } = require("react-native");
              if (AppRegistry && AppRegistry.reload) {
                AppRegistry.reload();
              }
            } catch (e) {}
          }
        }}
      />
      {/* 横スクロール全体をCustomScrollViewでラップ */}
      <CustomScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View>
          <GanttHeader
            hourLabels={hourLabels}
            dateColumnWidth={dateColumnWidth}
            ganttColumnWidth={ganttColumnWidth}
            infoColumnWidth={infoColumnWidth}
          />
          {/* 本体 */}
          <GanttChartBody
            days={days}
            rows={rows}
            dateColumnWidth={dateColumnWidth}
            ganttColumnWidth={ganttColumnWidth}
            infoColumnWidth={infoColumnWidth}
            cellWidth={cellWidth}
            halfHourLines={halfHourLines}
            isClassTime={isClassTime}
            getStatusConfig={getStatusConfig}
            handleShiftPress={handleShiftPress}
            handleEmptyCellClick={handleEmptyCellClick}
            styles={styles}
            userColorsMap={userColorsMap}
          />
        </View>
      </CustomScrollView>
      {/* シフト編集モーダル */}
      <EditShiftModalView
        visible={showEditModal}
        newShiftData={newShiftData}
        users={users}
        timeOptions={timeOptions}
        statusConfigs={statusConfigs}
        isLoading={isLoading}
        styles={styles}
        onChange={(field, value) =>
          setNewShiftData({ ...newShiftData, [field]: value })
        }
        onClose={() => setShowEditModal(false)}
        onSave={handleSaveShift}
        onDelete={async () => {
          if (editingShift) {
            await handleDeleteShift(editingShift.id); // 非同期処理に対応
          }
        }}
      />
      {/* シフト追加モーダル */}
      <AddShiftModalView
        visible={showAddModal}
        newShiftData={newShiftData}
        users={users}
        timeOptions={timeOptions}
        statusConfigs={statusConfigs}
        isLoading={isLoading}
        styles={styles}
        onChange={(field, value) =>
          setNewShiftData({ ...newShiftData, [field]: value })
        }
        onClose={() => setShowAddModal(false)}
        onSave={handleSaveShift}
      />
      {/* 画面全体ローディングオーバーレイ */}
      {isLoading && (
        <View
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0,0,0,0.25)",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 9999,
          }}
          pointerEvents="auto"
        >
          <ActivityIndicator size="large" color="#1976D2" />
        </View>
      )}
    </View>
  );
};
