import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import Box from "@/common/common-ui/ui-base/BaseBox/BoxComponent";
import TaskCardComponent from "./task-components/TaskCardComponent";
import ModalComponent from "./task-components/ModalComponent";
import TaskListStyles from "./task-styles/TaskListStyles";

interface Task {
  id: string;
  title: string;
  frequency: string;
  timePerTask: string;
  description: string;
}

interface TaskListProps {
  tasks: Task[];
  onEditTask: (updatedTask: Task) => void;
}

const TaskList: React.FC<TaskListProps> = ({ tasks, onEditTask }) => {
  const [isModalVisible, setModalVisible] = useState(false);
  const [newTask, setNewTask] = useState({
    title: "",
    frequency: "",
    timePerTask: "",
    description: "",
  });
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [customTime, setCustomTime] = useState("");
  const [customInterval, setCustomInterval] = useState("");

  const frequencyOptions = [
    "1分に1回",
    "5分に1回",
    "10分に1回",
    "20分に1回",
    "30分に1回",
    "60分に1回",
    "その他",
  ];

  const timeOptions = [
    "1分以内",
    "5分以内",
    "10分",
    "20分",
    "30分",
    "60分",
    "その他",
  ];

  const openModal = () => setModalVisible(true);
  const closeModal = () => setModalVisible(false);

  const addTask = () => {
    const timePerTask =
      newTask.timePerTask === "その他" ? customTime : newTask.timePerTask;
    const frequency =
      newTask.frequency === "その他" ? customInterval : newTask.frequency;
    onEditTask({
      id: Date.now().toString(),
      ...newTask,
      timePerTask,
      frequency,
    });
    setNewTask({
      title: "",
      frequency: "",
      timePerTask: "",
      description: "",
    });
    setCustomTime("");
    setCustomInterval("");
    closeModal();
  };

  const openEditModal = (task: Task) => {
    setEditingTask(task);
    setModalVisible(true);
  };

  const saveTaskEdits = () => {
    if (editingTask) {
      const timePerTask =
        editingTask.timePerTask === "その他"
          ? customTime
          : editingTask.timePerTask;
      const frequency =
        editingTask.frequency === "その他"
          ? customInterval
          : editingTask.frequency;
      onEditTask({ ...editingTask, timePerTask, frequency });
      setEditingTask(null);
      setCustomTime("");
      setCustomInterval("");
      closeModal();
    }
  };

  const renderItem = ({ item }: { item: Task }) => {
    console.log("Rendering TaskCardComponent with item:", item);
    return (
      <TaskCardComponent
        frequency={item.frequency}
        timePerTask={item.timePerTask}
        title={item.title}
        onPress={() => openEditModal(item)}
      />
    );
  };

  console.log("Rendering TaskList component");
  console.log("Received tasks in TaskList:", tasks);
  console.log("Modal visibility:", isModalVisible);

  return (
    <>
      <FlatList
        data={tasks}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContainer}
      />
      <TouchableOpacity style={styles.addButton} onPress={openModal}>
        <Text style={styles.addButtonText}>+</Text>
      </TouchableOpacity>

      <ModalComponent
        isVisible={isModalVisible}
        title={editingTask ? "タスクを編集" : "タスクを追加"}
        onClose={closeModal}
        onSave={editingTask ? saveTaskEdits : addTask}
      >
        <TextInput
          style={styles.input}
          placeholder="タスク名"
          value={editingTask?.title || newTask.title}
          onChangeText={(text) =>
            editingTask
              ? setEditingTask({ ...editingTask, title: text })
              : setNewTask({ ...newTask, title: text })
          }
        />
        <View>
          <Text>時間</Text>
          <Picker
            selectedValue={editingTask?.timePerTask || newTask.timePerTask}
            onValueChange={(value) =>
              editingTask
                ? setEditingTask({ ...editingTask, timePerTask: value })
                : setNewTask({ ...newTask, timePerTask: value })
            }
            style={styles.picker}
          >
            {timeOptions.map((option) => (
              <Picker.Item key={option} label={option} value={option} />
            ))}
          </Picker>
          {(editingTask?.timePerTask === "その他" ||
            newTask.timePerTask === "その他") && (
            <TextInput
              style={styles.customInput}
              placeholder="カスタム時間を入力"
              value={customTime}
              onChangeText={setCustomTime}
            />
          )}
        </View>
        <View>
          <Text>頻度</Text>
          <Picker
            selectedValue={editingTask?.frequency || newTask.frequency}
            onValueChange={(value) =>
              editingTask
                ? setEditingTask({ ...editingTask, frequency: value })
                : setNewTask({ ...newTask, frequency: value })
            }
            style={styles.picker}
          >
            {frequencyOptions.map((option) => (
              <Picker.Item key={option} label={option} value={option} />
            ))}
          </Picker>
          {(editingTask?.frequency === "その他" ||
            newTask.frequency === "その他") && (
            <TextInput
              style={styles.customInput}
              placeholder="カスタム頻度を入力"
              value={customInterval}
              onChangeText={setCustomInterval}
            />
          )}
        </View>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="記述"
          value={editingTask?.description || newTask.description}
          onChangeText={(text) =>
            editingTask
              ? setEditingTask({ ...editingTask, description: text })
              : setNewTask({ ...newTask, description: text })
          }
          multiline
        />
      </ModalComponent>
    </>
  );
};

const styles = TaskListStyles;

export default TaskList;
