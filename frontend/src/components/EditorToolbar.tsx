import PropTypes from 'prop-types';
import type { Editor } from '@tiptap/react';
import {
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
} from 'lucide-react';
import styles from './NoteEditor.module.css';

export interface EditorToolbarProps {
  editor: Editor | null;
}

export default function EditorToolbar({ editor }: EditorToolbarProps) {
  if (!editor || editor.isDestroyed) return null;

  return (
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
  );
}

EditorToolbar.propTypes = {
  editor: PropTypes.shape({
    isActive: PropTypes.func.isRequired,
    chain: PropTypes.func.isRequired,
  }),
};
