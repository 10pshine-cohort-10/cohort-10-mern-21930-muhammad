import { useState, type KeyboardEvent, type MouseEvent } from 'react';
import PropTypes from 'prop-types';
import { Pin, Trash2 } from 'lucide-react';
import type { Note } from '../types';
import { extractPlainText, formatRelativeTime } from '../utils/formatters';
import styles from './NoteCard.module.css';

const COLOR_CLASS_MAP: Record<string, string> = {
  slate: styles.colorSlate,
  sage: styles.colorSage,
  teal: styles.colorTeal,
  sand: styles.colorSand,
  lavender: styles.colorLavender,
  rose: styles.colorRose,
};

export interface NoteCardProps {
  note: Note;
  onSelect: (note: Note) => void;
  onTogglePin: (id: string, isPinned: boolean) => void;
  onDelete: (id: string) => void;
}

export default function NoteCard({ note, onSelect, onTogglePin, onDelete }: NoteCardProps) {
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);

  const cardColorClass = (note.color && COLOR_CLASS_MAP[note.color]) || styles.colorSlate;
  const plainPreview = extractPlainText(note.content || '');

  const handleCardClick = () => {
    if (!isConfirmingDelete && onSelect) {
      onSelect(note);
    }
  };

  const handlePinClick = (event: MouseEvent) => {
    event.stopPropagation();
    if (onTogglePin) {
      onTogglePin(note.id, !note.isPinned);
    }
  };

  const handleDeleteTrigger = (event: MouseEvent) => {
    event.stopPropagation();
    setIsConfirmingDelete(true);
  };

  const handleConfirmDelete = (event: MouseEvent) => {
    event.stopPropagation();
    if (onDelete) {
      onDelete(note.id);
    }
    setIsConfirmingDelete(false);
  };

  const handleCancelDelete = (event: MouseEvent) => {
    event.stopPropagation();
    setIsConfirmingDelete(false);
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleCardClick();
    }
  };

  return (
    <div
      className={`${styles.card} ${cardColorClass} ${note.isPinned ? styles.cardPinned : ''}`}
      onClick={handleCardClick}
      role="button"
      tabIndex={0}
      onKeyDown={handleKeyDown}
    >
      <div className={styles.cardHeader}>
        <h3 className={styles.title}>{note.title || 'Untitled'}</h3>

        <div className={styles.actions}>
          <button
            type="button"
            className={`${styles.iconButton} ${note.isPinned ? styles.pinActive : ''}`}
            onClick={handlePinClick}
            title={note.isPinned ? 'Unpin note' : 'Pin note'}
            aria-label={note.isPinned ? 'Unpin note' : 'Pin note'}
          >
            <Pin size={14} fill={note.isPinned ? 'currentColor' : 'none'} />
          </button>

          <button
            type="button"
            className={`${styles.iconButton} ${styles.deleteButton}`}
            onClick={handleDeleteTrigger}
            title="Delete note"
            aria-label="Delete note"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      <p className={styles.preview}>
        {plainPreview || <span style={{ fontStyle: 'italic', opacity: 0.6 }}>Empty note</span>}
      </p>

      <div className={styles.cardFooter}>
        <div className={styles.tagsList}>
          {note.tags &&
            note.tags.map((tag) => (
              <span key={tag} className={styles.tagPill}>
                #{tag}
              </span>
            ))}
        </div>

        <span className={styles.timestamp}>{formatRelativeTime(note.createdAt || '')}</span>
      </div>

      {isConfirmingDelete && (
        <div className={styles.deleteConfirm} onClick={(e) => e.stopPropagation()}>
          <p className={styles.confirmMessage}>Delete this note?</p>
          <div className={styles.confirmActions}>
            <button type="button" className={styles.confirmButton} onClick={handleConfirmDelete}>
              Delete
            </button>
            <button type="button" className={styles.cancelButton} onClick={handleCancelDelete}>
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

NoteCard.propTypes = {
  note: PropTypes.shape({
    id: PropTypes.string.isRequired,
    title: PropTypes.string,
    content: PropTypes.string,
    color: PropTypes.string,
    isPinned: PropTypes.bool,
    tags: PropTypes.arrayOf(PropTypes.string),
    createdAt: PropTypes.string,
  }).isRequired,
  onSelect: PropTypes.func.isRequired,
  onTogglePin: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
};
