import React from "react";
import {
  Modal,
  Pressable,
  View,
  Text,
  TouchableOpacity,
  TextInput,
} from "react-native";
import { modalStyles } from "./styles";

export const ShiftModal = ({
  isModalVisible,
  setModalVisible,
  modalShift,
  handleReportShift,
  handleEditShift,
  reportModalVisible,
  setReportModalVisible,
  taskCounts,
  setTaskCounts,
  comments,
  setComments,
}) => {
  return (
    <>
      {/* メインモーダル */}
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

      {/* 報告モーダル */}
      <Modal
        visible={reportModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setReportModalVisible(false)}
      >
        <Pressable
          style={modalStyles.modalOverlay}
          onPress={() => setReportModalVisible(false)}
        >
          <View style={modalStyles.modalContent}>
            <Text style={modalStyles.modalTitle}>シフト報告</Text>
            {Object.keys(taskCounts).map((task) => (
              <View
                key={task}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  marginVertical: 5,
                }}
              >
                <Text style={{ flex: 1 }}>{task}</Text>
                <TouchableOpacity
                  onPress={() =>
                    setTaskCounts((prev) => ({
                      ...prev,
                      [task]: Math.max((prev[task] || 0) - 1, 0),
                    }))
                  }
                >
                  <Text style={{ fontSize: 18, marginHorizontal: 10 }}>-</Text>
                </TouchableOpacity>
                <Text>{taskCounts[task] || 0} 分</Text>
                <TouchableOpacity
                  onPress={() =>
                    setTaskCounts((prev) => ({
                      ...prev,
                      [task]: (prev[task] || 0) + 1,
                    }))
                  }
                >
                  <Text style={{ fontSize: 18, marginHorizontal: 10 }}>+</Text>
                </TouchableOpacity>
              </View>
            ))}
            <TextInput
              style={{
                borderWidth: 1,
                borderColor: "#ccc",
                borderRadius: 5,
                padding: 10,
                marginVertical: 10,
                width: "100%",
              }}
              placeholder="コメントを入力してください"
              value={comments}
              onChangeText={setComments}
            />
            <TouchableOpacity
              style={modalStyles.modalButton}
              onPress={() => {
                console.log("報告内容:", { taskCounts, comments });
                setReportModalVisible(false);
              }}
            >
              <Text style={modalStyles.modalButtonText}>報告を送信</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>
    </>
  );
};
