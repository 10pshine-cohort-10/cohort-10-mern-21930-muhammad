import { useState, useEffect, useRef, type KeyboardEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Plus, Pin, FileJson, FileText, User, LogOut } from 'lucide-react';
import type { Note } from '../types';
import styles from './CommandPalette.module.css';

export interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  notes: Note[];
  onSelectNote: (note: Note) => void;
  onCreateNote: () => void;
  onTogglePinnedFilter: () => void;
  onExportNotes?: (format: 'json' | 'markdown') => void;
  onLogout?: () => void;
}

interface PaletteAction {
  id: string;
  label: string;
  shortcut?: string;
  icon: typeof Plus;
  run: () => void;
}

export default function CommandPalette({
  isOpen,
  onClose,
  notes,
  onSelectNote,
  onCreateNote,
  onTogglePinnedFilter,
  onExportNotes,
  onLogout,
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
    { id: 'create', label: 'Create new note', shortcut: 'N', icon: Plus, run: () => { onCreateNote(); onClose(); } },
    { id: 'pinned', label: 'Toggle pinned notes filter', shortcut: 'P', icon: Pin, run: () => { onTogglePinnedFilter(); onClose(); } },
    { id: 'export-json', label: 'Export notes as JSON', icon: FileJson, run: () => { onExportNotes?.('json'); onClose(); } },
    { id: 'export-md', label: 'Export notes as Markdown', icon: FileText, run: () => { onExportNotes?.('markdown'); onClose(); } },
    { id: 'profile', label: 'View profile', icon: User, run: () => { navigate('/profile'); onClose(); } },
  ];

  if (onLogout) {
    baseActions.push({ id: 'logout', label: 'Log out', icon: LogOut, run: () => { onLogout(); onClose(); } });
  }

  const query = searchTerm.trim().toLowerCase();
  const filteredActions = baseActions.filter((action) => action.label.toLowerCase().includes(query));
  const filteredNotes = notes.filter((n) => (n.title || '').toLowerCase().includes(query) || (n.content || '').toLowerCase().includes(query)).slice(0, 5);

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
        const selectedNoteIndex = selectedIndex - filteredActions.length;
        const selectedNote = filteredNotes[selectedNoteIndex];
        if (selectedNote) {
          onSelectNote(selectedNote);
          onClose();
        }
      }
    }
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()} onKeyDown={handleKeyDown}>
        <div className={styles.searchHeader}>
          <Search size={18} className={styles.searchIcon} />
          <input
            ref={inputRef}
            type="text"
            className={styles.searchInput}
            placeholder="Type a command or search notes..."
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
