import { useState, useEffect, useCallback } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { ChevronDown, ChevronRight } from 'lucide-react';
import NoteEditorHeader from './NoteEditorHeader';
import EditorToolbar from './EditorToolbar';
import NoteMetaRow from './NoteMetaRow';
import NoteTagList from './NoteTagList';
import { useDebouncedAutosave } from '../hooks/useDebouncedAutosave';
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
  const [title, setTitle] = useState<string>('');
  const [color, setColor] = useState<NoteColor>('slate');
  const [status, setStatus] = useState<NoteStatus | null>(null);
  const [isPinned, setIsPinned] = useState<boolean>(false);
  const [tags, setTags] = useState<string[]>([]);
  const [isFocusMode, setIsFocusMode] = useState<boolean>(false);
  const [showMetadata, setShowMetadata] = useState<boolean>(false);

  const editor = useEditor({
    extensions: [StarterKit],
    content: note?.content || '',
    editorProps: { attributes: { class: styles.tiptapEditor } },
  });

  const getEditorContent = useCallback(
    () => (editor && !editor.isDestroyed ? editor.getHTML() : ''),
    [editor]
  );

  const { saveStatus, setSaveStatus, clearTimer } = useDebouncedAutosave({
    noteId: note?.id,
    isOpen,
    title,
    color,
    isPinned,
    tags,
    getContent: getEditorContent,
    onSave,
  });

  useEffect(() => {
    setTitle(note?.title || '');
    setColor(note?.color || 'slate');
    setStatus(note?.status ?? null);
    setIsPinned(Boolean(note?.isPinned));
    setTags(Array.isArray(note?.tags) ? note.tags : []);
    if (editor && !editor.isDestroyed) {
      editor.commands.setContent(note?.content || '');
    }
  }, [note, editor]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && saveStatus !== 'saving') {
        event.preventDefault();
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose, saveStatus]);

  const hasCustomMetadata = tags.length > 0 || color !== 'slate' || isPinned;

  const handleManualSave = async () => {
    clearTimer();
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
    }
  };

  return (
    <div
      className={styles.overlay}
      onClick={() => {
        if (saveStatus !== 'saving') onClose();
      }}
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
          onToggleFocusMode={() => setIsFocusMode(!isFocusMode)}
          onClose={onClose}
        />

        <div className={styles.drawerBody}>
          <input
            type="text"
            className={styles.titleInput}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Note title..."
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
          <button type="button" className={styles.cancelBtn} onClick={onClose} disabled={saveStatus === 'saving'}>
            Cancel
          </button>
          <button type="button" className={styles.saveBtn} onClick={handleManualSave} disabled={saveStatus === 'saving'}>
            {saveStatus === 'saving' ? 'Saving...' : 'Save Note'}
          </button>
        </div>
      </div>
    </div>
  );
}
