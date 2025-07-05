"use client";

import { useState, useEffect, useRef } from "react";
import TaskChart from "@/components/TaskChart";
import TaskList from "@/components/TaskList"; // ← 新しい部品をインポート

type TaskCycle = "daily" | "weekly" | "monthly";
type Task = {
  id: number;
  title: string;
  isCompleted: boolean;
  cycle: TaskCycle;
};

export default function HomePage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskCycle, setNewTaskCycle] = useState<TaskCycle>("daily");
  const fileInputRef = useRef<HTMLInputElement>(null);

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
      cycle: newTaskCycle,
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

  const handleResetTasks = (cycle: TaskCycle) => {
    setTasks(
      tasks.map((task) =>
        task.cycle === cycle ? { ...task, isCompleted: false } : task
      )
    );
  };

  const handleExportTasks = () => {
    if (tasks.length === 0) {
      alert("エクスポートするタスクがありません。");
      return;
    }
    const jsonString = JSON.stringify(tasks, null, 2);
    const blob = new Blob([jsonString], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "tasks.json";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImportTasks = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const importedTasks = JSON.parse(event.target?.result as string);
        if (Array.isArray(importedTasks)) {
          setTasks(importedTasks);
          alert("タスクをインポートしました。");
        } else {
          alert("無効な形式のJSONファイルです。");
        }
      } catch (error) {
        alert("ファイルの読み込みに失敗しました。");
        console.error("Failed to parse JSON file:", error);
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  const dailyTasks = tasks.filter((task) => task.cycle === "daily");
  const weeklyTasks = tasks.filter((task) => task.cycle === "weekly");
  const monthlyTasks = tasks.filter((task) => task.cycle === "monthly");

  const dailyData = {
    total: dailyTasks.length,
    completed: dailyTasks.filter((task) => task.isCompleted).length,
  };
  const weeklyData = {
    total: weeklyTasks.length,
    completed: weeklyTasks.filter((task) => task.isCompleted).length,
  };
  const monthlyData = {
    total: monthlyTasks.length,
    completed: monthlyTasks.filter((task) => task.isCompleted).length,
  };

  return (
    <div className="p-4 sm:p-6 md:p-8">
      <h1 className="text-2xl font-bold mb-4">繰り返しタスク管理アプリ</h1>

      <div className="mb-12">
        <h2 className="text-xl font-semibold mb-4">達成状況</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <h3 className="text-lg font-medium text-center mb-2">デイリー</h3>
            <TaskChart
              totalTasks={dailyData.total}
              completedTasks={dailyData.completed}
            />
          </div>
          <div>
            <h3 className="text-lg font-medium text-center mb-2">
              ウィークリー
            </h3>
            <TaskChart
              totalTasks={weeklyData.total}
              completedTasks={weeklyData.completed}
            />
          </div>
          <div>
            <h3 className="text-lg font-medium text-center mb-2">マンスリー</h3>
            <TaskChart
              totalTasks={monthlyData.total}
              completedTasks={monthlyData.completed}
            />
          </div>
        </div>
      </div>

      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">タスクを追加</h2>
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={newTaskTitle}
            onChange={(e) => setNewTaskTitle(e.target.value)}
            className="border border-gray-700 rounded px-3 py-2 text-white bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent transition-colors"
            placeholder="新しいタスクを入力"
          />
          <select
            value={newTaskCycle}
            onChange={(e) => setNewTaskCycle(e.target.value as TaskCycle)}
            className="border border-gray-700 rounded px-3 py-2 text-white bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent transition-colors"
          >
            <option value="daily">デイリー</option>
            <option value="weekly">ウィークリー</option>
            <option value="monthly">マンスリー</option>
          </select>
          <button
            onClick={handleAddTask}
            className="bg-gray-600 text-white px-4 py-2 rounded font-semibold hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 focus:ring-offset-gray-950 transition-colors"
          >
            追加
          </button>
        </div>
      </div>

      <div className="mb-10">
        <h2 className="text-xl font-semibold mb-2">データ管理</h2>
        <div className="flex items-center gap-2">
          <button
            onClick={handleExportTasks}
            className="bg-gray-800 text-white px-4 py-2 rounded font-semibold hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-600 focus:ring-offset-2 focus:ring-offset-gray-950 transition-colors"
          >
            エクスポート
          </button>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="bg-gray-800 text-white px-4 py-2 rounded font-semibold hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-600 focus:ring-offset-2 focus:ring-offset-gray-950 transition-colors"
          >
            インポート
          </button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImportTasks}
            className="hidden"
            accept=".json"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div>
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-xl font-semibold">デイリータスク</h2>
            <button
              onClick={() => handleResetTasks("daily")}
              className="text-gray-300 hover:text-white p-1 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 focus:ring-offset-gray-950"
              aria-label="デイリータスクをリセット"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-5 h-5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 15 3 9m0 0 6-6M3 9h12a6 6 0 0 1 0 12h-3"
                />
              </svg>
            </button>
          </div>
          <TaskList
            tasks={dailyTasks}
            onToggleComplete={handleToggleComplete}
            onDeleteTask={handleDeleteTask}
          />
        </div>
        <div>
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-xl font-semibold">ウィークリータスク</h2>
            <button
              onClick={() => handleResetTasks("weekly")}
              className="text-gray-300 hover:text-white p-1 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 focus:ring-offset-gray-950"
              aria-label="ウィークリータスクをリセット"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-5 h-5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 15 3 9m0 0 6-6M3 9h12a6 6 0 0 1 0 12h-3"
                />
              </svg>
            </button>
          </div>
          <TaskList
            tasks={weeklyTasks}
            onToggleComplete={handleToggleComplete}
            onDeleteTask={handleDeleteTask}
          />
        </div>
        <div>
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-xl font-semibold">マンスリータスク</h2>
            <button
              onClick={() => handleResetTasks("monthly")}
              className="text-gray-300 hover:text-white p-1 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 focus:ring-offset-gray-950"
              aria-label="マンスリータスクをリセット"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-5 h-5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 15 3 9m0 0 6-6M3 9h12a6 6 0 0 1 0 12h-3"
                />
              </svg>
            </button>
          </div>
          <TaskList
            tasks={monthlyTasks}
            onToggleComplete={handleToggleComplete}
            onDeleteTask={handleDeleteTask}
          />
        </div>
      </div>
    </div>
  );
}
