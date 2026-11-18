import { useState, useRef } from 'react';
import { Download, Upload, FileText } from 'lucide-react';
import Layout from '../components/Layout';
import SearchBar from '../components/SearchBar';
import NoteCard from '../components/NoteCard';
import NoteEditor from '../components/NoteEditor';
import { useNotes } from '../hooks/useNotes';
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

  const [activeNoteForEdit, setActiveNoteForEdit] = useState(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [filterMode, setFilterMode] = useState('all');
  const fileInputRef = useRef(null);

  const handleOpenNewNote = () => {
    setActiveNoteForEdit(null);
    setIsEditorOpen(true);
  };

  const handleSelectNote = (note) => {
    setActiveNoteForEdit(note);
    setIsEditorOpen(true);
  };

  const handleCloseEditor = () => {
    setIsEditorOpen(false);
    setActiveNoteForEdit(null);
  };

  const handleSaveNote = async (noteData) => {
    if (noteData.id) {
      await updateNote(noteData.id, noteData);
    } else {
      await createNote(noteData);
    }
  };

  const handleImportFileChange = async (event) => {
    const file = event.target.files?.[0];
    if (file) {
      await importNotes(file);
      event.target.value = '';
    }
  };

  const displayedNotes = notes.filter((note) => {
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

          <div className={styles.actionsGroup}>
            <button
              type="button"
              className={styles.secondaryBtn}
              onClick={() => exportNotes('json')}
              title="Export all notes to JSON backup"
            >
              <Download size={14} />
              <span>Export JSON</span>
            </button>

            <button
              type="button"
              className={styles.secondaryBtn}
              onClick={() => exportNotes('markdown')}
              title="Export notes to Markdown document"
            >
              <Download size={14} />
              <span>Export MD</span>
            </button>

            <button
              type="button"
              className={styles.secondaryBtn}
              onClick={() => fileInputRef.current?.click()}
              title="Import notes from JSON backup"
            >
              <Upload size={14} />
              <span>Import</span>
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              className={styles.hiddenInput}
              onChange={handleImportFileChange}
            />
          </div>
        </div>

        <div className={styles.tagFilterBar}>
          <button
            type="button"
            className={`${styles.tagChip} ${filterMode === 'all' && !selectedTag ? styles.tagChipActive : ''}`}
            onClick={() => {
              setFilterMode('all');
              setSelectedTag('');
            }}
          >
            All Notes
          </button>

          <button
            type="button"
            className={`${styles.tagChip} ${filterMode === 'pinned' ? styles.tagChipActive : ''}`}
            onClick={() => {
              setFilterMode('pinned');
              setSelectedTag('');
            }}
          >
            Pinned
          </button>

          {allTags.map((tag) => (
            <button
              key={tag}
              type="button"
              className={`${styles.tagChip} ${selectedTag === tag ? styles.tagChipActive : ''}`}
              onClick={() => {
                setFilterMode('all');
                setSelectedTag(selectedTag === tag ? '' : tag);
              }}
            >
              #{tag}
            </button>
          ))}
        </div>

        {isLoading ? (
          <div className={styles.skeletonGrid}>
            <div className={styles.skeletonCard} />
            <div className={styles.skeletonCard} />
            <div className={styles.skeletonCard} />
          </div>
        ) : displayedNotes.length === 0 ? (
          <div className={styles.emptyState}>
            <FileText size={40} color="var(--text-subtle)" />
            <h4 className={styles.emptyTitle}>
              {searchQuery ? 'No notes matched your search' : 'No notes yet'}
            </h4>
            <p className={styles.emptySubtitle}>
              {searchQuery
                ? 'Try searching with different keywords or clear the filter.'
                : 'Capture your thoughts, ideas, and tasks with rich text formatting.'}
            </p>
            {!searchQuery && (
              <button
                type="button"
                className={styles.createFirstBtn}
                onClick={handleOpenNewNote}
              >
                Create First Note
              </button>
            )}
          </div>
        ) : (
          <div className={styles.notesGrid}>
            {displayedNotes.map((note) => (
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
