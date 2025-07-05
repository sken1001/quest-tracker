// components/TaskChart.tsx
"use client";

import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { Doughnut } from "react-chartjs-2";

ChartJS.register(ArcElement, Tooltip, Legend);

// このコンポーネントが受け取るデータの「型」を定義
type TaskChartProps = {
  completedTasks: number;
  totalTasks: number;
};

export default function TaskChart({
  completedTasks,
  totalTasks,
}: TaskChartProps) {
  const incompleteTasks = totalTasks - completedTasks;

  const data = {
    labels: ["完了", "未完了"],
    datasets: [
      {
        data: [completedTasks, incompleteTasks],
        backgroundColor: ["#22c55e", "#374151"], // green-500, gray-700
        borderColor: ["#111827"], // gray-900
        borderWidth: 2,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top" as const,
        labels: {
          color: "#f3f4f6", // gray-100
        },
      },
      tooltip: {
        titleFont: {
          size: 14,
        },
      },
    },
  };

  if (totalTasks === 0) {
    return <div className="text-center text-gray-500">タスクがありません</div>;
  }

  return (
    <div className="relative h-64">
      <Doughnut data={data} options={options} />
    </div>
  );
}
