import { useState, useRef, useEffect, type DragEvent } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { ArrowRight, ChevronDown } from 'lucide-react';
import { formatRelativeTime, extractPlainText } from '../utils/formatters';
import { getNoteTilt } from '../utils/noteTilt';
import type { Note, NoteStatus } from '../types';
import styles from './KanbanBoard.module.css';

const COLOR_CLASS_MAP: Record<string, string> = {
  slate: styles.colorSlate,
  sage: styles.colorSage,
  teal: styles.colorTeal,
  sand: styles.colorSand,
  lavender: styles.colorLavender,
  rose: styles.colorRose,
};

export interface KanbanColumnOption {
  status: NoteStatus;
  label: string;
}

export interface KanbanCardProps {
  note: Note;
  columnStatus: NoteStatus;
  columns: KanbanColumnOption[];
  isDragging: boolean;
  isJustDropped: boolean;
  onDragStart: (event: DragEvent<HTMLDivElement>, noteId: string) => void;
  onDragEnd: () => void;
  onOpenNote: (note: Note) => void;
  onMoveStatus: (noteId: string, nextStatus: NoteStatus) => Promise<void>;
}

export default function KanbanCard({
  note,
  columnStatus,
  columns,
  isDragging,
  isJustDropped,
  onDragStart,
  onDragEnd,
  onOpenNote,
  onMoveStatus,
}: KanbanCardProps) {
  const [isMoveMenuOpen, setIsMoveMenuOpen] = useState(false);
  const moveMenuRef = useRef<HTMLDivElement>(null);
  const moveTriggerRef = useRef<HTMLButtonElement>(null);

  const shouldReduceMotion = useReducedMotion();
  const shouldSwing = isJustDropped && !shouldReduceMotion;
  const restingTilt = shouldReduceMotion ? 0 : getNoteTilt(note.id);
  const targetTilt = isDragging ? 0 : restingTilt;
  const cardColorClass = (note.color && COLOR_CLASS_MAP[note.color]) || styles.colorSlate;
  const targetColumns = columns.filter((c) => c.status !== columnStatus);

  useEffect(() => {
    if (!isMoveMenuOpen) return;
    const handleOutside = (event: MouseEvent) => {
      if (moveMenuRef.current && !moveMenuRef.current.contains(event.target as Node)) {
        setIsMoveMenuOpen(false);
      }
    };
    window.addEventListener('mousedown', handleOutside);
    return () => window.removeEventListener('mousedown', handleOutside);
  }, [isMoveMenuOpen]);

  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, note.id)}
      onDragEnd={onDragEnd}
      className={`${styles.dragWrapper} ${isDragging ? styles.dragging : ''} ${shouldSwing || isMoveMenuOpen ? styles.kanbanCardSwinging : ''}`}
    >
      <motion.div
        className={styles.motionCard}
        initial={shouldSwing ? { rotate: restingTilt - 8 } : false}
        animate={{ rotate: targetTilt }}
        transition={
          shouldSwing
            ? { type: 'spring', stiffness: 260, damping: 14, mass: 0.9 }
            : shouldReduceMotion
              ? { duration: 0 }
              : { duration: 0.14 }
        }
      >
        <div className={`${styles.kanbanCard} ${cardColorClass}`}>
          {note.isPinned && (
            <div className={styles.pinIndicator} aria-hidden="true">
              <div className={styles.pinHole} />
            </div>
          )}

          <button type="button" className={styles.cardBodyBtn} onClick={() => onOpenNote(note)}>
            <div className={styles.cardTitle}>{note.title || 'Untitled'}</div>
            {note.content && (
              <p className={styles.cardPreview}>{extractPlainText(note.content).slice(0, 80)}</p>
            )}
          </button>

          <div className={styles.cardFooter}>
            <div className={styles.cardFooterTop}>
              <span className={styles.updatedLabel}>Updated {formatRelativeTime(note.updatedAt)}</span>
              <div className={styles.moveMenuWrap} ref={moveMenuRef}>
                <button
                  ref={moveTriggerRef}
                  type="button"
                  className={styles.moveToTrigger}
                  onClick={() => setIsMoveMenuOpen((prev) => !prev)}
                  aria-haspopup="menu"
                  aria-expanded={isMoveMenuOpen}
                  aria-label="Move to column"
                >
                  <span>Move to</span>
                  <ChevronDown size={11} />
                </button>
                {isMoveMenuOpen && (
                  <div
                    className={styles.moveDropdown}
                    role="menu"
                    aria-label="Move note to column"
                    onKeyDown={(e) => {
                      if (e.key === 'Escape') {
                        e.stopPropagation();
                        setIsMoveMenuOpen(false);
                        moveTriggerRef.current?.focus();
                      }
                    }}
                  >
                    {targetColumns.map((target) => (
                      <button
                        key={target.status}
                        type="button"
                        role="menuitem"
                        className={styles.moveDropdownItem}
                        onClick={() => {
                          setIsMoveMenuOpen(false);
                          onMoveStatus(note.id, target.status);
                        }}
                      >
                        <ArrowRight size={11} />
                        <span>{target.label}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
