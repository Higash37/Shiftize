import React from "react";
import { View, Text, TouchableOpacity, Dimensions } from "react-native";
import { AntDesign } from "@expo/vector-icons";
import { colors } from "@/common/common-theme/ThemeColors";
import { format } from "date-fns";
import { ja } from "date-fns/locale";
import { ShiftListItemProps } from "./types";
import { shiftListItemStyles as styles } from "./styles";

// レスポンシブデザイン用の定数
const { width: SCREEN_WIDTH } = Dimensions.get("window");
const IS_SMALL_DEVICE = SCREEN_WIDTH < 375;

export const ShiftListItem: React.FC<ShiftListItemProps> = ({
  shift,
  isSelected,
  selectedDate,
  onPress,
  onDetailsPress,
  children,
}) => {
  return (
    <View>
      <View
        style={[
          styles.shiftItem,
          { borderColor: colors.status[shift.status] }, // 状態に応じた外枠の色
          shift.date === selectedDate && styles.selectedShiftItem,
        ]}
      >
        <TouchableOpacity style={styles.shiftContent} onPress={onPress}>
          <AntDesign
            name="user"
            size={IS_SMALL_DEVICE ? 16 : 20}
            color={colors.primary}
            style={styles.icon}
          />
          <View style={styles.textContainer}>
            <View style={styles.shiftInfoContainer}>
              {/* 日付表示部分を固定幅に */}
              <View style={styles.dateContainer}>
                <Text style={styles.dateText}>
                  {format(new Date(shift.date), "d日(E)", {
                    locale: ja,
                  })}
                </Text>
              </View>

              {/* ステータスラベルを固定幅に */}
              <View style={styles.statusContainer}>
                <Text
                  style={[
                    styles.userLabel,
                    {
                      backgroundColor: colors.status[shift.status] + "20",
                      color: colors.status[shift.status],
                    },
                  ]}
                >
                  {shift.status === "draft"
                    ? "下書き"
                    : shift.status === "approved"
                    ? "承認済"
                    : shift.status === "pending"
                    ? "承認待ち"
                    : shift.status === "rejected"
                    ? "却下"
                    : shift.status === "deletion_requested"
                    ? "削除申請中"
                    : shift.status === "deleted"
                    ? "削除済"
                    : shift.status === "completed"
                    ? "完了"
                    : ""}
                </Text>
              </View>

              {/* 時間表示 */}
              <Text
                style={[
                  styles.timeText,
                  IS_SMALL_DEVICE && styles.smallTimeText,
                ]}
              >
                {shift.startTime} ~ {shift.endTime}
              </Text>
            </View>
          </View>
        </TouchableOpacity>
        <TouchableOpacity style={styles.detailsButton} onPress={onDetailsPress}>
          <Text style={styles.detailsText}>詳細</Text>
          <AntDesign
            name={isSelected ? "down" : "right"}
            size={IS_SMALL_DEVICE ? 14 : 16}
            color={colors.text.secondary}
            style={styles.detailsIcon}
          />
        </TouchableOpacity>
      </View>
      {children}
    </View>
  );
};
