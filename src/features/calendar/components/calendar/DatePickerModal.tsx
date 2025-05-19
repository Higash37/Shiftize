import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  ScrollView,
  StyleSheet,
} from "react-native";
import { colors } from "@/common/common-theme/ThemeColors";

interface DatePickerModalProps {
  isVisible: boolean;
  initialDate: Date;
  onClose: () => void;
  onSelect: (date: Date) => void;
}

export const DatePickerModal: React.FC<DatePickerModalProps> = ({
  isVisible,
  initialDate,
  onClose,
  onSelect,
}) => {
  const [tempDate, setTempDate] = useState<Date>(initialDate);
  const [showYearPicker, setShowYearPicker] = useState(true);
  const [showMonthPicker, setShowMonthPicker] = useState(false);

  // 年の配列を生成（2020年から2030年まで）
  const years = Array.from({ length: 11 }, (_, i) => 2020 + i);
  // 月の配列を生成（1月から12月まで）
  const months = Array.from({ length: 12 }, (_, i) => i + 1);

  const handleYearSelect = (year: number) => {
    const newDate = new Date(tempDate);
    newDate.setFullYear(year);
    setTempDate(newDate);
    setShowYearPicker(false);
    setShowMonthPicker(true);
  };

  const handleMonthSelect = (month: number) => {
    const newDate = new Date(tempDate);
    newDate.setMonth(month - 1);
    setTempDate(newDate);
    onSelect(newDate);
    onClose();
  };

  return (
    <Modal
      visible={isVisible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        {showYearPicker && (
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{tempDate.getFullYear()}年</Text>
            <ScrollView style={styles.pickerContainer}>
              {years.map((year) => (
                <TouchableOpacity
                  key={year}
                  style={[
                    styles.pickerItem,
                    year === tempDate.getFullYear() && styles.selectedItem,
                  ]}
                  onPress={() => handleYearSelect(year)}
                >
                  <Text
                    style={[
                      styles.pickerText,
                      year === tempDate.getFullYear() && styles.selectedText,
                    ]}
                  >
                    {year}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.modalButton} onPress={onClose}>
                <Text style={styles.modalButtonText}>キャンセル</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {showMonthPicker && (
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{tempDate.getFullYear()}年</Text>
            <View style={styles.monthGrid}>
              {months.map((month) => (
                <TouchableOpacity
                  key={month}
                  style={[
                    styles.monthItem,
                    month === tempDate.getMonth() + 1 && styles.selectedItem,
                  ]}
                  onPress={() => handleMonthSelect(month)}
                >
                  <Text
                    style={[
                      styles.monthItemText,
                      month === tempDate.getMonth() + 1 && styles.selectedText,
                    ]}
                  >
                    {month}月
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.modalButton}
                onPress={() => {
                  setShowMonthPicker(false);
                  setShowYearPicker(true);
                }}
              >
                <Text style={styles.modalButtonText}>戻る</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalButton} onPress={onClose}>
                <Text style={styles.modalButtonText}>キャンセル</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    width: "80%",
    maxHeight: "80%",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 16,
  },
  pickerContainer: {
    maxHeight: 300,
  },
  pickerItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  selectedItem: {
    backgroundColor: colors.primary + "20",
  },
  pickerText: {
    fontSize: 16,
    textAlign: "center",
  },
  selectedText: {
    color: colors.primary,
    fontWeight: "bold",
  },
  monthGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  monthItem: {
    width: "30%",
    padding: 12,
    marginBottom: 8,
    borderRadius: 8,
    alignItems: "center",
  },
  monthItemText: {
    fontSize: 16,
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 10,
  },
  modalButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  modalButtonText: {
    color: colors.primary,
    fontSize: 16,
  },
});
