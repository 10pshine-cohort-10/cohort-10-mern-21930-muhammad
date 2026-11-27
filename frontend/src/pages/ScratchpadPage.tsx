import { useState, useEffect, useRef } from 'react';
import { Plus, ArrowUpRight, Columns3, Trash2, Download } from 'lucide-react';
import Layout from '../components/Layout';
import NoteCard from '../components/NoteCard';
import NoteEditor from '../components/NoteEditor';
import BentoStatsBar from '../components/BentoStatsBar';
import CommandPalette from '../components/CommandPalette';
import ScratchpadBanner from '../components/ScratchpadBanner';
import ScratchpadQuickJot from '../components/ScratchpadQuickJot';
import UndoToast from '../components/UndoToast';
import { usePaletteShortcut } from '../hooks/usePaletteShortcut';
import { useAuth } from '../context/AuthContext';
import { useNotes } from '../hooks/useNotes';
import { downloadExportedNotes } from '../utils/noteExport';
import {
  getGuestNotes,
  createGuestNote,
  updateGuestNote,
  deleteGuestNote,
  clearGuestNotes,
  saveGuestNotesList,
} from '../utils/guestStorage';
import type { Note, NoteInput, NoteStatus } from '../types';
import dashboardStyles from './DashboardPage.module.css';
import styles from './ScratchpadPage.module.css';

function toPromotedPayload(draft: Note, status?: NoteStatus): NoteInput {
  return {
    title: draft.title,
    content: draft.content,
    color: draft.color,
    tags: Array.isArray(draft.tags) && draft.tags.length ? draft.tags : ['scratch'],
    isPinned: draft.isPinned,
    ...(status ? { status } : {}),
  };
}

