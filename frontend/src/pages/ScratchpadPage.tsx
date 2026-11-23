import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Sparkles } from 'lucide-react';
import NoteCard from '../components/NoteCard';
import NoteEditor from '../components/NoteEditor';
import BentoStatsBar from '../components/BentoStatsBar';
import CommandPalette from '../components/CommandPalette';
import NotesEmptyState from '../components/NotesEmptyState';
import { usePaletteShortcut } from '../hooks/usePaletteShortcut';
import {
  getGuestNotes,
  createGuestNote,
  updateGuestNote,
  deleteGuestNote,
} from '../utils/guestStorage';
import type { Note, NoteInput } from '../types';
import dashboardStyles from './DashboardPage.module.css';
import styles from './ScratchpadPage.module.css';

export default function ScratchpadPage() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [activeNoteForEdit, setActiveNoteForEdit] = useState<Note | NoteInput | null>(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [isPaletteOpen, setIsPaletteOpen] = useState(false);

  useEffect(() => {
    setNotes(getGuestNotes());
  }, []);

  usePaletteShortcut(() => setIsPaletteOpen(true));

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

  const pinnedCount = notes.filter((n) => n.isPinned).length;
  const allTags = Array.from(new Set(notes.flatMap((n) => n.tags || [])));

  return (
    <div className={styles.container}>
      <div className={styles.guestBanner}>
        <span className={styles.bannerText}>
          Working in Guest Scratchpad. Your notes are saved locally in this browser.
        </span>
        <div className={styles.bannerActions}>
          <Link to="/register" className={styles.ctaButton}><Sparkles size={14} /> Create Account to Sync</Link>
          <Link to="/login" className={styles.loginLink}>Log In</Link>
        </div>
      </div>

      <div className={styles.headerRow}>
        <h1 className={styles.brandTitle}>Notes Scratchpad</h1>
        <button type="button" className={styles.newNoteBtn} onClick={handleOpenNewNote}>
          <Plus size={16} /><span>New Note</span>
        </button>
      </div>

      <BentoStatsBar
        totalNotes={notes.length}
        pinnedCount={pinnedCount}
        totalTags={allTags.length}
        onOpenCommandPalette={() => setIsPaletteOpen(true)}
      />

      {notes.length === 0 ? (
        <NotesEmptyState searchQuery="" onCreateNote={handleOpenNewNote} />
      ) : (
        <div className={dashboardStyles.notesGrid}>
          {notes.map((singleNote) => (
            <NoteCard
              key={singleNote.id}
              note={singleNote}
              onSelect={handleSelectNote}
              onTogglePin={handleTogglePin}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      <NoteEditor
        note={activeNoteForEdit}
        isOpen={isEditorOpen}
        onClose={handleCloseEditor}
        onSave={handleSaveNote}
      />

      <CommandPalette
        isOpen={isPaletteOpen}
        onClose={() => setIsPaletteOpen(false)}
        notes={notes}
        onSelectNote={handleSelectNote}
        onCreateNote={handleOpenNewNote}
        onTogglePinnedFilter={() => {}}
      />
    </div>
  );
}
