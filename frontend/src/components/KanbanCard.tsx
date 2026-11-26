import type { DragEvent } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { formatRelativeTime, extractPlainText } from '../utils/formatters';
import type { Note, NoteStatus } from '../types';
import styles from './KanbanBoard.module.css';

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
  const shouldReduceMotion = useReducedMotion();
  const shouldSwing = isJustDropped && !shouldReduceMotion;

  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, note.id)}
      onDragEnd={onDragEnd}
      className={`${styles.dragWrapper} ${isDragging ? styles.dragging : ''} ${shouldSwing ? styles.kanbanCardSwinging : ''}`}
    >
      <motion.div
        style={{ transformOrigin: 'top center' }}
        initial={shouldSwing ? { rotate: -8 } : false}
        animate={{ rotate: 0 }}
        transition={
          shouldSwing
            ? { type: 'spring', stiffness: 260, damping: 14, mass: 0.9 }
            : { duration: 0 }
        }
      >
        <div className={styles.kanbanCard}>
          <div className={styles.pinIndicator} aria-hidden="true">
            <div className={styles.pinHole} />
          </div>

          <button type="button" className={styles.cardBodyBtn} onClick={() => onOpenNote(note)}>
            <div className={styles.cardTitle}>{note.title || 'Untitled'}</div>
            {note.content && (
              <p className={styles.cardPreview}>{extractPlainText(note.content).slice(0, 80)}</p>
            )}
          </button>

          <div className={styles.cardFooter}>
            <span className={styles.updatedLabel}>Updated {formatRelativeTime(note.updatedAt)}</span>
            <div className={styles.quickMoveGroup}>
              {columns
                .filter((c) => c.status !== columnStatus)
                .map((target) => (
                  <button
                    key={target.status}
                    type="button"
                    className={styles.moveBtn}
                    onClick={() => onMoveStatus(note.id, target.status)}
                    title={`Move to ${target.label}`}
                  >
                    <ArrowRight size={11} />
                    <span>{target.label}</span>
                  </button>
                ))}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
