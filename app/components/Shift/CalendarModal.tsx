import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ViewStyle,
  TextStyle,
  Platform,
  Dimensions,
} from "react-native";
import { Calendar } from "react-native-calendars";
import { colors } from "../../constants/theme";
import { getPlatformShadow } from "@/utils/time";

// 画面幅に基づいてカレンダーのサイズを計算
const SCREEN_WIDTH = Dimensions.get("window").width;
const CALENDAR_WIDTH = Math.min(SCREEN_WIDTH - 32, 400); // モーダルの最大幅を考慮
const DAY_WIDTH = Math.floor(CALENDAR_WIDTH / 7); // 7日分で割る

type Props = {
  visible: boolean;
  onClose: () => void;
  onConfirm: (dates: string[]) => void;
  initialDates?: string[];
};

export const CalendarModal: React.FC<Props> = ({
  visible,
  onClose,
  onConfirm,
  initialDates = [],
}) => {
  const [selectedDates, setSelectedDates] =
    React.useState<string[]>(initialDates);

  const markedDates = React.useMemo(() => {
    const marked: { [key: string]: any } = {};
    selectedDates.forEach((date) => {
      marked[date] = {
        selected: true,
        selectedColor: colors.primary,
      };
    });
    return marked;
  }, [selectedDates]);

  const handleDayPress = (day: any) => {
    setSelectedDates((prev) => {
      const dateExists = prev.includes(day.dateString);
      if (dateExists) {
        return prev.filter((date) => date !== day.dateString);
      } else {
        return [...prev, day.dateString];
      }
    });
  };

  const handleConfirm = () => {
    onConfirm(selectedDates);
    onClose();
  };

  const renderHeader = (date: Date) => {
    const month = `${date.getFullYear()}年${date.getMonth() + 1}月`;
    return (
      <View style={styles.calendarHeader}>
        <Text style={styles.monthText}>{month}</Text>
      </View>
    );
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.title}>日付を選択</Text>
            <Text style={styles.subtitle}>{selectedDates.length}日選択中</Text>
            <TouchableOpacity onPress={onClose}>
              <Text style={styles.closeButton}>✕</Text>
            </TouchableOpacity>
          </View>

          <Calendar
            markedDates={markedDates}
            onDayPress={handleDayPress}
            enableSwipeMonths
            style={styles.calendar}
            renderHeader={renderHeader}
            theme={{
              backgroundColor: colors.background,
              calendarBackground: colors.background,
              textSectionTitleColor: colors.text.secondary,
              selectedDayBackgroundColor: colors.primary,
              selectedDayTextColor: colors.text.white,
              todayTextColor: colors.primary,
              dayTextColor: colors.text.primary,
              textDisabledColor: colors.text.disabled,
              dotColor: colors.primary,
              selectedDotColor: colors.text.white,
              arrowColor: colors.text.primary,
              monthTextColor: colors.text.primary,
              textMonthFontSize: 16,
              textDayFontSize: 14,
              textDayHeaderFontSize: 12,
              "stylesheet.calendar.header": {
                header: {
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                  paddingHorizontal: 16,
                  paddingVertical: 8,
                  borderBottomWidth: 1,
                  borderBottomColor: colors.border,
                },
                monthText: {
                  fontSize: 16,
                  fontWeight: "bold",
                },
                arrow: {
                  padding: 8,
                },
              },
              "stylesheet.calendar.main": {
                week: {
                  marginTop: 0,
                  marginBottom: 0,
                  flexDirection: "row",
                  justifyContent: "space-around",
                  borderBottomWidth: 1,
                  borderBottomColor: colors.border,
                },
              },
              "stylesheet.day.basic": {
                base: {
                  width: DAY_WIDTH,
                  height: DAY_WIDTH,
                  alignItems: "center",
                  justifyContent: "center",
                  borderRightWidth: 1,
                  borderRightColor: colors.border,
                },
                dot: {
                  width: 2,
                  height: 2,
                  marginTop: 2,
                  borderRadius: 1.5,
                },
                selected: {
                  backgroundColor: colors.primary,
                  borderRadius: DAY_WIDTH / 2,
                },
                today: {
                  borderColor: colors.primary,
                  borderWidth: 1,
                  borderRadius: DAY_WIDTH / 2,
                },
              },
            }}
          />

          <View style={styles.footer}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={onClose}
            >
              <Text style={styles.cancelButtonText}>キャンセル</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, styles.confirmButton]}
              onPress={handleConfirm}
            >
              <Text style={styles.confirmButtonText}>設定する</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create<{
  overlay: ViewStyle;
  content: ViewStyle;
  header: ViewStyle;
  title: TextStyle;
  closeButton: TextStyle;
  calendar: ViewStyle;
  calendarHeader: ViewStyle;
  monthText: TextStyle;
  footer: ViewStyle;
  button: ViewStyle;
  cancelButton: ViewStyle;
  confirmButton: ViewStyle;
  cancelButtonText: TextStyle;
  confirmButtonText: TextStyle;
  subtitle: TextStyle;
}>({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    backgroundColor: colors.background,
    borderRadius: 12,
    width: Platform.OS === "web" ? CALENDAR_WIDTH : "90%",
    maxWidth: CALENDAR_WIDTH,
    padding: 16,
    ...getPlatformShadow(4),
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.text.primary,
  },
  closeButton: {
    fontSize: 20,
    color: colors.text.secondary,
    padding: 4,
  },
  calendar: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
  },
  calendarHeader: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 8,
  },
  monthText: {
    fontSize: 16,
    fontWeight: "bold",
    color: colors.text.primary,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 8,
    marginTop: 16,
  },
  button: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
    minWidth: 80,
    alignItems: "center",
  },
  cancelButton: {
    backgroundColor: colors.surface,
  },
  confirmButton: {
    backgroundColor: colors.primary,
  },
  cancelButtonText: {
    color: colors.text.secondary,
    fontSize: 14,
    fontWeight: "500",
  },
  confirmButtonText: {
    color: colors.text.white,
    fontSize: 14,
    fontWeight: "500",
  },
  subtitle: {
    fontSize: 14,
    color: colors.text.secondary,
  },
});
