import { useEffect, useState } from "react";
import { getTasks } from "../../../../services/firebase/firebase-task";

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
        console.log("Fetched tasks:", fetchedTasks);
        setTasks(fetchedTasks);
      } catch (error) {
        console.error("タスクの取得中にエラーが発生しました: ", error);
      }
    };

    fetchTasks();
  }, []);

  const addTask = (newTask: Task) => {
    setTasks([...tasks, newTask]);
  };

  const editTask = (updatedTask: Task) => {
    setTasks(
      tasks.map((task) => (task.id === updatedTask.id ? updatedTask : task))
    );
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
