"use client";

import { useState, useEffect, useRef } from "react";
import TaskChart from "@/components/TaskChart";

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
          // ここでより詳細な型ガードを行うことも可能です
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
    e.target.value = ""; // 同じファイルを連続で選択できるようにリセット
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
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">繰り返しタスク管理アプリ</h1>

      <div className="mb-8">
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

      <div className="mb-4">
        <h2 className="text-xl font-semibold mb-2">タスクを追加</h2>
        <div className="flex items-center gap-2">
          {" "}
          <input
            type="text"
            value={newTaskTitle}
            onChange={(e) => setNewTaskTitle(e.target.value)}
            className="border rounded px-2 py-1 text-white bg-gray-700"
            placeholder="新しいタスクを入力"
          />
          <select
            value={newTaskCycle}
            onChange={(e) => setNewTaskCycle(e.target.value as TaskCycle)}
            className="border rounded px-2 py-1 text-white bg-gray-700"
          >
            <option value="daily">デイリー</option>
            <option value="weekly">ウィークリー</option>
            <option value="monthly">マンスリー</option>
          </select>
          <button
            onClick={handleAddTask}
            className="bg-blue-500 text-white px-4 py-1 rounded"
          >
            追加
          </button>
        </div>
      </div>

      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-2">データ管理</h2>
        <div className="flex items-center gap-2">
          <button
            onClick={handleExportTasks}
            className="bg-gray-600 text-white px-4 py-1 rounded"
          >
            エクスポート
          </button>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="bg-gray-600 text-white px-4 py-1 rounded"
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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-xl font-semibold">デイリータスク</h2>
            <button
              onClick={() => handleResetTasks("daily")}
              className="bg-gray-600 text-white px-2 py-0.5 text-xs rounded hover:bg-gray-500"
            >
              リセット
            </button>
          </div>
          <ul>
            {dailyTasks.map((task) => (
              <li
                key={task.id}
                className="flex items-center justify-between mb-2 bg-gray-800 p-2 rounded"
              >
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={task.isCompleted}
                    onChange={() => handleToggleComplete(task.id)}
                  />
                  <span
                    className={
                      task.isCompleted ? "line-through text-gray-500" : ""
                    }
                  >
                    {task.title}
                  </span>
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full text-white ${
                      task.cycle === "daily"
                        ? "bg-green-500"
                        : task.cycle === "weekly"
                        ? "bg-purple-500"
                        : "bg-orange-500"
                    }`}
                  >
                    {task.cycle}
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
        <div>
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-xl font-semibold">ウィークリータスク</h2>
            <button
              onClick={() => handleResetTasks("weekly")}
              className="bg-gray-600 text-white px-2 py-0.5 text-xs rounded hover:bg-gray-500"
            >
              リセット
            </button>
          </div>
          <ul>
            {weeklyTasks.map((task) => (
              <li
                key={task.id}
                className="flex items-center justify-between mb-2 bg-gray-800 p-2 rounded"
              >
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={task.isCompleted}
                    onChange={() => handleToggleComplete(task.id)}
                  />
                  <span
                    className={
                      task.isCompleted ? "line-through text-gray-500" : ""
                    }
                  >
                    {task.title}
                  </span>
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full text-white ${
                      task.cycle === "daily"
                        ? "bg-green-500"
                        : task.cycle === "weekly"
                        ? "bg-purple-500"
                        : "bg-orange-500"
                    }`}
                  >
                    {task.cycle}
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
        <div>
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-xl font-semibold">マンスリータスク</h2>
            <button
              onClick={() => handleResetTasks("monthly")}
              className="bg-gray-600 text-white px-2 py-0.5 text-xs rounded hover:bg-gray-500"
            >
              リセット
            </button>
          </div>
          <ul>
            {monthlyTasks.map((task) => (
              <li
                key={task.id}
                className="flex items-center justify-between mb-2 bg-gray-800 p-2 rounded"
              >
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={task.isCompleted}
                    onChange={() => handleToggleComplete(task.id)}
                  />
                  <span
                    className={
                      task.isCompleted ? "line-through text-gray-500" : ""
                    }
                  >
                    {task.title}
                  </span>
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full text-white ${
                      task.cycle === "daily"
                        ? "bg-green-500"
                        : task.cycle === "weekly"
                        ? "bg-purple-500"
                        : "bg-orange-500"
                    }`}
                  >
                    {task.cycle}
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
      </div>
    </div>
  );
}
