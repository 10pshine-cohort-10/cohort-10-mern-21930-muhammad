import { useState, useRef, useEffect, useCallback } from 'react';
import type { Note } from '../types';

export interface UseSoftDeleteOptions {
  onPermanentDelete: (id: string) => Promise<void>;
  onRestoreNote: (note: Note) => void;
  onRemoveFromState: (id: string) => void;
  durationMs?: number;
}

export function useSoftDelete({
  onPermanentDelete,
  onRestoreNote,
  onRemoveFromState,
  durationMs = 5000,
}: UseSoftDeleteOptions) {
  const [deletedNote, setDeletedNote] = useState<Note | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const finalizeDelete = useCallback(() => {
    if (deletedNote) {
      onPermanentDelete(deletedNote.id).catch((err) =>
        console.error('Permanent delete failed:', err)
      );
    }
    setDeletedNote(null);
  }, [deletedNote, onPermanentDelete]);

  const triggerSoftDelete = (noteToTrash: Note) => {
    // If a previous delete was pending, finalize it immediately
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      finalizeDelete();
    }

    onRemoveFromState(noteToTrash.id);
    setDeletedNote(noteToTrash);

    timerRef.current = setTimeout(() => {
      onPermanentDelete(noteToTrash.id).catch((err) =>
        console.error('Permanent delete failed:', err)
      );
      setDeletedNote(null);
    }, durationMs);
  };

  const undoDelete = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (deletedNote) {
      onRestoreNote(deletedNote);
      setDeletedNote(null);
    }
  };

  const dismissToast = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    finalizeDelete();
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  return {
    deletedNote,
    triggerSoftDelete,
    undoDelete,
    dismissToast,
  };
}
