import { useState, useEffect, useRef } from 'react';
import type { NoteInput, NoteStatus } from '../types';
import type { SaveStatus } from '../components/NoteEditorHeader';

export interface UseDebouncedAutosaveOptions {
  noteId?: string;
  isOpen: boolean;
  title: string;
  contentVersion?: number;
  color: NoteInput['color'];
  status?: NoteStatus | null;
  isPinned: boolean;
  tags: string[];
  getContent: () => string;
  onSave: (payload: NoteInput) => Promise<void>;
  onError?: (message: string) => void;
  delayMs?: number;
}

export function useDebouncedAutosave({
  noteId,
  isOpen,
  title,
  contentVersion = 0,
  color,
  status = null,
  isPinned,
  tags,
  getContent,
  onSave,
  onError,
  delayMs = 1500,
}: UseDebouncedAutosaveOptions) {
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const isInitialMount = useRef<boolean>(true);
  const onSaveRef = useRef(onSave);
  const onErrorRef = useRef(onError);
  const getContentRef = useRef(getContent);
  const lastSavedSignatureRef = useRef<string>('');

  useEffect(() => {
    onSaveRef.current = onSave;
  }, [onSave]);

  useEffect(() => {
    onErrorRef.current = onError;
  }, [onError]);

  useEffect(() => {
    getContentRef.current = getContent;
  }, [getContent]);

  useEffect(() => {
    setSaveStatus(noteId ? 'idle' : 'draft');
    isInitialMount.current = true;
    lastSavedSignatureRef.current = '';
  }, [noteId]);

  useEffect(() => {
    if (!isOpen || !noteId) return;

    const snapshotSignature = JSON.stringify({
      noteId,
      title,
      contentVersion,
      color,
      status,
      isPinned,
      tags,
    });

    if (isInitialMount.current) {
      isInitialMount.current = false;
      lastSavedSignatureRef.current = snapshotSignature;
      return;
    }

    if (snapshotSignature === lastSavedSignatureRef.current) {
      return;
    }

    if (timerRef.current) clearTimeout(timerRef.current);
    setSaveStatus('draft');

    timerRef.current = setTimeout(async () => {
      setSaveStatus('saving');
      try {
        await onSaveRef.current({
          id: noteId,
          title: title.trim() || 'Untitled',
          content: getContentRef.current(),
          color,
          status,
          isPinned,
          tags,
        });
        lastSavedSignatureRef.current = snapshotSignature;
        setSaveStatus('saved');
      } catch (err) {
        console.error('Autosave error:', err);
        setSaveStatus('draft');
        onErrorRef.current?.('Autosave failed. Click Save Note to retry.');
      }
    }, delayMs);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [noteId, isOpen, title, contentVersion, color, status, isPinned, tags, delayMs]);

  const clearTimer = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
  };

  return { saveStatus, setSaveStatus, clearTimer };
}
