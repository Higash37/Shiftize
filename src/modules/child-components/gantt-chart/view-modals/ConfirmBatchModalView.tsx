import React from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";

interface ConfirmBatchModalViewProps {
  visible: boolean;
  title: string;
  description: string;
  isLoading: boolean;
  styles: any;
  onCancel: () => void;
  onConfirm: () => void;
}

export const ConfirmBatchModalView: React.FC<ConfirmBatchModalViewProps> = ({
  visible,
  title,
  description,
  isLoading,
  styles,
  onCancel,
  onConfirm,
}) => (
  <Modal
    visible={visible}
    transparent
    animationType="fade"
    onRequestClose={onCancel}
  >
    <TouchableOpacity
      activeOpacity={1}
      style={styles.modalOverlay}
      onPress={onCancel}
    >
      <TouchableOpacity
        activeOpacity={1}
        style={styles.modalContent}
        onPress={(e) => e.stopPropagation()}
      >
        <Text style={styles.modalTitle}>{title}</Text>
        <Text style={styles.modalSubtitle}>{description}</Text>
        <View
          style={{
            flexDirection: "row",
            justifyContent: "flex-end",
            marginTop: 24,
          }}
        >
          <TouchableOpacity
            style={[
              styles.modalButton,
              styles.cancelButton,
              { marginRight: 8 },
            ]}
            onPress={onCancel}
            disabled={isLoading}
          >
            <Text style={styles.cancelButtonText}>キャンセル</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.modalButton, styles.saveButton]}
            onPress={onConfirm}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.saveButtonText}>はい</Text>
            )}
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </TouchableOpacity>
  </Modal>
);

export default ConfirmBatchModalView;
