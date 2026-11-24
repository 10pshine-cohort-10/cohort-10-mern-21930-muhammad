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
  const plainPreview = extractPlainText(note.content || '');

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <h4 className={styles.title}>{note.title || 'Untitled'}</h4>
      </div>

      <p className={styles.preview}>
        {plainPreview || <span style={{ fontStyle: 'italic', opacity: 0.6 }}>Empty note</span>}
      </p>

      <div className={styles.footer}>
        <span className={styles.date}>{formatRelativeTime(note.updatedAt || note.createdAt)}</span>

        <div className={styles.actions}>
          <button
            type="button"
            className={styles.restoreBtn}
            onClick={() => onRestore(note)}
            title="Restore note to active desk"
          >
            <RotateCcw size={13} />
            <span>Restore</span>
          </button>

          <button
            type="button"
            className={styles.deleteBtn}
            onClick={() => onDeletePermanent(note.id)}
            title="Delete permanently"
            aria-label="Delete permanently"
          >
            <Trash2 size={15} />
          </button>
        </div>
      </div>
    </div>
  );
}
