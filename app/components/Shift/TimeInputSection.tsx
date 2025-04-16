// src/components/Shift/TimeInputSection.tsx
import React, { useState } from "react";
import {
  View,
  StyleSheet,
  Text,
  Modal,
  TouchableOpacity,
  Platform,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import { colors } from "../../constants/theme";
import { getPlatformShadow } from "@/utils/time";

export type TimeSlot = {
  start: string;
  end: string;
};

interface TimeInputSectionProps {
  value: TimeSlot[];
  onChange: (newValue: TimeSlot[]) => void;
}

const generateTimeOptions = () => {
  const options = [];
  for (let hour = 9; hour <= 22; hour++) {
    for (let minute = 0; minute < 60; minute += 30) {
      const timeString = `${String(hour).padStart(2, "0")}:${String(
        minute
      ).padStart(2, "0")}`;
      options.push(timeString);
    }
  }
  return options;
};

const TimeInputSection: React.FC<TimeInputSectionProps> = ({
  value,
  onChange,
}) => {
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);
  const timeOptions = generateTimeOptions();

  const handleTimeChange = (type: "start" | "end", selectedTime: string) => {
    const newTimeSlots = [...value];
    if (newTimeSlots.length === 0) {
      newTimeSlots.push({ start: "", end: "" });
    }
    newTimeSlots[0][type] = selectedTime;
    onChange(newTimeSlots);
  };

  const formatTime = (time: string) => {
    return time || "時間を選択";
  };

  const renderPicker = (
    type: "start" | "end",
    visible: boolean,
    setVisible: (visible: boolean) => void
  ) => {
    const currentValue = value[0]?.[type] || timeOptions[0];

    if (!visible) return null;

    return (
      <View style={styles.pickerContainer}>
        <View style={styles.pickerHeader}>
          <TouchableOpacity onPress={() => setVisible(false)}>
            <Text style={styles.pickerCancelText}>キャンセル</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => {
              if (!value[0]?.[type]) {
                handleTimeChange(type, timeOptions[0]);
              }
              setVisible(false);
            }}
          >
            <Text style={styles.pickerDoneText}>完了</Text>
          </TouchableOpacity>
        </View>
        <Picker
          selectedValue={currentValue}
          onValueChange={(itemValue) => handleTimeChange(type, itemValue)}
          style={styles.picker}
        >
          {timeOptions.map((time) => (
            <Picker.Item key={time} label={time} value={time} />
          ))}
        </Picker>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>時間帯</Text>
      <View style={styles.timeContainer}>
        <View style={styles.timeInput}>
          <Text style={styles.timeLabel}>開始時間</Text>
          <TouchableOpacity
            style={styles.timeButton}
            onPress={() => setShowStartPicker(true)}
          >
            <Text style={styles.timeButtonText}>
              {formatTime(value[0]?.start)}
            </Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.separator}>〜</Text>
        <View style={styles.timeInput}>
          <Text style={styles.timeLabel}>終了時間</Text>
          <TouchableOpacity
            style={styles.timeButton}
            onPress={() => setShowEndPicker(true)}
          >
            <Text style={styles.timeButtonText}>
              {formatTime(value[0]?.end)}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {renderPicker("start", showStartPicker, setShowStartPicker)}
      {renderPicker("end", showEndPicker, setShowEndPicker)}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 8,
    color: colors.text.primary,
  },
  timeContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  timeInput: {
    flex: 1,
  },
  timeLabel: {
    fontSize: 14,
    color: colors.text.secondary,
    marginBottom: 4,
  },
  separator: {
    marginHorizontal: 8,
    color: colors.text.secondary,
  },
  timeButton: {
    backgroundColor: colors.surface,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  timeButtonText: {
    color: colors.text.primary,
    fontSize: 16,
    textAlign: "center",
  },
  pickerContainer: {
    backgroundColor: colors.background,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    ...getPlatformShadow(4),
  },
  pickerHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  pickerCancelText: {
    color: colors.text.secondary,
    fontSize: 16,
  },
  pickerDoneText: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: "bold",
  },
  picker: {
    height: 216,
  },
});

export default TimeInputSection;
