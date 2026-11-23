import { useState, useEffect, useRef } from 'react';
import type { NoteInput } from '../types';
import type { SaveStatus } from '../components/NoteEditorHeader';

export interface UseDebouncedAutosaveOptions {
  noteId?: string;
  isOpen: boolean;
  title: string;
  color: NoteInput['color'];
  isPinned: boolean;
  tags: string[];
  getContent: () => string;
  onSave: (payload: NoteInput) => Promise<void>;
  delayMs?: number;
}

export function useDebouncedAutosave({
  noteId,
  isOpen,
  title,
  color,
  isPinned,
  tags,
  getContent,
  onSave,
  delayMs = 1500,
}: UseDebouncedAutosaveOptions) {
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const isInitialMount = useRef<boolean>(true);

  useEffect(() => {
    setSaveStatus(noteId ? 'idle' : 'draft');
    isInitialMount.current = true;
  }, [noteId]);

  useEffect(() => {
    if (!isOpen || !noteId) return;

    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    if (timerRef.current) clearTimeout(timerRef.current);
    setSaveStatus('draft');

    timerRef.current = setTimeout(async () => {
      setSaveStatus('saving');
      try {
        await onSave({
          id: noteId,
          title: title.trim() || 'Untitled',
          content: getContent(),
          color,
          isPinned,
          tags,
        });
        setSaveStatus('saved');
      } catch (err) {
        console.error('Autosave error:', err);
        setSaveStatus('idle');
      }
    }, delayMs);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [noteId, isOpen, title, color, isPinned, tags, getContent, onSave, delayMs]);

  const clearTimer = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
  };

  return { saveStatus, setSaveStatus, clearTimer };
}
