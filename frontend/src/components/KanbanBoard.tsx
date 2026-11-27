import { useState, useRef, useEffect, type DragEvent } from 'react';
import { Plus } from 'lucide-react';
import KanbanCard from './KanbanCard';
import KanbanColumnAddMenu from './KanbanColumnAddMenu';
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
  searchQuery?: string;
  onOpenNote: (note: Note) => void;
  onMoveStatus: (noteId: string, nextStatus: NoteStatus) => Promise<void>;
  onCreateInColumn: (status: NoteStatus) => void;
}

export default function KanbanBoard({
  notes,
  searchQuery = '',
  onOpenNote,
  onMoveStatus,
  onCreateInColumn,
}: KanbanBoardProps) {
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [dropTarget, setDropTarget] = useState<NoteStatus | null>(null);
  const [recentlyMovedId, setRecentlyMovedId] = useState<string | null>(null);
  const [openAddMenu, setOpenAddMenu] = useState<{ status: NoteStatus; anchorEl: HTMLButtonElement } | null>(null);
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

  const hasSearch = searchQuery.trim().length > 0;

  return (
    <div className={styles.boardWrapper}>
      {(boardNotes.length === 0 || untrackedNotes.length > 0) && (
        <div className={styles.unstagedHintBar}>
          <span>
            {hasSearch && boardNotes.length === 0
              ? 'No board notes match your search.'
              : boardNotes.length === 0
                ? untrackedNotes.length > 0
                  ? `Your plan board is clear. Use + on any column to pull in from ${untrackedNotes.length} unstaged notes or start a new one.`
                  : 'Your plan board is clear. Add a note to To Do, In Progress, or Done.'
                : `${untrackedNotes.length} unstaged ${untrackedNotes.length === 1 ? 'note is' : 'notes are'} hidden from Board — use + on any column to stage.`}
          </span>
          <button type="button" className={styles.primaryBtn} onClick={() => onCreateInColumn('todo')}>
            <Plus size={15} />
            <span>New Plan Note</span>
          </button>
        </div>
      )}

      <div className={styles.columnsGrid}>
        {COLUMNS.map((col) => {
          const columnNotes = boardNotes.filter((n) => n.status === col.status);
          const isOver = dropTarget === col.status;
          const isMenuForCol = openAddMenu?.status === col.status;

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
                  onClick={(e) => {
                    const btn = e.currentTarget;
                    setOpenAddMenu((prev) => (prev?.status === col.status ? null : { status: col.status, anchorEl: btn }));
                  }}
                  aria-haspopup="dialog"
                  aria-expanded={isMenuForCol}
                  aria-label={`Add note to ${col.label}`}
                  title={`Add to ${col.label}`}
                >
                  <Plus size={15} />
                </button>
              </div>

              <div className={styles.cardList}>
                {columnNotes.length === 0 ? (
                  <p className={styles.columnEmptyHint}>Drop a note here or click +</p>
                ) : (
                  columnNotes.map((note) => (
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
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>

      {openAddMenu && (
        <KanbanColumnAddMenu
          status={openAddMenu.status}
          columnLabel={COLUMNS.find((c) => c.status === openAddMenu.status)?.label || ''}
          anchorEl={openAddMenu.anchorEl}
          untrackedNotes={untrackedNotes}
          onCreateNew={onCreateInColumn}
          onAddExisting={triggerColumnMove}
          onClose={() => setOpenAddMenu(null)}
        />
      )}
    </div>
  );
}
