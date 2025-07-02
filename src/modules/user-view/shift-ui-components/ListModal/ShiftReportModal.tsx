import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  Pressable,
  Modal,
} from "react-native";
import { modalStyles } from "./ModalStyles";
import { ShiftService } from "../../../../services/firebase/firebase-shift";

type TaskCounts = {
  [key: string]: {
    count: number;
    time: number;
  };
};

const ShiftReportModal = ({
  reportModalVisible,
  setReportModalVisible,
  taskCounts,
  comments,
  setComments,
  modalShift,
  fetchShifts,
  setTaskCounts,
}: {
  reportModalVisible: boolean;
  setReportModalVisible: (visible: boolean) => void;
  taskCounts: TaskCounts;
  comments: string;
  setComments: (comments: string) => void;
  modalShift: any;
  fetchShifts: () => void;
  setTaskCounts: React.Dispatch<React.SetStateAction<TaskCounts>>;
}) => {
  const handleReportSubmit = async () => {
    if (modalShift) {
      try {
        const formattedTasks = Object.keys(taskCounts).reduce((acc, key) => {
          acc[key] = {
            count: taskCounts[key].count,
            time: taskCounts[key].time,
          };
          return acc;
        }, {} as { [key: string]: { count: number; time: number } });

        await ShiftService.updateShiftWithTasks(
          modalShift.id,
          formattedTasks,
          comments
        );

        fetchShifts();
        setReportModalVisible(false);
      } catch (error) {
        console.error("報告の保存に失敗しました:", error);
      }
    }
  };

  return (
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
          {Object.keys(taskCounts).map((task) => {
            const taskData = taskCounts[task] || { count: 0, time: 0 };
            return (
              <View key={task} style={modalStyles.taskRow}>
                <Text style={modalStyles.taskTitle}>{task}</Text>
                <View style={modalStyles.countControls}>
                  <TouchableOpacity
                    style={modalStyles.countButton}
                    onPress={() => {
                      setTaskCounts((prev) => {
                        const updatedTaskCounts = { ...prev };
                        updatedTaskCounts[task] = {
                          ...updatedTaskCounts[task],
                          count: Math.max(
                            (updatedTaskCounts[task]?.count || 0) - 1,
                            0
                          ),
                        };
                        return updatedTaskCounts;
                      });
                    }}
                  >
                    <Text style={modalStyles.taskText}>-</Text>
                  </TouchableOpacity>
                  <Text style={modalStyles.countText}>{taskData.count} 回</Text>
                  <TouchableOpacity
                    style={modalStyles.countButton}
                    onPress={() => {
                      setTaskCounts((prev) => {
                        const updatedTaskCounts = { ...prev };
                        updatedTaskCounts[task] = {
                          ...updatedTaskCounts[task],
                          count: (updatedTaskCounts[task]?.count || 0) + 1,
                        };
                        return updatedTaskCounts;
                      });
                    }}
                  >
                    <Text style={modalStyles.taskText}>+</Text>
                  </TouchableOpacity>
                </View>
                <View style={modalStyles.timeControls}>
                  <TouchableOpacity
                    style={modalStyles.countButton}
                    onPress={() => {
                      setTaskCounts((prev) => {
                        const updatedTaskCounts = { ...prev };
                        updatedTaskCounts[task] = {
                          ...updatedTaskCounts[task],
                          time: Math.max(
                            (updatedTaskCounts[task]?.time || 0) - 5,
                            0
                          ),
                        };
                        return updatedTaskCounts;
                      });
                    }}
                  >
                    <Text style={modalStyles.taskText}>-</Text>
                  </TouchableOpacity>
                  <Text style={modalStyles.valueText}>{taskData.time} 分</Text>
                  <TouchableOpacity
                    style={modalStyles.countButton}
                    onPress={() => {
                      setTaskCounts((prev) => {
                        const updatedTaskCounts = { ...prev };
                        updatedTaskCounts[task] = {
                          ...updatedTaskCounts[task],
                          time: (updatedTaskCounts[task]?.time || 0) + 5,
                        };
                        return updatedTaskCounts;
                      });
                    }}
                  >
                    <Text style={modalStyles.taskText}>+</Text>
                  </TouchableOpacity>
                </View>
              </View>
            );
          })}
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
            placeholderTextColor="#999"
            value={comments}
            onChangeText={setComments}
          />
          <TouchableOpacity
            style={modalStyles.modalButton}
            onPress={handleReportSubmit}
          >
            <Text style={modalStyles.modalButtonText}>報告を送信</Text>
          </TouchableOpacity>
        </View>
      </Pressable>
    </Modal>
  );
};

export default ShiftReportModal;
