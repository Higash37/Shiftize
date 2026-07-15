

import React, { useState, useMemo, memo } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";

import { AntDesign } from "@expo/vector-icons";
import { colors } from "@/common/common-theme/ThemeColors";
import { format } from "date-fns";
import { ja } from "date-fns/locale";
import {
  getStatusColor,
  getStatusText,
} from "../calendar-utils/calendar.utils";
import { ShiftListProps } from "./ShiftList.types";
import { ShiftItemProps } from "./ShiftList.types";

import { getPlatformShadow } from "@/common/common-utils/util-style/StyleHelpers";

import { ShiftDetailsAdapter } from "./ShiftListAdapter";
import CustomScrollView from "@/common/common-ui/ui-scroll/ScrollViewComponent";

const ShiftItem = memo(({ shift, isExpanded, onToggle }: ShiftItemProps) => {

  const borderColor = getStatusColor(shift.status);

  return (
    <View key={shift.id} style={styles.shiftItemContainer}>
      {}
      <TouchableOpacity

        style={[styles.shiftHeader, { borderColor }]}
        onPress={onToggle}
        activeOpacity={0.7}
      >
        <View style={styles.shiftHeaderContent}>
          {}
          <AntDesign name="user" size={16} color={borderColor} />
          {}
          <Text style={styles.dateText} numberOfLines={1}>
            {format(new Date(shift.date), "d日(E)", {
              locale: ja,
            })}
          </Text>
          {}
          <Text
            style={[styles.statusText, { color: borderColor }]}
            numberOfLines={1}
          >
            {getStatusText(shift.status)}
          </Text>
          {}
          <Text style={styles.shiftTime} numberOfLines={1}>
            {shift.startTime} ~ {shift.endTime}
          </Text>
        </View>
        {}
        {}
        <AntDesign
          name={isExpanded ? "up" : "down"}
          size={14}
          color={colors.text.primary}
          style={styles.expandIcon}
        />
      </TouchableOpacity>
      {}
      <ShiftDetailsAdapter shift={shift} isOpen={isExpanded} />
    </View>
  );
});

export const ShiftList: React.FC<ShiftListProps> = ({
  shifts,
  selectedDate,
}) => {

  const [expandedShifts, setExpandedShifts] = useState<{
    [key: string]: boolean;
  }>({});

  const filteredShifts = useMemo(
    () => shifts.filter((shift) => shift.date === selectedDate),
    [shifts, selectedDate]
  );

  const toggleShiftDetails = (shiftId: string) => {
    setExpandedShifts((prev) => ({
      ...prev,
      [shiftId]: !prev[shiftId],
    }));
  };

  if (filteredShifts.length === 0) {
    return null;
  }

  return (
    <CustomScrollView style={styles.shiftList}>
      {filteredShifts.map((shift) => (
        <ShiftItem
          key={shift.id}
          shift={shift}

          isExpanded={expandedShifts[shift.id] || false}

          onToggle={() => toggleShiftDetails(shift.id)}
        />
      ))}
    </CustomScrollView>
  );
};

const styles = StyleSheet.create({

  shiftList: {
    width: "70%",
    padding: 8,
    alignSelf: "center",
  },

  shiftItemContainer: {
    marginBottom: 8,
    width: "70%",
  },

  expandIcon: {
    marginLeft: 4,
  },

  shiftHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 8,
    backgroundColor: colors.surface,
    borderRadius: 6,
    marginBottom: 6,
    marginHorizontal: 3,
    borderWidth: 1,
    ...getPlatformShadow(1),
  },

  shiftHeaderContent: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 8,
  },

  statusText: {
    fontSize: 10,
    fontWeight: "bold",
  },

  shiftTime: {
    fontSize: 11,
    fontWeight: "bold",
    color: colors.text.primary,
    flexShrink: 1,
  },

  dateText: {
    fontSize: 12,
    fontWeight: "bold",
    color: colors.text.primary,
    marginLeft: 3,
  },

  userLabel: {
    fontSize: 14,
    color: colors.text.secondary,
    marginLeft: 8,
  },
});
