import { useState, useEffect, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { ChevronDown, ChevronRight } from 'lucide-react';
import NoteEditorHeader from './NoteEditorHeader';
import EditorToolbar from './EditorToolbar';
import NoteMetaRow from './NoteMetaRow';
import NoteTagList from './NoteTagList';
import { useDebouncedAutosave } from '../hooks/useDebouncedAutosave';
import { downloadExportedNotes } from '../utils/noteExport';
import type { Note, NoteInput, NoteColor, NoteStatus } from '../types';
import styles from './NoteEditor.module.css';

export interface NoteEditorProps {
  note: Note | NoteInput | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (notePayload: NoteInput) => Promise<void>;
}

export default function NoteEditor(props: NoteEditorProps) {
  if (!props.isOpen) return null;
  return <NoteEditorDrawer {...props} />;
}

function NoteEditorDrawer({ note, isOpen, onClose, onSave }: NoteEditorProps) {
  const [title, setTitle] = useState<string>(() => note?.title || '');
  const [color, setColor] = useState<NoteColor>(() => note?.color || 'slate');
  const [status, setStatus] = useState<NoteStatus | null>(() => note?.status ?? null);
  const [isPinned, setIsPinned] = useState<boolean>(() => Boolean(note?.isPinned));
  const [tags, setTags] = useState<string[]>(() => (Array.isArray(note?.tags) ? note.tags : []));
  const [contentVersion, setContentVersion] = useState<number>(0);
  const [isFocusMode, setIsFocusMode] = useState<boolean>(false);
  const [showMetadata, setShowMetadata] = useState<boolean>(() => Boolean(note?.status && !note?.id));
  const [saveError, setSaveError] = useState<string>('');
  const [isConfirmingDiscard, setIsConfirmingDiscard] = useState<boolean>(false);

  const editor = useEditor({
    extensions: [StarterKit],
    content: note?.content || '',
    editorProps: { attributes: { class: styles.tiptapEditor } },
    onUpdate: () => {
      setContentVersion((prev) => prev + 1);
    },
  });

  const getEditorContent = useCallback(
    () => (editor && !editor.isDestroyed ? editor.getHTML() : ''),
    [editor]
  );

  const { saveStatus, setSaveStatus, clearTimer } = useDebouncedAutosave({
    noteId: note?.id,
    isOpen,
    title,
    contentVersion,
    color,
    status,
    isPinned,
    tags,
    getContent: getEditorContent,
    onSave,
    onError: (msg) => setSaveError(msg),
  });

  const initializedNoteRef = useRef<Note | NoteInput | null | undefined>(note);
  const syncedEditorNoteRef = useRef<Note | NoteInput | null | undefined>(note);

  useEffect(() => {
    if (initializedNoteRef.current !== note) {
      initializedNoteRef.current = note;
      setTitle(note?.title || '');
      setColor(note?.color || 'slate');
      setStatus(note?.status ?? null);
      setIsPinned(Boolean(note?.isPinned));
      setTags(Array.isArray(note?.tags) ? note.tags : []);
      setShowMetadata(Boolean(note?.status && !note?.id));
      setContentVersion(0);
      setSaveError('');
      setIsConfirmingDiscard(false);
    }
    if (editor && !editor.isDestroyed && syncedEditorNoteRef.current !== note) {
      syncedEditorNoteRef.current = note;
      editor.commands.setContent(note?.content || '');
    }
  }, [note, editor]);

  const requestClose = useCallback(() => {
    if (saveStatus === 'saving') return;
    const strippedBody = getEditorContent().replace(/<[^>]+>/g, '').trim();
    const isUnsavedNewDraft = !note?.id && (title.trim().length > 0 || strippedBody.length > 0);
    const hasPendingExistingChanges = Boolean(note?.id) && (saveStatus === 'draft' || Boolean(saveError));
    if ((isUnsavedNewDraft || hasPendingExistingChanges) && !isConfirmingDiscard) {
      setIsConfirmingDiscard(true);
      return;
    }
    onClose();
  }, [saveStatus, saveError, getEditorContent, note?.id, title, isConfirmingDiscard, onClose]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && saveStatus !== 'saving') {
        event.preventDefault();
        requestClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [requestClose, saveStatus]);

  const hasCustomMetadata = tags.length > 0 || color !== 'slate' || isPinned || Boolean(status);
  const isArchived = tags.includes('archive');
  const canToggleArchive = Boolean(note?.id && !note.id.startsWith('guest-'));

  const handleManualSave = async () => {
    clearTimer();
    setSaveError('');
    setSaveStatus('saving');
    try {
      await onSave({
        id: note?.id,
        title: title.trim() || 'Untitled',
        content: getEditorContent(),
        color,
        status,
        isPinned,
        tags,
      });
      setSaveStatus('saved');
      onClose();
    } catch (err) {
      console.error('Failed to save note:', err);
      setSaveStatus('idle');
      setSaveError('Failed to save note. Check your connection and try again.');
    }
  };

  const handleToggleArchive = async () => {
    if (!canToggleArchive || !note?.id || saveStatus === 'saving') return;
    clearTimer();
    const nextTags = isArchived
      ? tags.filter((tag) => tag !== 'archive')
      : [...tags, 'archive'];
    setSaveError('');
    setSaveStatus('saving');
    try {
      await onSave({
        id: note.id,
        title: title.trim() || 'Untitled',
        content: getEditorContent(),
        color,
        status,
        isPinned,
        tags: nextTags,
      });
      setTags(nextTags);
      setSaveStatus('saved');
      onClose();
    } catch (err) {
      console.error('Failed to update archive status:', err);
      setSaveStatus('idle');
      setSaveError('Could not update archive status. Please try again.');
    }
  };

  const drawerMarkup = (
    <div
      className={styles.overlay}
      onClick={requestClose}
    >
      <div
        className={`${styles.drawer} ${isFocusMode ? styles.drawerFocus : ''}`}
        role="dialog"
        aria-modal="true"
        aria-label={note?.id ? 'Edit Note' : 'Create Note'}
        onClick={(e) => e.stopPropagation()}
      >
        <NoteEditorHeader
          isEditing={Boolean(note?.id)}
          isFocusMode={isFocusMode}
          saveStatus={saveStatus}
          isArchived={isArchived}
          onToggleFocusMode={() => setIsFocusMode(!isFocusMode)}
          onToggleArchive={canToggleArchive ? () => void handleToggleArchive() : undefined}
          onExportCurrentNote={
            note?.id
              ? (format) => {
                  downloadExportedNotes(
                    [
                      {
                        ...(note as Note),
                        title: title.trim() || 'Untitled',
                        content: getEditorContent(),
                        color,
                        status,
                        isPinned,
                        tags,
                      },
                    ],
                    format,
                    'single',
                    title.trim() || 'note'
                  );
                }
              : undefined
          }
          onClose={requestClose}
        />

        <div className={styles.drawerBody}>
          {saveError && (
            <div className={styles.saveErrorBanner} role="alert">
              <span>{saveError}</span>
            </div>
          )}
          {isConfirmingDiscard && (
            <div className={styles.saveErrorBanner} role="alertdialog" aria-label="Confirm discard unsaved changes">
              <span>{note?.id ? 'Discard unsaved changes?' : 'Discard unsaved draft?'}</span>
              <div className={styles.confirmActionsRow}>
                <button
                  type="button"
                  className={styles.confirmCancelBtn}
                  onClick={() => setIsConfirmingDiscard(false)}
                >
                  Keep editing
                </button>
                <button
                  type="button"
                  className={styles.confirmDangerBtn}
                  onClick={onClose}
                >
                  Discard
                </button>
              </div>
            </div>
          )}
          <input
            type="text"
            className={styles.titleInput}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Note title..."
            aria-label="Note title"
          />

          <div>
            <button
              type="button"
              className={styles.collapsibleToggle}
              onClick={() => setShowMetadata(!showMetadata)}
              aria-expanded={showMetadata}
            >
              {showMetadata ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
              <span>{showMetadata ? 'Hide Details' : 'Details & Tags'}</span>
              {!showMetadata && hasCustomMetadata && (
                <span aria-label="Has tags or color">· {tags.length || '•'}</span>
              )}
            </button>
          </div>

          {showMetadata && (
            <>
              <NoteMetaRow
                color={color}
                isPinned={isPinned}
                status={status}
                onColorChange={setColor}
                onTogglePin={() => setIsPinned(!isPinned)}
                onStatusChange={setStatus}
              />
              <NoteTagList
                tags={tags}
                onAddTag={(tag) => !tags.includes(tag) && setTags([...tags, tag])}
                onRemoveTag={(tag) => setTags(tags.filter((t) => t !== tag))}
              />
            </>
          )}

          {!isFocusMode && <EditorToolbar editor={editor} />}

          <div className={styles.editorContent}>
            <EditorContent editor={editor} />
          </div>
        </div>

        <div className={styles.drawerFooter}>
          <button type="button" className={styles.cancelBtn} onClick={requestClose} disabled={saveStatus === 'saving'}>
            {note?.id && saveStatus === 'saved' ? 'Close' : 'Cancel'}
          </button>
          <button type="button" className={styles.saveBtn} onClick={handleManualSave} disabled={saveStatus === 'saving'}>
            {saveStatus === 'saving' ? 'Saving...' : 'Save Note'}
          </button>
        </div>
      </div>
    </div>
  );

  return typeof document !== 'undefined' ? createPortal(drawerMarkup, document.body) : drawerMarkup;
}
