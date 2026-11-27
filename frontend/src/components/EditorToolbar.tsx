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

  const toolGroups = [
    {
      name: 'Text style',
      items: [
        { label: 'Bold', active: editor.isActive('bold'), icon: Bold, run: () => editor.chain().focus().toggleBold().run() },
        { label: 'Italic', active: editor.isActive('italic'), icon: Italic, run: () => editor.chain().focus().toggleItalic().run() },
        { label: 'Heading 1', active: editor.isActive('heading', { level: 1 }), icon: Heading1, run: () => editor.chain().focus().toggleHeading({ level: 1 }).run() },
        { label: 'Heading 2', active: editor.isActive('heading', { level: 2 }), icon: Heading2, run: () => editor.chain().focus().toggleHeading({ level: 2 }).run() },
      ],
    },
    {
      name: 'Blocks',
      items: [
        { label: 'Bullet List', active: editor.isActive('bulletList'), icon: List, run: () => editor.chain().focus().toggleBulletList().run() },
        { label: 'Numbered List', active: editor.isActive('orderedList'), icon: ListOrdered, run: () => editor.chain().focus().toggleOrderedList().run() },
        { label: 'Quote', active: editor.isActive('blockquote'), icon: Quote, run: () => editor.chain().focus().toggleBlockquote().run() },
        { label: 'Code Block', active: editor.isActive('codeBlock'), icon: Code, run: () => editor.chain().focus().toggleCodeBlock().run() },
      ],
    },
    {
      name: 'History',
      items: [
        { label: 'Undo', active: false, icon: Undo, run: () => editor.chain().focus().undo().run() },
        { label: 'Redo', active: false, icon: Redo, run: () => editor.chain().focus().redo().run() },
      ],
    },
  ];

  return (
    <div className={styles.editorToolbar} role="toolbar" aria-label="Note formatting">
      {toolGroups.map((group) => (
        <div key={group.name} className={styles.toolbarGroup} role="group" aria-label={group.name}>
          {group.items.map(({ label, active, icon: Icon, run }) => (
            <button
              key={label}
              type="button"
              className={`${styles.toolButton} ${active ? styles.toolActive : ''}`}
              onClick={run}
              title={label}
              aria-label={label}
              aria-pressed={label !== 'Undo' && label !== 'Redo' ? active : undefined}
            >
              <Icon size={14} />
            </button>
          ))}
        </div>
      ))}
    </div>
  );
}

EditorToolbar.propTypes = {
  editor: PropTypes.shape({
    isActive: PropTypes.func.isRequired,
    chain: PropTypes.func.isRequired,
  }),
};
