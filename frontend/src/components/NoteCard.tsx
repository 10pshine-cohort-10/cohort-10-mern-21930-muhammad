import { useState, useRef, useEffect, type KeyboardEvent, type MouseEvent } from 'react';
import { Pin, Trash2, MoreHorizontal, Check, FileJson, FileText, Leaf, Droplet, Star, Palette, Lightbulb, type LucideIcon } from 'lucide-react';
import NoteCardDeleteConfirm from './NoteCardDeleteConfirm';
import type { Note } from '../types';
import type { ExportFormat } from '../utils/noteExport';
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

const NOTE_ICON_MAP: Record<string, LucideIcon> = {
  slate: FileText,
  sage: Leaf,
  teal: Droplet,
  sand: Star,
  lavender: Palette,
  rose: Lightbulb,
};

export interface NoteCardProps {
  note: Note;
  isFocused?: boolean;
  isSelectionMode?: boolean;
  isSelected?: boolean;
  onToggleSelect?: (id: string) => void;
  onExportNote?: (note: Note, format: ExportFormat) => void;
  onSelect: (note: Note) => void;
  onTogglePin: (id: string, isPinned: boolean) => void;
  onDelete: (id: string) => void;
}

export default function NoteCard({
  note,
  isFocused = false,
  isSelectionMode = false,
  isSelected = false,
  onToggleSelect,
  onExportNote,
  onSelect,
  onTogglePin,
  onDelete,
}: NoteCardProps) {
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isMenuOpen) return;
    const handleOutside = (event: globalThis.MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    window.addEventListener('mousedown', handleOutside);
    return () => window.removeEventListener('mousedown', handleOutside);
  }, [isMenuOpen]);

  const cardColorClass = (note.color && COLOR_CLASS_MAP[note.color]) || styles.colorSlate;
  const BadgeIcon = (note.color && NOTE_ICON_MAP[note.color]) || FileText;
  const plainPreview = extractPlainText(note.content || '');

  const handleCardClick = (event?: MouseEvent) => {
    if (isConfirmingDelete) return;
    if (isSelectionMode || event?.shiftKey) {
      onToggleSelect?.(note.id);
      return;
    }
    onSelect?.(note);
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
      className={`${styles.card} ${cardColorClass} ${note.isPinned ? styles.cardPinned : ''} ${isFocused ? styles.cardFocused : ''} ${isMenuOpen ? styles.cardMenuOpen : ''} ${isSelected ? styles.cardSelected : ''}`}
      onClick={handleCardClick}
      role="button"
      tabIndex={0}
      aria-selected={isSelectionMode ? isSelected : undefined}
      onKeyDown={handleKeyDown}
    >
      {note.isPinned && (
        <div className={styles.hangingPinIndicator} title="Pinned to board">
          <div className={styles.hangingPinHole} />
        </div>
      )}

      <div className={styles.cardHeader}>
        <div className={styles.headerLeft}>
          {isSelectionMode ? (
            <span
              className={`${styles.selectBadge} ${isSelected ? styles.selectBadgeChecked : ''}`}
              aria-hidden="true"
            >
              {isSelected && <Check size={12} />}
            </span>
          ) : (
            <span className={styles.iconBadge} aria-hidden="true">
              <BadgeIcon size={15} />
            </span>
          )}
          <h3 className={styles.title}>{note.title || 'Untitled'}</h3>
        </div>

        <div className={styles.actions} ref={menuRef}>
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
            className={styles.iconButton}
            onClick={(e) => {
              e.stopPropagation();
              setIsMenuOpen((prev) => !prev);
            }}
            aria-haspopup="menu"
            aria-expanded={isMenuOpen}
            aria-label="More actions"
            title="More actions"
          >
            <MoreHorizontal size={15} />
          </button>
          {isMenuOpen && (
            <div
              className={styles.cardMenu}
              role="menu"
              aria-label="Note actions"
              onClick={(e) => e.stopPropagation()}
              onKeyDown={(e) => {
                if (e.key === 'Escape') {
                  e.stopPropagation();
                  setIsMenuOpen(false);
                }
              }}
            >
              {onExportNote && (
                <>
                  <button
                    type="button"
                    role="menuitem"
                    className={styles.cardMenuItem}
                    onClick={() => { setIsMenuOpen(false); onExportNote(note, 'json'); }}
                  >
                    <FileJson size={13} />
                    <span>Export JSON</span>
                  </button>
                  <button
                    type="button"
                    role="menuitem"
                    className={styles.cardMenuItem}
                    onClick={() => { setIsMenuOpen(false); onExportNote(note, 'markdown'); }}
                  >
                    <FileText size={13} />
                    <span>Export Markdown</span>
                  </button>
                  <div className={styles.cardMenuDivider} />
                </>
              )}
              <button
                type="button"
                role="menuitem"
                className={`${styles.cardMenuItem} ${styles.cardMenuItemDanger}`}
                onClick={(e) => { setIsMenuOpen(false); handleDeleteTrigger(e); }}
              >
                <Trash2 size={13} />
                <span>Delete note</span>
              </button>
            </div>
          )}
        </div>
      </div>

      <p className={styles.preview}>
        {plainPreview || <span style={{ fontStyle: 'italic', opacity: 0.6 }}>Empty note</span>}
      </p>

      <div className={styles.cardFooter}>
        <div className={styles.tagsList}>
          {Array.isArray(note.tags) &&
            note.tags.map((tag) => (
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
