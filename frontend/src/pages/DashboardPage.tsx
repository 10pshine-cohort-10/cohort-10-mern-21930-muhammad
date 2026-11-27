import { useState, useRef, useEffect, type ChangeEvent } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Pin, Plus, Archive, Trash2 } from 'lucide-react';
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
import AddFolderModal from '../components/AddFolderModal';
import { useNotes } from '../hooks/useNotes';
import { usePaletteShortcut } from '../hooks/usePaletteShortcut';
import { useDeskKeyboardNav } from '../hooks/useDeskKeyboardNav';
import { useSoftDelete } from '../hooks/useSoftDelete';
import { useAuth, GUEST_SYNC_COUNT_KEY, GUEST_SYNC_ERROR_KEY } from '../context/AuthContext';
import { downloadExportedNotes, type ExportFormat, type ExportScope } from '../utils/noteExport';
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
  const [isMobileFolderModalOpen, setIsMobileFolderModalOpen] = useState(false);
  const [quickAddExpandCount, setQuickAddExpandCount] = useState(0);
  const [statusNotice, setStatusNotice] = useState<{ text: string; isError?: boolean; actionLabel?: string; onAction?: () => void } | null>(null);
  const [filterMode, setFilterMode] = useState('all');
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [isConfirmingBatchDelete, setIsConfirmingBatchDelete] = useState(false);
  const [selectedNoteIds, setSelectedNoteIds] = useState<string[]>([]);
  const [isExportMenuOpen, setIsExportMenuOpen] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>(() => {
    try {
      return (localStorage.getItem('notes_view_mode') as ViewMode) || 'grid';
    } catch {
      return 'grid';
    }
  });
  const searchInputRef = useRef<HTMLInputElement>(null);
  const quickTackInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    try {
      const hasSyncError = sessionStorage.getItem(GUEST_SYNC_ERROR_KEY);
      if (hasSyncError) {
        sessionStorage.removeItem(GUEST_SYNC_ERROR_KEY);
        setStatusNotice({
          text: 'Your local Scratchpad drafts could not sync automatically. Open Scratchpad to add them when ready.',
          isError: true,
        });
        return;
      }
      const rawCount = sessionStorage.getItem(GUEST_SYNC_COUNT_KEY);
      if (rawCount) {
        sessionStorage.removeItem(GUEST_SYNC_COUNT_KEY);
        const parsed = Number.parseInt(rawCount, 10);
        if (Number.isFinite(parsed) && parsed > 0) {
          setStatusNotice({
            text: `Synced ${parsed} Scratchpad ${parsed === 1 ? 'note' : 'notes'} to your account.`,
          });
        }
      }
    } catch {
      /* sessionStorage unavailable */
    }
  }, []);

  usePaletteShortcut(() => setIsPaletteOpen(true));

  const { deletedNote, triggerSoftDelete, undoDelete, dismissToast } = useSoftDelete({
    onPermanentDelete: deleteNote, onRestoreNote: restoreNoteLocally, onRemoveFromState: removeNoteLocally,
  });

  const safeNotes = Array.isArray(notes)
    ? notes.filter((n): n is Note => Boolean(n && typeof n === 'object' && n.id))
    : [];
  const activeNotes = safeNotes.filter((n) => !(Array.isArray(n.tags) && n.tags.includes('archive')));
  const safeTags = (Array.isArray(allTags) ? allTags : []).filter((tag) => tag !== 'archive');
  const displayedNotes = safeNotes.filter((n: Note) =>
    !selectedTag && Array.isArray(n.tags) && n.tags.includes('archive')
      ? false
      : filterMode === 'pinned'
        ? n.isPinned
        : true
  );
  const pinnedNotes = filterMode === 'all' ? displayedNotes.filter((n) => n.isPinned) : [];
  const regularNotes = filterMode === 'all' && pinnedNotes.length > 0
    ? displayedNotes.filter((n) => !n.isPinned)
    : displayedNotes;
  const orderedNotes = [...pinnedNotes, ...regularNotes];
  const pinnedCount = activeNotes.filter((n) => n.isPinned).length;

  const handleChangeViewMode = (mode: ViewMode) => {
    setViewMode(mode);
    try {
      localStorage.setItem('notes_view_mode', mode);
    } catch {
      /* ignore */
    }
    if (mode === 'board') {
      setIsSelectionMode(false);
      setIsConfirmingBatchDelete(false);
      setSelectedNoteIds([]);
    }
  };

  const openEditor = (targetNote: Note | NoteInput | null = null) => {
    if (targetNote) {
      setActiveNoteForEdit(targetNote);
    } else if (selectedTag) {
      setActiveNoteForEdit({ tags: [selectedTag] });
    } else {
      setActiveNoteForEdit(null);
    }
    setIsEditorOpen(true);
  };

  const { focusedIndex } = useDeskKeyboardNav({
    notes: orderedNotes,
    isModalOpen: isEditorOpen || isPaletteOpen || isHelpOpen || isMobileFolderModalOpen,
    isDisabled: viewMode === 'board',
    onSelectNote: openEditor,
    onTogglePin: togglePin,
    onDeleteNote: (id) => { const n = orderedNotes.find((item) => item.id === id); if (n) triggerSoftDelete(n); },
    onUndoDelete: undoDelete,
    onOpenNewNote: () => openEditor(null),
    onToggleHelp: () => setIsHelpOpen((prev) => !prev),
    onFocusSearch: () => searchInputRef.current?.focus(),
    onFocusQuickTack: () => {
      setQuickAddExpandCount((prev) => prev + 1);
      setTimeout(() => quickTackInputRef.current?.focus(), 0);
    },
  });

  const handleImportFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      const imported = await importNotes(file);
      setStatusNotice({
        text: `Imported ${imported.length} ${imported.length === 1 ? 'note' : 'notes'}.`,
      });
    } catch (err) {
      console.error('Import notes failed:', err);
      setStatusNotice({
        text: err instanceof Error ? err.message : 'Could not import notes file.',
        isError: true,
      });
    } finally {
      event.target.value = '';
    }
  };

  useEffect(() => {
    if (!isSelectionMode) return;
    const handleEscapeSelection = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !isEditorOpen && !isPaletteOpen && !isHelpOpen) {
        setIsSelectionMode(false);
        setIsConfirmingBatchDelete(false);
        setSelectedNoteIds([]);
      }
    };
    window.addEventListener('keydown', handleEscapeSelection);
    return () => window.removeEventListener('keydown', handleEscapeSelection);
  }, [isSelectionMode, isEditorOpen, isPaletteOpen, isHelpOpen]);

  const toggleSelectNote = (id: string) => {
    setIsSelectionMode(true);
    setIsConfirmingBatchDelete(false);
    setSelectedNoteIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const resetSelection = () => {
    setIsSelectionMode(false);
    setIsConfirmingBatchDelete(false);
    setSelectedNoteIds([]);
  };

  const handleBatchStage = async (nextStatus: NoteStatus) => {
    if (selectedNoteIds.length === 0) return;
    try {
      await Promise.all(selectedNoteIds.map((id) => updateNote(id, { status: nextStatus })));
      resetSelection();
    } catch (err) {
      console.error('Batch stage update failed:', err);
      setStatusNotice({ text: 'Could not update stages for selected notes.', isError: true });
    }
  };

  const handleBatchPin = async () => {
    if (selectedNoteIds.length === 0) return;
    const selectedSet = activeNotes.filter((n) => selectedNoteIds.includes(n.id));
    const shouldPin = selectedSet.some((n) => !n.isPinned);
    try {
      await Promise.all(selectedNoteIds.map((id) => togglePin(id, shouldPin)));
      resetSelection();
    } catch (err) {
      console.error('Batch pin update failed:', err);
      setStatusNotice({ text: 'Could not update pin state for selected notes.', isError: true });
    }
  };

  const handleBatchArchive = async () => {
    if (selectedNoteIds.length === 0) return;
    const chosen = safeNotes.filter((n) => selectedNoteIds.includes(n.id));
    try {
      await Promise.all(
        chosen.map((n) => {
          const nextTags = Array.isArray(n.tags) && n.tags.includes('archive')
            ? n.tags
            : [...(n.tags || []), 'archive'];
          return updateNote(n.id, { tags: nextTags });
        })
      );
      setStatusNotice({ text: `Archived ${chosen.length} ${chosen.length === 1 ? 'note' : 'notes'}.` });
      resetSelection();
    } catch (err) {
      console.error('Batch archive failed:', err);
      setStatusNotice({ text: 'Could not archive selected notes.', isError: true });
    }
  };

  const handleBatchDelete = async () => {
    if (selectedNoteIds.length === 0) return;
    try {
      await Promise.all(selectedNoteIds.map((id) => deleteNote(id)));
      resetSelection();
    } catch (err) {
      console.error('Batch delete failed:', err);
      setStatusNotice({ text: 'Could not delete selected notes.', isError: true });
    }
  };

  const handleToggleArchiveNote = async (target: Note) => {
    const isArchived = Array.isArray(target.tags) && target.tags.includes('archive');
    const nextTags = isArchived
      ? (target.tags || []).filter((tag) => tag !== 'archive')
      : [...(target.tags || []), 'archive'];
    try {
      await updateNote(target.id, { tags: nextTags });
      setStatusNotice({
        text: isArchived
          ? `Restored "${target.title || 'Untitled'}" from Archive.`
          : `Moved "${target.title || 'Untitled'}" to Archive.`,
      });
    } catch (err) {
      console.error('Toggle archive note failed:', err);
      setStatusNotice({ text: 'Could not update archive status. Please try again.', isError: true });
    }
  };

  const handleScopedExport = async (format: ExportFormat, scope: ExportScope) => {
    if (scope === 'selected') {
      const chosen = activeNotes.filter((n) => selectedNoteIds.includes(n.id));
      if (chosen.length > 0) {
        downloadExportedNotes(chosen, format, 'selected');
      }
      return;
    }
    if (scope === 'folder' && selectedTag) {
      const folderNotes = safeNotes.filter((n) => Array.isArray(n.tags) && n.tags.includes(selectedTag));
      downloadExportedNotes(folderNotes, format, 'folder', selectedTag);
      return;
    }
    if (format === 'txt') {
      downloadExportedNotes(activeNotes, 'txt', 'all');
      return;
    }
    await exportNotes(format);
  };

  const handleExportSingleNote = (target: Note, format: ExportFormat) => {
    downloadExportedNotes([target], format, 'single', target.title || 'note');
  };

  const renderNotesList = (list: Note[], offset = 0, isPinnedSection = false) => (
    <div className={viewMode === 'stream' ? styles.notesStream : isPinnedSection ? styles.pinnedGrid : styles.notesGrid}>
      {list.map((singleNote: Note, idx: number) => (
        <NoteCard
          key={singleNote.id}
          note={singleNote}
          isFocused={focusedIndex === offset + idx}
          isSelectionMode={isSelectionMode}
          isSelected={selectedNoteIds.includes(singleNote.id)}
          onToggleSelect={toggleSelectNote}
          onExportNote={handleExportSingleNote}
          onArchive={(n) => void handleToggleArchiveNote(n)}
          onSelect={openEditor}
          onTogglePin={togglePin}
          onDelete={() => triggerSoftDelete(singleNote)}
        />
      ))}
    </div>
  );

  const pageHeadingText = selectedTag
    ? `#${selectedTag}`
    : filterMode === 'pinned'
      ? 'Pinned Notes'
      : 'All Notes';

  return (
    <Layout
      onNewNoteClick={() => openEditor(null)}
      folders={safeTags}
      selectedFolder={selectedTag}
      onSelectFolder={handleSelectFolder}
      onOpenHelp={() => setIsHelpOpen(true)}
      hasCustomPalette
      onAddFolder={(tag) => {
        const created = addCustomFolder(tag);
        if (created) handleSelectFolder(created);
      }}
    >
      <div className={styles.container}>
        <div className={styles.pageHeadingRow}>
          <h1 className={styles.pageHeading}>{pageHeadingText}</h1>
        </div>

        {statusNotice && (
          <div
            className={statusNotice.isError ? styles.errorBanner : styles.syncNoticeBar}
            role={statusNotice.isError ? 'alert' : 'status'}
          >
            <span>{statusNotice.text}</span>
            <div className={styles.selectionBarActions}>
              {statusNotice.actionLabel && statusNotice.onAction && (
                <button
                  type="button"
                  className={styles.syncDismissBtn}
                  onClick={() => { statusNotice.onAction?.(); setStatusNotice(null); }}
                >
                  {statusNotice.actionLabel}
                </button>
              )}
              <button
                type="button"
                className={statusNotice.isError ? styles.retryBtn : styles.syncDismissBtn}
                onClick={() => setStatusNotice(null)}
              >
                Dismiss
              </button>
            </div>
          </div>
        )}

        <div className={styles.controlsBar}>
          <SearchBar
            ref={searchInputRef}
            value={searchQuery}
            onChange={setSearchQuery}
            onClear={() => setSearchQuery('')}
            onOpenCommandPalette={() => setIsPaletteOpen(true)}
          />
          <ViewModeToggle currentMode={viewMode} onChangeMode={handleChangeViewMode} />
          <ExportImportActions
            onExport={handleScopedExport}
            onImportFile={handleImportFileChange}
            onOpenCommandPalette={() => setIsPaletteOpen(true)}
            selectedCount={selectedNoteIds.length}
            activeFolder={selectedTag}
            folderCount={
              selectedTag
                ? safeNotes.filter((n) => Array.isArray(n.tags) && n.tags.includes(selectedTag)).length
                : 0
            }
            totalCount={activeNotes.length}
            isSelectionMode={isSelectionMode}
            isBoardView={viewMode === 'board'}
            isMenuOpen={isExportMenuOpen}
            onMenuOpenChange={setIsExportMenuOpen}
            onToggleSelectionMode={() => {
              if (isSelectionMode) resetSelection();
              else setIsSelectionMode(true);
            }}
          />
        </div>

        <div className={styles.mobileFolderStrip} role="region" aria-label="Folders">
          <button
            type="button"
            className={`${styles.tagChip} ${!selectedTag ? styles.tagChipActive : ''}`}
            onClick={() => handleSelectFolder('')}
            aria-label="Filter folder All"
          >
            All
          </button>
          {safeTags.map((tag) => (
            <button
              key={tag}
              type="button"
              className={`${styles.tagChip} ${selectedTag === tag ? styles.tagChipActive : ''}`}
              onClick={() => handleSelectFolder(tag)}
              aria-label={`Filter folder #${tag}`}
            >
              #{tag}
            </button>
          ))}
          <button
            type="button"
            className={styles.tagChip}
            onClick={() => setIsMobileFolderModalOpen(true)}
            aria-label="Add folder"
          >
            <Plus size={13} /> Folder
          </button>
          <button
            type="button"
            className={styles.tagChip}
            onClick={() => setQuickAddExpandCount((prev) => prev + 1)}
            aria-label="Open quick add"
          >
            <Plus size={13} /> Quick add
          </button>
        </div>

        {isSelectionMode && selectedNoteIds.length > 0 && (
          <div className={styles.selectionBar}>
            <span>{selectedNoteIds.length} selected</span>
            <div className={styles.selectionBarActions}>
              <select
                className={styles.batchStageSelect}
                aria-label="Move selected notes to stage"
                value=""
                onChange={(e) => {
                  const chosen = e.target.value as NoteStatus;
                  if (chosen) void handleBatchStage(chosen);
                }}
              >
                <option value="">Move stage...</option>
                <option value="todo">To Do</option>
                <option value="in_progress">In Progress</option>
                <option value="done">Done</option>
              </select>
              <button type="button" className={styles.secondaryBtn} onClick={() => void handleBatchPin()}>
                <Pin size={14} />
                <span>Pin</span>
              </button>
              <button type="button" className={styles.secondaryBtn} onClick={() => void handleBatchArchive()}>
                <Archive size={14} />
                <span>Archive</span>
              </button>
              <button
                type="button"
                className={styles.secondaryBtn}
                onClick={() => setIsExportMenuOpen(true)}
              >
                Export
              </button>
              {isConfirmingBatchDelete ? (
                <button type="button" className={styles.retryBtn} onClick={() => void handleBatchDelete()}>
                  Confirm delete ({selectedNoteIds.length})
                </button>
              ) : (
                <button type="button" className={styles.secondaryBtn} onClick={() => setIsConfirmingBatchDelete(true)}>
                  <Trash2 size={14} />
                  <span>Delete</span>
                </button>
              )}
              <button type="button" className={styles.secondaryBtn} onClick={resetSelection}>
                Clear
              </button>
            </div>
          </div>
        )}

        <BentoStatsBar
          totalNotes={activeNotes.length} pinnedCount={pinnedCount} totalTags={safeTags.length}
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
            searchQuery={searchQuery}
            onOpenNote={openEditor}
            onMoveStatus={async (noteId: string, nextStatus: NoteStatus) => {
              try {
                await updateNote(noteId, { status: nextStatus });
              } catch (err) {
                console.error('Move note stage failed:', err);
                setStatusNotice({ text: 'Could not move card stage. Please try again.', isError: true });
              }
            }}
            onCreateInColumn={(status: NoteStatus) => openEditor({ status, ...(selectedTag ? { tags: [selectedTag] } : {}) })}
          />
        ) : displayedNotes.length === 0 ? (
          <NotesEmptyState
            searchQuery={searchQuery}
            activeFolder={selectedTag}
            onCreateNote={() => openEditor(null)}
            onApplyTemplate={(tpl) =>
              openEditor({
                ...tpl,
                tags: Array.from(new Set([...(tpl.tags || []), ...(selectedTag ? [selectedTag] : [])])),
              })
            }
          />
        ) : (
          <>
            {pinnedNotes.length > 0 && (
              <>
                <div className={styles.sectionHeading}>Pinned</div>
                {renderNotesList(pinnedNotes, 0, true)}
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
          activeTag={selectedTag}
          inputRef={quickTackInputRef}
          expandSignal={quickAddExpandCount}
          onQuickCreate={async (title, tag, status) => {
            await createNote({
              title,
              content: '',
              tags: tag ? [tag] : [],
              color: 'slate',
              isPinned: false,
              ...(status ? { status } : {}),
            });
            if (viewMode === 'board' && !status) {
              setStatusNotice({
                text: `Saved "${title}" to All Notes.`,
                actionLabel: 'Switch to Grid',
                onAction: () => handleChangeViewMode('grid'),
              });
            }
          }}
        />

        <NoteEditor
          note={activeNoteForEdit} isOpen={isEditorOpen}
          onClose={() => { setIsEditorOpen(false); setActiveNoteForEdit(null); }}
          onSave={async (payload) => { if (payload.id) await updateNote(payload.id, payload); else await createNote(payload); }}
        />

        <CommandPalette
          isOpen={isPaletteOpen} onClose={() => setIsPaletteOpen(false)} notes={activeNotes}
          onSelectNote={openEditor} onCreateNote={() => openEditor(null)}
          onTogglePinnedFilter={() => setFilterMode((prev) => (prev === 'pinned' ? 'all' : 'pinned'))}
          onChangeViewMode={handleChangeViewMode}
          onOpenHelp={() => setIsHelpOpen(true)}
          onExportNotes={exportNotes} onLogout={logout}
        />

        <AddFolderModal
          isOpen={isMobileFolderModalOpen}
          existingFolders={safeTags}
          onClose={() => setIsMobileFolderModalOpen(false)}
          onCreateFolder={(tag) => {
            const created = addCustomFolder(tag);
            if (created) handleSelectFolder(created);
          }}
        />

        {deletedNote && <UndoToast noteTitle={deletedNote.title} onUndo={undoDelete} onDismiss={dismissToast} />}
        <KeyboardHelpModal isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)} />
      </div>
    </Layout>
  );
}
