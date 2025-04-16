import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  ScrollView,
  Modal,
  Pressable,
} from "react-native";
import { colors } from "../../constants/theme";

interface TimeSelectProps {
  label?: string;
  value?: string;
  onChange?: (time: string) => void;
  startTime?: string;
  endTime?: string;
  onStartTimeChange?: (time: string) => void;
  onEndTimeChange?: (time: string) => void;
  zIndex?: number;
}

const generateTimeOptions = () => {
  const options = new Set<string>();
  for (let hour = 9; hour <= 22; hour++) {
    for (let minute = 0; minute < 60; minute += 30) {
      const timeString = `${String(hour).padStart(2, "0")}:${String(
        minute
      ).padStart(2, "0")}`;
      options.add(timeString);
    }
  }
  return Array.from(options).sort();
};

const TimeSelect: React.FC<TimeSelectProps> = ({
  label,
  value,
  onChange,
  startTime,
  endTime,
  onStartTimeChange,
  onEndTimeChange,
  zIndex = 1,
}) => {
  const [showStartOptions, setShowStartOptions] = useState(false);
  const [showEndOptions, setShowEndOptions] = useState(false);
  const timeOptions = generateTimeOptions();

  const handleStartSelect = (time: string) => {
    if (onStartTimeChange) {
      onStartTimeChange(time);
    }
    setShowStartOptions(false);
  };

  const handleEndSelect = (time: string) => {
    if (onEndTimeChange) {
      onEndTimeChange(time);
    }
    setShowEndOptions(false);
  };

  const handleSelect = (time: string) => {
    if (onChange) {
      onChange(time);
    }
    setShowStartOptions(false);
    setShowEndOptions(false);
  };

  if (startTime !== undefined && endTime !== undefined) {
    return (
      <View style={[styles.container, { zIndex }]}>
        <View style={styles.timeContainer}>
          <View style={styles.timeSelect}>
            <Text style={styles.label}>開始時間</Text>
            <TouchableOpacity
              style={styles.button}
              onPress={() => setShowStartOptions(true)}
            >
              <Text style={styles.buttonText}>{startTime || "時間を選択"}</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.timeSelect}>
            <Text style={styles.label}>終了時間</Text>
            <TouchableOpacity
              style={styles.button}
              onPress={() => setShowEndOptions(true)}
            >
              <Text style={styles.buttonText}>{endTime || "時間を選択"}</Text>
            </TouchableOpacity>
          </View>
        </View>

        <Modal
          visible={showStartOptions}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setShowStartOptions(false)}
        >
          <Pressable
            style={styles.modalOverlay}
            onPress={() => setShowStartOptions(false)}
          >
            <View style={styles.modalContent}>
              <Pressable>
                <View style={styles.optionsContainer}>
                  <ScrollView
                    style={styles.scrollContainer}
                    showsVerticalScrollIndicator={true}
                  >
                    {timeOptions.map((time) => (
                      <TouchableOpacity
                        key={time}
                        style={[
                          styles.optionItem,
                          startTime === time && styles.selectedOption,
                        ]}
                        onPress={() => handleStartSelect(time)}
                      >
                        <Text
                          style={[
                            styles.optionText,
                            startTime === time && styles.selectedOptionText,
                          ]}
                        >
                          {time}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              </Pressable>
            </View>
          </Pressable>
        </Modal>

        <Modal
          visible={showEndOptions}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setShowEndOptions(false)}
        >
          <Pressable
            style={styles.modalOverlay}
            onPress={() => setShowEndOptions(false)}
          >
            <View style={styles.modalContent}>
              <Pressable>
                <View style={styles.optionsContainer}>
                  <ScrollView
                    style={styles.scrollContainer}
                    showsVerticalScrollIndicator={true}
                  >
                    {timeOptions.map((time) => (
                      <TouchableOpacity
                        key={time}
                        style={[
                          styles.optionItem,
                          endTime === time && styles.selectedOption,
                        ]}
                        onPress={() => handleEndSelect(time)}
                      >
                        <Text
                          style={[
                            styles.optionText,
                            endTime === time && styles.selectedOptionText,
                          ]}
                        >
                          {time}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              </Pressable>
            </View>
          </Pressable>
        </Modal>
      </View>
    );
  }

  return (
    <View style={[styles.container, { zIndex }]}>
      <Text style={styles.label}>{label}</Text>
      <TouchableOpacity
        style={styles.button}
        onPress={() => setShowStartOptions(true)}
      >
        <Text style={styles.buttonText}>{value || "時間を選択"}</Text>
      </TouchableOpacity>

      <Modal
        visible={showStartOptions}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowStartOptions(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setShowStartOptions(false)}
        >
          <View style={styles.modalContent}>
            <Pressable>
              <View style={styles.optionsContainer}>
                <ScrollView
                  style={styles.scrollContainer}
                  showsVerticalScrollIndicator={true}
                >
                  {timeOptions.map((time) => (
                    <TouchableOpacity
                      key={time}
                      style={[
                        styles.optionItem,
                        value === time && styles.selectedOption,
                      ]}
                      onPress={() => handleSelect(time)}
                    >
                      <Text
                        style={[
                          styles.optionText,
                          value === time && styles.selectedOptionText,
                        ]}
                      >
                        {time}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            </Pressable>
          </View>
        </Pressable>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  timeContainer: {
    flexDirection: "row",
    gap: 16,
  },
  timeSelect: {
    flex: 1,
  },
  label: {
    fontSize: 14,
    color: colors.text.secondary,
    marginBottom: 8,
  },
  button: {
    padding: 12,
    backgroundColor: colors.surface,
    borderRadius: 8,
  },
  buttonText: {
    fontSize: 16,
    color: colors.text.primary,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: "80%",
    maxHeight: "80%",
    backgroundColor: colors.background,
    borderRadius: 8,
    padding: 16,
  },
  optionsContainer: {
    maxHeight: 300,
  },
  scrollContainer: {
    maxHeight: 300,
  },
  optionItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  selectedOption: {
    backgroundColor: colors.primary,
  },
  optionText: {
    fontSize: 16,
    color: colors.text.primary,
  },
  selectedOptionText: {
    color: colors.text.white,
  },
});

export default TimeSelect;
