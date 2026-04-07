import dayjs from 'dayjs';
import { Task, DayOfWeek } from '@/types';

/** Check if a task should appear on a given date */
export function isTaskVisibleOnDate(task: Task, dateStr: string): boolean {
  const date = dayjs(dateStr);
  const created = dayjs(task.createdAt);

  // Don't show tasks before they were created
  if (date.isBefore(created, 'day')) return false;

  switch (task.scheduleType) {
    case 'everyday':
      return true;

    case 'specific_days':
      return (task.selectedDays ?? []).includes(date.day() as DayOfWeek);

    case 'every_n_days': {
      const diff = date.diff(created, 'day');
      const interval = Math.max(1, Math.floor(task.interval ?? 2));
      return diff % interval === 0;
    }

    case 'one_time':
      return date.format('YYYY-MM-DD') === task.oneTimeDate;

    default:
      return false;
  }
}

export function getTasksForDate(tasks: Task[], dateStr: string): Task[] {
  return tasks
    .filter((t) => isTaskVisibleOnDate(t, dateStr))
    .sort((a, b) => a.order - b.order);
}
