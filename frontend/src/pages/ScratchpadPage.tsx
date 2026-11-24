import { useState, useEffect } from 'react';
import { Plus, Pin } from 'lucide-react';
import Layout from '../components/Layout';
import NoteCard from '../components/NoteCard';
import NoteEditor from '../components/NoteEditor';
import BentoStatsBar from '../components/BentoStatsBar';
import CommandPalette from '../components/CommandPalette';
import NotesEmptyState from '../components/NotesEmptyState';
import ScratchpadBanner from '../components/ScratchpadBanner';
import { usePaletteShortcut } from '../hooks/usePaletteShortcut';
import { useAuth } from '../context/AuthContext';
import { useNotes } from '../hooks/useNotes';
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

  const { isAuthenticated } = useAuth();
  const { createNote } = useNotes();

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

  const handleTackToDesk = async (noteToTack: Note) => {
    try {
      await createNote({
        title: noteToTack.title,
        content: noteToTack.content,
        color: noteToTack.color,
        tags: noteToTack.tags?.length ? noteToTack.tags : ['scratch'],
        isPinned: noteToTack.isPinned,
      });
      handleDelete(noteToTack.id);
    } catch (err) {
      console.error('Failed to promote scratch note to desk:', err);
    }
  };

  const pinnedCount = notes.filter((n) => n.isPinned).length;
  const allTags = Array.from(new Set(notes.flatMap((n) => n.tags || [])));

  const content = (
    <div className={styles.container}>
      <ScratchpadBanner isAuthenticated={isAuthenticated} />

      <div className={styles.headerRow}>
        <h1 className={styles.brandTitle}>
          {isAuthenticated ? 'Draft Blotter' : 'Notes Scratchpad'}
        </h1>
        <button type="button" className={styles.newNoteBtn} onClick={handleOpenNewNote}>
          <Plus size={16} /><span>New Note</span>
        </button>
      </div>

      <BentoStatsBar
        totalNotes={notes.length} pinnedCount={pinnedCount} totalTags={allTags.length}
        onOpenCommandPalette={() => setIsPaletteOpen(true)}
      />

      {notes.length === 0 ? (
        <NotesEmptyState
          searchQuery=""
          onCreateNote={handleOpenNewNote}
          onApplyTemplate={(tpl) => { setActiveNoteForEdit(tpl); setIsEditorOpen(true); }}
        />
      ) : (
        <div className={dashboardStyles.notesGrid}>
          {notes.map((singleNote) => (
            <div key={singleNote.id} className={styles.scratchpadItem}>
              <NoteCard
                note={singleNote}
                onSelect={handleSelectNote}
                onTogglePin={handleTogglePin}
                onDelete={handleDelete}
              />
              {isAuthenticated && (
                <button
                  type="button"
                  className={styles.tackBtn}
                  onClick={() => handleTackToDesk(singleNote)}
                  title="Promote this draft to your cloud desk board"
                >
                  <Pin size={13} />
                  <span>Tack to Desk</span>
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      <NoteEditor note={activeNoteForEdit} isOpen={isEditorOpen} onClose={handleCloseEditor} onSave={handleSaveNote} />
      <CommandPalette
        isOpen={isPaletteOpen} onClose={() => setIsPaletteOpen(false)} notes={notes}
        onSelectNote={handleSelectNote} onCreateNote={handleOpenNewNote} onTogglePinnedFilter={() => {}}
      />
    </div>
  );

  return isAuthenticated ? <Layout onNewNoteClick={handleOpenNewNote}>{content}</Layout> : content;
}
