import { useState, useRef, useEffect, type DragEvent } from 'react';
import { Plus, Columns3 } from 'lucide-react';
import KanbanCard from './KanbanCard';
import type { Note, NoteStatus } from '../types';
import styles from './KanbanBoard.module.css';

interface ColumnDef {
  status: NoteStatus;
  label: string;
  accentClass: string;
}

const COLUMNS: ColumnDef[] = [
  { status: 'todo', label: 'To Do', accentClass: styles.dotTodo },
  { status: 'in_progress', label: 'In Progress', accentClass: styles.dotInProgress },
  { status: 'done', label: 'Done', accentClass: styles.dotDone },
];

export interface KanbanBoardProps {
  notes: Note[];
  onOpenNote: (note: Note) => void;
  onMoveStatus: (noteId: string, nextStatus: NoteStatus) => Promise<void>;
  onCreateInColumn: (status: NoteStatus) => void;
}

export default function KanbanBoard({
  notes,
  onOpenNote,
  onMoveStatus,
  onCreateInColumn,
}: KanbanBoardProps) {
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [dropTarget, setDropTarget] = useState<NoteStatus | null>(null);
  const [recentlyMovedId, setRecentlyMovedId] = useState<string | null>(null);
  const [selectedNoteToAdd, setSelectedNoteToAdd] = useState<string>('');
  const swingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (swingTimerRef.current) clearTimeout(swingTimerRef.current);
    };
  }, []);

  const boardNotes = notes.filter((n) => n.status === 'todo' || n.status === 'in_progress' || n.status === 'done');
  const untrackedNotes = notes.filter((n) => !n.status);

  const triggerColumnMove = async (noteId: string, nextStatus: NoteStatus) => {
    const current = notes.find((n) => n.id === noteId);
    if (!current || current.status === nextStatus) return;

    if (swingTimerRef.current) clearTimeout(swingTimerRef.current);
    setRecentlyMovedId(noteId);
    swingTimerRef.current = setTimeout(() => {
      setRecentlyMovedId((prev) => (prev === noteId ? null : prev));
    }, 850);

    await onMoveStatus(noteId, nextStatus);
  };

  const handleDragStart = (event: DragEvent<HTMLDivElement>, noteId: string) => {
    setDraggedId(noteId);
    event.dataTransfer.setData('text/plain', noteId);
    event.dataTransfer.effectAllowed = 'move';
  };

  const handleDrop = async (event: DragEvent<HTMLDivElement>, status: NoteStatus) => {
    event.preventDefault();
    const noteId = event.dataTransfer.getData('text/plain') || draggedId;
    setDraggedId(null);
    setDropTarget(null);
    if (!noteId) return;
    await triggerColumnMove(noteId, status);
  };

  const handleAddExisting = async () => {
    if (!selectedNoteToAdd) return;
    await onMoveStatus(selectedNoteToAdd, 'todo');
    setSelectedNoteToAdd('');
  };

  if (boardNotes.length === 0) {
    return (
      <div className={styles.emptyBoard}>
        <Columns3 size={28} className={styles.emptyIcon} />
        <h3 className={styles.emptyTitle}>Your plan board is clear</h3>
        <p className={styles.emptyText}>
          Only notes you add to the board appear here, keeping your reference notes clutter-free.
        </p>
        <div className={styles.emptyActions}>
          <button type="button" className={styles.primaryBtn} onClick={() => onCreateInColumn('todo')}>
            <Plus size={15} />
            <span>New Plan Note</span>
          </button>
          {untrackedNotes.length > 0 && (
            <div className={styles.promoteRow}>
              <select
                aria-label="Select an existing note to add to board"
                className={styles.promoteSelect}
                value={selectedNoteToAdd}
                onChange={(e) => setSelectedNoteToAdd(e.target.value)}
              >
                <option value="">Add an existing note…</option>
                {untrackedNotes.map((n) => (
                  <option key={n.id} value={n.id}>{n.title || 'Untitled'}</option>
                ))}
              </select>
              <button type="button" className={styles.secondaryBtn} onClick={handleAddExisting} disabled={!selectedNoteToAdd}>
                Add to To Do
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={styles.boardWrapper}>
      {untrackedNotes.length > 0 && (
        <div className={styles.boardToolbar}>
          <select
            aria-label="Add existing note to board"
            className={styles.promoteSelect}
            value={selectedNoteToAdd}
            onChange={(e) => setSelectedNoteToAdd(e.target.value)}
          >
            <option value="">Track an existing note on board…</option>
            {untrackedNotes.map((n) => (
              <option key={n.id} value={n.id}>{n.title || 'Untitled'}</option>
            ))}
          </select>
          <button type="button" className={styles.secondaryBtn} onClick={handleAddExisting} disabled={!selectedNoteToAdd}>
            Add to To Do
          </button>
        </div>
      )}

      <div className={styles.columnsGrid}>
        {COLUMNS.map((col) => {
          const columnNotes = boardNotes.filter((n) => n.status === col.status);
          const isOver = dropTarget === col.status;

          return (
            <div
              key={col.status}
              className={`${styles.column} ${isOver ? styles.columnDropOver : ''}`}
              onDragOver={(e) => { e.preventDefault(); setDropTarget(col.status); }}
              onDragLeave={() => setDropTarget(null)}
              onDrop={(e) => handleDrop(e, col.status)}
            >
              <div className={styles.columnHeader}>
                <div className={styles.columnTitleGroup}>
                  <span className={`${styles.statusDot} ${col.accentClass}`} />
                  <h3 className={styles.columnTitle}>{col.label}</h3>
                  <span className={styles.columnCount}>{columnNotes.length}</span>
                </div>
                <button
                  type="button"
                  className={styles.columnAddBtn}
                  onClick={() => onCreateInColumn(col.status)}
                  aria-label={`Add note to ${col.label}`}
                  title={`Add to ${col.label}`}
                >
                  <Plus size={15} />
                </button>
              </div>

              <div className={styles.cardList}>
                {columnNotes.map((note) => (
                  <KanbanCard
                    key={note.id}
                    note={note}
                    columnStatus={col.status}
                    columns={COLUMNS}
                    isDragging={draggedId === note.id}
                    isJustDropped={recentlyMovedId === note.id}
                    onDragStart={handleDragStart}
                    onDragEnd={() => { setDraggedId(null); setDropTarget(null); }}
                    onOpenNote={onOpenNote}
                    onMoveStatus={triggerColumnMove}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
