import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { X } from 'lucide-react';
import EditorToolbar from './EditorToolbar';
import NoteMetaRow from './NoteMetaRow';
import NoteTagList from './NoteTagList';
import styles from './NoteEditor.module.css';

/**
 * Slide-over drawer for creating or editing rich text notes.
 * @param {{
 *   note: { id?: string, title?: string, content?: string, color?: string, isPinned?: boolean, tags?: string[] } | null,
 *   isOpen: boolean,
 *   onClose: () => void,
 *   onSave: (data: object) => Promise<void>
 * }} props
 */
export default function NoteEditor({ note, isOpen, onClose, onSave }) {
  const [title, setTitle] = useState('');
  const [color, setColor] = useState('slate');
  const [isPinned, setIsPinned] = useState(false);
  const [tags, setTags] = useState([]);
  const [isSaving, setIsSaving] = useState(false);

  const editor = useEditor({
    extensions: [StarterKit],
    content: note?.content || '',
    editorProps: {
      attributes: {
        class: styles.tiptapEditor,
      },
    },
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

  const handleAddTag = (newTag) => {
    if (!tags.includes(newTag)) setTags([...tags, newTag]);
  };

  const handleRemoveTag = (tagToRemove) => {
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
      <div className={styles.drawer} onClick={(e) => e.stopPropagation()}>
        <div className={styles.drawerHeader}>
          <span className={styles.headerTitle}>{note ? 'Edit Note' : 'Create Note'}</span>
          <button
            type="button"
            className={styles.closeButton}
            onClick={onClose}
            aria-label="Close editor"
          >
            <X size={18} />
          </button>
        </div>

        <div className={styles.drawerBody}>
          <input
            type="text"
            className={styles.titleInput}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Note title..."
          />

          <NoteMetaRow
            color={color}
            isPinned={isPinned}
            onColorChange={setColor}
            onTogglePin={() => setIsPinned(!isPinned)}
          />

          <NoteTagList
            tags={tags}
            onAddTag={handleAddTag}
            onRemoveTag={handleRemoveTag}
          />

          <EditorToolbar editor={editor} />

          <div className={styles.editorContent}>
            <EditorContent editor={editor} />
          </div>
        </div>

        <div className={styles.drawerFooter}>
          <button type="button" className={styles.cancelBtn} onClick={onClose} disabled={isSaving}>
            Cancel
          </button>
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
