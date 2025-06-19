import React from "react";
import { View, Text, TouchableOpacity, Pressable, Modal } from "react-native";
import { modalStyles } from "./ModalStyles";

const ShiftModal = ({
  isModalVisible,
  setModalVisible,
  handleReportShift,
  handleEditShift,
}: any) => {
  return (
    <Modal
      visible={isModalVisible}
      transparent={true}
      animationType="fade"
      onRequestClose={() => setModalVisible(false)}
    >
      <Pressable
        style={modalStyles.modalOverlay}
        onPress={() => setModalVisible(false)}
      >
        <View style={modalStyles.modalContent}>
          <Text style={modalStyles.modalTitle}>シフト操作</Text>
          <TouchableOpacity
            style={modalStyles.modalButton}
            onPress={handleReportShift}
          >
            <Text style={modalStyles.modalButtonText}>シフト報告をする</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={modalStyles.modalButton}
            onPress={handleEditShift}
          >
            <Text style={modalStyles.modalButtonText}>シフト変更をする</Text>
          </TouchableOpacity>
        </View>
      </Pressable>
    </Modal>
  );
};

export default ShiftModal;
