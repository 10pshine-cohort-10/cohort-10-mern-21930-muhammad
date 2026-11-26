import { useState, useEffect, useRef } from 'react';
import { Plus, Pin, Trash2 } from 'lucide-react';
import Layout from '../components/Layout';
import NoteCard from '../components/NoteCard';
import NoteEditor from '../components/NoteEditor';
import BentoStatsBar from '../components/BentoStatsBar';
import CommandPalette from '../components/CommandPalette';
import NotesEmptyState from '../components/NotesEmptyState';
import ScratchpadBanner from '../components/ScratchpadBanner';
import ScratchpadQuickJot from '../components/ScratchpadQuickJot';
import { usePaletteShortcut } from '../hooks/usePaletteShortcut';
import { useAuth } from '../context/AuthContext';
import { useNotes } from '../hooks/useNotes';
import {
  getGuestNotes,
  createGuestNote,
  updateGuestNote,
  deleteGuestNote,
  clearGuestNotes,
} from '../utils/guestStorage';
import type { Note, NoteInput } from '../types';
import dashboardStyles from './DashboardPage.module.css';
import styles from './ScratchpadPage.module.css';

export default function ScratchpadPage() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [filterMode, setFilterMode] = useState<'all' | 'pinned'>('all');
  const [tackingId, setTackingId] = useState<string | null>(null);
  const [statusNotice, setStatusNotice] = useState<{ text: string; isError?: boolean } | null>(null);
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

  const handleTackToDesk = async (noteToTack: Note) => {
    if (tackingId) return;
    setTackingId(noteToTack.id);
    try {
      await createNote({
        title: noteToTack.title,
        content: noteToTack.content,
        color: noteToTack.color,
        tags: Array.isArray(noteToTack.tags) && noteToTack.tags.length ? noteToTack.tags : ['scratch'],
        isPinned: noteToTack.isPinned,
      });
      handleDelete(noteToTack.id);
      showNotice(`Tacked "${noteToTack.title || 'Untitled'}" to Desk`);
    } catch (err) {
      console.error('Failed to promote scratch note to desk:', err);
      showNotice('Failed to tack draft to Desk. Please try again.', true);
    } finally {
      setTackingId(null);
    }
  };

  const handleTackAll = async () => {
    if (tackingId || safeNotes.length === 0) return;
    setTackingId('__all__');
    try {
      for (const n of safeNotes) {
        await createNote({
          title: n.title,
          content: n.content,
          color: n.color,
          tags: Array.isArray(n.tags) && n.tags.length ? n.tags : ['scratch'],
          isPinned: n.isPinned,
        });
        deleteGuestNote(n.id);
      }
      setNotes([]);
      showNotice(`Tacked ${safeNotes.length} draft(s) to Desk`);
    } catch (err) {
      console.error('Failed to promote all scratch notes:', err);
      setNotes(getGuestNotes());
      showNotice('Some drafts could not be tacked to Desk.', true);
    } finally {
      setTackingId(null);
    }
  };

  const handleClearBlotter = () => {
    clearGuestNotes();
    setNotes([]);
    showNotice('Cleared local drafts');
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
        <h1 className={styles.brandTitle}>{isAuthenticated ? 'Draft Blotter' : 'Notes Scratchpad'}</h1>
        <div className={styles.headerActions}>
          {isAuthenticated && safeNotes.length > 0 && (
            <button type="button" className={styles.bulkBtn} onClick={handleTackAll} disabled={Boolean(tackingId)}>
              <Pin size={14} /><span>Tack All to Desk</span>
            </button>
          )}
          {safeNotes.length > 0 && (
            <button type="button" className={styles.bulkBtn} onClick={handleClearBlotter}>
              <Trash2 size={14} /><span>Clear Blotter</span>
            </button>
          )}
          <button type="button" className={styles.newNoteBtn} onClick={handleOpenNewNote}>
            <Plus size={16} /><span>New Note</span>
          </button>
        </div>
      </div>

      <BentoStatsBar
        totalNotes={safeNotes.length} pinnedCount={pinnedCount} totalTags={0}
        thirdStatLabel="Storage" thirdStatValue="Local"
        activeFilter={filterMode}
        onOpenCommandPalette={() => setIsPaletteOpen(true)}
        onFilterAll={() => setFilterMode('all')}
        onFilterPinned={() => setFilterMode((prev) => (prev === 'pinned' ? 'all' : 'pinned'))}
      />

      <ScratchpadQuickJot
        onQuickSave={async (title) => {
          await handleSaveNote({ title, content: '', color: 'slate', tags: [], isPinned: false });
          showNotice('Saved locally in browser');
        }}
      />

      {statusNotice && (
        <div role="status" className={`${styles.noticeBar} ${statusNotice.isError ? styles.noticeError : ''}`}>
          {statusNotice.text}
        </div>
      )}

      {displayedNotes.length === 0 ? (
        <NotesEmptyState
          searchQuery=""
          emptyTitle={isAuthenticated ? 'Your draft blotter is empty' : 'Your scratchpad is clear'}
          emptySubtitle={
            isAuthenticated
              ? 'Jot a fast unfiled thought above or pick a starter blueprint below. Tack drafts to your Desk when ready.'
              : 'Jot a quick note above — everything saves locally in this browser until you create an account to sync.'
          }
          onCreateNote={handleOpenNewNote}
          onApplyTemplate={(tpl) => { setActiveNoteForEdit(tpl); setIsEditorOpen(true); }}
        />
      ) : (
        <div className={dashboardStyles.notesGrid}>
          {displayedNotes.map((singleNote) => (
            <div key={singleNote.id} className={styles.scratchpadItem}>
              <NoteCard note={singleNote} onSelect={handleSelectNote} onTogglePin={handleTogglePin} onDelete={handleDelete} />
              {isAuthenticated && (
                <button
                  type="button" className={styles.tackBtn} disabled={tackingId === singleNote.id}
                  onClick={() => handleTackToDesk(singleNote)} title="Promote this draft to your cloud desk board"
                >
                  <Pin size={13} /><span>{tackingId === singleNote.id ? 'Tacking...' : 'Tack to Desk'}</span>
                </button>
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
      />
    </div>
  );

  return isAuthenticated ? <Layout onNewNoteClick={handleOpenNewNote}>{content}</Layout> : content;
}
