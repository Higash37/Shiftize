import React from "react";
import { View, Text, TouchableOpacity, Platform } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "@/services/auth/useAuth";
import { AntDesign } from "@expo/vector-icons";
import styles from "../gantt-chart-styles/GanttChartMonthView.styles";
import { PrintButton } from "../print/PrintButton";

interface MonthSelectorBarProps {
  selectedDate: Date;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  onShowYearMonthPicker: () => void;
  onReload: () => void;
  onBatchApprove: () => void;
  onBatchDelete: () => void;
  isLoading: boolean;
  totalAmount?: number; // 追加：合計金額
  totalHours?: number; // 追加：合計時間
}

export const MonthSelectorBar: React.FC<MonthSelectorBarProps> = (props) => {
  const { signOut } = useAuth();
  const {
    selectedDate,
    onPrevMonth,
    onNextMonth,
    onShowYearMonthPicker,
    onReload,
    onBatchApprove,
    onBatchDelete,
    isLoading,
    totalAmount = 0,
    totalHours = 0,
  } = props;
  return (
    <View style={styles.monthSelector}>
      {/* 金額表示部分 - シフトがなくても表示 */}
      <View
        style={{
          position: "absolute",
          left: 10,
          top: "38%",
          transform: [{ translateY: -24 }],
          backgroundColor: "#f0f8ff",
          padding: 5,
          borderRadius: 6,
          borderWidth: 1,
          borderColor: "#4A90E2",
          zIndex: 10,
        }}
      >
        <Text style={{ fontWeight: "bold", color: "#333" }}>
          合計: {totalAmount.toLocaleString()}円{" "}
        </Text>
        {totalHours > 0 ? (
          <Text style={{ fontSize: 12, color: "#666" }}>
            ({Math.floor(totalHours)}時間
            {Math.round((totalHours % 1) * 60) > 0
              ? `${Math.round((totalHours % 1) * 60)}分`
              : ""}
            )
          </Text>
        ) : (
          <Text style={{ fontSize: 12, color: "#666" }}>(0時間)</Text>
        )}
        <Text style={{ fontSize: 10, color: "#888", fontStyle: "italic" }}>
          ※授業時間を除く
        </Text>
      </View>
      <View style={styles.monthNavigator}>
        <TouchableOpacity style={styles.monthNavButton} onPress={onPrevMonth}>
          <Text style={styles.monthNavButtonText}>＜</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.monthButton}
          onPress={onShowYearMonthPicker}
        >
          <Text style={styles.monthText}>
            {selectedDate.getFullYear()}年{selectedDate.getMonth() + 1}月
          </Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.monthNavButton} onPress={onNextMonth}>
          <Text style={styles.monthNavButtonText}>＞</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.addShiftButtonRow}>
        {Platform.OS === "web" && <PrintButton />}
        <TouchableOpacity style={styles.addShiftButton} onPress={onReload}>
          <Ionicons name="add" size={20} color="#4A90E2" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.headerButton} onPress={onReload}>
          <Text style={styles.headerButtonText}>更新</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.headerButton, { backgroundColor: "#1976D2" }]}
          onPress={onBatchApprove}
          disabled={isLoading}
        >
          <Text style={{ color: "#fff", fontWeight: "bold" }}>一括承認</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.headerButton, { backgroundColor: "#F44336" }]}
          onPress={onBatchDelete}
          disabled={isLoading}
        >
          <Text style={{ color: "#fff", fontWeight: "bold" }}>完全削除</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};
