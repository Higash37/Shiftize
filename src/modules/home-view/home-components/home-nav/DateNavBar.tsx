import React from "react";
import { View, Text, Pressable } from "react-native";
import { styles } from "../../home-styles/home-view-styles";

interface DateNavBarProps {
  isMobile: boolean;
  showFirst: boolean;
  onToggleHalf: () => void;
  onPrevDay: () => void;
  onNextDay: () => void;
  dateLabel: string;
  onOpenDatePicker: () => void;
}

export const DateNavBar: React.FC<DateNavBarProps> = ({
  isMobile,
  showFirst,
  onToggleHalf,
  onPrevDay,
  onNextDay,
  dateLabel,
  onOpenDatePicker,
}) => (
  <View
    style={[
      styles.datePickerRow,
      {
        alignItems: "center",
        flexDirection: "row",
        justifyContent: "space-between",
      },
    ]}
  >
    {/* 左端：前半/後半ボタンまたはスペーサー */}
    {isMobile ? (
      <View style={{ marginLeft: 30 }}>
        <Pressable
          onPress={onToggleHalf}
          style={{
            borderRadius: 16,
            borderWidth: 1,
            borderColor: "#90caf9",
            backgroundColor: "#e3f2fd",
            paddingHorizontal: 10,
            paddingVertical: 8,
          }}
        >
          <Text style={{ color: "#1976d2", fontWeight: "bold" }}>
            {showFirst ? "前半" : "後半"}
          </Text>
        </Pressable>
      </View>
    ) : (
      // PC/タブレット用：左側のスペーサー（バランス用）
      <View style={{ width: 80 }} />
    )}
    {/* 中央：年月ピッカー＋日付ナビ */}
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        flex: 1,
        justifyContent: "center",
      }}
    >
      <Text style={styles.dateNavBtn} onPress={onPrevDay}>
        {"<"}
      </Text>
      <Pressable onPress={onOpenDatePicker}>
        <Text style={styles.dateLabel}>{dateLabel}</Text>
      </Pressable>
      <Text style={styles.dateNavBtn} onPress={onNextDay}>
        {">"}
      </Text>
    </View>
    {/* 右端スペース調整用 */}
    <View style={{ width: 80 }} />
  </View>
);
