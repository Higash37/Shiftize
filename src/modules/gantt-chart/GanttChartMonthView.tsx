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
import { ShiftStatusConfig } from "./gantt-chart-types/GanttChartTypes";
import styles from "./gantt-chart-styles/GanttChartMonthView.styles";
import { GanttChartMonthViewProps } from "./gantt-chart-types/GanttChartProps";
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
import { EditShiftModalView } from "./view-modals/EditShiftModalView";
import { AddShiftModalView } from "./view-modals/AddShiftModalView";

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
  const handleEditShift = (shift: ShiftItem) => {
    setEditingShift(shift);
    setNewShiftData({
      date: shift.date,
      startTime: shift.startTime,
      endTime: shift.endTime,
      userId: shift.userId,
      nickname: shift.nickname,
      status: shift.status,
      classes: shift.classes || [], // 授業時間も編集可能に
    });
    setShowEditModal(true);
  };

  // シフト削除
  const handleDeleteShift = async (shift: { id: string; status: string }) => {
    // React Native用の確認ダイアログ
    Alert.alert(
      shift.status === "deleted"
        ? "完全に削除しますか？（元に戻せません）"
        : "このシフトを削除しますか？",
      shift.status === "deleted"
        ? "この操作は元に戻せません。よろしいですか？"
        : "このシフトは「削除済み」状態になります。",
      [
        { text: "キャンセル", style: "cancel" },
        {
          text: "削除",
          style: "destructive",
          onPress: async () => {
            setIsLoading(true);
            try {
              if (shift.status === "deleted") {
                // 完全削除
                await deleteDoc(doc(db, "shifts", shift.id));
              } else {
                // ステータスをdeletedに
                await updateDoc(doc(db, "shifts", shift.id), {
                  status: "deleted",
                  updatedAt: serverTimestamp(),
                });
              }
              if (onShiftUpdate) await onShiftUpdate();
            } catch (error) {
              console.error("シフト削除エラー:", error);
            } finally {
              setIsLoading(false);
              setShowEditModal(false);
            }
          },
        },
      ]
    );
  };

  // シフト追加
  const handleAddShift = () => {
    setNewShiftData({
      date: format(selectedDate, "yyyy-MM-dd"),
      startTime: "09:00",
      endTime: "11:00",
      userId: "",
      nickname: "",
      status: "approved",
      classes: [], // 授業時間の初期値
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
        // 新規追加の場合（statusは常にapprovedで保存）
        await addDoc(collection(db, "shifts"), {
          ...newShiftData,
          status: "approved",
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
        status: "approved",
        classes: [], // 授業時間の初期値
      });
      setShowEditModal(false);
      setShowAddModal(false);
      setIsLoading(false);
    } catch (error) {
      console.error("シフト保存エラー:", error);
      setIsLoading(false);
    }
  };

  // --- シフトバー・グリッド全体押下時のモーダル表示 ---
  const handleShiftPress = (shift: ShiftItem) => {
    const user = users.find((u) => u.uid === shift.userId);
    setEditingShift(shift);
    setNewShiftData({
      date: shift.date,
      startTime: shift.startTime,
      endTime: shift.endTime,
      userId: shift.userId,
      nickname: user ? user.nickname : "",
      status: shift.status,
      classes: shift.classes || [], // 授業時間も編集可能に
    });
    setShowEditModal(true);
  };

  // 空白セルをクリックした時の処理
  const handleEmptyCellClick = (date: string, position: number) => {
    // クリック位置から開始時間を計算
    const startTime = positionToTime(position);
    // 終了時間は1時間後（22:00を超えない）
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
      classes: [], // 授業時間の初期値
    });
    setShowAddModal(true);
  };

  // --- 本体 ---
  return (
    <View style={styles.container}>
      {/* 月選択バー（カレンダー切り替え行） */}
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
        <View style={styles.addShiftButtonRow}>
          <TouchableOpacity
            style={styles.addShiftButton}
            onPress={handleAddShift}
          >
            <Ionicons name="add" size={20} color="#4A90E2" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={() => {
              /* TODO: 更新処理 */
            }}
          >
            <Text style={styles.headerButtonText}>更新</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={async () => {
              // 一括承認処理（その月の全シフトを承認済みに）
              if (shifts.length === 0) {
                Alert.alert("シフトがありません");
                return;
              }
              setIsLoading(true);
              try {
                for (const shift of shifts) {
                  await updateDoc(doc(db, "shifts", shift.id), {
                    status: "approved",
                    updatedAt: serverTimestamp(),
                  });
                }
                Alert.alert(
                  "一括承認完了",
                  `${shifts.length}件のシフトを承認しました`
                );
                if (onShiftUpdate) {
                  // 引数なしでリロード用に呼び出し（fetchShiftsByMonth等を親でラップして渡す想定）
                  await onShiftUpdate();
                }
              } catch (error) {
                Alert.alert("エラー", "一括承認に失敗しました");
              } finally {
                setIsLoading(false);
              }
            }}
          >
            <Text style={styles.headerButtonText}>一括承認</Text>
          </TouchableOpacity>
        </View>
      </View>
      {/* ヘッダー上部：右上にボタン配置 */}
      <View
        style={{
          flexDirection: "row",
          justifyContent: "flex-end",
          alignItems: "center",
          width: "100%",
          paddingRight: 16,
          marginTop: 2,
        }}
      >
        {/* 右上ボタン群（＋・更新・一括承認） */}
        <View style={styles.addShiftButtonRow}>
          <TouchableOpacity
            style={styles.addShiftButton}
            onPress={handleAddShift}
          >
            <Ionicons name="add" size={20} color="#4A90E2" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={() => {
              /* TODO: 更新処理 */
            }}
          >
            <Text style={styles.headerButtonText}>更新</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={async () => {
              // 一括承認処理（その月の全シフトを承認済みに）
              if (shifts.length === 0) {
                Alert.alert("シフトがありません");
                return;
              }
              setIsLoading(true);
              try {
                for (const shift of shifts) {
                  await updateDoc(doc(db, "shifts", shift.id), {
                    status: "approved",
                    updatedAt: serverTimestamp(),
                  });
                }
                Alert.alert(
                  "一括承認完了",
                  `${shifts.length}件のシフトを承認しました`
                );
                if (onShiftUpdate) {
                  // 引数なしでリロード用に呼び出し（fetchShiftsByMonth等を親でラップして渡す想定）
                  await onShiftUpdate();
                }
              } catch (error) {
                Alert.alert("エラー", "一括承認に失敗しました");
              } finally {
                setIsLoading(false);
              }
            }}
          >
            <Text style={styles.headerButtonText}>一括承認</Text>
          </TouchableOpacity>
        </View>
      </View>
      {/* カレンダーヘッダー本体 */}
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
        <View
          style={[
            styles.headerInfoCell,
            {
              width: infoColumnWidth,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center", // 中央揃え
            },
          ]}
        >
          <Text style={[styles.headerText, { flex: 1, textAlign: "center" }]}>
            情報
          </Text>
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
                <DateCell
                  date={date}
                  dateColumnWidth={dateColumnWidth}
                  styles={styles}
                />
                <GanttChartGrid
                  shifts={group}
                  cellWidth={cellWidth}
                  ganttColumnWidth={ganttColumnWidth}
                  halfHourLines={halfHourLines}
                  isClassTime={isClassTime}
                  getStatusConfig={getStatusConfig}
                  onShiftPress={handleShiftPress}
                  onBackgroundPress={(x) => {
                    // シフトバーの上以外を押した場合のみ新規追加
                    // x座標から30分単位のpositionを算出
                    const position =
                      (x / ganttColumnWidth) * ((halfHourLines.length - 1) / 2);
                    handleEmptyCellClick(date, position);
                  }}
                  styles={styles}
                />
                <GanttChartInfo
                  shifts={group}
                  getStatusConfig={getStatusConfig}
                  onShiftPress={handleShiftPress}
                  onDelete={() => {}}
                  infoColumnWidth={infoColumnWidth}
                  styles={styles}
                />
              </View>
            ));
          } else {
            // シフトがない日 - グリッド線を表示
            return (
              <View key={date} style={styles.shiftRow}>
                <DateCell
                  date={date}
                  dateColumnWidth={dateColumnWidth}
                  styles={styles}
                />
                <EmptyCell
                  date={date}
                  width={ganttColumnWidth}
                  cellWidth={cellWidth}
                  halfHourLines={halfHourLines}
                  isClassTime={isClassTime}
                  styles={styles}
                  handleEmptyCellClick={handleEmptyCellClick}
                />
                <View
                  style={[styles.emptyInfoCell, { width: infoColumnWidth }]}
                />
              </View>
            );
          }
        })}
      </CustomScrollView>{" "}
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
        onDelete={() => {
          // 編集中のshiftのIDとstatusを必ず渡す
          if (editingShift) {
            handleDeleteShift({
              id: editingShift.id,
              status: editingShift.status,
            });
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
    </View>
  );
};
