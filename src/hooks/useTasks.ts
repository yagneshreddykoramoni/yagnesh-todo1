import { useState, useCallback, useMemo } from 'react';
import { v4 as uuid } from 'uuid';
import dayjs from 'dayjs';
import { Task, TaskCompletion } from '@/types';
import { getTasks, saveTasks, getCompletions, saveCompletions } from '@/lib/storage';
import { getTasksForDate } from '@/lib/scheduler';

export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>(getTasks);
  const [completions, setCompletions] = useState<TaskCompletion[]>(getCompletions);
  const [selectedDate, setSelectedDate] = useState(dayjs().format('YYYY-MM-DD'));

  const addTask = useCallback((task: Omit<Task, 'id' | 'createdAt' | 'order'>) => {
    setTasks((prev) => {
      const createdAt = dayjs(selectedDate).isAfter(dayjs(), 'day')
        ? selectedDate
        : dayjs().format('YYYY-MM-DD');
      const newTask: Task = {
        ...task,
        id: uuid(),
        createdAt,
        order: prev.length,
      };
      const updated = [...prev, newTask];
      saveTasks(updated);
      return updated;
    });
  }, [selectedDate]);

  const updateTask = useCallback((id: string, updates: Partial<Omit<Task, 'id' | 'createdAt'>>) => {
    setTasks((prev) => {
      const updated = prev.map((t) => (t.id === id ? { ...t, ...updates } : t));
      saveTasks(updated);
      return updated;
    });
  }, []);

  const deleteTask = useCallback((id: string) => {
    setTasks((prev) => {
      const updated = prev.filter((t) => t.id !== id);
      saveTasks(updated);
      return updated;
    });
    setCompletions((prev) => {
      const updated = prev.filter((c) => c.taskId !== id);
      saveCompletions(updated);
      return updated;
    });
  }, []);

  const toggleComplete = useCallback((taskId: string) => {
    if (dayjs(selectedDate).isAfter(dayjs(), 'day')) {
      return;
    }

    setCompletions((prev) => {
      const exists = prev.find((c) => c.taskId === taskId && c.date === selectedDate);
      const updated = exists
        ? prev.filter((c) => !(c.taskId === taskId && c.date === selectedDate))
        : [...prev, { taskId, date: selectedDate }];
      saveCompletions(updated);
      return updated;
    });
  }, [selectedDate]);

  const isCompleted = useCallback((taskId: string) => {
    return completions.some((c) => c.taskId === taskId && c.date === selectedDate);
  }, [completions, selectedDate]);

  const reorderTasks = useCallback((reordered: Task[]) => {
    setTasks((prev) => {
      const updatedVisible = reordered.map((t, i) => ({ ...t, order: i }));
      const updated = prev.map((t) => {
        const found = updatedVisible.find((u) => u.id === t.id);
        return found ?? t;
      });
      saveTasks(updated);
      return updated;
    });
  }, []);

  const todayTasks = useMemo(() => {
    const visible = getTasksForDate(tasks, selectedDate);
    const previousDate = dayjs(selectedDate).subtract(1, 'day').format('YYYY-MM-DD');
    const previousVisible = getTasksForDate(tasks, previousDate);

    const carryForward = previousVisible.filter((task) => {
      // Keep interval-based tasks strictly on their scheduled cadence.
      if (task.scheduleType === 'every_n_days') {
        return false;
      }

      const wasCompletedYesterday = completions.some(
        (c) => c.taskId === task.id && c.date === previousDate
      );
      const alreadyVisibleToday = visible.some((v) => v.id === task.id);
      return !wasCompletedYesterday && !alreadyVisibleToday;
    });

    const merged = [...visible, ...carryForward];
    const completed = merged.filter((t) => isCompleted(t.id));
    const active = merged.filter((t) => !isCompleted(t.id));
    return [...active, ...completed];
  }, [tasks, completions, selectedDate, isCompleted]);

  return {
    tasks: todayTasks,
    allTasks: tasks,
    selectedDate,
    setSelectedDate,
    addTask,
    updateTask,
    deleteTask,
    toggleComplete,
    isCompleted,
    reorderTasks,
    completions,
  };
}