export default function ScratchpadPage() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [filterMode, setFilterMode] = useState<'all' | 'pinned'>('all');
  const [promotingId, setPromotingId] = useState<string | null>(null);
  const [statusNotice, setStatusNotice] = useState<{ text: string; isError?: boolean } | null>(null);
  const [clearedBackup, setClearedBackup] = useState<Note[] | null>(null);
  const [activeNoteForEdit, setActiveNoteForEdit] = useState<Note | NoteInput | null>(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [isPaletteOpen, setIsPaletteOpen] = useState(false);

  const { isAuthenticated } = useAuth();
  const { createNote } = useNotes({ autoSync: false });
  const noticeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setNotes(getGuestNotes());
    return () => {
      if (noticeTimerRef.current) clearTimeout(noticeTimerRef.current);
    };
  }, []);
  usePaletteShortcut(() => setIsPaletteOpen(true));

  const showNotice = (text: string, isError = false) => {
    if (noticeTimerRef.current) clearTimeout(noticeTimerRef.current);
    setStatusNotice({ text, isError });
    noticeTimerRef.current = setTimeout(() => setStatusNotice(null), 3000);
  };

  const handleOpenNewNote = () => { setActiveNoteForEdit(null); setIsEditorOpen(true); };
  const handleSelectNote = (n: Note) => { setActiveNoteForEdit(n); setIsEditorOpen(true); };
  const handleCloseEditor = () => { setIsEditorOpen(false); setActiveNoteForEdit(null); };

  const handleSaveNote = async (payload: NoteInput) => {
    if (payload.id) {
      const updated = updateGuestNote(payload.id, payload);
      setNotes((prev) => prev.map((n) => (n.id === payload.id ? updated : n)));
    } else {
      const created = createGuestNote(payload);
      setNotes((prev) => [created, ...prev]);
    }
  };

  const handleDelete = (id: string) => {
    deleteGuestNote(id);
    setNotes((prev) => prev.filter((n) => n.id !== id));
  };

  const handleTogglePin = (id: string, isPinned: boolean) => {
    const updated = updateGuestNote(id, { isPinned });
    setNotes((prev) => prev.map((n) => (n.id === id ? updated : n)));
  };

  const handlePromoteToNotes = async (draft: Note, status?: NoteStatus) => {
    if (promotingId) return;
    setPromotingId(draft.id);
    try {
      await createNote(toPromotedPayload(draft, status));
      handleDelete(draft.id);
      const destinationLabel = status === 'todo' ? 'Board (To Do)' : 'notes';
      showNotice(`Added "${draft.title || 'Untitled'}" to ${destinationLabel}`);
    } catch (err) {
      console.error('Failed to promote scratch note:', err);
      showNotice('Failed to add draft to notes. Please try again.', true);
    } finally {
      setPromotingId(null);
    }
  };

  const handlePromoteAll = async () => {
    if (promotingId || safeNotes.length === 0) return;
    setPromotingId('__all__');
    try {
      for (const draft of safeNotes) {
        await createNote(toPromotedPayload(draft));
        deleteGuestNote(draft.id);
      }
      setNotes([]);
      showNotice(`Added ${safeNotes.length} draft(s) to notes`);
    } catch (err) {
      console.error('Failed to promote all scratch notes:', err);
      setNotes(getGuestNotes());
      showNotice('Some drafts could not be added to notes.', true);
    } finally {
      setPromotingId(null);
    }
  };

  const handleClearScratchpad = () => {
    if (safeNotes.length === 0) return;
    setClearedBackup(safeNotes);
    clearGuestNotes();
    setNotes([]);
    showNotice('Cleared Scratchpad');
  };

  const handleUndoClear = () => {
    if (!clearedBackup) return;
    saveGuestNotesList(clearedBackup);
    setNotes(clearedBackup);
    setClearedBackup(null);
    showNotice('Restored Scratchpad drafts');
  };

  const safeNotes = Array.isArray(notes)
    ? notes.filter((n): n is Note => Boolean(n && typeof n === 'object' && n.id))
    : [];
  const pinnedCount = safeNotes.filter((n) => Boolean(n.isPinned)).length;
  const displayedNotes = filterMode === 'pinned' ? safeNotes.filter((n) => n.isPinned) : safeNotes;

  const content = (
    <div className={styles.container}>
      <ScratchpadBanner isAuthenticated={isAuthenticated} />
      <div className={styles.headerRow}>
        <div>
          <h1 className={styles.brandTitle}>Scratchpad</h1>
          <span className={styles.deviceOnlyLabel}>Saved on this device only</span>
        </div>
        <div className={styles.headerActions}>
          {safeNotes.length > 0 && (
            <button
              type="button"
              className={styles.bulkBtn}
              onClick={() => downloadExportedNotes(safeNotes, 'json', 'all', 'scratchpad')}
            >
              <Download size={14} /><span>Export</span>
            </button>
          )}
          {isAuthenticated && safeNotes.length > 0 && (
            <button type="button" className={styles.bulkBtn} onClick={handlePromoteAll} disabled={Boolean(promotingId)}>
              <ArrowUpRight size={14} /><span>Add all to notes</span>
            </button>
          )}
          {safeNotes.length > 0 && (
            <button type="button" className={styles.bulkBtn} onClick={handleClearScratchpad}>
              <Trash2 size={14} /><span>Clear Scratchpad</span>
            </button>
          )}
          {!isAuthenticated && (
            <button type="button" className={styles.newNoteBtn} onClick={handleOpenNewNote}>
              <Plus size={16} /><span>New Note</span>
            </button>
          )}
        </div>
      </div>

      {safeNotes.length > 0 && (
        <BentoStatsBar
          totalNotes={safeNotes.length} pinnedCount={pinnedCount} totalTags={0}
          thirdStatLabel="Storage" thirdStatValue="Local"
          activeFilter={filterMode}
          onOpenCommandPalette={() => setIsPaletteOpen(true)}
          onFilterAll={() => setFilterMode('all')}
          onFilterPinned={() => setFilterMode((prev) => (prev === 'pinned' ? 'all' : 'pinned'))}
        />
      )}

      <ScratchpadQuickJot
        onQuickSave={async (title) => {
          await handleSaveNote({ title, content: '', color: 'slate', tags: [], isPinned: false });
          showNotice('Saved on this device only');
        }}
        onSelectTemplate={(tpl) => {
          setActiveNoteForEdit(tpl);
          setIsEditorOpen(true);
        }}
      />

      {statusNotice && (
        <div role="status" className={`${styles.noticeBar} ${statusNotice.isError ? styles.noticeError : ''}`}>
          {statusNotice.text}
        </div>
      )}

      {displayedNotes.length === 0 ? (
        <div className={styles.emptySimple}>
          <p className={styles.emptySimpleTitle}>Your scratchpad is clear</p>
          <p className={styles.emptySimpleSubtitle}>Jot a quick thought above.</p>
        </div>
      ) : (
        <div className={dashboardStyles.notesGrid}>
          {displayedNotes.map((singleNote) => (
            <div key={singleNote.id} className={styles.scratchpadItem}>
              <NoteCard note={singleNote} onSelect={handleSelectNote} onTogglePin={handleTogglePin} onDelete={handleDelete} />
              {isAuthenticated && (
                <div className={styles.promoteActionsRow}>
                  <button
                    type="button"
                    className={styles.tackBtn}
                    disabled={promotingId === singleNote.id}
                    onClick={() => handlePromoteToNotes(singleNote)}
                    title="Promote this draft to your notes"
                  >
                    <ArrowUpRight size={13} />
                    <span>{promotingId === singleNote.id ? 'Adding...' : 'Add to notes'}</span>
                  </button>
                  <button
                    type="button"
                    className={`${styles.tackBtn} ${styles.boardPromoteBtn}`}
                    disabled={promotingId === singleNote.id}
                    onClick={() => handlePromoteToNotes(singleNote, 'todo')}
                    title="Move this draft straight to Board (To Do)"
                  >
                    <Columns3 size={13} />
                    <span>Move to Board</span>
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <NoteEditor note={activeNoteForEdit} isOpen={isEditorOpen} onClose={handleCloseEditor} onSave={handleSaveNote} />
      <CommandPalette
        isOpen={isPaletteOpen} onClose={() => setIsPaletteOpen(false)} notes={safeNotes}
        onSelectNote={handleSelectNote} onCreateNote={handleOpenNewNote}
        onTogglePinnedFilter={() => setFilterMode((prev) => (prev === 'pinned' ? 'all' : 'pinned'))}
        isGuest={!isAuthenticated}
      />
      {clearedBackup && (
        <UndoToast
          noteTitle={`${clearedBackup.length} draft(s)`}
          onUndo={handleUndoClear}
          onDismiss={() => setClearedBackup(null)}
        />
      )}
    </div>
  );

  return isAuthenticated ? <Layout onNewNoteClick={handleOpenNewNote} hasCustomPalette>{content}</Layout> : content;
}
