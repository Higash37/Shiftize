import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Button,
  TextInput,
  FlatList,
  StyleSheet,
} from "react-native";
import TaskList from "./TaskList";
import useTaskManagementHook from "./task-hooks/useTaskManagementHook";
import TaskManagementStyles from "./task-styles/TaskManagementStyles";
import { generateTaskId, formatTaskDescription } from "./task-utils/TaskUtils";
import { getTasks, deleteTask } from "../../../services/firebase/firebase-task";

interface Task {
  id: string;
  title: string;
  frequency: string;
  timePerTask: string;
  description: string;
}

const TaskManagementView: React.FC = () => {
  const {
    tasks: initialTasks,
    addTask,
    editTask,
    completeTask,
  } = useTaskManagementHook();

  const [tasks, setTasks] = useState<Task[]>([]); // 初期値を空配列に修正
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskFrequency, setNewTaskFrequency] = useState("");
  const [newTaskTimePerTask, setNewTaskTimePerTask] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const reloadTasks = async () => {
    const updatedTasks = await getTasks();
    setTasks(updatedTasks); // Firebaseから取得したタスクを正しく設定
  };

  useEffect(() => {
    reloadTasks(); // コンポーネントの初回レンダリング時にタスクをロード
  }, []);

  const handleAddTask = async () => {
    if (!newTaskTitle || !newTaskFrequency || !newTaskTimePerTask) {
      console.error("タスクの追加に必要なデータが不足しています。");
      return;
    }

    const newTask: Task = {
      id: generateTaskId(),
      title: newTaskTitle,
      frequency: newTaskFrequency,
      timePerTask: newTaskTimePerTask,
      description: "",
    };

    setIsSubmitting(true); // ボタンを無効化

    try {
      await addTask(newTask);
      setNewTaskTitle("");
      setNewTaskFrequency("");
      setNewTaskTimePerTask("");
      await reloadTasks(); // Firebase送信後に画面をリロード
    } catch (error) {
      console.error("タスクの追加中にエラーが発生しました: ", error);
    } finally {
      setIsSubmitting(false); // ボタンを再度有効化
    }
  };

  const handleEditTask = async (updatedTask: Task) => {
    await editTask(updatedTask);
    reloadTasks();
  };

  const handleDeleteTask = async (taskId: string) => {
    await deleteTask(taskId);
    reloadTasks();
  };

  return (
    <View style={TaskManagementStyles.container}>
      <Text style={TaskManagementStyles.title}>タスク管理</Text>
      <TaskList
        tasks={tasks}
        onAddTask={addTask}
        onEditTask={handleEditTask}
        handleDeleteTask={handleDeleteTask} // 削除処理を渡す
        reloadTasks={reloadTasks} // リロード処理を渡す
      />
    </View>
  );
};

export default TaskManagementView;
