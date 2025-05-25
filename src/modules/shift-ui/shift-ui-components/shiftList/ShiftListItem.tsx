import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from "react-native";
import { AntDesign } from "@expo/vector-icons";
import { colors } from "@/common/common-theme/ThemeColors";
import { format } from "date-fns";
import { ja } from "date-fns/locale";
import { getPlatformShadow } from "@/common/common-utils/util-style/StyleGenerator";
import { ShiftStatus } from "@/common/common-models/model-shift/shiftTypes";

// レスポンシブデザイン用の定数
const { width: SCREEN_WIDTH } = Dimensions.get("window");
const IS_SMALL_DEVICE = SCREEN_WIDTH < 375;
const IS_TABLET = SCREEN_WIDTH > 768;

interface Shift {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  status: ShiftStatus;
  classes?: any[];
  userId: string;
}

interface ShiftListItemProps {
  shift: Shift;
  isSelected: boolean;
  selectedDate: string;
  onPress: () => void;
  onDetailsPress: () => void;
  children?: React.ReactNode;
}

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
                    styles.staffLabel,
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

const styles = StyleSheet.create({
  shiftItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: IS_SMALL_DEVICE ? 8 : 12,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    borderRadius: 8,
    marginBottom: 8,
    width: "100%",
    maxWidth: IS_TABLET ? 600 : "95%",
    ...getPlatformShadow(2),
  },
  shiftContent: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  textContainer: {
    flex: 1,
  },
  icon: {
    marginRight: 8,
  },
  shiftInfoContainer: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
  },
  dateContainer: {
    width: IS_SMALL_DEVICE ? 60 : 80,
    marginRight: 8,
  },
  dateText: {
    fontSize: IS_SMALL_DEVICE ? 14 : 16,
    fontWeight: "bold",
    color: colors.text.primary,
  },
  statusContainer: {
    width: IS_SMALL_DEVICE ? 80 : 90,
    marginRight: 8,
  },
  timeText: {
    fontSize: IS_SMALL_DEVICE ? 12 : 14,
    color: colors.text.primary,
    flex: 1,
  },
  smallTimeText: {
    fontSize: 12,
  },
  staffLabel: {
    color: colors.primary,
    backgroundColor: colors.primary + "20",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    fontSize: IS_SMALL_DEVICE ? 12 : 14,
    textAlign: "center",
    width: "100%", // 親のステータスコンテナに合わせて幅一杯に
    overflow: "hidden",
  },
  detailsButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  detailsText: {
    fontSize: IS_SMALL_DEVICE ? 12 : 14,
    color: colors.text.secondary,
  },
  detailsIcon: {
    marginLeft: 4,
  },
  selectedShiftItem: {
    backgroundColor: colors.selected,
  },
});
