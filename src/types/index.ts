export type ScheduleType = 'everyday' | 'specific_days' | 'every_n_days' | 'one_time';

export type DayOfWeek = 0 | 1 | 2 | 3 | 4 | 5 | 6; // Sun=0 ... Sat=6

export interface Task {
  id: string;
  title: string;
  scheduleType: ScheduleType;
  selectedDays?: DayOfWeek[]; // for specific_days
  interval?: number; // for every_n_days (>=1)
  oneTimeDate?: string; // ISO date for one_time
  createdAt: string; // ISO date
  order: number;
}

export interface TaskCompletion {
  taskId: string;
  date: string; // ISO date YYYY-MM-DD
}

export interface Note {
  id: string;
  title: string;
  content: string;
  folderId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Folder {
  id: string;
  name: string;
  createdAt: string;
}
