import { useEffect, useState } from 'react';
import type { Note } from '../types';

export interface UseDeskKeyboardNavOptions {
  notes: Note[];
  isModalOpen: boolean;
  onSelectNote: (note: Note) => void;
  onTogglePin: (id: string, isPinned: boolean) => void;
  onDeleteNote: (id: string) => void;
  onUndoDelete?: () => void;
  onOpenNewNote: () => void;
  onToggleHelp: () => void;
  onFocusSearch: () => void;
  onFocusQuickTack: () => void;
}

export function useDeskKeyboardNav({
  notes,
  isModalOpen,
  onSelectNote,
  onTogglePin,
  onDeleteNote,
  onUndoDelete,
  onOpenNewNote,
  onToggleHelp,
  onFocusSearch,
  onFocusQuickTack,
}: UseDeskKeyboardNavOptions) {
  const [focusedIndex, setFocusedIndex] = useState<number>(-1);

  // Reset focus when notes change or get empty
  useEffect(() => {
    if (notes.length === 0) {
      setFocusedIndex(-1);
    } else if (focusedIndex >= notes.length) {
      setFocusedIndex(notes.length - 1);
    }
  }, [notes.length, focusedIndex]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (isModalOpen || !event.key) return;

      const activeEl = document.activeElement;
      const isInputActive =
        activeEl instanceof HTMLInputElement ||
        activeEl instanceof HTMLTextAreaElement ||
        (activeEl instanceof HTMLElement && activeEl.isContentEditable);

      if (isInputActive) return;

      const keyLower = event.key.toLowerCase();

      // Handle hotkeys
      if (event.key === 'j' || event.key === 'ArrowDown') {
        event.preventDefault();
        setFocusedIndex((prev) => (notes.length === 0 ? -1 : (prev + 1) % notes.length));
      } else if (event.key === 'k' || event.key === 'ArrowUp') {
        event.preventDefault();
        setFocusedIndex((prev) =>
          notes.length === 0 ? -1 : (prev - 1 + notes.length) % notes.length
        );
      } else if (event.key === 'Enter' && focusedIndex >= 0 && notes[focusedIndex]) {
        event.preventDefault();
        onSelectNote(notes[focusedIndex]);
      } else if (keyLower === 'p' && focusedIndex >= 0 && notes[focusedIndex]) {
        event.preventDefault();
        const note = notes[focusedIndex];
        onTogglePin(note.id, !note.isPinned);
      } else if (keyLower === 'd' && focusedIndex >= 0 && notes[focusedIndex]) {
        event.preventDefault();
        onDeleteNote(notes[focusedIndex].id);
      } else if (keyLower === 'z' && onUndoDelete) {
        event.preventDefault();
        onUndoDelete();
      } else if (keyLower === 't') {
        event.preventDefault();
        onFocusQuickTack();
      } else if (keyLower === 'n') {
        event.preventDefault();
        onOpenNewNote();
      } else if (event.key === '/') {
        event.preventDefault();
        onFocusSearch();
      } else if (event.key === '?') {
        event.preventDefault();
        onToggleHelp();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    notes,
    focusedIndex,
    isModalOpen,
    onSelectNote,
    onTogglePin,
    onDeleteNote,
    onUndoDelete,
    onOpenNewNote,
    onToggleHelp,
    onFocusSearch,
    onFocusQuickTack,
  ]);

  return {
    focusedIndex,
    setFocusedIndex,
  };
}
