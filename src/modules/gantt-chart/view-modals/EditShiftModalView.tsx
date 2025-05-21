import React from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { Picker } from "@react-native-picker/picker";

interface EditShiftModalViewProps {
  visible: boolean;
  newShiftData: any;
  users: string[];
  timeOptions: string[];
  statusConfigs: any[];
  isLoading: boolean;
  styles: any;
  onChange: (field: string, value: any) => void;
  onClose: () => void;
  onSave: () => void;
}

export const EditShiftModalView: React.FC<EditShiftModalViewProps> = ({
  visible,
  newShiftData,
  users,
  timeOptions,
  statusConfigs,
  isLoading,
  styles,
  onChange,
  onClose,
  onSave,
}) => (
  <Modal
    visible={visible}
    transparent
    animationType="fade"
    onRequestClose={onClose}
  >
    <View style={styles.modalOverlay}>
      <View style={styles.modalContent}>
        <Text style={styles.modalTitle}>シフト編集</Text>
        <Text style={styles.modalSubtitle}>{newShiftData.date}</Text>

        <View style={styles.formGroup}>
          <Text style={styles.formLabel}>ユーザー</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={newShiftData.userId}
              onValueChange={(itemValue) => onChange("userId", itemValue)}
              style={styles.picker}
            >
              <Picker.Item label="ユーザーを選択" value="" />
              {users.map((user) => (
                <Picker.Item key={user} label={user} value={user} />
              ))}
            </Picker>
          </View>
        </View>

        <View style={styles.timeInputContainer}>
          <View style={styles.timeInputGroup}>
            <Text style={styles.timeInputLabel}>開始時間</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={newShiftData.startTime}
                onValueChange={(itemValue) => onChange("startTime", itemValue)}
                style={styles.picker}
              >
                {timeOptions.map((time) => (
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
                selectedValue={newShiftData.endTime}
                onValueChange={(itemValue) => onChange("endTime", itemValue)}
                style={styles.picker}
              >
                {timeOptions.map((time) => (
                  <Picker.Item key={time} label={time} value={time} />
                ))}
              </Picker>
            </View>
          </View>
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.formLabel}>ステータス</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={newShiftData.status}
              onValueChange={(itemValue) => onChange("status", itemValue)}
              style={styles.picker}
            >
              {statusConfigs.map((config) => (
                <Picker.Item
                  key={config.status}
                  label={config.label}
                  value={config.status}
                />
              ))}
            </Picker>
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
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.saveButtonText}>保存</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </View>
  </Modal>
);
