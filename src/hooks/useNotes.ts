import { useState, useCallback } from 'react';
import { v4 as uuid } from 'uuid';
import dayjs from 'dayjs';
import { Note, Folder } from '@/types';
import { getNotes, saveNotes, getFolders, saveFolders } from '@/lib/storage';

export function useNotes() {
  const [notes, setNotes] = useState<Note[]>(getNotes);
  const [folders, setFolders] = useState<Folder[]>(getFolders);

  const persistNotes = useCallback((updated: Note[]) => {
    setNotes(updated);
    saveNotes(updated);
  }, []);

  const persistFolders = useCallback((updated: Folder[]) => {
    setFolders(updated);
    saveFolders(updated);
  }, []);

  const addNote = useCallback((title: string, content: string, folderId: string | null) => {
    const now = dayjs().toISOString();
    const note: Note = { id: uuid(), title, content, folderId, createdAt: now, updatedAt: now };
    persistNotes([note, ...notes]);
  }, [notes, persistNotes]);

  const updateNote = useCallback((id: string, updates: Partial<Pick<Note, 'title' | 'content' | 'folderId'>>) => {
    persistNotes(notes.map((n) => n.id === id ? { ...n, ...updates, updatedAt: dayjs().toISOString() } : n));
  }, [notes, persistNotes]);

  const deleteNote = useCallback((id: string) => {
    persistNotes(notes.filter((n) => n.id !== id));
  }, [notes, persistNotes]);

  const addFolder = useCallback((name: string) => {
    const folder: Folder = { id: uuid(), name, createdAt: dayjs().toISOString() };
    persistFolders([...folders, folder]);
  }, [folders, persistFolders]);

  const deleteFolder = useCallback((id: string) => {
    persistFolders(folders.filter((f) => f.id !== id));
    persistNotes(notes.map((n) => n.folderId === id ? { ...n, folderId: null } : n));
  }, [folders, notes, persistFolders, persistNotes]);

  return { notes, folders, addNote, updateNote, deleteNote, addFolder, deleteFolder };
}
