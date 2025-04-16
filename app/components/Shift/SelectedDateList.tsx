// src/components/Shift/SelectedDateList.tsx
import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";

interface Props {
  selectedDates: string[];
  onRemove: (date: string) => void;
}

const formatDateWithWeekday = (dateStr: string): string => {
  const date = new Date(dateStr);
  const options: Intl.DateTimeFormatOptions = {
    month: "long",
    day: "numeric",
    weekday: "short",
  };
  return date.toLocaleDateString("ja-JP", options);
};

export default function SelectedDateList({ selectedDates, onRemove }: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>📋 選択済み日付</Text>
      {selectedDates.length === 0 && (
        <Text style={styles.noneText}>まだ日付が選択されていません</Text>
      )}
      {selectedDates.map((date) => (
        <View key={date} style={styles.item}>
          <Text style={styles.dateText}>{formatDateWithWeekday(date)}</Text>
          <TouchableOpacity onPress={() => onRemove(date)}>
            <Text style={styles.removeText}>選択を解除</Text>
          </TouchableOpacity>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 16,
    elevation: 2,
  },
  title: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 12,
    color: "#003366",
  },
  item: {
    backgroundColor: "#F2F4F8",
    padding: 12,
    borderRadius: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  dateText: {
    fontSize: 15,
    fontWeight: "500",
  },
  removeText: {
    color: "#007AFF",
    fontWeight: "bold",
  },
  noneText: {
    color: "#999",
    fontStyle: "italic",
  },
});
