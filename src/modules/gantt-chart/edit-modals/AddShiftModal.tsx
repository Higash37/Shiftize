import React from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import styles from "../gantt-chart-styles/GanttChartMonthEdit.styles";
import { generateTimeOptions } from "../gantt-chart-common/utils";

export type AddShiftModalProps = {
  visible: boolean;
  newShift: {
    userId: string;
    nickname: string;
    date: string;
    startTime: string;
    endTime: string;
    status: string;
  };
  users: Array<{ uid: string; nickname: string }>;
  loading: boolean;
  onChange: (field: string, value: string) => void;
  onClose: () => void;
  onAdd: () => void;
};

export const AddShiftModal: React.FC<AddShiftModalProps> = ({
  visible,
  newShift,
  users,
  loading,
  onChange,
  onClose,
  onAdd,
}) => (
  <Modal
    visible={visible}
    transparent
    animationType="fade"
    onRequestClose={onClose}
  >
    <View style={styles.modalOverlay}>
      <View style={styles.modalContent}>
        <Text style={styles.modalTitle}>新規シフト追加</Text>
        <Text style={styles.modalSubtitle}>{newShift.date}</Text>
        <View style={styles.formGroup}>
          <Text style={styles.formLabel}>スタッフ</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={newShift.userId}
              onValueChange={(itemValue) =>
                onChange("userId", itemValue.toString())
              }
              style={styles.picker}
            >
              <Picker.Item label="スタッフを選択" value="" />
              {users.map((user) => (
                <Picker.Item
                  key={user.uid}
                  label={user.nickname}
                  value={user.uid}
                />
              ))}
            </Picker>
          </View>
        </View>
        <View style={styles.timeInputContainer}>
          <View style={styles.timeInputGroup}>
            <Text style={styles.timeInputLabel}>開始時間</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={newShift.startTime}
                onValueChange={(itemValue) => onChange("startTime", itemValue)}
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
                selectedValue={newShift.endTime}
                onValueChange={(itemValue) => onChange("endTime", itemValue)}
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
            onPress={onAdd}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.saveButtonText}>追加</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </View>
  </Modal>
);
