// src/types/task.ts

export type TaskCycle = "daily" | "weekly" | "monthly";

export type Task = {
  id: number;
  title: string;
  isCompleted: boolean;
  cycle: TaskCycle;
  deadline?: string; // ISO 8601 format string
  deadlineHour?: number | null;
};
