import { useState } from 'react';
import { RotateCcw, Trash2 } from 'lucide-react';
import type { Note } from '../types';
import { extractPlainText, formatRelativeTime } from '../utils/formatters';
import styles from './ArchiveNoteCard.module.css';

export interface ArchiveNoteCardProps {
  note: Note;
  onRestore: (note: Note) => void;
  onDeletePermanent: (id: string) => void;
}

export default function ArchiveNoteCard({
  note,
  onRestore,
  onDeletePermanent,
}: ArchiveNoteCardProps) {
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
  const plainPreview = extractPlainText(note.content || '');

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <h4 className={styles.title}>{note.title || 'Untitled'}</h4>
      </div>

      <p className={styles.preview}>
        {plainPreview || <span className={styles.emptyPreviewMuted}>Empty note</span>}
      </p>

      <div className={styles.footer}>
        <span className={styles.date}>{formatRelativeTime(note.updatedAt || note.createdAt)}</span>

        <div className={styles.actions}>
          <button
            type="button"
            className={styles.restoreBtn}
            onClick={() => onRestore(note)}
            title="Restore note"
          >
            <RotateCcw size={13} />
            <span>Restore</span>
          </button>

          <button
            type="button"
            className={styles.deleteBtn}
            onClick={() => setIsConfirmingDelete((prev) => !prev)}
            title="Delete permanently"
            aria-label="Delete permanently"
            aria-expanded={isConfirmingDelete}
          >
            <Trash2 size={15} />
          </button>
        </div>
      </div>

      {isConfirmingDelete && (
        <div className={styles.confirmPromptRow} role="alert">
          <span>Delete forever?</span>
          <div className={styles.actions}>
            <button
              type="button"
              className={styles.restoreBtn}
              onClick={() => setIsConfirmingDelete(false)}
            >
              Cancel
            </button>
            <button
              type="button"
              className={styles.confirmDangerBtn}
              onClick={() => {
                setIsConfirmingDelete(false);
                onDeletePermanent(note.id);
              }}
            >
              Delete forever
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
