import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  StyleSheet,
  SafeAreaView,
  TouchableWithoutFeedback,
} from "react-native";
import { format } from "date-fns";
import { colors } from "@/common/common-theme/ThemeColors";
import { getPlatformShadow } from "@/common/common-utils/util-style/StyleGenerator";
import CustomScrollView from "@/common/common-ui/ui-scroll/ScrollViewComponent";
import ShiftDateSelector from "@/modules/user-view/shift-ui/shift-ui-components/ShiftDateSelector";

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
}: {
  tempDate: Date;
  onMonthSelect: (month: number) => void;
  onBack: () => void;
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
  const [showDayPicker, setShowDayPicker] = useState(false);

  useEffect(() => {
    if (isVisible) {
      setTempDate(initialDate);
      setShowYearPicker(true);
      setShowMonthPicker(false);
      setShowDayPicker(false);
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
    setShowMonthPicker(false);
    setShowDayPicker(true);
  };

  // 日選択ハンドラ
  const handleDaySelect = (dateString: string) => {
    const [y, m, d] = dateString.split("-").map(Number);
    const newDate = new Date(y, m - 1, d);
    setTempDate(newDate);
    onSelect(newDate);
    onClose();
  };

  // モーダルクローズハンドラ
  const handleClose = () => {
    onClose();
    setShowYearPicker(true);
    setShowMonthPicker(false);
    setShowDayPicker(false);
  };

  // カレンダーのcurrentをtempDateの年月に合わせる
  const calendarCurrent = `${tempDate.getFullYear()}-${String(
    tempDate.getMonth() + 1
  ).padStart(2, "0")}-01`;

  return (
    <Modal
      visible={isVisible}
      transparent
      animationType="fade"
      onRequestClose={handleClose}
    >
      <TouchableWithoutFeedback onPress={handleClose}>
        <View style={styles.modalOverlay}>
          <TouchableWithoutFeedback onPress={() => {}}>
            <View>
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
                />
              )}
              {showDayPicker && (
                <View style={styles.modalContent}>
                  <Text style={styles.modalTitle}>
                    {tempDate.getFullYear()}年{tempDate.getMonth() + 1}月
                    日を選択
                  </Text>
                  <ShiftDateSelector
                    selectedDate={format(tempDate, "yyyy-MM-dd")}
                    onSelect={handleDaySelect}
                  />
                  <View style={styles.modalButtons}>
                    <TouchableOpacity
                      style={styles.modalButton}
                      onPress={() => {
                        setShowDayPicker(false);
                        setShowMonthPicker(true);
                      }}
                    >
                      <Text style={styles.modalButtonText}>戻る</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1, // 画面全体を覆う
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 24,
    width: "90%",
    maxWidth: 600,
    maxHeight: "80%", // 高さを調整
    minWidth: 320,
    ...getPlatformShadow(5),
    alignItems: "center",
    justifyContent: "center",
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
    justifyContent: "space-around", // PC画面でのレイアウトを改善
    width: "100%",
    marginBottom: 8,
  },
  monthItem: {
    width: "28%", // PC画面でのアイテム幅を調整
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
    width: "100%",
  },
  modalButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    marginHorizontal: 8,
    backgroundColor: colors.primary + "10",
    borderRadius: 8,
  },
  modalButtonText: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
  },
});
