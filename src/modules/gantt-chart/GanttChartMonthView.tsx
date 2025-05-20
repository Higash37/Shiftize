import React, { useState, useEffect, useRef } from "react";
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
import { DatePickerModal } from "@/modules/calendar/calendar-components/calendar-modal/DatePickerModal";
import { Picker } from "@react-native-picker/picker";
import { useAuth } from "@/services/auth/useAuth";

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

interface ShiftStatusConfig {
  status: ShiftStatus;
  label: string;
  color: string;
  canEdit: boolean;
}

interface GanttChartMonthViewProps {
  shifts: ShiftItem[];
  days: string[];
  users: string[];
  onShiftPress?: (shift: ShiftItem) => void;
  onShiftUpdate?: (shift: ShiftItem) => void;
  onMonthChange?: (year: number, month: number) => void;
  classTimes?: { start: string; end: string }[];
}

// シフトの重なりをグループ化
function groupShiftsByOverlap(shifts: ShiftItem[]) {
  if (shifts.length === 0) return [];

  // 1人1行表示のために、各シフトを別々のグループとして返す
  return shifts
    .sort((a, b) => a.startTime.localeCompare(b.startTime))
    .map((shift) => [shift]);
}

// 30分ごとの時間選択リストを生成
function generateTimeOptions() {
  const options = [];
  for (let hour = 9; hour <= 22; hour++) {
    options.push(`${hour.toString().padStart(2, "0")}:00`);
    options.push(`${hour.toString().padStart(2, "0")}:30`);
  }
  return options;
}

