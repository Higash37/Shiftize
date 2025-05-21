import React from "react";
import { Modal, View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import styles from "../gantt-chart-styles/GanttChartMonthEdit.styles";
import { ShiftStatusConfig } from "../gantt-chart-types/GanttChartTypes";

export type ActionModalProps = {
  visible: boolean;
  editingShift: { nickname: string; status: string } | null;
  statusConfigs: ShiftStatusConfig[];
  getStatusConfig: (status: string) => ShiftStatusConfig;
  onTimeEdit: () => void;
  onClassTime: () => void;
  onDelete: () => void;
  onChangeStatus: (status: string) => void;
  onClose: () => void;
};

export const ActionModal: React.FC<ActionModalProps> = ({
  visible,
  editingShift,
  statusConfigs,
  getStatusConfig,
  onTimeEdit,
  onClassTime,
  onDelete,
  onChangeStatus,
  onClose,
}) => {
  if (!editingShift) return null;
  const statusConfig = getStatusConfig(editingShift.status);
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>シフト操作</Text>
          <Text style={styles.modalSubtitle}>{editingShift.nickname}</Text>
          <Text style={[styles.statusLabel, { color: statusConfig.color }]}>
            現在のステータス: {statusConfig.label}
          </Text>
          <View style={styles.actionButtons}>
            <TouchableOpacity style={styles.actionButton} onPress={onTimeEdit}>
              <Ionicons name="time-outline" size={24} color="#4A90E2" />
              <Text style={styles.actionText}>時間変更</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton} onPress={onClassTime}>
              <Ionicons name="school-outline" size={24} color="#50C878" />
              <Text style={styles.actionText}>授業時間</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton} onPress={onDelete}>
              <Ionicons name="trash-outline" size={24} color="#FF4444" />
              <Text style={styles.actionText}>削除</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.statusButtons}>
            <Text style={styles.statusSectionTitle}>ステータス変更：</Text>
            <View style={styles.statusButtonsRow}>
              {statusConfigs.map(
                (config) =>
                  config.status !== editingShift.status && (
                    <TouchableOpacity
                      key={config.status}
                      style={[
                        styles.statusButton,
                        { backgroundColor: config.color },
                      ]}
                      onPress={() => onChangeStatus(config.status)}
                    >
                      <Text style={styles.statusButtonText}>
                        {config.label}
                      </Text>
                    </TouchableOpacity>
                  )
              )}
            </View>
          </View>
          <TouchableOpacity
            style={[styles.modalButton, styles.cancelButton, { marginTop: 12 }]}
            onPress={onClose}
          >
            <Text style={styles.cancelButtonText}>キャンセル</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};
