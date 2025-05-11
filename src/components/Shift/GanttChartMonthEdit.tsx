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
} from "react-native";
import {
  ShiftItem,
  ShiftStatusConfig,
  DEFAULT_SHIFT_STATUS_CONFIG,
} from "@/types/shift";
import { doc, onSnapshot, updateDoc } from "firebase/firestore";
import { db } from "@/services/firebase";

interface GanttChartMonthEditProps {
  shifts: ShiftItem[];
  onShiftPress?: (shift: ShiftItem) => void;
  onShiftUpdate?: (shift: ShiftItem) => void;
}

const timeLabels = Array.from({ length: (22 - 9) * 2 + 1 }, (_, i) => {
  const hour = 9 + Math.floor(i / 2);
  const min = i % 2 === 0 ? "00" : "30";
  return `${hour}:${min}`;
});

const cellCount = (22 - 9) * 4; // 15分単位

export const GanttChartMonthEdit: React.FC<GanttChartMonthEditProps> = ({
  shifts,
  onShiftPress,
  onShiftUpdate,
}) => {
  const [statusConfigs, setStatusConfigs] = useState<ShiftStatusConfig[]>(
    DEFAULT_SHIFT_STATUS_CONFIG
  );
  const [editingShift, setEditingShift] = useState<ShiftItem | null>(null);
  const [timeInput, setTimeInput] = useState({ start: "", end: "" });
  const containerRef = useRef<View>(null);

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

    setEditingShift(null);
  };

  const createPanResponder = (shift: ShiftItem) => {
    const statusConfig = getStatusConfig(shift.status);
    if (!statusConfig.canEdit) return null;

    return PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: (_, gestureState) => {
        if (!containerRef.current) return;

        containerRef.current.measure((x, y, width, height, pageX, pageY) => {
          const containerWidth = width;
          const startX = pageX;
          const moveX = gestureState.moveX - startX;
          const percentage = (moveX / containerWidth) * 100;

          // 15分単位に丸める
          const minutes = Math.round((percentage * (13 * 60)) / 100 / 15) * 15;
          const newStartHour = 9 + Math.floor(minutes / 60);
          const newStartMinute = minutes % 60;

          const newStartTime = `${newStartHour
            .toString()
            .padStart(2, "0")}:${newStartMinute.toString().padStart(2, "0")}`;
          setTimeInput((prev) => ({ ...prev, start: newStartTime }));
        });
      },
      onPanResponderRelease: () => {
        handleTimeUpdate();
      },
    });
  };

  const renderShiftBar = (shift: ShiftItem) => {
    const statusConfig = getStatusConfig(shift.status);
    const startHour = parseInt(shift.startTime.split(":")[0]);
    const startMinute = parseInt(shift.startTime.split(":")[1]);
    const endHour = parseInt(shift.endTime.split(":")[0]);
    const endMinute = parseInt(shift.endTime.split(":")[1]);

    const startPosition =
      ((startHour - 9) * 60 + startMinute) * (100 / (13 * 60));
    const width =
      ((endHour - startHour) * 60 + (endMinute - startMinute)) *
      (100 / (13 * 60));

    const panResponder = createPanResponder(shift);

    return (
      <View
        key={shift.id}
        style={[
          styles.shiftBar,
          {
            left: `${startPosition}%`,
            width: `${width}%`,
            backgroundColor: statusConfig.color,
            opacity: shift.status === "deleted" ? 0.5 : 1,
          },
        ]}
        {...panResponder?.panHandlers}
      >
        <View style={styles.shiftBarContent}>
          <Text style={styles.shiftName} numberOfLines={1}>
            {shift.nickname}
          </Text>
          <Text style={styles.shiftTime} numberOfLines={1}>
            {shift.startTime} - {shift.endTime}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View ref={containerRef} style={styles.content}>
        <View style={styles.header}>
          <View style={styles.timeHeader}>
            {Array.from({ length: 14 }, (_, i) => i + 9).map((hour) => (
              <Text key={hour} style={styles.timeLabel}>
                {hour}:00
              </Text>
            ))}
          </View>
        </View>
        <ScrollView style={styles.shiftList}>
          {shifts.map((shift) => (
            <View key={shift.id} style={styles.shiftRow}>
              <View style={styles.shiftInfo}>
                <Text style={styles.shiftName}>{shift.nickname}</Text>
                <Text style={styles.shiftDate}>{shift.date}</Text>
              </View>
              <View style={styles.shiftBarContainer}>
                {renderShiftBar(shift)}
              </View>
            </View>
          ))}
        </ScrollView>
      </View>

      <Modal
        visible={!!editingShift}
        transparent
        animationType="fade"
        onRequestClose={() => setEditingShift(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>時間を編集</Text>
            <View style={styles.timeInputContainer}>
              <TextInput
                style={styles.timeInput}
                value={timeInput.start}
                onChangeText={(text) =>
                  setTimeInput((prev) => ({ ...prev, start: text }))
                }
                placeholder="開始時間 (HH:MM)"
                keyboardType="numbers-and-punctuation"
              />
              <Text style={styles.timeSeparator}>-</Text>
              <TextInput
                style={styles.timeInput}
                value={timeInput.end}
                onChangeText={(text) =>
                  setTimeInput((prev) => ({ ...prev, end: text }))
                }
                placeholder="終了時間 (HH:MM)"
                keyboardType="numbers-and-punctuation"
              />
            </View>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setEditingShift(null)}
              >
                <Text style={styles.buttonText}>キャンセル</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton]}
                onPress={handleTimeUpdate}
              >
                <Text style={styles.buttonText}>保存</Text>
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
  content: {
    flex: 1,
  },
  header: {
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  timeHeader: {
    flexDirection: "row",
    height: 30,
  },
  timeLabel: {
    width: 60,
    textAlign: "center",
    fontSize: 12,
    color: "#666",
  },
  shiftList: {
    flex: 1,
  },
  shiftRow: {
    flexDirection: "row",
    height: 40,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  shiftInfo: {
    width: 120,
    padding: 8,
    justifyContent: "center",
  },
  shiftName: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#333",
    textAlign: "center",
  },
  shiftDate: {
    fontSize: 12,
    color: "#666",
  },
  shiftBarContainer: {
    flex: 1,
    position: "relative",
  },
  shiftBar: {
    position: "absolute",
    height: "100%",
    borderWidth: 1,
    borderColor: "#eee",
    justifyContent: "center",
    alignItems: "center",
    padding: 4,
  },
  shiftBarContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  shiftTime: {
    fontSize: 10,
    color: "#666",
    textAlign: "center",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 16,
    width: "80%",
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 16,
    textAlign: "center",
  },
  timeInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  timeInput: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 4,
    padding: 8,
    width: 100,
    textAlign: "center",
  },
  timeSeparator: {
    marginHorizontal: 8,
    fontSize: 16,
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  modalButton: {
    flex: 1,
    padding: 12,
    borderRadius: 4,
    marginHorizontal: 8,
  },
  cancelButton: {
    backgroundColor: "#f5f5f5",
  },
  saveButton: {
    backgroundColor: "#2196F3",
  },
  buttonText: {
    color: "#fff",
    textAlign: "center",
    fontSize: 16,
  },
});
