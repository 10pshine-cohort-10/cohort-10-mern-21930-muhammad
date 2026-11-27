import { useRef, useState, useEffect, useMemo, type ChangeEvent, type KeyboardEvent } from 'react';
import { MoreHorizontal, Upload, Check, CheckSquare, FileJson, FileText, Terminal } from 'lucide-react';
import type { ExportFormat, ExportScope } from '../utils/noteExport';
import styles from '../pages/DashboardPage.module.css';

export interface ExportImportActionsProps {
  onExport: (format: ExportFormat, scope: ExportScope) => Promise<void> | void;
  onImportFile: (event: ChangeEvent<HTMLInputElement>) => void;
  onOpenCommandPalette?: () => void;
  selectedCount?: number;
  activeFolder?: string;
  folderCount?: number;
  totalCount?: number;
  isSelectionMode?: boolean;
  isBoardView?: boolean;
  onToggleSelectionMode?: () => void;
  isMenuOpen?: boolean;
  onMenuOpenChange?: (open: boolean) => void;
}

export default function ExportImportActions({
  onExport,
  onImportFile,
  onOpenCommandPalette,
  selectedCount = 0,
  activeFolder = '',
  folderCount = 0,
  totalCount = 0,
  isSelectionMode = false,
  isBoardView = false,
  onToggleSelectionMode,
  isMenuOpen: controlledOpen,
  onMenuOpenChange,
}: ExportImportActionsProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const [internalOpen, setInternalOpen] = useState(false);
  const isMenuOpen = controlledOpen !== undefined ? controlledOpen : internalOpen;
  const setMenuOpen = (next: boolean) => {
    setInternalOpen(next);
    onMenuOpenChange?.(next);
  };

  const [exportError, setExportError] = useState('');
  const [didExport, setDidExport] = useState(false);

  const shortcutLabel = useMemo(() => {
    if (typeof navigator !== 'undefined' && /Mac|iPhone|iPad|iPod/i.test(navigator.platform || navigator.userAgent)) {
      return '⌘K';
    }
    return 'Ctrl K';
  }, []);

  const activeScope: ExportScope = !isBoardView && selectedCount > 0
    ? 'selected'
    : activeFolder
      ? 'folder'
      : 'all';

  const scopeLabel = activeScope === 'selected'
    ? `Selected (${selectedCount})`
    : activeScope === 'folder'
      ? `#${activeFolder} (${folderCount})`
      : `All notes (${totalCount})`;

  useEffect(() => {
    if (!isMenuOpen) return;
    const handleOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };
    window.addEventListener('mousedown', handleOutside);
    return () => window.removeEventListener('mousedown', handleOutside);
  }, [isMenuOpen]);

  const handleFormatClick = async (format: ExportFormat) => {
    setExportError('');
    setMenuOpen(false);
    try {
      await onExport(format, activeScope);
      setDidExport(true);
      setTimeout(() => setDidExport(false), 1500);
    } catch (err) {
      console.error('Failed to export notes:', err);
      setExportError('Export failed. Please try again.');
    }
  };

  const handleMenuKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Escape') {
      event.stopPropagation();
      setMenuOpen(false);
      triggerRef.current?.focus();
      return;
    }

    const items = Array.from(
      menuRef.current?.querySelectorAll<HTMLButtonElement>('[role="menuitem"]') || []
    );
    if (items.length === 0) return;

    const currentIdx = items.indexOf(document.activeElement as HTMLButtonElement);
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      items[(currentIdx + 1) % items.length].focus();
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      items[(currentIdx - 1 + items.length) % items.length].focus();
    } else if (event.key === 'Home') {
      event.preventDefault();
      items[0].focus();
    } else if (event.key === 'End') {
      event.preventDefault();
      items[items.length - 1].focus();
    }
  };

  return (
    <div className={styles.actionsWrapper}>
      <div className={styles.actionsGroup}>
        {onToggleSelectionMode && !isBoardView && (
          <button
            type="button"
            className={`${styles.secondaryBtn} ${isSelectionMode ? styles.secondaryBtnActive : ''}`}
            onClick={onToggleSelectionMode}
            aria-pressed={isSelectionMode}
            title="Select multiple notes"
          >
            <CheckSquare size={14} />
            <span>{isSelectionMode ? 'Done' : 'Select'}</span>
          </button>
        )}

        <div className={styles.exportMenuContainer} ref={menuRef} onKeyDown={handleMenuKeyDown}>
          <button
            ref={triggerRef}
            type="button"
            className={styles.moreMenuBtn}
            onClick={() => setMenuOpen(!isMenuOpen)}
            aria-haspopup="menu"
            aria-expanded={isMenuOpen}
            aria-label="More actions"
            title="Commands, Export, Import"
          >
            {didExport ? <Check size={16} /> : <MoreHorizontal size={16} />}
          </button>

          {isMenuOpen && (
            <div className={styles.exportPopover} role="menu" aria-label="Workspace actions">
              {onOpenCommandPalette && (
                <>
                  <button
                    type="button"
                    role="menuitem"
                    className={styles.exportMenuItem}
                    onClick={() => { setMenuOpen(false); onOpenCommandPalette(); }}
                  >
                    <Terminal size={14} />
                    <span>Commands</span>
                    <kbd className={styles.menuKbd}>{shortcutLabel}</kbd>
                  </button>
                  <div className={styles.menuDivider} />
                </>
              )}

              <div className={styles.exportScopeHeader}>Export: {scopeLabel}</div>

              <button
                type="button"
                role="menuitem"
                className={styles.exportMenuItem}
                onClick={() => handleFormatClick('json')}
              >
                <FileJson size={14} />
                <span>Export as JSON (.json)</span>
              </button>
              <button
                type="button"
                role="menuitem"
                className={styles.exportMenuItem}
                onClick={() => handleFormatClick('markdown')}
              >
                <FileText size={14} />
                <span>Export as Markdown (.md)</span>
              </button>

              <div className={styles.menuDivider} />

              <button
                type="button"
                role="menuitem"
                className={styles.exportMenuItem}
                onClick={() => { setMenuOpen(false); fileInputRef.current?.click(); }}
              >
                <Upload size={14} />
                <span>Import JSON…</span>
              </button>
            </div>
          )}
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
          className={styles.hiddenInput}
          onChange={onImportFile}
        />
      </div>

      {exportError && (
        <div className={styles.exportErrorText} role="alert">
          {exportError}
        </div>
      )}
    </div>
  );
}
