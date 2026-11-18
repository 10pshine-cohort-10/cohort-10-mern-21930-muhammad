import { useState } from 'react';
import { Pin, Trash2 } from 'lucide-react';
import styles from './NoteCard.module.css';

function extractPlainText(html) {
  if (!html) return '';
  const temporaryDiv = document.createElement('div');
  temporaryDiv.innerHTML = html;
  return temporaryDiv.textContent || temporaryDiv.innerText || '';
}

function formatRelativeTime(dateString) {
  if (!dateString) return '';
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now - date) / 1000);

  if (diffInSeconds < 60) return 'Just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

export default function NoteCard({ note, onSelect, onTogglePin, onDelete }) {
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);

  const colorClassMap = {
    slate: styles.colorSlate,
    sage: styles.colorSage,
    teal: styles.colorTeal,
    sand: styles.colorSand,
    lavender: styles.colorLavender,
    rose: styles.colorRose,
  };

  const cardColorClass = colorClassMap[note.color] || styles.colorSlate;
  const plainPreview = extractPlainText(note.content);

  const handleCardClick = () => {
    if (!isConfirmingDelete && onSelect) {
      onSelect(note);
    }
  };

  const handlePinClick = (event) => {
    event.stopPropagation();
    if (onTogglePin) {
      onTogglePin(note.id, !note.isPinned);
    }
  };

  const handleDeleteTrigger = (event) => {
    event.stopPropagation();
    setIsConfirmingDelete(true);
  };

  const handleConfirmDelete = (event) => {
    event.stopPropagation();
    if (onDelete) {
      onDelete(note.id);
    }
    setIsConfirmingDelete(false);
  };

  const handleCancelDelete = (event) => {
    event.stopPropagation();
    setIsConfirmingDelete(false);
  };

  return (
    <div
      className={`${styles.card} ${cardColorClass} ${note.isPinned ? styles.cardPinned : ''}`}
      onClick={handleCardClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleCardClick();
        }
      }}
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

        <span className={styles.timestamp}>{formatRelativeTime(note.createdAt)}</span>
      </div>

      {isConfirmingDelete && (
        <div className={styles.deleteConfirm} onClick={(e) => e.stopPropagation()}>
          <p className={styles.confirmMessage}>Delete this note?</p>
          <div className={styles.confirmActions}>
            <button
              type="button"
              className={styles.confirmButton}
              onClick={handleConfirmDelete}
            >
              Delete
            </button>
            <button
              type="button"
              className={styles.cancelButton}
              onClick={handleCancelDelete}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
