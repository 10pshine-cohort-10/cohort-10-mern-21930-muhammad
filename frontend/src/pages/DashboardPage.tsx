import { useState, useRef, useEffect, type ChangeEvent } from 'react';
import { useSearchParams } from 'react-router-dom';
import Layout from '../components/Layout';
import SearchBar from '../components/SearchBar';
import NoteCard from '../components/NoteCard';
import NoteEditor from '../components/NoteEditor';
import ExportImportActions from '../components/ExportImportActions';
import NotesEmptyState from '../components/NotesEmptyState';
import BentoStatsBar from '../components/BentoStatsBar';
import CommandPalette from '../components/CommandPalette';
import QuickTackBar from '../components/QuickTackBar';
import UndoToast from '../components/UndoToast';
import ViewModeToggle, { type ViewMode } from '../components/ViewModeToggle';
import KanbanBoard from '../components/KanbanBoard';
import KeyboardHelpModal from '../components/KeyboardHelpModal';
import { useNotes } from '../hooks/useNotes';
import { usePaletteShortcut } from '../hooks/usePaletteShortcut';
import { useDeskKeyboardNav } from '../hooks/useDeskKeyboardNav';
import { useSoftDelete } from '../hooks/useSoftDelete';
import { useAuth } from '../context/AuthContext';
import type { Note, NoteInput, NoteStatus } from '../types';
import styles from './DashboardPage.module.css';

