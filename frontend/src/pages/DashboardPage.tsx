import { useState, useRef, type ChangeEvent } from 'react';
import Layout from '../components/Layout';
import DashboardControls from '../components/DashboardControls';
import NoteCard from '../components/NoteCard';
import NoteEditor from '../components/NoteEditor';
import TagFilterBar from '../components/TagFilterBar';
import NotesEmptyState from '../components/NotesEmptyState';
import BentoStatsBar from '../components/BentoStatsBar';
import CommandPalette from '../components/CommandPalette';
import QuickTackBar from '../components/QuickTackBar';
import UndoToast from '../components/UndoToast';
import ViewModeToggle, { type ViewMode } from '../components/ViewModeToggle';
import KeyboardHelpModal from '../components/KeyboardHelpModal';
import { useNotes } from '../hooks/useNotes';
import { usePaletteShortcut } from '../hooks/usePaletteShortcut';
import { useDeskKeyboardNav } from '../hooks/useDeskKeyboardNav';
import { useSoftDelete } from '../hooks/useSoftDelete';
import { useAuth } from '../context/AuthContext';
import type { Note, NoteInput } from '../types';
import styles from './DashboardPage.module.css';

export default function DashboardPage() {
  const {
    notes, isLoading, searchQuery, setSearchQuery, selectedTag, setSelectedTag, allTags,
    createNote, updateNote, deleteNote, togglePin, exportNotes, importNotes,
    removeNoteLocally, restoreNoteLocally,
  } = useNotes();
  const { logout } = useAuth();

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

  const safeNotes = Array.isArray(notes) ? notes : [];
  const safeTags = Array.isArray(allTags) ? allTags : [];
  const displayedNotes = safeNotes.filter((n: Note) => {
    if (!n) return false;
    const tags = Array.isArray(n.tags) ? n.tags : [];
    if (!selectedTag && tags.includes('archive')) return false;
    return filterMode === 'pinned' ? Boolean(n.isPinned) : true;
  });
  const pinnedCount = safeNotes.filter((n) => n && n.isPinned && !(Array.isArray(n.tags) && n.tags.includes('archive'))).length;

  const openEditor = (targetNote: Note | NoteInput | null = null) => {
    setActiveNoteForEdit(targetNote);
    setIsEditorOpen(true);
  };

  const { focusedIndex } = useDeskKeyboardNav({
    notes: displayedNotes,
    isModalOpen: isEditorOpen || isPaletteOpen || isHelpOpen,
    onSelectNote: openEditor,
    onTogglePin: togglePin,
    onDeleteNote: (id) => { const n = safeNotes.find((item) => item.id === id); if (n) triggerSoftDelete(n); },
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

  const tagCounts: Record<string, number> = {};
  for (const t of safeTags) {
    tagCounts[t] = safeNotes.filter((n) => n && Array.isArray(n.tags) && n.tags.includes(t)).length;
  }

  return (
    <Layout onNewNoteClick={() => openEditor(null)}>
      <div className={styles.container}>
        <DashboardControls
          searchInputRef={searchInputRef}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onSearchClear={() => setSearchQuery('')}
          onExportNotes={exportNotes}
          onImportFileChange={handleImportFileChange}
        />

        <BentoStatsBar
          totalNotes={safeNotes.length} pinnedCount={pinnedCount} totalTags={safeTags.length}
          onOpenCommandPalette={() => setIsPaletteOpen(true)}
          onFilterAll={() => { setFilterMode('all'); setSelectedTag(''); }}
          onFilterPinned={() => setFilterMode('pinned')}
        />

        <div className={styles.sectionHeading}>My folders</div>
        <TagFilterBar
          filterMode={filterMode} selectedTag={selectedTag} allTags={safeTags}
          totalCount={safeNotes.length} pinnedCount={pinnedCount} tagCounts={tagCounts}
          onSelectFilterMode={setFilterMode} onSelectTag={setSelectedTag} onAddNewFolder={setSelectedTag}
        />

        <div className={styles.headerWithAction}>
          <div className={styles.sectionHeading} style={{ margin: 0 }}>Recent notes</div>
          <ViewModeToggle currentMode={viewMode} onChangeMode={(m) => { setViewMode(m); localStorage.setItem('notes_view_mode', m); }} />
        </div>

        <QuickTackBar
          activeTag={selectedTag} inputRef={quickTackInputRef}
          onQuickCreate={async (title, tag) => { await createNote({ title, content: '', tags: tag ? [tag] : [], color: 'slate', isPinned: false }); }}
        />

        {isLoading ? (
          <div className={styles.skeletonGrid}><div className={styles.skeletonCard} /><div className={styles.skeletonCard} /></div>
        ) : displayedNotes.length === 0 ? (
          <NotesEmptyState searchQuery={searchQuery} onCreateNote={() => openEditor(null)} onApplyTemplate={openEditor} />
        ) : (
          <div className={viewMode === 'stream' ? styles.notesStream : styles.notesGrid}>
            {displayedNotes.map((singleNote: Note, idx: number) => (
              <NoteCard
                key={singleNote.id}
                note={singleNote}
                isFocused={focusedIndex === idx}
                onSelect={openEditor}
                onTogglePin={togglePin}
                onDelete={() => triggerSoftDelete(singleNote)}
              />
            ))}
          </div>
        )}

        <NoteEditor
          note={activeNoteForEdit} isOpen={isEditorOpen}
          onClose={() => { setIsEditorOpen(false); setActiveNoteForEdit(null); }}
          onSave={async (payload) => { if (payload.id) await updateNote(payload.id, payload); else await createNote(payload); }}
        />

        <CommandPalette
          isOpen={isPaletteOpen} onClose={() => setIsPaletteOpen(false)} notes={safeNotes}
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
