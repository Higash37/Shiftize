import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from "react-native";
import { AntDesign } from "@expo/vector-icons";
import { colors } from "@/common/common-theme/ThemeColors";
import { format } from "date-fns";
import { ja } from "date-fns/locale";
import { Shift } from "@/features/shift/types/shift";
import { ShiftDetails } from "@/features/shift/components/Shift/ShiftDetails";
import { getStatusColor, getStatusText } from "./utils";
import { ShiftListProps } from "./types";

export const ShiftList: React.FC<ShiftListProps> = ({
  shifts,
  selectedDate,
}) => {
  const [expandedShifts, setExpandedShifts] = useState<{
    [key: string]: boolean;
  }>({});

  const toggleShiftDetails = (shiftId: string) => {
    setExpandedShifts((prev) => ({
      ...prev,
      [shiftId]: !prev[shiftId],
    }));
  };

  const filteredShifts = shifts.filter((shift) => shift.date === selectedDate);

  if (filteredShifts.length === 0) {
    return null;
  }

  return (
    <ScrollView style={styles.shiftList}>
      {filteredShifts.map((shift) => {
        const borderColor = getStatusColor(shift.status);
        return (
          <View key={shift.id}>
            <TouchableOpacity
              style={[styles.shiftHeader, { borderColor: borderColor }]}
              onPress={() => toggleShiftDetails(shift.id)}
            >
              <View style={styles.shiftHeaderContent}>
                <AntDesign name="user" size={20} color={borderColor} />
                <Text style={styles.dateText}>
                  {format(new Date(shift.date), "d日(E)", {
                    locale: ja,
                  })}
                </Text>
                <Text style={[styles.statusText, { color: borderColor }]}>
                  {getStatusText(shift.status)}
                </Text>
                <Text style={styles.shiftTime}>
                  {shift.startTime} ~ {shift.endTime}
                </Text>
              </View>
              <AntDesign
                name={expandedShifts[shift.id] ? "up" : "down"}
                size={16}
                color={colors.text.primary}
              />
            </TouchableOpacity>
            <ShiftDetails
              shift={shift}
              isOpen={expandedShifts[shift.id] || false}
            />
          </View>
        );
      })}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  shiftList: {
    width: "100%",
    padding: 10,
  },
  shiftHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 12,
    backgroundColor: colors.surface,
    borderRadius: 8,
    marginBottom: 1,
    borderWidth: 2,
  },
  shiftHeaderContent: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "bold",
  },
  shiftTime: {
    fontSize: 14,
    fontWeight: "bold",
    color: colors.text.primary,
  },
  dateText: {
    fontSize: 16,
    fontWeight: "bold",
    color: colors.text.primary,
    marginLeft: 8,
  },
  staffLabel: {
    fontSize: 14,
    color: colors.text.secondary,
    marginLeft: 8,
  },
});
