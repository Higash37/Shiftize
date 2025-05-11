import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import {
  ShiftItem,
  ShiftStatusConfig,
  DEFAULT_SHIFT_STATUS_CONFIG,
} from "@/types/shift";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "@/services/firebase";

interface GanttChartMonthViewProps {
  shifts: ShiftItem[];
  days: string[];
  users: string[];
  onShiftPress?: (shift: ShiftItem) => void;
}

export const GanttChartMonthView: React.FC<GanttChartMonthViewProps> = ({
  shifts,
  days,
  users,
  onShiftPress,
}) => {
  const [statusConfigs, setStatusConfigs] = useState<ShiftStatusConfig[]>(
    DEFAULT_SHIFT_STATUS_CONFIG
  );

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

    return (
      <TouchableOpacity
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
        onPress={() => onShiftPress?.(shift)}
        disabled={!statusConfig.canEdit}
      >
        <Text style={styles.shiftTime}>
          {shift.startTime} - {shift.endTime}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.timeHeader}>
          {Array.from({ length: 14 }, (_, i) => i + 9).map((hour) => (
            <Text key={hour} style={styles.timeLabel}>
              {hour}:00
            </Text>
          ))}
        </View>
      </View>
      <ScrollView style={styles.content}>
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
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
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
  content: {
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
    fontSize: 14,
    fontWeight: "bold",
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
  },
  shiftTime: {
    fontSize: 12,
    color: "#333",
  },
});
