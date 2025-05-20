import React, { memo, useMemo } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  useWindowDimensions,
} from "react-native";
import { AntDesign } from "@expo/vector-icons";
import { colors } from "@/common/common-theme/ThemeColors";
import { useResponsiveCalendarSize } from "../calendar-constants/constants";

interface CalendarHeaderProps {
  date: Date;
  onYearMonthSelect: () => void;
}

/**
 * カレンダーヘッダーコンポーネント
 * 年月表示と日付選択ボタンを含む
 */
export const CalendarHeader = memo<CalendarHeaderProps>(
  ({ date, onYearMonthSelect }) => {
    const { isSmallScreen } = useResponsiveCalendarSize();
    const { width } = useWindowDimensions();

    // レスポンシブサイズに基づくスタイル
    const dynamicStyles = useMemo(
      () => ({
        monthText: {
          fontSize: isSmallScreen ? 14 : 16,
        },
        monthSelector: {
          padding: isSmallScreen ? 4 : 8,
        },
      }),
      [isSmallScreen]
    ); // 日付が無効な場合のフォールバック値
    const validDate = isNaN(date.getTime()) ? new Date() : date;
    const year = validDate.getFullYear();
    const month = validDate.getMonth() + 1;
    const formattedDate = `${year}年${month}月`;

    return (
      <View style={styles.calendarHeader}>
        <TouchableOpacity
          style={[styles.monthSelector, dynamicStyles.monthSelector]}
          onPress={onYearMonthSelect}
          activeOpacity={0.7}
        >
          <Text style={[styles.monthText, dynamicStyles.monthText]}>
            {formattedDate}
          </Text>
          <AntDesign
            name="calendar"
            size={isSmallScreen ? 16 : 20}
            color={colors.text.primary}
            style={styles.calendarIcon}
          />
        </TouchableOpacity>
      </View>
    );
  }
);

const styles = StyleSheet.create({
  calendarHeader: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 4,
    backgroundColor: "transparent",
  },
  monthSelector: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 8,
  },
  monthText: {
    fontWeight: "bold",
    color: colors.text.primary,
  },
  calendarIcon: {
    marginLeft: 8,
  },
});
