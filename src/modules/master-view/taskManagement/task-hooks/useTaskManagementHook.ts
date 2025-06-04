import { useEffect, useState } from "react";
import { getTasks } from "../../../../services/firebase/firebase-task";
import { TaskService } from "../../../../services/firebase/firebase-task"; // TaskServiceをインポート

interface Task {
  id: string;
  title: string;
  frequency: string;
  timePerTask: string;
  description: string;
}

const useTaskManagementHook = () => {
  const [tasks, setTasks] = useState<Task[]>([]);

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const fetchedTasks = (await getTasks()).map((task) => ({
          id: task.id,
          title: task.title || "",
          frequency: task.frequency || "",
          timePerTask: task.timePerTask || "",
          description: task.description || "",
        }));
        setTasks(fetchedTasks);
      } catch (error) {
        console.error("タスクの取得中にエラーが発生しました: ", error);
      }
    };

    fetchTasks();
  }, []);

  const addTask = async (newTask: Task) => {
    try {
      const taskId = await TaskService.addTask(newTask);
      setTasks([...tasks, { ...newTask, id: taskId }]);
    } catch (error) {
      console.error("タスクの追加中にエラーが発生しました: ", error);
    }
  };

  const editTask = async (updatedTask: Task) => {
    try {
      await TaskService.updateTask(updatedTask.id, updatedTask);
      setTasks(
        tasks.map((task) => (task.id === updatedTask.id ? updatedTask : task))
      );
    } catch (error) {
      console.error("タスクの更新中にエラーが発生しました: ", error);
    }
  };

  const completeTask = (taskId: string) => {
    setTasks(
      tasks.map((task) =>
        task.id === taskId ? { ...task, status: "completed" } : task
      )
    );
  };

  return { tasks, addTask, editTask, completeTask };
};

export default useTaskManagementHook;
