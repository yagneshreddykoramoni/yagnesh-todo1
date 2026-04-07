import { useState } from 'react';
import { useNotes } from '@/hooks/useNotes';
import { Plus, FolderPlus, Trash2, Pencil, ChevronRight, ArrowLeft } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Note } from '@/types';
import dayjs from 'dayjs';
import { cn } from '@/lib/utils';

export function NotesPage() {
  const { notes, folders, addNote, updateNote, deleteNote, addFolder, deleteFolder } = useNotes();
  const [activeFolderId, setActiveFolderId] = useState<string | null>(null);
  const [noteModalOpen, setNoteModalOpen] = useState(false);
  const [folderModalOpen, setFolderModalOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [noteTitle, setNoteTitle] = useState('');
  const [noteContent, setNoteContent] = useState('');
  const [folderName, setFolderName] = useState('');

  const filteredNotes = activeFolderId === null
    ? notes
    : notes.filter((n) => n.folderId === activeFolderId);

  const openNewNote = () => {
    setEditingNote(null);
    setNoteTitle('');
    setNoteContent('');
    setNoteModalOpen(true);
  };

  const openEditNote = (note: Note) => {
    setEditingNote(note);
    setNoteTitle(note.title);
    setNoteContent(note.content);
    setNoteModalOpen(true);
  };

  const handleSaveNote = () => {
    if (!noteTitle.trim()) return;
    if (editingNote) {
      updateNote(editingNote.id, { title: noteTitle, content: noteContent });
    } else {
      addNote(noteTitle, noteContent, activeFolderId);
    }
    setNoteModalOpen(false);
  };

  const handleSaveFolder = () => {
    if (!folderName.trim()) return;
    addFolder(folderName.trim());
    setFolderName('');
    setFolderModalOpen(false);
  };

  const confirmAndDeleteFolder = (folderId: string, folderNameToDelete: string) => {
    if (window.confirm(`Delete folder "${folderNameToDelete}" and all notes inside it?`)) {
      deleteFolder(folderId);
    }
  };

  const confirmAndDeleteNote = (noteId: string, noteTitleToDelete: string) => {
    if (window.confirm(`Delete note "${noteTitleToDelete}"?`)) {
      deleteNote(noteId);
    }
  };

  return (
    <div className="safe-page-bottom flex flex-col">
      <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
        <div className="mx-auto flex max-w-lg items-center gap-3 px-4 pt-4 pb-3">
          {activeFolderId !== null && (
            <button onClick={() => setActiveFolderId(null)} className="rounded-lg p-2 text-muted-foreground hover:bg-secondary">
              <ArrowLeft className="h-5 w-5" />
            </button>
          )}
          <h1 className="flex-1 text-xl font-bold text-foreground">
            {activeFolderId ? folders.find((f) => f.id === activeFolderId)?.name ?? 'Notes' : 'Notes'}
          </h1>
          <button onClick={() => setFolderModalOpen(true)} className="rounded-lg p-2 text-muted-foreground hover:bg-secondary">
            <FolderPlus className="h-5 w-5" />
          </button>
        </div>
      </header>

      <div className="mx-auto w-full max-w-lg px-4">
        {/* Folders */}
        {activeFolderId === null && folders.length > 0 && (
          <div className="mb-4 space-y-1.5">
            {folders.map((folder) => (
              <div
                key={folder.id}
                className="group flex items-center gap-3 rounded-xl border bg-card px-4 py-3"
              >
                <button onClick={() => setActiveFolderId(folder.id)} className="flex flex-1 items-center gap-2">
                  <span className="text-sm font-medium text-foreground">{folder.name}</span>
                  <span className="text-xs text-muted-foreground">
                    {notes.filter((n) => n.folderId === folder.id).length}
                  </span>
                </button>
                <button onClick={() => confirmAndDeleteFolder(folder.id, folder.name)} className="rounded p-1 text-destructive hover:bg-destructive/10">
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
                <ChevronRight className="h-4 w-4 text-muted-foreground/40" />
              </div>
            ))}
          </div>
        )}

        {/* Notes list */}
        {filteredNotes.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="mb-3 rounded-2xl bg-accent p-4">
              <Plus className="h-8 w-8 text-accent-foreground" />
            </div>
            <p className="text-sm font-medium text-muted-foreground">No notes yet</p>
          </div>
        ) : (
          <div className="space-y-2">
            {filteredNotes.map((note) => (
              <div
                key={note.id}
                className="group rounded-xl border bg-card px-4 py-3"
              >
                <div className="flex items-start justify-between">
                  <button onClick={() => openEditNote(note)} className="flex-1 text-left">
                    <h3 className="text-sm font-semibold text-foreground">{note.title}</h3>
                    {note.content && (
                      <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">{note.content}</p>
                    )}
                    <p className="mt-1 text-[10px] text-muted-foreground/50">
                      {dayjs(note.updatedAt).format('MMM D, h:mm A')}
                    </p>
                  </button>
                  <div className="flex gap-1">
                    <button onClick={() => openEditNote(note)} className="rounded p-1.5 text-muted-foreground hover:bg-secondary">
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                    <button onClick={() => confirmAndDeleteNote(note.id, note.title)} className="rounded p-1.5 text-destructive hover:bg-destructive/10">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* FAB */}
      <button
        onClick={openNewNote}
        className="safe-fab-bottom fixed right-4 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-fab text-fab-foreground shadow-lg transition-transform hover:scale-105 active:scale-95"
      >
        <Plus className="h-6 w-6" />
      </button>

      {/* Note Modal */}
      <Dialog open={noteModalOpen} onOpenChange={setNoteModalOpen}>
        <DialogContent className="mx-4 max-w-sm rounded-xl">
          <DialogHeader>
            <DialogTitle>{editingNote ? 'Edit Note' : 'New Note'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label>Title</Label>
              <Input value={noteTitle} onChange={(e) => setNoteTitle(e.target.value)} className="mt-1" autoFocus />
            </div>
            <div>
              <Label>Content</Label>
              <Textarea value={noteContent} onChange={(e) => setNoteContent(e.target.value)} className="mt-1 min-h-[120px]" />
            </div>
            <Button onClick={handleSaveNote} className="w-full" disabled={!noteTitle.trim()}>
              {editingNote ? 'Save' : 'Create Note'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Folder Modal */}
      <Dialog open={folderModalOpen} onOpenChange={setFolderModalOpen}>
        <DialogContent className="mx-4 max-w-sm rounded-xl">
          <DialogHeader>
            <DialogTitle>New Folder</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <Input value={folderName} onChange={(e) => setFolderName(e.target.value)} placeholder="Folder name" autoFocus />
            <Button onClick={handleSaveFolder} className="w-full" disabled={!folderName.trim()}>Create Folder</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
