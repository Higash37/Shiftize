import React from "react";
import { Modal, View, Text, TouchableOpacity } from "react-native";
import { Picker } from "@react-native-picker/picker";
import styles from "../gantt-chart-styles/GanttChartMonthEdit.styles";
import { generateTimeOptions } from "../gantt-chart-common/utils";

export type ClassTimeModalProps = {
  visible: boolean;
  editingShift: { nickname: string } | null;
  classTimeInput: { start: string; end: string };
  onChange: (field: "start" | "end", value: string) => void;
  onClose: () => void;
  onSave: () => void;
};

export const ClassTimeModal: React.FC<ClassTimeModalProps> = ({
  visible,
  editingShift,
  classTimeInput,
  onChange,
  onClose,
  onSave,
}) => {
  if (!editingShift) return null;
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>授業時間を設定</Text>
          <Text style={styles.modalSubtitle}>{editingShift.nickname}</Text>
          <View style={styles.timeInputContainer}>
            <View style={styles.timeInputGroup}>
              <Text style={styles.timeInputLabel}>開始時間</Text>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={classTimeInput.start}
                  onValueChange={(itemValue) => onChange("start", itemValue)}
                  style={styles.picker}
                >
                  {generateTimeOptions().map((time) => (
                    <Picker.Item key={time} label={time} value={time} />
                  ))}
                </Picker>
              </View>
            </View>
            <Text style={styles.timeInputSeparator}>～</Text>
            <View style={styles.timeInputGroup}>
              <Text style={styles.timeInputLabel}>終了時間</Text>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={classTimeInput.end}
                  onValueChange={(itemValue) => onChange("end", itemValue)}
                  style={styles.picker}
                >
                  {generateTimeOptions().map((time) => (
                    <Picker.Item key={time} label={time} value={time} />
                  ))}
                </Picker>
              </View>
            </View>
          </View>
          <View style={styles.modalButtons}>
            <TouchableOpacity
              style={[styles.modalButton, styles.cancelButton]}
              onPress={onClose}
            >
              <Text style={styles.cancelButtonText}>キャンセル</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modalButton, styles.saveButton]}
              onPress={onSave}
            >
              <Text style={styles.saveButtonText}>保存</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};
