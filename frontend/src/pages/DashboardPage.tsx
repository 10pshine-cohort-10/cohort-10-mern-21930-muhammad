import { useState, type ChangeEvent } from 'react';
import Layout from '../components/Layout';
import SearchBar from '../components/SearchBar';
import NoteCard from '../components/NoteCard';
import NoteEditor from '../components/NoteEditor';
import TagFilterBar from '../components/TagFilterBar';
import ExportImportActions from '../components/ExportImportActions';
import NotesEmptyState from '../components/NotesEmptyState';
import { useNotes } from '../hooks/useNotes';
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

  const [activeNoteForEdit, setActiveNoteForEdit] = useState<Note | NoteInput | null>(null);
  const [isEditorOpen, setIsEditorOpen] = useState<boolean>(false);
  const [filterMode, setFilterMode] = useState<string>('all');

  const handleOpenNewNote = () => {
    setActiveNoteForEdit(null);
    setIsEditorOpen(true);
  };

  const handleSelectNote = (note: Note) => {
    setActiveNoteForEdit(note);
    setIsEditorOpen(true);
  };

  const handleCloseEditor = () => {
    setIsEditorOpen(false);
    setActiveNoteForEdit(null);
  };

  const handleSaveNote = async (noteData: NoteInput) => {
    try {
      if (noteData.id) {
        await updateNote(noteData.id, noteData);
      } else {
        await createNote(noteData);
      }
    } catch (err) {
      console.error('Failed to save note:', err);
      throw err;
    }
  };

  const handleImportFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      try {
        await importNotes(file);
      } catch (err) {
        console.error('Failed to import notes file:', err);
      } finally {
        event.target.value = '';
      }
    }
  };

  const displayedNotes = notes.filter((note: Note) => {
    if (filterMode === 'pinned') return note.isPinned;
    return true;
  });

  return (
    <Layout onNewNoteClick={handleOpenNewNote}>
      <div className={styles.container}>
        <div className={styles.controlsBar}>
          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            onClear={() => setSearchQuery('')}
          />
          <ExportImportActions
            onExport={exportNotes}
            onImportFile={handleImportFileChange}
          />
        </div>

        <TagFilterBar
          filterMode={filterMode}
          selectedTag={selectedTag}
          allTags={allTags}
          onSelectFilterMode={setFilterMode}
          onSelectTag={setSelectedTag}
        />

        {isLoading ? (
          <div className={styles.skeletonGrid}>
            <div className={styles.skeletonCard} />
            <div className={styles.skeletonCard} />
            <div className={styles.skeletonCard} />
          </div>
        ) : displayedNotes.length === 0 ? (
          <NotesEmptyState
            searchQuery={searchQuery}
            onCreateNote={handleOpenNewNote}
          />
        ) : (
          <div className={styles.notesGrid}>
            {displayedNotes.map((note: Note) => (
              <NoteCard
                key={note.id}
                note={note}
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
      </div>
    </Layout>
  );
}
