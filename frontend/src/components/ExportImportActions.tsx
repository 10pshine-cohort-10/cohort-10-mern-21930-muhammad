import { useRef, useState, useEffect, type ChangeEvent, type KeyboardEvent } from 'react';
import { Download, Upload, ChevronDown, Check, CheckSquare, FileJson, FileText } from 'lucide-react';
import type { ExportFormat, ExportScope } from '../utils/noteExport';
import styles from '../pages/DashboardPage.module.css';

export interface ExportImportActionsProps {
  onExport: (format: ExportFormat, scope: ExportScope) => Promise<void> | void;
  onImportFile: (event: ChangeEvent<HTMLInputElement>) => void;
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

  const [exportScope, setExportScope] = useState<ExportScope>('all');
  const [exportError, setExportError] = useState('');
  const [didExport, setDidExport] = useState(false);

  const defaultScope: ExportScope = selectedCount > 0 ? 'selected' : activeFolder ? 'folder' : 'all';

  useEffect(() => {
    setExportScope(defaultScope);
  }, [defaultScope]);

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
      await onExport(format, exportScope);
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
      menuRef.current?.querySelectorAll<HTMLButtonElement>('[role="menuitem"], [role="menuitemradio"]') || []
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

  const showScopeStrip = selectedCount > 0 || Boolean(activeFolder);

  return (
    <div className={styles.actionsWrapper}>
      <div className={styles.actionsGroup}>
        {onToggleSelectionMode && (
          <button
            type="button"
            className={`${styles.secondaryBtn} ${isSelectionMode ? styles.secondaryBtnActive : ''}`}
            onClick={onToggleSelectionMode}
            disabled={isBoardView}
            aria-pressed={isSelectionMode}
            title={isBoardView ? 'Switch to Grid or Stream view to multi-select' : 'Select multiple notes'}
          >
            <CheckSquare size={14} />
            <span>{isSelectionMode ? 'Done' : 'Select'}</span>
          </button>
        )}

        <div className={styles.exportMenuContainer} ref={menuRef} onKeyDown={handleMenuKeyDown}>
          <button
            ref={triggerRef}
            type="button"
            className={styles.secondaryBtn}
            onClick={() => setMenuOpen(!isMenuOpen)}
            aria-haspopup="menu"
            aria-expanded={isMenuOpen}
            title="Export notes"
          >
            {didExport ? <Check size={14} /> : <Download size={14} />}
            <span>{didExport ? 'Exported' : 'Export'}</span>
            <ChevronDown size={13} />
          </button>

          {isMenuOpen && (
            <div className={styles.exportPopover} role="menu" aria-label="Export options">
              {showScopeStrip ? (
                <div className={styles.scopeStrip}>
                  {selectedCount > 0 && (
                    <button
                      type="button"
                      role="menuitemradio"
                      aria-checked={exportScope === 'selected'}
                      className={`${styles.scopeBtn} ${exportScope === 'selected' ? styles.scopeBtnActive : ''}`}
                      onClick={() => setExportScope('selected')}
                    >
                      Selected ({selectedCount})
                    </button>
                  )}
                  {activeFolder && (
                    <button
                      type="button"
                      role="menuitemradio"
                      aria-checked={exportScope === 'folder'}
                      className={`${styles.scopeBtn} ${exportScope === 'folder' ? styles.scopeBtnActive : ''}`}
                      onClick={() => setExportScope('folder')}
                    >
                      #{activeFolder} ({folderCount})
                    </button>
                  )}
                  <button
                    type="button"
                    role="menuitemradio"
                    aria-checked={exportScope === 'all'}
                    className={`${styles.scopeBtn} ${exportScope === 'all' ? styles.scopeBtnActive : ''}`}
                    onClick={() => setExportScope('all')}
                  >
                    All notes ({totalCount})
                  </button>
                </div>
              ) : (
                <div className={styles.exportScopeHeader}>All notes ({totalCount})</div>
              )}

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
            </div>
          )}
        </div>

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