export const GanttChartMonthView: React.FC<GanttChartMonthViewProps> = ({
  shifts,
  days,
  users,
  onShiftPress,
  onShiftUpdate,
  onMonthChange,
  classTimes = [],
}) => {
  const [statusConfigs, setStatusConfigs] = useState<ShiftStatusConfig[]>(
    DEFAULT_SHIFT_STATUS_CONFIG
  );
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showYearMonthPicker, setShowYearMonthPicker] = useState(false);
  const [editingShift, setEditingShift] = useState<ShiftItem | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newShiftData, setNewShiftData] = useState({
    date: "",
    startTime: "09:00",
    endTime: "11:00",
    userId: "",
    nickname: "",
    status: "pending" as ShiftStatus,
  });
  const [selectedUserId, setSelectedUserId] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();

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
        const updatedConfigs = DEFAULT_SHIFT_STATUS_CONFIG.map((config) => ({
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

  // 日付ごとにシフトをグループ化
  const rows: [string, ShiftItem[]][] = days.flatMap((date) => {
    const dayShifts = shifts.filter((s) => s.date === date);
    if (dayShifts.length === 0) return [[date, []]];
    const groups = groupShiftsByOverlap(dayShifts);
    // 空のグループを除外
    return groups
      .filter((group) => group.length > 0)
      .map((group) => [date, group] as [string, ShiftItem[]]);
  });
  // 授業時間帯のセル判定
  function isClassTime(time: string) {
    // 授業時間の表示を無効化（灰色の縦線を表示しない）
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

  // 時間位置の計算ヘルパー関数
  function timeToPosition(time: string): number {
    const [hours, minutes] = time.split(":").map(Number);
    return hours - 9 + minutes / 60;
  }

  // 時間セル計算
  const cellWidth = ganttColumnWidth / (hourLabels.length - 1) / 2;
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
  // DatePickerModalで日付が選択されたときの処理
  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    setShowYearMonthPicker(false);

    // 親コンポーネントに月の変更を通知
    if (onMonthChange) {
      onMonthChange(date.getFullYear(), date.getMonth());
    }
  };

  // シフト編集
  const handleEditShift = (shift: ShiftItem) => {
    setEditingShift(shift);
    setNewShiftData({
      date: shift.date,
      startTime: shift.startTime,
      endTime: shift.endTime,
      userId: shift.userId,
      nickname: shift.nickname,
      status: shift.status,
    });
    setShowEditModal(true);
  };

  // シフト削除
  const handleDeleteShift = async (shift: ShiftItem) => {
    const confirmed = window.confirm("このシフトを削除してもよろしいですか？");
    if (!confirmed) return;

    setIsLoading(true);
    try {
      // Firestoreからシフトを削除
      await deleteDoc(doc(db, "shifts", shift.id));
      setIsLoading(false);
    } catch (error) {
      console.error("シフト削除エラー:", error);
      setIsLoading(false);
    }
  };

  // シフト追加
  const handleAddShift = () => {
    setNewShiftData({
      date: format(selectedDate, "yyyy-MM-dd"),
      startTime: "09:00",
      endTime: "11:00",
      userId: "",
      nickname: "",
      status: "pending",
    });
    setShowAddModal(true);
  };

  // シフト保存
  const handleSaveShift = async () => {
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
      if (editingShift) {
        // 編集の場合
        await updateDoc(doc(db, "shifts", editingShift.id), {
          ...newShiftData,
          updatedAt: serverTimestamp(),
        });
        setEditingShift(null);
      } else {
        // 新規追加の場合
        await addDoc(collection(db, "shifts"), {
          ...newShiftData,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
          userId: user?.uid, // 現在のユーザーIDをセット
        });
      }

      setNewShiftData({
        date: "",
        startTime: "09:00",
        endTime: "11:00",
        userId: "",
        nickname: "",
        status: "pending",
      });
      setShowEditModal(false);
      setShowAddModal(false);
      setIsLoading(false);
    } catch (error) {
      console.error("シフト保存エラー:", error);
      setIsLoading(false);
    }
  };

  // --- ガントチャート本体 ---
  type GanttChartGridProps = {
    shifts: ShiftItem[];
    timeLabels: string[];
    halfHourLines: string[];
    isClassTime: (time: string) => boolean;
    getStatusConfig: (status: string) => ShiftStatusConfig;
    onShiftPress?: (shift: ShiftItem) => void;
  };
  const GanttChartGrid: React.FC<GanttChartGridProps> = ({
    shifts,
    timeLabels,
    halfHourLines,
    isClassTime,
    getStatusConfig,
    onShiftPress,
  }) => {
    // 日付を取得するためにシフトの一つを使用
    const date = shifts.length > 0 ? shifts[0].date : "";

    return (
      <View style={[styles.ganttCell, { width: ganttColumnWidth }]}>
        {" "}
        {/* クリック可能な背景レイヤー */}
        <TouchableOpacity
          style={[StyleSheet.absoluteFill, { zIndex: 1 }]}
          onPress={() => handleOpenAddModal(date)}
          activeOpacity={0.7}
        />
        {/* 背景グリッド */}
        <View style={styles.ganttBgRow}>
          {halfHourLines.map((t: string, i: number) => (
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
        {/* シフト */}
        {shifts.map((shift: ShiftItem) => {
          const statusConfig = getStatusConfig(shift.status);
          const startPos = timeToPosition(shift.startTime);
          const endPos = timeToPosition(shift.endTime);

          // セルに合わせて開始と終了位置を調整
          // 厳密に開始時間に合わせる
          const startCell = Math.floor(startPos * 2);
          // 終了時間は必ず次のセルまでとする
          const endCell = Math.ceil(endPos * 2);
          // 最低幅を確保（少なくとも2セル分）
          const cellSpan = Math.max(endCell - startCell, 2);
          return (
            <TouchableOpacity
              key={shift.id}
              style={[
                styles.shiftBar,
                {
                  left: startCell * cellWidth,
                  width: cellSpan * cellWidth,
                  backgroundColor: statusConfig.color,
                  opacity: shift.status === "deleted" ? 0.5 : 1,
                  zIndex: 2, // シフトを背景レイヤーの上に表示
                },
              ]}
              onPress={() => onShiftPress?.(shift)}
            >
              <View
                style={{
                  width: "100%",
                  height: "100%",
                  justifyContent: "center",
                  alignItems: "center", // 中央揃え
                  paddingHorizontal: 8, // 水平パディングを増やす
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
  };

  // --- 情報表示 ---
  type GanttChartInfoProps = {
    shifts: ShiftItem[];
    getStatusConfig: (status: string) => ShiftStatusConfig;
  };

  const GanttChartInfo: React.FC<GanttChartInfoProps> = ({
    shifts,
    getStatusConfig,
  }) => (
    <View
      style={[
        styles.infoCell,
        {
          width: infoColumnWidth,
        },
      ]}
    >
      <CustomScrollView
        style={{ flex: 1, width: "100%" }}
        contentContainerStyle={{ paddingVertical: 0 }}
      >
        {shifts.map((shift: ShiftItem) => {
          const statusConfig = getStatusConfig(shift.status);
          return (
            <View
              key={shift.id}
              style={[
                styles.infoContent,
                {
                  borderWidth: 0.5,
                  borderColor: statusConfig.color,
                  backgroundColor: "#f8fafd",
                  width: infoColumnWidth - 4,
                },
              ]}
            >
              <Text
                style={styles.infoText}
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                {shift.nickname}
              </Text>
              <Text
                style={styles.infoTimeText}
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                {shift.startTime}～{shift.endTime}
              </Text>
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

  // シフト追加モーダルを開く関数
  const handleOpenAddModal = (dateString: string) => {
    setNewShiftData({
      ...newShiftData,
      date: dateString,
    });
    setShowAddModal(true);
  };

  // シフト追加ボタン
  const AddShiftButton = ({ date }: { date: string }) => (
    <TouchableOpacity
      style={styles.addShiftButton}
      onPress={() => handleOpenAddModal(date)}
    >
      <Ionicons name="add-circle" size={24} color="#4A90E2" />
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* 月選択 */}
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
      </View>
      {/* ヘッダー */}
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
        {days.map((date) => {
          const matchingRows = rows.filter(([rowDate]) => rowDate === date);

          if (matchingRows.length > 0) {
            // シフトがある日
            return matchingRows.map(([date, group], idx) => (
              <View key={date + String(idx)} style={styles.shiftRow}>
                <DateCell date={date} />
                <GanttChartGrid
                  shifts={group}
                  timeLabels={hourLabels}
                  halfHourLines={halfHourLines}
                  isClassTime={isClassTime}
                  getStatusConfig={getStatusConfig}
                  onShiftPress={onShiftPress}
                />
                <GanttChartInfo
                  shifts={group}
                  getStatusConfig={getStatusConfig}
                />
                <AddShiftButton date={date} />
              </View>
            ));
          } else {
            // シフトがない日 - グリッド線を表示
            return (
              <View key={date} style={styles.shiftRow}>
                <DateCell date={date} />
                <TouchableOpacity
                  style={[styles.emptyCell, { width: ganttColumnWidth }]}
                  onPress={() => handleOpenAddModal(date)}
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
                </TouchableOpacity>
                <View
                  style={[styles.emptyInfoCell, { width: infoColumnWidth }]}
                />
                <AddShiftButton date={date} />
              </View>
            );
          }
        })}
      </CustomScrollView>{" "}
      {/* シフト編集モーダル */}
      <Modal
        visible={showEditModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowEditModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>シフト編集</Text>
            <Text style={styles.modalSubtitle}>{newShiftData.date}</Text>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>ユーザー</Text>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={newShiftData.userId}
                  onValueChange={(itemValue) =>
                    setNewShiftData({ ...newShiftData, userId: itemValue })
                  }
                  style={styles.picker}
                >
                  <Picker.Item label="ユーザーを選択" value="" />
                  {users.map((user) => (
                    <Picker.Item key={user} label={user} value={user} />
                  ))}
                </Picker>
              </View>
            </View>

            <View style={styles.timeInputContainer}>
              <View style={styles.timeInputGroup}>
                <Text style={styles.timeInputLabel}>開始時間</Text>
                <View style={styles.pickerContainer}>
                  <Picker
                    selectedValue={newShiftData.startTime}
                    onValueChange={(itemValue) =>
                      setNewShiftData({ ...newShiftData, startTime: itemValue })
                    }
                    style={styles.picker}
                  >
                    {timeOptions.map((time) => (
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
                    selectedValue={newShiftData.endTime}
                    onValueChange={(itemValue) =>
                      setNewShiftData({ ...newShiftData, endTime: itemValue })
                    }
                    style={styles.picker}
                  >
                    {timeOptions.map((time) => (
                      <Picker.Item key={time} label={time} value={time} />
                    ))}
                  </Picker>
                </View>
              </View>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>ステータス</Text>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={newShiftData.status}
                  onValueChange={(itemValue) =>
                    setNewShiftData({ ...newShiftData, status: itemValue })
                  }
                  style={styles.picker}
                >
                  {statusConfigs.map((config) => (
                    <Picker.Item
                      key={config.status}
                      label={config.label}
                      value={config.status}
                    />
                  ))}
                </Picker>
              </View>
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowEditModal(false)}
              >
                <Text style={styles.cancelButtonText}>キャンセル</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton]}
                onPress={handleSaveShift}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.saveButtonText}>保存</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      {/* シフト追加モーダル */}
      <Modal
        visible={showAddModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowAddModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>シフト追加</Text>
            <Text style={styles.modalSubtitle}>{newShiftData.date}</Text>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>ユーザー</Text>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={newShiftData.userId}
                  onValueChange={(itemValue) =>
                    setNewShiftData({ ...newShiftData, userId: itemValue })
                  }
                  style={styles.picker}
                >
                  <Picker.Item label="ユーザーを選択" value="" />
                  {users.map((user) => (
                    <Picker.Item key={user} label={user} value={user} />
                  ))}
                </Picker>
              </View>
            </View>

            <View style={styles.timeInputContainer}>
              <View style={styles.timeInputGroup}>
                <Text style={styles.timeInputLabel}>開始時間</Text>
                <View style={styles.pickerContainer}>
                  <Picker
                    selectedValue={newShiftData.startTime}
                    onValueChange={(itemValue) =>
                      setNewShiftData({ ...newShiftData, startTime: itemValue })
                    }
                    style={styles.picker}
                  >
                    {timeOptions.map((time) => (
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
                    selectedValue={newShiftData.endTime}
                    onValueChange={(itemValue) =>
                      setNewShiftData({ ...newShiftData, endTime: itemValue })
                    }
                    style={styles.picker}
                  >
                    {timeOptions.map((time) => (
                      <Picker.Item key={time} label={time} value={time} />
                    ))}
                  </Picker>
                </View>
              </View>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>ステータス</Text>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={newShiftData.status}
                  onValueChange={(itemValue) =>
                    setNewShiftData({ ...newShiftData, status: itemValue })
                  }
                  style={styles.picker}
                >
                  {statusConfigs.map((config) => (
                    <Picker.Item
                      key={config.status}
                      label={config.label}
                      value={config.status}
                    />
                  ))}
                </Picker>
              </View>
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowAddModal(false)}
              >
                <Text style={styles.cancelButtonText}>キャンセル</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton]}
                onPress={handleSaveShift}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.saveButtonText}>追加</Text>
                )}
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
    flex: 1,
    backgroundColor: "#fff",
  },
  addShiftButton: {
    position: "absolute",
    right: 10,
    top: 10,
    zIndex: 100,
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    borderRadius: 15,
    padding: 3,
    width: 30,
    height: 30,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
    elevation: 3,
  },
  // モーダル用スタイルの追加
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
  cancelButtonText: {
    color: "#666",
    fontWeight: "bold",
  },
  saveButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  headerRow: {
    flexDirection: "row",
    backgroundColor: "#f0f0f0",
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
    elevation: 2,
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
  shiftRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    minHeight: 65, // 行の高さを少し増やす
    height: 65,
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
    height: 65, // セル全体の高さに合わせる
    top: 0, // マージンなし
    borderRadius: 0, // 角を丸めない
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 0, // パディングをなくす
    paddingVertical: 0, // パディングをなくす
    elevation: 3,
    borderWidth: 0, // 枠線を消す
  },
  shiftBarText: {
    color: "#000", // 黒色テキストに変更
    fontSize: 16, // フォントサイズを大きく
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 2, // 下に少しマージンを追加
  },
  shiftTimeText: {
    color: "#000", // 黒色テキストに変更
    fontSize: 14, // 時間表示のフォントサイズを大きく
    fontWeight: "500", // やや太く
    textAlign: "center",
  },
  infoCell: {
    padding: 0,
    justifyContent: "flex-start",
    height: 65, // 高さを調整
    overflow: "hidden",
    backgroundColor: "#f9f9f9",
  },
  infoContent: {
    marginBottom: 0,
    padding: 3,
    borderRadius: 3,
    marginHorizontal: 0,
    marginTop: 1,
  },
  infoText: {
    fontSize: 12,
    fontWeight: "bold",
    marginBottom: 1,
  },
  infoTimeText: {
    fontSize: 11,
    color: "#333",
    marginBottom: 0,
  },
  statusText: {
    fontSize: 9,
    fontWeight: "500",
    color: "#555",
  },
  emptyCell: {
    height: 65, // 空のセルの高さも調整
    borderRightWidth: 1,
    borderRightColor: "#ddd",
    position: "relative", // グリッド線表示のため追加
  },
  emptyInfoCell: {
    height: 65, // 空のセルの高さも調整
    backgroundColor: "#f9f9f9",
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.7)",
  },
  // Removed duplicate modalTitle and modalContent below
  input: {
    height: 40,
    borderColor: "#ddd",
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    marginBottom: 15,
  },
  picker: {
    height: 50,
    borderColor: "#ddd",
    borderWidth: 1,
    borderRadius: 5,
    marginBottom: 15,
  },
  saveButton: {
    backgroundColor: "#4CAF50",
    borderRadius: 5,
    paddingVertical: 10,
    alignItems: "center",
  },
  // Removed duplicate saveButtonText style
  closeButton: {
    marginTop: 10,
    paddingVertical: 10,
  },
  closeButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
});