export default function DashboardPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialUrlTag = searchParams.get('tag') || '';

  const {
    notes, isLoading, errorMessage, fetchNotes, searchQuery, setSearchQuery, selectedTag, setSelectedTag,
    allTags, addCustomFolder, createNote, updateNote, deleteNote, togglePin, exportNotes, importNotes,
    removeNoteLocally, restoreNoteLocally,
  } = useNotes({ initialTag: initialUrlTag });
  const { logout } = useAuth();

  useEffect(() => {
    const urlTag = searchParams.get('tag') || '';
    setSelectedTag(urlTag);
  }, [searchParams, setSelectedTag]);

  const handleSelectFolder = (tag: string) => {
    setFilterMode('all');
    setSearchParams(tag ? { tag } : {});
  };

  const [activeNoteForEdit, setActiveNoteForEdit] = useState<Note | NoteInput | null>(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [isPaletteOpen, setIsPaletteOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [filterMode, setFilterMode] = useState('all');
  const [viewMode, setViewMode] = useState<ViewMode>(() => {
    try {
      return (localStorage.getItem('notes_view_mode') as ViewMode) || 'grid';
    } catch {
      return 'grid';
    }
  });
  const searchInputRef = useRef<HTMLInputElement>(null);
  const quickTackInputRef = useRef<HTMLInputElement>(null);

  usePaletteShortcut(() => setIsPaletteOpen(true));

  const { deletedNote, triggerSoftDelete, undoDelete, dismissToast } = useSoftDelete({
    onPermanentDelete: deleteNote, onRestoreNote: restoreNoteLocally, onRemoveFromState: removeNoteLocally,
  });

  const safeNotes = Array.isArray(notes)
    ? notes.filter((n): n is Note => Boolean(n && typeof n === 'object' && n.id))
    : [];
  const safeTags = Array.isArray(allTags) ? allTags : [];
  const displayedNotes = safeNotes.filter((n: Note) =>
    !selectedTag && Array.isArray(n.tags) && n.tags.includes('archive')
      ? false
      : filterMode === 'pinned'
        ? n.isPinned
        : true
  );
  const pinnedCount = safeNotes.filter(
    (n) => n.isPinned && !(Array.isArray(n.tags) && n.tags.includes('archive'))
  ).length;

  const openEditor = (targetNote: Note | NoteInput | null = null) => {
    setActiveNoteForEdit(targetNote);
    setIsEditorOpen(true);
  };

  const { focusedIndex } = useDeskKeyboardNav({
    notes: displayedNotes,
    isModalOpen: isEditorOpen || isPaletteOpen || isHelpOpen,
    onSelectNote: openEditor,
    onTogglePin: togglePin,
    onDeleteNote: (id) => { const n = notes.find((item) => item.id === id); if (n) triggerSoftDelete(n); },
    onUndoDelete: undoDelete,
    onOpenNewNote: () => openEditor(null),
    onToggleHelp: () => setIsHelpOpen((prev) => !prev),
    onFocusSearch: () => searchInputRef.current?.focus(),
    onFocusQuickTack: () => quickTackInputRef.current?.focus(),
  });

  const handleImportFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      try { await importNotes(file); } finally { event.target.value = ''; }
    }
  };

  const pinnedNotes = filterMode === 'all' ? displayedNotes.filter((n) => n.isPinned) : [];
  const regularNotes = filterMode === 'all' && pinnedNotes.length > 0
    ? displayedNotes.filter((n) => !n.isPinned)
    : displayedNotes;

  const renderNotesList = (list: Note[], offset = 0) => (
    <div className={viewMode === 'stream' ? styles.notesStream : styles.notesGrid}>
      {list.map((singleNote: Note, idx: number) => (
        <NoteCard
          key={singleNote.id} note={singleNote} isFocused={focusedIndex === offset + idx}
          onSelect={openEditor} onTogglePin={togglePin} onDelete={() => triggerSoftDelete(singleNote)}
        />
      ))}
    </div>
  );

  return (
    <Layout
      onNewNoteClick={() => openEditor(null)}
      folders={safeTags}
      selectedFolder={selectedTag}
      onSelectFolder={handleSelectFolder}
      onAddFolder={(tag) => {
        const created = addCustomFolder(tag);
        if (created) handleSelectFolder(created);
      }}
    >
      <div className={styles.container}>
        <div className={styles.controlsBar}>
          <SearchBar ref={searchInputRef} value={searchQuery} onChange={setSearchQuery} onClear={() => setSearchQuery('')} />
          <ViewModeToggle
            currentMode={viewMode}
            onChangeMode={(m) => { setViewMode(m); localStorage.setItem('notes_view_mode', m); }}
          />
          <ExportImportActions onExport={exportNotes} onImportFile={handleImportFileChange} />
        </div>

        <BentoStatsBar
          totalNotes={safeNotes.length} pinnedCount={pinnedCount} totalTags={safeTags.length}
          activeFilter={filterMode === 'pinned' ? 'pinned' : 'all'}
          onOpenCommandPalette={() => setIsPaletteOpen(true)}
          onFilterAll={() => handleSelectFolder('')}
          onFilterPinned={() => setFilterMode((prev) => (prev === 'pinned' ? 'all' : 'pinned'))}
        />

        {errorMessage && (
          <div className={styles.errorBanner} role="alert">
            <span>{errorMessage}</span>
            <button type="button" className={styles.retryBtn} onClick={() => fetchNotes()}>
              Retry
            </button>
          </div>
        )}

        {isLoading ? (
          <div className={styles.skeletonGrid} aria-busy="true" aria-label="Loading notes">
            <div className={styles.skeletonCard} /><div className={styles.skeletonCard} />
          </div>
        ) : viewMode === 'board' ? (
          <KanbanBoard
            notes={displayedNotes}
            onOpenNote={openEditor}
            onMoveStatus={async (noteId: string, nextStatus: NoteStatus) => {
              await updateNote(noteId, { status: nextStatus });
            }}
            onCreateInColumn={(status: NoteStatus) => openEditor({ status })}
          />
        ) : displayedNotes.length === 0 ? (
          <NotesEmptyState searchQuery={searchQuery} onCreateNote={() => openEditor(null)} onApplyTemplate={openEditor} />
        ) : (
          <>
            {pinnedNotes.length > 0 && (
              <>
                <div className={styles.sectionHeading}>Pinned</div>
                {renderNotesList(pinnedNotes, 0)}
              </>
            )}
            <div className={styles.headerWithAction}>
              <div className={`${styles.sectionHeading} ${styles.sectionHeadingCompact}`}>
                {filterMode === 'pinned' ? 'Pinned notes' : 'Recent notes'}
              </div>
            </div>
            {renderNotesList(regularNotes, pinnedNotes.length)}
          </>
        )}

        <QuickTackBar
          activeTag={selectedTag} inputRef={quickTackInputRef}
          onQuickCreate={async (title, tag) => { await createNote({ title, content: '', tags: tag ? [tag] : [], color: 'slate', isPinned: false }); }}
        />

        <NoteEditor
          note={activeNoteForEdit} isOpen={isEditorOpen}
          onClose={() => { setIsEditorOpen(false); setActiveNoteForEdit(null); }}
          onSave={async (payload) => { if (payload.id) await updateNote(payload.id, payload); else await createNote(payload); }}
        />

        <CommandPalette
          isOpen={isPaletteOpen} onClose={() => setIsPaletteOpen(false)} notes={notes}
          onSelectNote={openEditor} onCreateNote={() => openEditor(null)}
          onTogglePinnedFilter={() => setFilterMode((prev) => (prev === 'pinned' ? 'all' : 'pinned'))}
          onExportNotes={exportNotes} onLogout={logout}
        />

        {deletedNote && <UndoToast noteTitle={deletedNote.title} onUndo={undoDelete} onDismiss={dismissToast} />}
        <KeyboardHelpModal isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)} />
      </div>
    </Layout>
  );
}
