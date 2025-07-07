"use client";

import { useState, useEffect, useRef } from "react";
import TaskChart from "@/components/TaskChart";
import TaskList from "@/components/TaskList";
import DeadlineHourSelector from "@/components/DeadlineHourSelector";
import type { Task, TaskCycle } from "@/types/task";

export default function HomePage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskCycle, setNewTaskCycle] = useState<TaskCycle>("daily");
  const [deadlineHour, setDeadlineHour] = useState<number | null>(5);
  const [newDeadlineDayOfWeek, setNewDeadlineDayOfWeek] = useState<number>(0);
  const [newDeadlineDayOfMonth, setNewDeadlineDayOfMonth] = useState<number>(1);
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

  // Helper function to get the reset point for a given cycle
  const getCycleResetPoint = (cycle: TaskCycle, task: Task): Date => {
    const now = new Date();
    let resetPoint = new Date();

    if (cycle === "daily") {
      resetPoint.setHours(task.deadlineHour ?? 0, 0, 0, 0);
      if (now < resetPoint) {
        resetPoint.setDate(resetPoint.getDate() - 1);
      }
    } else if (cycle === "weekly") {
      const targetDayOfWeek = task.deadlineDayOfWeek ?? 0;
      const currentDay = now.getDay();
      let daysUntilTargetDay = targetDayOfWeek - currentDay;
      if (daysUntilTargetDay < 0) {
        daysUntilTargetDay += 7;
      }
      resetPoint.setDate(now.getDate() + daysUntilTargetDay);
      resetPoint.setHours(24, 0, 0, 0);
      if (now < resetPoint) {
        resetPoint.setDate(resetPoint.getDate() - 7);
      }
    } else if (cycle === "monthly") {
      const targetDayOfMonth = task.deadlineDayOfMonth ?? 1;
      resetPoint.setDate(targetDayOfMonth);
      resetPoint.setHours(24, 0, 0, 0);
      if (now < resetPoint) {
        resetPoint.setMonth(resetPoint.getMonth() - 1);
      }
    }
    return resetPoint;
  };

  // Helper function to get the deadline for the *next* cycle
  const getNextCycleDeadline = (cycle: TaskCycle, task: Task): Date => {
    const now = new Date();
    let nextDeadline = new Date();

    if (cycle === "daily") {
      nextDeadline.setHours(task.deadlineHour ?? 0, 0, 0, 0);
      nextDeadline.setDate(nextDeadline.getDate() + 1);
    } else if (cycle === "weekly") {
      const targetDayOfWeek = task.deadlineDayOfWeek ?? 0;
      const currentDay = now.getDay();
      let daysUntilTargetDay = targetDayOfWeek - currentDay;
      if (daysUntilTargetDay < 0) {
        daysUntilTargetDay += 7;
      }
      nextDeadline.setDate(now.getDate() + daysUntilTargetDay);
      nextDeadline.setHours(task.deadlineHour ?? 0, 0, 0, 0);
      if (now > nextDeadline) {
        nextDeadline.setDate(nextDeadline.getDate() + 7);
      }
    } else if (cycle === "monthly") {
      const targetDayOfMonth = task.deadlineDayOfMonth ?? 1;
      nextDeadline.setDate(targetDayOfMonth);
      nextDeadline.setHours(task.deadlineHour ?? 0, 0, 0, 0);
      if (now > nextDeadline) {
        nextDeadline.setMonth(nextDeadline.getMonth() + 1);
      }
    }
    return nextDeadline;
  };

  const handleAddTask = () => {
    if (newTaskTitle.trim() === "") return;

    const now = new Date();
    let deadline: Date | undefined = undefined;

    if (deadlineHour !== null) {
      deadline = new Date();
      deadline.setHours(deadlineHour, 0, 0, 0);

      switch (newTaskCycle) {
        case "daily":
          if (now > deadline) {
            deadline.setDate(deadline.getDate() + 1);
          }
          break;
        case "weekly":
          const targetDayOfWeek = newDeadlineDayOfWeek;
          const currentDay = now.getDay();
          let daysUntilTargetDay = targetDayOfWeek - currentDay;
          if (daysUntilTargetDay < 0) {
            daysUntilTargetDay += 7;
          }
          deadline.setDate(now.getDate() + daysUntilTargetDay);
          deadline.setHours(deadlineHour, 0, 0, 0);
          if (now > deadline) {
            deadline.setDate(deadline.getDate() + 7);
          }
          break;
        case "monthly":
          const targetDayOfMonth = newDeadlineDayOfMonth;
          deadline.setDate(targetDayOfMonth);
          deadline.setHours(deadlineHour, 0, 0, 0);
          if (now > deadline) {
            deadline.setMonth(deadline.getMonth() + 1);
          }
          break;
      }
    }

    const newTask: Task = {
      id: Date.now(),
      title: newTaskTitle,
      isCompleted: false,
      cycle: newTaskCycle,
      deadline: deadline?.toISOString(),
      deadlineHour: deadlineHour,
      deadlineDayOfWeek: newTaskCycle === "weekly" ? newDeadlineDayOfWeek : undefined,
      deadlineDayOfMonth: newTaskCycle === "monthly" ? newDeadlineDayOfMonth : undefined,
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
    const now = new Date();

    setTasks(prevTasks =>
      prevTasks.map(task => {
        if (task.cycle === cycle) {
          const resetPoint = getCycleResetPoint(cycle, task); // Pass the task object
          if (now >= resetPoint) {
            const newDeadline = getNextCycleDeadline(cycle, task); // Pass the task object
            return { ...task, isCompleted: false, deadline: newDeadline.toISOString() };
          } else {
            // If not yet time to reset, keep the task as is
            return task;
          }
        }
        return task;
      })
    );

    // Provide feedback for each cycle type if no tasks were reset or if it's not yet time
    const tasksToReset = tasks.filter(task => task.cycle === cycle);
    if (tasksToReset.length > 0) {
      const firstTask = tasksToReset[0]; // Just pick one to get the reset point for the alert
      const resetPointForAlert = getCycleResetPoint(cycle, firstTask);
      if (now < resetPointForAlert) {
        alert(`${cycle}タスクはまだリセットできません。次のリセットは${resetPointForAlert.toLocaleString()}です。`);
      }
    } else {
      // No tasks for this cycle, so nothing to reset
      // alert(`この${cycle}サイクルにはタスクがありません。`);
    }
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
        <div className="flex flex-wrap items-center gap-2">
          <input
            type="text"
            value={newTaskTitle}
            onChange={(e) => setNewTaskTitle(e.target.value)}
            className="border border-gray-700 rounded px-3 py-2 text-white bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent transition-colors w-full sm:w-auto"
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
          {newTaskCycle === "weekly" && (
            <select
              value={newDeadlineDayOfWeek}
              onChange={(e) => setNewDeadlineDayOfWeek(Number(e.target.value))}
              className="border border-gray-700 rounded px-3 py-2 text-white bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent transition-colors"
            >
              <option value={0}>日曜日</option>
              <option value={1}>月曜日</option>
              <option value={2}>火曜日</option>
              <option value={3}>水曜日</option>
              <option value={4}>木曜日</option>
              <option value={5}>金曜日</option>
              <option value={6}>土曜日</option>
            </select>
          )}
          {newTaskCycle === "monthly" && (
            <select
              value={newDeadlineDayOfMonth}
              onChange={(e) => setNewDeadlineDayOfMonth(Number(e.target.value))}
              className="border border-gray-700 rounded px-3 py-2 text-white bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent transition-colors"
            >
              {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => (
                <option key={day} value={day}>{`${day}日`}</option>
              ))}
            </select>
          )}
          <DeadlineHourSelector selectedHour={deadlineHour} onChange={setDeadlineHour} />
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
        <div className="flex flex-wrap items-center gap-2">
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
        <TaskList
          title="デイリータスク"
          tasks={dailyTasks}
          cycle="daily"
          onToggleComplete={handleToggleComplete}
          onDeleteTask={handleDeleteTask}
          onResetTasks={handleResetTasks}
        />
        <TaskList
          title="ウィークリータスク"
          tasks={weeklyTasks}
          cycle="weekly"
          onToggleComplete={handleToggleComplete}
          onDeleteTask={handleDeleteTask}
          onResetTasks={handleResetTasks}
        />
        <TaskList
          title="マンスリータスク"
          tasks={monthlyTasks}
          cycle="monthly"
          onToggleComplete={handleToggleComplete}
          onDeleteTask={handleDeleteTask}
          onResetTasks={handleResetTasks}
        />
      </div>
    </div>
  );
}
