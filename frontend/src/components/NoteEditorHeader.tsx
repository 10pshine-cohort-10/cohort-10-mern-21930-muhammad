import { useState, useRef, useEffect } from 'react';
import { X, Maximize2, Minimize2, Download, Archive, ArchiveRestore } from 'lucide-react';
import type { ExportFormat } from '../utils/noteExport';
import styles from './NoteEditor.module.css';

export type SaveStatus = 'idle' | 'saving' | 'saved' | 'draft';

export interface NoteEditorHeaderProps {
  isEditing: boolean;
  isFocusMode: boolean;
  saveStatus?: SaveStatus;
  isArchived?: boolean;
  onToggleFocusMode: () => void;
  onToggleArchive?: () => void;
  onExportCurrentNote?: (format: ExportFormat) => void;
  onClose: () => void;
}

export default function NoteEditorHeader({
  isEditing,
  isFocusMode,
  saveStatus = 'idle',
  isArchived = false,
  onToggleFocusMode,
  onToggleArchive,
  onExportCurrentNote,
  onClose,
}: NoteEditorHeaderProps) {
  const [isExportOpen, setIsExportOpen] = useState(false);
  const exportMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isExportOpen) return;
    const handleOutside = (event: MouseEvent) => {
      if (exportMenuRef.current && !exportMenuRef.current.contains(event.target as Node)) {
        setIsExportOpen(false);
      }
    };
    window.addEventListener('mousedown', handleOutside);
    return () => window.removeEventListener('mousedown', handleOutside);
  }, [isExportOpen]);

  let stampLabel = '';
  let stampClass = styles.saveStamp;

  if (saveStatus === 'saving') {
    stampLabel = '[ SAVING... ]';
    stampClass = `${styles.saveStamp} ${styles.saveStampActive}`;
  } else if (saveStatus === 'saved') {
    stampLabel = '[ STAMPED ]';
    stampClass = `${styles.saveStamp} ${styles.saveStampSaved}`;
  } else if (saveStatus === 'draft') {
    stampLabel = '[ DRAFT ]';
  }

  return (
    <div className={styles.drawerHeader}>
      <div className={styles.headerLeft}>
        <span className={styles.headerTitle}>{isEditing ? 'Edit Note' : 'Create Note'}</span>
        {stampLabel && <span className={stampClass}>{stampLabel}</span>}
      </div>

      <div className={styles.headerActions}>
        {isEditing && onToggleArchive && (
          <button
            type="button"
            className={styles.iconButton}
            onClick={onToggleArchive}
            title={isArchived ? 'Restore from Archive' : 'Move to Archive'}
            aria-label={isArchived ? 'Restore from Archive' : 'Move to Archive'}
          >
            {isArchived ? <ArchiveRestore size={16} /> : <Archive size={16} />}
          </button>
        )}
        {isEditing && onExportCurrentNote && (
          <div ref={exportMenuRef} className={styles.exportWrap}>
            <button
              type="button"
              className={styles.iconButton}
              onClick={() => setIsExportOpen((prev) => !prev)}
              aria-haspopup="menu"
              aria-expanded={isExportOpen}
              title="Export note"
              aria-label="Export note"
            >
              <Download size={16} />
            </button>
            {isExportOpen && (
              <div
                className={styles.exportDropdown}
                role="menu"
                aria-label="Export note"
                onKeyDown={(e) => {
                  if (e.key === 'Escape') {
                    e.stopPropagation();
                    setIsExportOpen(false);
                  }
                }}
              >
                <button
                  type="button"
                  role="menuitem"
                  className={styles.exportOption}
                  onClick={() => { setIsExportOpen(false); onExportCurrentNote('json'); }}
                >
                  Export JSON
                </button>
                <button
                  type="button"
                  role="menuitem"
                  className={styles.exportOption}
                  onClick={() => { setIsExportOpen(false); onExportCurrentNote('markdown'); }}
                >
                  Export Markdown
                </button>
                <button
                  type="button"
                  role="menuitem"
                  className={styles.exportOption}
                  onClick={() => { setIsExportOpen(false); onExportCurrentNote('txt'); }}
                >
                  Export Plain Text
                </button>
              </div>
            )}
          </div>
        )}
        <button
          type="button"
          className={styles.iconButton}
          onClick={onToggleFocusMode}
          title={isFocusMode ? 'Exit focus mode' : 'Enter focus mode'}
          aria-label={isFocusMode ? 'Exit focus mode' : 'Enter focus mode'}
        >
          {isFocusMode ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
        </button>
        <button
          type="button"
          className={styles.closeButton}
          onClick={onClose}
          aria-label="Close editor"
        >
          <X size={18} />
        </button>
      </div>
    </div>
  );
}
