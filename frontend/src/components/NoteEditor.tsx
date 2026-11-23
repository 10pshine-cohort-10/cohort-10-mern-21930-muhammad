import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { ChevronDown, ChevronRight } from 'lucide-react';
import NoteEditorHeader from './NoteEditorHeader';
import EditorToolbar from './EditorToolbar';
import NoteMetaRow from './NoteMetaRow';
import NoteTagList from './NoteTagList';
import type { Note, NoteInput, NoteColor } from '../types';
import styles from './NoteEditor.module.css';

export interface NoteEditorProps {
  note: Note | NoteInput | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: NoteInput) => Promise<void>;
}

export default function NoteEditor({ note, isOpen, onClose, onSave }: NoteEditorProps) {
  const [title, setTitle] = useState<string>('');
  const [color, setColor] = useState<NoteColor>('slate');
  const [isPinned, setIsPinned] = useState<boolean>(false);
  const [tags, setTags] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [isFocusMode, setIsFocusMode] = useState<boolean>(false);
  const [showMetadata, setShowMetadata] = useState<boolean>(false);

  const editor = useEditor({
    extensions: [StarterKit],
    content: note?.content || '',
    editorProps: { attributes: { class: styles.tiptapEditor } },
  });

  useEffect(() => {
    setTitle(note?.title || '');
    setColor(note?.color || 'slate');
    setIsPinned(Boolean(note?.isPinned));
    setTags(Array.isArray(note?.tags) ? note.tags : []);
    if (editor) {
      editor.commands.setContent(note?.content || '');
    }
  }, [note, editor]);

  if (!isOpen) return null;

  const handleAddTag = (newTag: string) => {
    if (!tags.includes(newTag)) setTags([...tags, newTag]);
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((t) => t !== tagToRemove));
  };

  const handleSave = async () => {
    const htmlContent = editor ? editor.getHTML() : '';
    setIsSaving(true);
    try {
      await onSave({
        id: note?.id,
        title: title.trim() || 'Untitled',
        content: htmlContent,
        color,
        isPinned,
        tags,
      });
      onClose();
    } catch (err) {
      console.error('Failed to save note in editor:', err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={`${styles.drawer} ${isFocusMode ? styles.drawerFocus : ''}`} onClick={(e) => e.stopPropagation()}>
        <NoteEditorHeader
          isEditing={Boolean(note?.id)}
          isFocusMode={isFocusMode}
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
            </button>
          </div>

          {showMetadata && (
            <>
              <NoteMetaRow
                color={color}
                isPinned={isPinned}
                onColorChange={setColor}
                onTogglePin={() => setIsPinned(!isPinned)}
              />
              <NoteTagList tags={tags} onAddTag={handleAddTag} onRemoveTag={handleRemoveTag} />
            </>
          )}

          {!isFocusMode && <EditorToolbar editor={editor} />}

          <div className={styles.editorContent}>
            <EditorContent editor={editor} />
          </div>
        </div>

        <div className={styles.drawerFooter}>
          <button type="button" className={styles.cancelBtn} onClick={onClose} disabled={isSaving}>Cancel</button>
          <button type="button" className={styles.saveBtn} onClick={handleSave} disabled={isSaving}>
            {isSaving ? 'Saving...' : 'Save Note'}
          </button>
        </div>
      </div>
    </div>
  );
}

NoteEditor.propTypes = {
  note: PropTypes.shape({
    id: PropTypes.string,
    title: PropTypes.string,
    content: PropTypes.string,
    color: PropTypes.string,
    isPinned: PropTypes.bool,
    tags: PropTypes.arrayOf(PropTypes.string),
  }),
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
};
