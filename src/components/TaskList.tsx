'use client';

import type { Task, TaskCycle } from "@/types/task";

type TaskListProps = {
  title: string;
  tasks: Task[];
  cycle: TaskCycle;
  onToggleComplete: (id: number) => void;
  onDeleteTask: (id: number) => void;
  onResetTasks: (cycle: TaskCycle) => void;
};

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const isToday = date.getDate() === now.getDate() &&
                  date.getMonth() === now.getMonth() &&
                  date.getFullYear() === now.getFullYear();

  const day = date.getDate();
  const hours = `0${date.getHours()}`.slice(-2);
  const minutes = `0${date.getMinutes()}`.slice(-2);

  if (isToday) {
    return `今日 ${hours}:${minutes}`;
  }
  return `${date.getMonth() + 1}/${day} ${hours}:${minutes}`;
}

export default function TaskList({
  title,
  tasks,
  cycle,
  onToggleComplete,
  onDeleteTask,
  onResetTasks,
}: TaskListProps) {
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-xl font-semibold">{title}</h2>
        <button
          onClick={() => onResetTasks(cycle)}
          className="text-gray-300 hover:text-white p-1 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 focus:ring-offset-gray-950"
          aria-label={`${title}をリセット`}
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

      {tasks.length === 0 ? (
        <p className="text-gray-500 text-sm mt-2">タスクはありません。</p>
      ) : (
        <ul>
          {tasks.map((task) => {
            const isOverdue = task.deadline && new Date(task.deadline) < new Date() && !task.isCompleted;
            return (
            <li
              key={task.id}
              className="flex items-center justify-between mb-2 bg-gray-800 p-3 rounded-lg hover:bg-gray-700 transition-colors"
            >
              <label className="flex items-center gap-2 cursor-pointer flex-grow min-w-0">
                <input
                  type="checkbox"
                  className="form-checkbox h-5 w-5 rounded bg-gray-800 border-gray-600 text-green-500 focus:ring-green-500"
                  checked={task.isCompleted}
                  onChange={() => onToggleComplete(task.id)}
                />
                <span className={`flex-grow min-w-0 truncate ${task.isCompleted ? "line-through text-gray-400" : ""}`}>
                  {task.title}
                </span>
              </label>
              <div className="flex items-center gap-2 flex-shrink-0 ml-auto">
                <span className={`text-xs px-2 py-0.5 rounded-full text-white ${
                  task.cycle === "daily" ? "bg-teal-800 text-teal-100"
                  : task.cycle === "weekly" ? "bg-sky-800 text-sky-100"
                  : "bg-rose-800 text-rose-100"
                }`}>
                  {task.cycle}
                </span>
                {task.cycle === "weekly" && task.deadlineDayOfWeek !== undefined && (
                  <span className="text-xs text-gray-400">
                    ({["日", "月", "火", "水", "木", "金", "土"][task.deadlineDayOfWeek]}曜日)
                  </span>
                )}
                {task.cycle === "monthly" && task.deadlineDayOfMonth !== undefined && (
                  <span className="text-xs text-gray-400">
                    ({task.deadlineDayOfMonth}日)
                  </span>
                )}
                {task.deadline && (
                  <span className={`text-xs ${isOverdue ? 'text-red-400' : 'text-gray-400'}`}>
                    {formatDate(task.deadline)}
                  </span>
                )}
                <button
                  onClick={() => onDeleteTask(task.id)}
                  className="text-gray-400 hover:text-red-500 p-1 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-gray-900"
                  aria-label={`タスク「${task.title}」を削除`}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              </div>
            </li>
          )})}
        </ul>
      )}
    </div>
  );
}
