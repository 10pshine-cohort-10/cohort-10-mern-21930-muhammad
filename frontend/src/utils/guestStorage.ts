import type { Note, NoteInput } from '../types';

const GUEST_STORAGE_KEY = 'notes_guest_drafts';

export function getGuestNotes(): Note[] {
  try {
    const serialized = localStorage.getItem(GUEST_STORAGE_KEY);
    if (!serialized) return [];
    const parsed = JSON.parse(serialized);
    return Array.isArray(parsed) ? (parsed as Note[]) : [];
  } catch (err) {
    console.error('Failed to read local guest notes:', err);
    return [];
  }
}

export function saveGuestNotesList(notesList: Note[]): void {
  try {
    localStorage.setItem(GUEST_STORAGE_KEY, JSON.stringify(notesList));
  } catch (err) {
    console.error('Failed to persist local guest notes:', err);
  }
}

export function createGuestNote(noteInput: NoteInput): Note {
  const currentNotes = getGuestNotes();
  const timestamp = new Date().toISOString();
  const newNote: Note = {
    id: `guest-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    userId: 'guest',
    title: noteInput.title?.trim() || 'Untitled',
    content: noteInput.content || '',
    color: noteInput.color || 'slate',
    isPinned: Boolean(noteInput.isPinned),
    tags: Array.isArray(noteInput.tags) ? noteInput.tags : [],
    createdAt: timestamp,
    updatedAt: timestamp,
  };

  const updatedNotes = [newNote, ...currentNotes];
  saveGuestNotesList(updatedNotes);
  return newNote;
}

export function updateGuestNote(noteId: string, noteInput: NoteInput): Note {
  const currentNotes = getGuestNotes();
  const existingNote = currentNotes.find((n) => n.id === noteId);
  const timestamp = new Date().toISOString();

  const updatedNote: Note = {
    id: noteId,
    userId: 'guest',
    title: noteInput.title !== undefined ? noteInput.title.trim() || 'Untitled' : existingNote?.title || 'Untitled',
    content: noteInput.content !== undefined ? noteInput.content : existingNote?.content || '',
    color: noteInput.color || existingNote?.color || 'slate',
    isPinned: noteInput.isPinned !== undefined ? Boolean(noteInput.isPinned) : Boolean(existingNote?.isPinned),
    tags: Array.isArray(noteInput.tags) ? noteInput.tags : existingNote?.tags || [],
    createdAt: existingNote?.createdAt || timestamp,
    updatedAt: timestamp,
  };

  const updatedNotes = currentNotes.map((n) => (n.id === noteId ? updatedNote : n));
  saveGuestNotesList(updatedNotes);
  return updatedNote;
}

export function deleteGuestNote(noteId: string): void {
  const currentNotes = getGuestNotes();
  const updatedNotes = currentNotes.filter((n) => n.id !== noteId);
  saveGuestNotesList(updatedNotes);
}

export function clearGuestNotes(): void {
  try {
    localStorage.removeItem(GUEST_STORAGE_KEY);
  } catch (err) {
    console.error('Failed to clear local guest notes:', err);
  }
}
