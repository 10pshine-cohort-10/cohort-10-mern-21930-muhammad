import { useState, useEffect, useRef, type KeyboardEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search, Plus, Pin, FileJson, FileText, User, LogOut,
  Columns3, LayoutGrid, AlignJustify, BarChart3, PenLine, Archive, HelpCircle,
} from 'lucide-react';
import type { Note } from '../types';
import type { ViewMode } from './ViewModeToggle';
import styles from './CommandPalette.module.css';

export interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  notes: Note[];
  onSelectNote: (note: Note) => void;
  onCreateNote: () => void;
  onTogglePinnedFilter: () => void;
  onChangeViewMode?: (mode: ViewMode) => void;
  onOpenHelp?: () => void;
  onExportNotes?: (format: 'json' | 'markdown') => void;
  onLogout?: () => void;
  isGuest?: boolean;
}

interface PaletteAction {
  id: string;
  label: string;
  shortcut?: string;
  icon: typeof Plus;
  isPrimary?: boolean;
  run: () => void;
}

export default function CommandPalette({
  isOpen,
  onClose,
  notes,
  onSelectNote,
  onCreateNote,
  onTogglePinnedFilter,
  onChangeViewMode,
  onOpenHelp,
  onExportNotes,
  onLogout,
  isGuest = false,
}: CommandPaletteProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (isOpen) {
      setSearchTerm('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 30);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const baseActions: PaletteAction[] = [
    { id: 'create', label: 'Create new note', shortcut: 'N', icon: Plus, isPrimary: true, run: () => { onCreateNote(); onClose(); } },
    ...(onChangeViewMode ? [
      { id: 'view-board', label: 'Switch to Board view', icon: Columns3, isPrimary: true, run: () => { onChangeViewMode('board'); onClose(); } },
      { id: 'view-grid', label: 'Switch to Grid view', icon: LayoutGrid, run: () => { onChangeViewMode('grid'); onClose(); } },
      { id: 'view-stream', label: 'Switch to Stream view', icon: AlignJustify, run: () => { onChangeViewMode('stream'); onClose(); } },
    ] : []),
    { id: 'pinned', label: 'Toggle pinned notes filter', shortcut: 'P', icon: Pin, isPrimary: true, run: () => { onTogglePinnedFilter(); onClose(); } },
    ...(!isGuest ? [
      { id: 'nav-progress', label: 'Open Progress', icon: BarChart3, isPrimary: true, run: () => { navigate('/insights'); onClose(); } },
      { id: 'nav-notes', label: 'Open Notes', icon: FileText, run: () => { navigate('/dashboard'); onClose(); } },
      { id: 'nav-scratchpad', label: 'Open Scratchpad', icon: PenLine, run: () => { navigate('/scratchpad'); onClose(); } },
      { id: 'nav-archive', label: 'Open Archive', icon: Archive, run: () => { navigate('/archive'); onClose(); } },
    ] : []),
    ...(onOpenHelp ? [{ id: 'help', label: 'Keyboard shortcuts', shortcut: '?', icon: HelpCircle, run: () => { onClose(); onOpenHelp(); } }] : []),
    ...(onExportNotes ? [
      { id: 'export-json', label: 'Export notes as JSON', icon: FileJson, run: () => { onExportNotes('json'); onClose(); } },
      { id: 'export-md', label: 'Export notes as Markdown', icon: FileText, run: () => { onExportNotes('markdown'); onClose(); } },
    ] : []),
    ...(!isGuest ? [{ id: 'profile', label: 'View profile', icon: User, run: () => { navigate('/profile'); onClose(); } }] : []),
    ...(onLogout ? [{ id: 'logout', label: 'Log out', icon: LogOut, run: () => { onLogout(); onClose(); } }] : []),
  ];

  const query = searchTerm.trim().toLowerCase();
  const filteredActions = query
    ? baseActions.filter((action) => action.label.toLowerCase().includes(query))
    : baseActions.filter((action) => action.isPrimary).slice(0, 4);
  const filteredNotes = notes
    .filter((n) => (n.title || '').toLowerCase().includes(query) || (n.content || '').toLowerCase().includes(query))
    .slice(0, query ? 5 : 4);

  const totalItemsCount = filteredActions.length + filteredNotes.length;

  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.key === 'Escape') {
      event.preventDefault();
      onClose();
    } else if (event.key === 'ArrowDown') {
      event.preventDefault();
      setSelectedIndex((prev) => (totalItemsCount ? (prev + 1) % totalItemsCount : 0));
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      setSelectedIndex((prev) => (totalItemsCount ? (prev - 1 + totalItemsCount) % totalItemsCount : 0));
    } else if (event.key === 'Enter') {
      event.preventDefault();
      if (selectedIndex < filteredActions.length) {
        filteredActions[selectedIndex]?.run();
      } else {
        const selectedNote = filteredNotes[selectedIndex - filteredActions.length];
        if (selectedNote) {
          onSelectNote(selectedNote);
          onClose();
        }
      }
    }
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div
        className={styles.modal}
        role="dialog"
        aria-modal="true"
        aria-label="Command palette"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={handleKeyDown}
      >
        <div className={styles.searchHeader}>
          <Search size={18} className={styles.searchIcon} />
          <input
            ref={inputRef}
            type="text"
            className={styles.searchInput}
            placeholder="Type a command or search notes..."
            aria-label="Command or search notes"
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setSelectedIndex(0); }}
          />
          <kbd className={styles.escBadge}>ESC</kbd>
        </div>

        <div className={styles.resultsList}>
          {filteredActions.length > 0 && <div className={styles.sectionLabel}>Actions</div>}
          {filteredActions.map((action, idx) => {
            const Icon = action.icon;
            return (
              <button
                key={action.id}
                type="button"
                className={`${styles.commandItem} ${selectedIndex === idx ? styles.commandItemActive : ''}`}
                onClick={action.run}
                onMouseEnter={() => setSelectedIndex(idx)}
              >
                <span className={styles.itemLabelGroup}><Icon size={16} /><span>{action.label}</span></span>
                {action.shortcut && <kbd className={styles.itemShortcut}>{action.shortcut}</kbd>}
              </button>
            );
          })}

          {filteredNotes.length > 0 && <div className={styles.sectionLabel}>Notes</div>}
          {filteredNotes.map((matchedNote, idx) => {
            const combinedIndex = filteredActions.length + idx;
            return (
              <button
                key={matchedNote.id}
                type="button"
                className={`${styles.commandItem} ${selectedIndex === combinedIndex ? styles.commandItemActive : ''}`}
                onClick={() => { onSelectNote(matchedNote); onClose(); }}
                onMouseEnter={() => setSelectedIndex(combinedIndex)}
              >
                <span className={styles.itemLabelGroup}><FileText size={16} /><span>{matchedNote.title || 'Untitled'}</span></span>
                {matchedNote.tags?.[0] && <span className={styles.itemShortcut}>#{matchedNote.tags[0]}</span>}
              </button>
            );
          })}

          {totalItemsCount === 0 && <div className={styles.emptyState}>No matching commands or notes found.</div>}
        </div>
      </div>
    </div>
  );
}
