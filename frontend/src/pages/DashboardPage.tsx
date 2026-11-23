import { useState, type ChangeEvent } from 'react';
import Layout from '../components/Layout';
import SearchBar from '../components/SearchBar';
import NoteCard from '../components/NoteCard';
import NoteEditor from '../components/NoteEditor';
import TagFilterBar from '../components/TagFilterBar';
import ExportImportActions from '../components/ExportImportActions';
import NotesEmptyState from '../components/NotesEmptyState';
import BentoStatsBar from '../components/BentoStatsBar';
import CommandPalette from '../components/CommandPalette';
import { useNotes } from '../hooks/useNotes';
import { usePaletteShortcut } from '../hooks/usePaletteShortcut';
import { useAuth } from '../context/AuthContext';
import type { Note, NoteInput } from '../types';
import styles from './DashboardPage.module.css';

export default function DashboardPage() {
  const {
    notes,
    isLoading,
    searchQuery,
    setSearchQuery,
    selectedTag,
    setSelectedTag,
    allTags,
    createNote,
    updateNote,
    deleteNote,
    togglePin,
    exportNotes,
    importNotes,
  } = useNotes();
  const { logout } = useAuth();

  const [activeNoteForEdit, setActiveNoteForEdit] = useState<Note | NoteInput | null>(null);
  const [isEditorOpen, setIsEditorOpen] = useState<boolean>(false);
  const [isPaletteOpen, setIsPaletteOpen] = useState<boolean>(false);
  const [filterMode, setFilterMode] = useState<string>('all');

  usePaletteShortcut(() => setIsPaletteOpen(true));

  const handleOpenNewNote = () => { setActiveNoteForEdit(null); setIsEditorOpen(true); };
  const handleSelectNote = (note: Note) => { setActiveNoteForEdit(note); setIsEditorOpen(true); };
  const handleCloseEditor = () => { setIsEditorOpen(false); setActiveNoteForEdit(null); };

  const handleSaveNote = async (notePayload: NoteInput) => {
    if (notePayload.id) {
      await updateNote(notePayload.id, notePayload);
    } else {
      await createNote(notePayload);
    }
  };

  const handleImportFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      try {
        await importNotes(file);
      } finally {
        event.target.value = '';
      }
    }
  };

  const displayedNotes = notes.filter((n: Note) => filterMode === 'pinned' ? n.isPinned : true);
  const pinnedCount = notes.filter((n) => n.isPinned).length;

  return (
    <Layout onNewNoteClick={handleOpenNewNote}>
      <div className={styles.container}>
        <div className={styles.controlsBar}>
          <SearchBar value={searchQuery} onChange={setSearchQuery} onClear={() => setSearchQuery('')} />
          <ExportImportActions onExport={exportNotes} onImportFile={handleImportFileChange} />
        </div>

        <BentoStatsBar
          totalNotes={notes.length}
          pinnedCount={pinnedCount}
          totalTags={allTags.length}
          onOpenCommandPalette={() => setIsPaletteOpen(true)}
        />

        <div className={styles.sectionHeading}>My folders</div>
        <TagFilterBar
          filterMode={filterMode}
          selectedTag={selectedTag}
          allTags={allTags}
          onSelectFilterMode={setFilterMode}
          onSelectTag={setSelectedTag}
        />

        <div className={styles.sectionHeading}>Recent notes</div>

        {isLoading ? (
          <div className={styles.skeletonGrid}>
            <div className={styles.skeletonCard} /><div className={styles.skeletonCard} /><div className={styles.skeletonCard} />
          </div>
        ) : displayedNotes.length === 0 ? (
          <NotesEmptyState searchQuery={searchQuery} onCreateNote={handleOpenNewNote} />
        ) : (
          <div className={styles.notesGrid}>
            {displayedNotes.map((singleNote: Note) => (
              <NoteCard
                key={singleNote.id}
                note={singleNote}
                onSelect={handleSelectNote}
                onTogglePin={togglePin}
                onDelete={deleteNote}
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
          onTogglePinnedFilter={() => setFilterMode((prev) => prev === 'pinned' ? 'all' : 'pinned')}
          onExportNotes={exportNotes}
          onLogout={logout}
        />
      </div>
    </Layout>
  );
}
