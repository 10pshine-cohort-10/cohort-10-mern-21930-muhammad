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
  const pendingNoteRef = useRef<Note | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const finalizePendingDelete = useCallback(() => {
    const pending = pendingNoteRef.current;
    pendingNoteRef.current = null;
    if (pending) {
      onPermanentDelete(pending.id).catch((err) =>
        console.error('Permanent delete failed:', err)
      );
    }
    setDeletedNote(null);
  }, [onPermanentDelete]);

  const triggerSoftDelete = (noteToTrash: Note) => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
      finalizePendingDelete();
    }

    onRemoveFromState(noteToTrash.id);
    pendingNoteRef.current = noteToTrash;
    setDeletedNote(noteToTrash);

    timerRef.current = setTimeout(() => {
      timerRef.current = null;
      finalizePendingDelete();
    }, durationMs);
  };

  const undoDelete = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    const pending = pendingNoteRef.current;
    pendingNoteRef.current = null;
    if (pending) {
      onRestoreNote(pending);
      setDeletedNote(null);
    }
  };

  const dismissToast = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    finalizePendingDelete();
  };

  const onPermanentDeleteRef = useRef(onPermanentDelete);
  useEffect(() => {
    onPermanentDeleteRef.current = onPermanentDelete;
  }, [onPermanentDelete]);

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
      const remainingNote = pendingNoteRef.current;
      pendingNoteRef.current = null;
      if (remainingNote) {
        onPermanentDeleteRef.current(remainingNote.id).catch((err) =>
          console.error('Permanent delete on unmount failed:', err)
        );
      }
    };
  }, []);

  return {
    deletedNote,
    triggerSoftDelete,
    undoDelete,
    dismissToast,
  };
}
