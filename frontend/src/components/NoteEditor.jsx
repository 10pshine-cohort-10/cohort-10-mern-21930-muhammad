import { useState, useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import {
  X,
  Bold,
  Italic,
  Heading1,
  Heading2,
  List,
  ListOrdered,
  Code,
  Quote,
  Undo,
  Redo,
  Pin,
} from 'lucide-react';
import styles from './NoteEditor.module.css';

export default function NoteEditor({ note, isOpen, onClose, onSave }) {
  const [title, setTitle] = useState('');
  const [color, setColor] = useState('slate');
  const [isPinned, setIsPinned] = useState(false);
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState('');
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
    if (note) {
      setTitle(note.title || '');
      setColor(note.color || 'slate');
      setIsPinned(Boolean(note.isPinned));
      setTags(Array.isArray(note.tags) ? note.tags : []);
      if (editor) {
        editor.commands.setContent(note.content || '');
      }
    } else {
      setTitle('');
      setColor('slate');
      setIsPinned(false);
      setTags([]);
      if (editor) {
        editor.commands.setContent('');
      }
    }
  }, [note, editor]);

  if (!isOpen) return null;

  const handleAddTag = (event) => {
    if (event.key === 'Enter' || event.key === ',') {
      event.preventDefault();
      const trimmed = tagInput.trim().replace(/^#/, '');
      if (trimmed && !tags.includes(trimmed)) {
        setTags([...tags, trimmed]);
      }
      setTagInput('');
    }
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
    } finally {
      setIsSaving(false);
    }
  };

  const colors = [
    { key: 'slate', className: styles.colorSlate, label: 'Slate' },
    { key: 'sage', className: styles.colorSage, label: 'Sage' },
    { key: 'teal', className: styles.colorTeal, label: 'Teal' },
    { key: 'sand', className: styles.colorSand, label: 'Sand' },
    { key: 'lavender', className: styles.colorLavender, label: 'Lavender' },
    { key: 'rose', className: styles.colorRose, label: 'Rose' },
  ];

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

          <div className={styles.optionsRow}>
            <div className={styles.colorPicker} title="Note color theme">
              {colors.map((c) => (
                <button
                  key={c.key}
                  type="button"
                  className={`${styles.colorDot} ${c.className} ${color === c.key ? styles.colorDotActive : ''}`}
                  onClick={() => setColor(c.key)}
                  aria-label={`Color ${c.label}`}
                />
              ))}
            </div>

            <button
              type="button"
              className={`${styles.pinToggle} ${isPinned ? styles.pinActive : ''}`}
              onClick={() => setIsPinned(!isPinned)}
            >
              <Pin size={14} fill={isPinned ? 'currentColor' : 'none'} />
              <span>{isPinned ? 'Pinned' : 'Pin note'}</span>
            </button>
          </div>

          <div className={styles.tagsContainer}>
            <div className={styles.tagsList}>
              {tags.map((tag) => (
                <span key={tag} className={styles.tagItem}>
                  #{tag}
                  <button
                    type="button"
                    className={styles.removeTagBtn}
                    onClick={() => handleRemoveTag(tag)}
                    aria-label={`Remove tag ${tag}`}
                  >
                    <X size={12} />
                  </button>
                </span>
              ))}
            </div>
            <input
              type="text"
              className={styles.tagInput}
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={handleAddTag}
              placeholder="Add tag and press Enter"
            />
          </div>

          {editor && (
            <div className={styles.editorToolbar}>
              <button
                type="button"
                className={`${styles.toolButton} ${editor.isActive('bold') ? styles.toolActive : ''}`}
                onClick={() => editor.chain().focus().toggleBold().run()}
                title="Bold"
              >
                <Bold size={14} />
              </button>
              <button
                type="button"
                className={`${styles.toolButton} ${editor.isActive('italic') ? styles.toolActive : ''}`}
                onClick={() => editor.chain().focus().toggleItalic().run()}
                title="Italic"
              >
                <Italic size={14} />
              </button>
              <button
                type="button"
                className={`${styles.toolButton} ${editor.isActive('heading', { level: 1 }) ? styles.toolActive : ''}`}
                onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                title="Heading 1"
              >
                <Heading1 size={14} />
              </button>
              <button
                type="button"
                className={`${styles.toolButton} ${editor.isActive('heading', { level: 2 }) ? styles.toolActive : ''}`}
                onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                title="Heading 2"
              >
                <Heading2 size={14} />
              </button>
              <button
                type="button"
                className={`${styles.toolButton} ${editor.isActive('bulletList') ? styles.toolActive : ''}`}
                onClick={() => editor.chain().focus().toggleBulletList().run()}
                title="Bullet List"
              >
                <List size={14} />
              </button>
              <button
                type="button"
                className={`${styles.toolButton} ${editor.isActive('orderedList') ? styles.toolActive : ''}`}
                onClick={() => editor.chain().focus().toggleOrderedList().run()}
                title="Numbered List"
              >
                <ListOrdered size={14} />
              </button>
              <button
                type="button"
                className={`${styles.toolButton} ${editor.isActive('blockquote') ? styles.toolActive : ''}`}
                onClick={() => editor.chain().focus().toggleBlockquote().run()}
                title="Quote"
              >
                <Quote size={14} />
              </button>
              <button
                type="button"
                className={`${styles.toolButton} ${editor.isActive('codeBlock') ? styles.toolActive : ''}`}
                onClick={() => editor.chain().focus().toggleCodeBlock().run()}
                title="Code Block"
              >
                <Code size={14} />
              </button>
              <button
                type="button"
                className={styles.toolButton}
                onClick={() => editor.chain().focus().undo().run()}
                title="Undo"
              >
                <Undo size={14} />
              </button>
              <button
                type="button"
                className={styles.toolButton}
                onClick={() => editor.chain().focus().redo().run()}
                title="Redo"
              >
                <Redo size={14} />
              </button>
            </div>
          )}

          <div className={styles.editorContent}>
            <EditorContent editor={editor} />
          </div>
        </div>

        <div className={styles.drawerFooter}>
          <button
            type="button"
            className={styles.cancelBtn}
            onClick={onClose}
            disabled={isSaving}
          >
            Cancel
          </button>
          <button
            type="button"
            className={styles.saveBtn}
            onClick={handleSave}
            disabled={isSaving}
          >
            {isSaving ? 'Saving...' : 'Save Note'}
          </button>
        </div>
      </div>
    </div>
  );
}
