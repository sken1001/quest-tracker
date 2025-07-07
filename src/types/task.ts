export type TaskCycle = "daily" | "weekly" | "monthly";

export type Task = {
  id: number;
  title: string;
  isCompleted: boolean;
  cycle: TaskCycle;
  deadline?: string;
  deadlineHour?: number | null;
  deadlineDayOfWeek?: number;
  deadlineDayOfMonth?: number;
};
