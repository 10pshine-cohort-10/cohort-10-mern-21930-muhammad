import { useState, type KeyboardEvent, type MouseEvent } from 'react';
import { Pin, Trash2 } from 'lucide-react';
import NoteCardDeleteConfirm from './NoteCardDeleteConfirm';
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

const NOTE_BADGE_MAP: Record<string, string> = {
  slate: '📝',
  sage: '🌿',
  teal: '💧',
  sand: '⭐',
  lavender: '🎨',
  rose: '💡',
};

export interface NoteCardProps {
  note: Note;
  isFocused?: boolean;
  onSelect: (note: Note) => void;
  onTogglePin: (id: string, isPinned: boolean) => void;
  onDelete: (id: string) => void;
}

export default function NoteCard({
  note,
  isFocused = false,
  onSelect,
  onTogglePin,
  onDelete,
}: NoteCardProps) {
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);

  const cardColorClass = (note.color && COLOR_CLASS_MAP[note.color]) || styles.colorSlate;
  const noteBadge = note.isPinned ? '📌' : (note.color && NOTE_BADGE_MAP[note.color]) || '📝';
  const plainPreview = extractPlainText(note.content || '');

  const handleCardClick = () => {
    if (!isConfirmingDelete && onSelect) onSelect(note);
  };

  const handlePinClick = (event: MouseEvent) => {
    event.stopPropagation();
    onTogglePin?.(note.id, !note.isPinned);
  };

  const handleDeleteTrigger = (event: MouseEvent) => {
    event.stopPropagation();
    setIsConfirmingDelete(true);
  };

  const handleConfirmDelete = (event: MouseEvent) => {
    event.stopPropagation();
    onDelete?.(note.id);
    setIsConfirmingDelete(false);
  };

  const handleCancelDelete = (event: MouseEvent) => {
    event.stopPropagation();
    setIsConfirmingDelete(false);
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.target !== e.currentTarget) return;
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleCardClick();
    }
  };

  return (
    <div
      className={`${styles.card} ${cardColorClass} ${note.isPinned ? styles.cardPinned : ''} ${isFocused ? styles.cardFocused : ''}`}
      onClick={handleCardClick}
      role="button"
      tabIndex={0}
      onKeyDown={handleKeyDown}
    >
      {note.isPinned && (
        <div className={styles.hangingPinIndicator} title="Pinned to board">
          <div className={styles.hangingPinHole} />
        </div>
      )}

      <div className={styles.cardHeader}>
        <div className={styles.headerLeft}>
          <span className={styles.iconBadge}>{noteBadge}</span>
          <h3 className={styles.title}>{note.title || 'Untitled'}</h3>
        </div>

        <div className={styles.actions}>
          <button
            type="button"
            className={`${styles.iconButton} ${note.isPinned ? styles.pinActive : ''}`}
            onClick={handlePinClick}
            title={note.isPinned ? 'Unpin note' : 'Pin note'}
            aria-label={note.isPinned ? 'Unpin note' : 'Pin note'}
          >
            <Pin size={15} fill={note.isPinned ? 'currentColor' : 'none'} />
          </button>

          <button
            type="button"
            className={`${styles.iconButton} ${styles.deleteButton}`}
            onClick={handleDeleteTrigger}
            title="Delete note"
            aria-label="Delete note"
          >
            <Trash2 size={15} />
          </button>
        </div>
      </div>

      <p className={styles.preview}>
        {plainPreview || <span style={{ fontStyle: 'italic', opacity: 0.6 }}>Empty note</span>}
      </p>

      <div className={styles.cardFooter}>
        <div className={styles.tagsList}>
          {note.tags?.map((tag) => (
            <span key={tag} className={styles.tagPill}>
              #{tag}
            </span>
          ))}
        </div>

        <span className={styles.timestamp}>{formatRelativeTime(note.createdAt || '')}</span>
      </div>

      {isConfirmingDelete && (
        <NoteCardDeleteConfirm onConfirm={handleConfirmDelete} onCancel={handleCancelDelete} />
      )}
    </div>
  );
}
