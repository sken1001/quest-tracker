"use client";

import { useState, useEffect } from "react";
import TaskChart from "@/components/TaskChart";

type Task = {
  id: number;
  title: string;
  isCompleted: boolean;
};

export default function HomePage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTaskTitle, setNewTaskTitle] = useState("");

  useEffect(() => {
    const savedTasks = localStorage.getItem("tasks");
    if (savedTasks) {
      setTasks(JSON.parse(savedTasks));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("tasks", JSON.stringify(tasks));
  }, [tasks]);

  const handleAddTask = () => {
    if (newTaskTitle.trim() === "") return;

    const newTask: Task = {
      id: Date.now(),
      title: newTaskTitle,
      isCompleted: false,
    };

    setTasks([...tasks, newTask]);
    setNewTaskTitle("");
  };

  const handleToggleComplete = (id: number) => {
    setTasks(
      tasks.map((task) =>
        task.id === id ? { ...task, isCompleted: !task.isCompleted } : task
      )
    );
  };

  const handleDeleteTask = (id: number) => {
    setTasks(tasks.filter((task) => task.id !== id));
  };

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((task) => task.isCompleted).length;

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">繰り返しタスク管理アプリ</h1>

      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-2">達成状況</h2>
        <TaskChart totalTasks={totalTasks} completedTasks={completedTasks} />
      </div>

      <div className="flex gap-2 mb-4">
        <input
          type="text"
          value={newTaskTitle}
          onChange={(e) => setNewTaskTitle(e.target.value)}
          className="border rounded px-2 py-1 text-white bg-gray-700"
          placeholder="新しいタスクを入力"
        />
        <button
          onClick={handleAddTask}
          className="bg-blue-500 text-white px-4 py-1 rounded"
        >
          追加
        </button>
      </div>

      <ul>
        {tasks.map((task) => (
          <li key={task.id} className="flex items-center justify-between mb-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={task.isCompleted}
                onChange={() => handleToggleComplete(task.id)}
              />
              <span
                className={task.isCompleted ? "line-through text-gray-500" : ""}
              >
                {task.title}
              </span>
            </label>
            <button
              onClick={() => handleDeleteTask(task.id)}
              className="bg-red-500 text-white px-2 py-0.5 text-xs rounded"
            >
              削除
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
