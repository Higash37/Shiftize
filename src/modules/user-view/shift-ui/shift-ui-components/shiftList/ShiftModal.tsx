import React, { useEffect, useState } from "react";
import {
  Modal,
  Pressable,
  View,
  Text,
  TouchableOpacity,
  TextInput,
} from "react-native";
import { modalStyles } from "./styles";
import { getTasks } from "@/services/firebase/firebase-task";

type ShiftModalProps = {
  isModalVisible: boolean;
  setModalVisible: (visible: boolean) => void;
  modalShift: any; // Replace 'any' with the correct type if known
  handleReportShift: () => void;
  handleEditShift: () => void;
  reportModalVisible: boolean;
  setReportModalVisible: (visible: boolean) => void;
  taskCounts: { [task: string]: number };
  setTaskCounts: React.Dispatch<
    React.SetStateAction<{ [task: string]: number }>
  >;
  comments: string;
  setComments: (comments: string) => void;
};

export const ShiftModal: React.FC<ShiftModalProps> = ({
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
  const [firebaseTasks, setFirebaseTasks] = useState<string[]>([]);

  useEffect(() => {
    if (reportModalVisible) {
      const fetchTasks = async () => {
        const tasks = await getTasks();
        setFirebaseTasks(tasks.map((task) => task.title));
      };
      fetchTasks();
    }
  }, [reportModalVisible]);

  return (
    <>
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
            {firebaseTasks.map((task) => (
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
