import { Task, TaskCompletion, Note, Folder } from '@/types';

const KEYS = {
  tasks: 'dailyflow_tasks',
  completions: 'dailyflow_completions',
  notes: 'dailyflow_notes',
  folders: 'dailyflow_folders',
};

function get<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function set(key: string, value: unknown) {
  localStorage.setItem(key, JSON.stringify(value));
}

// Tasks
export const getTasks = (): Task[] => get(KEYS.tasks, []);
export const saveTasks = (t: Task[]) => set(KEYS.tasks, t);

// Completions
export const getCompletions = (): TaskCompletion[] => get(KEYS.completions, []);
export const saveCompletions = (c: TaskCompletion[]) => set(KEYS.completions, c);

// Notes
export const getNotes = (): Note[] => get(KEYS.notes, []);
export const saveNotes = (n: Note[]) => set(KEYS.notes, n);

// Folders
export const getFolders = (): Folder[] => get(KEYS.folders, []);
export const saveFolders = (f: Folder[]) => set(KEYS.folders, f);
