import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Plus, Search } from 'lucide-react';
import type { Note, NoteStatus } from '../types';
import styles from './KanbanBoard.module.css';

export interface KanbanColumnAddMenuProps {
  status: NoteStatus;
  columnLabel: string;
  anchorEl: HTMLButtonElement;
  untrackedNotes: Note[];
  onCreateNew: (status: NoteStatus) => void;
  onAddExisting: (noteId: string, status: NoteStatus) => Promise<void>;
  onClose: () => void;
}

export default function KanbanColumnAddMenu({
  status,
  columnLabel,
  anchorEl,
  untrackedNotes,
  onCreateNew,
  onAddExisting,
  onClose,
}: KanbanColumnAddMenuProps) {
  const [filterText, setFilterText] = useState('');
  const menuRef = useRef<HTMLDivElement>(null);
  const rect = anchorEl.getBoundingClientRect();

  const top = Math.min(rect.bottom + 6, Math.max(12, window.innerHeight - 300));
  const right = Math.max(12, window.innerWidth - rect.right);

  useEffect(() => {
    const handleOutside = (event: MouseEvent) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target as Node) &&
        !anchorEl.contains(event.target as Node)
      ) {
        onClose();
        anchorEl.focus();
      }
    };
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.stopPropagation();
        onClose();
        anchorEl.focus();
      }
    };
    window.addEventListener('mousedown', handleOutside);
    window.addEventListener('keydown', handleKey);
    return () => {
      window.removeEventListener('mousedown', handleOutside);
      window.removeEventListener('keydown', handleKey);
    };
  }, [anchorEl, onClose]);

  const query = filterText.trim().toLowerCase();
  const filtered = query
    ? untrackedNotes.filter((n) => (n.title || 'Untitled').toLowerCase().includes(query))
    : untrackedNotes;

  return createPortal(
    <div
      ref={menuRef}
      className={styles.columnPopover}
      style={{ top: `${top}px`, right: `${right}px` }}
      role="dialog"
      aria-label={`Add note to ${columnLabel}`}
    >
      <button
        type="button"
        className={styles.popoverNewBtn}
        onClick={() => {
          onClose();
          anchorEl.focus();
          onCreateNew(status);
        }}
      >
        <Plus size={14} />
        <span>New note</span>
      </button>

      <div className={styles.popoverDivider} />

      <div className={styles.popoverSearchBox}>
        <Search size={13} className={styles.popoverSearchIcon} />
        <input
          type="text"
          className={styles.popoverSearchInput}
          value={filterText}
          onChange={(e) => setFilterText(e.target.value)}
          placeholder="Add existing note…"
          aria-label="Filter existing notes"
          autoFocus
        />
      </div>

      <div className={styles.popoverList}>
        {filtered.length === 0 ? (
          <div className={styles.popoverEmpty}>
            {untrackedNotes.length === 0 ? 'No untracked notes to add' : 'No matching notes'}
          </div>
        ) : (
          filtered.map((note) => (
            <button
              key={note.id}
              type="button"
              className={styles.popoverNoteItem}
              onClick={async () => {
                onClose();
                anchorEl.focus();
                await onAddExisting(note.id, status);
              }}
            >
              {note.title || 'Untitled'}
            </button>
          ))
        )}
      </div>
    </div>,
    document.body
  );
}
