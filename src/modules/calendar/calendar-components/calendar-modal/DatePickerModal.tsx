import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  StyleSheet,
  SafeAreaView,
} from "react-native";
import { colors } from "@/common/common-theme/ThemeColors";
import { getPlatformShadow } from "@/common/common-utils/util-style/StyleGenerator";
import CustomScrollView from "@/common/common-ui/ui-scroll/ScrollViewComponent";

interface DatePickerModalProps {
  isVisible: boolean;
  initialDate: Date;
  onClose: () => void;
  onSelect: (date: Date) => void;
}

/**
 * 年選択コンポーネント
 */
const YearPicker = ({
  tempDate,
  onYearSelect,
  onCancel,
}: {
  tempDate: Date;
  onYearSelect: (year: number) => void;
  onCancel: () => void;
}) => {
  // 年の配列を生成（現在の年から前後5年）
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 11 }, (_, i) => currentYear - 5 + i);

  return (
    <View style={styles.modalContent}>
      <Text style={styles.modalTitle}>年を選択</Text>
      <CustomScrollView style={styles.pickerContainer}>
        {years.map((year) => (
          <TouchableOpacity
            key={year}
            style={[
              styles.pickerItem,
              year === tempDate.getFullYear() && styles.selectedItem,
            ]}
            onPress={() => onYearSelect(year)}
          >
            <Text
              style={[
                styles.pickerText,
                year === tempDate.getFullYear() && styles.selectedText,
              ]}
            >
              {year}年
            </Text>
          </TouchableOpacity>
        ))}
      </CustomScrollView>
      <View style={styles.modalButtons}>
        <TouchableOpacity style={styles.modalButton} onPress={onCancel}>
          <Text style={styles.modalButtonText}>キャンセル</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

/**
 * 月選択コンポーネント
 */
const MonthPicker = ({
  tempDate,
  onMonthSelect,
  onBack,
  onCancel,
}: {
  tempDate: Date;
  onMonthSelect: (month: number) => void;
  onBack: () => void;
  onCancel: () => void;
}) => {
  // 月の配列を生成（1月から12月まで）
  const months = Array.from({ length: 12 }, (_, i) => i + 1);

  return (
    <View style={styles.modalContent}>
      <Text style={styles.modalTitle}>{tempDate.getFullYear()}年 月を選択</Text>
      <View style={styles.monthGrid}>
        {months.map((month) => (
          <TouchableOpacity
            key={month}
            style={[
              styles.monthItem,
              month === tempDate.getMonth() + 1 && styles.selectedItem,
            ]}
            onPress={() => onMonthSelect(month)}
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
        <TouchableOpacity style={styles.modalButton} onPress={onBack}>
          <Text style={styles.modalButtonText}>戻る</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.modalButton} onPress={onCancel}>
          <Text style={styles.modalButtonText}>キャンセル</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

/**
 * 日付選択モーダル
 */
export const DatePickerModal: React.FC<DatePickerModalProps> = ({
  isVisible,
  initialDate,
  onClose,
  onSelect,
}) => {
  const [tempDate, setTempDate] = useState<Date>(initialDate);
  const [showYearPicker, setShowYearPicker] = useState(true);
  const [showMonthPicker, setShowMonthPicker] = useState(false);
  // initialDateが変わったら、またはisVisibleがtrueになったらtempDateを更新
  useEffect(() => {
    if (isVisible) {
      setTempDate(initialDate);
    }
  }, [initialDate, isVisible]);

  // 年選択ハンドラ
  const handleYearSelect = (year: number) => {
    const newDate = new Date(tempDate);
    newDate.setFullYear(year);
    setTempDate(newDate);
    setShowYearPicker(false);
    setShowMonthPicker(true);
  };

  // 月選択ハンドラ
  const handleMonthSelect = (month: number) => {
    const newDate = new Date(tempDate);
    newDate.setMonth(month - 1);
    setTempDate(newDate);
    onSelect(newDate);
    onClose();
    // 次回表示用にステートをリセット
    setShowYearPicker(true);
    setShowMonthPicker(false);
  };

  // モーダルクローズハンドラ
  const handleClose = () => {
    onClose();
    // 次回表示用にステートをリセット
    setShowYearPicker(true);
    setShowMonthPicker(false);
  };

  return (
    <Modal
      visible={isVisible}
      transparent
      animationType="fade"
      onRequestClose={handleClose}
    >
      <SafeAreaView style={styles.modalOverlay}>
        {showYearPicker && (
          <YearPicker
            tempDate={tempDate}
            onYearSelect={handleYearSelect}
            onCancel={handleClose}
          />
        )}

        {showMonthPicker && (
          <MonthPicker
            tempDate={tempDate}
            onMonthSelect={handleMonthSelect}
            onBack={() => {
              setShowMonthPicker(false);
              setShowYearPicker(true);
            }}
            onCancel={handleClose}
          />
        )}
      </SafeAreaView>
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
    ...getPlatformShadow(5),
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 16,
    color: colors.text.primary,
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
    color: colors.text.primary,
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
    color: colors.text.primary,
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 16,
  },
  modalButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    marginHorizontal: 8,
  },
  modalButtonText: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: "bold",
  },
});
