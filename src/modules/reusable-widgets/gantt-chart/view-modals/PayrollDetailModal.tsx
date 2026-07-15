

import React from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { ShiftItem } from "@/common/common-models/ModelIndex";
import { calculateTotalWage } from "@/common/common-utils/util-shift/wageCalculator";

interface UserPayrollData {
  uid: string;
  nickname: string;
  color?: string;
  hourlyWage?: number;
  totalHours: number;
  totalAmount: number;
  shiftCount: number;
}

interface PayrollDetailModalProps {
  visible: boolean;
  onClose: () => void;
  shifts: ShiftItem[];
  users: Array<{ uid: string; nickname: string; color?: string; hourlyWage?: number }>;
  selectedDate: Date;
}

export const PayrollDetailModal: React.FC<PayrollDetailModalProps> = React.memo(({
  visible,
  onClose,
  shifts,
  users,
  selectedDate,
}) => {

  const selectedYear = selectedDate.getFullYear();
  const selectedMonth = selectedDate.getMonth() + 1;

  const calculateUserPayrollData = (): UserPayrollData[] => {
    const userDataMap = new Map<string, UserPayrollData>();

    const userLookup = new Map(users.map(u => [u.uid, u]));

    const monthlyShifts = shifts.filter((shift) => {
      const shiftYear = Number(shift.date.slice(0, 4));
      const shiftMonth = Number(shift.date.slice(5, 7));

      return (
        shiftYear === selectedYear &&
        shiftMonth === selectedMonth &&
        (shift.status === "approved" ||
          shift.status === "completed")
      );
    });

    monthlyShifts.forEach((shift) => {

      const user = userLookup.get(shift.userId);
      if (!user) return;

      const hourlyWage = user.hourlyWage || 1100;
      const classes = shift.classes || [];

      const { totalMinutes, totalWage } = calculateTotalWage(
        {
          startTime: shift.startTime,
          endTime: shift.endTime,
          classes: classes,
        },
        hourlyWage
      );

      const totalHours = totalMinutes / 60;

      if (userDataMap.has(user.uid)) {
        const existing = userDataMap.get(user.uid)!;
        existing.totalHours += totalHours;
        existing.totalAmount += totalWage;
        existing.shiftCount += 1;
      } else {
        userDataMap.set(user.uid, {
          uid: user.uid,
          nickname: user.nickname,
          color: user.color ?? "#4A90E2",
          hourlyWage: hourlyWage,
          totalHours: totalHours,
          totalAmount: totalWage,
          shiftCount: 1,
        });
      }
    });

    return Array.from(userDataMap.values()).sort(
      (a, b) => b.totalAmount - a.totalAmount
    );
  };

  const payrollData = calculateUserPayrollData();
  const grandTotal = payrollData.reduce(
    (acc, user) => ({
      totalHours: acc.totalHours + user.totalHours,
      totalAmount: acc.totalAmount + user.totalAmount,
      shiftCount: acc.shiftCount + user.shiftCount,
    }),
    { totalHours: 0, totalAmount: 0, shiftCount: 0 }
  );

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableOpacity
        activeOpacity={1}
        style={styles.modalOverlay}
        onPress={onClose}
      >
        <TouchableOpacity
          activeOpacity={1}
          style={styles.modalContent}
          onPress={(e) => e.stopPropagation()}
        >
          {}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>
              {selectedYear}年{selectedMonth}月 給与詳細
            </Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>

          {}
          <View style={styles.summaryContainer}>
            <Text style={styles.summaryTitle}>総計</Text>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryText}>
                総額: {grandTotal.totalAmount.toLocaleString()}円
              </Text>
              <Text style={styles.summaryText}>
                総時間: {Math.floor(grandTotal.totalHours)}時間
                {Math.round((grandTotal.totalHours % 1) * 60)}分
              </Text>
            </View>
            <Text style={styles.summarySubtext}>
              総シフト数: {grandTotal.shiftCount}件 | ※途中時間（給与除外分）を除く
            </Text>
            <Text style={styles.summaryNote}>
              ※承認済み・完了のシフトのみ計算対象
            </Text>
          </View>

          {}
          <ScrollView
            style={styles.listContainer}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {payrollData.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>
                  {selectedYear}年{selectedMonth}月のシフトデータがありません
                </Text>
              </View>
            ) : (
              payrollData.map((user, _index) => (
                <View key={user.uid} style={styles.userRow}>
                  {}
                  <View
                    style={[
                      styles.colorIndicator,
                      { backgroundColor: user.color || "#ccc" },
                    ]}
                  />

                  {}
                  <View style={styles.userInfo}>
                    <Text style={styles.userName}>{user.nickname}</Text>
                    <Text style={styles.userDetails}>
                      時給: {user.hourlyWage?.toLocaleString()}円 | シフト: {user.shiftCount}件
                    </Text>
                  </View>

                  {}
                  <View style={styles.userAmounts}>
                    <Text style={styles.userAmount}>
                      {user.totalAmount.toLocaleString()}円
                    </Text>
                    <Text style={styles.userHours}>
                      {Math.floor(user.totalHours)}時間
                      {Math.round((user.totalHours % 1) * 60) > 0 &&
                        `${Math.round((user.totalHours % 1) * 60)}分`}
                    </Text>
                  </View>
                </View>
              ))
            )}
          </ScrollView>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
});

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 12,
    width: "100%",
    maxWidth: 500,
    maxHeight: "85%",
    elevation: 0,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#fff",
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  closeButton: {
    padding: 5,
  },
  summaryContainer: {
    backgroundColor: "#f8f9fa",
    margin: 15,
    padding: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e9ecef",
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 8,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 5,
  },
  summaryText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#2196f3",
  },
  summarySubtext: {
    fontSize: 12,
    color: "#666",
    fontStyle: "italic",
  },
  summaryNote: {
    fontSize: 11,
    color: "#ff6b6b",
    marginTop: 4,
    fontWeight: "500",
  },
  listContainer: {
    flex: 1,
    paddingHorizontal: 15,
    paddingBottom: 15,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 50,
  },
  emptyText: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
  },
  userRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    marginBottom: 8,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e9ecef",
  },
  colorIndicator: {
    width: 12,
    height: 40,
    borderRadius: 6,
    marginRight: 12,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 2,
  },
  userDetails: {
    fontSize: 12,
    color: "#666",
  },
  userAmounts: {
    alignItems: "flex-end",
  },
  userAmount: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#2196f3",
    marginBottom: 2,
  },
  userHours: {
    fontSize: 12,
    color: "#666",
  },
});