import { useState } from 'react';
import { X, Maximize2, Minimize2, Download } from 'lucide-react';
import type { ExportFormat } from '../utils/noteExport';
import styles from './NoteEditor.module.css';

export type SaveStatus = 'idle' | 'saving' | 'saved' | 'draft';

export interface NoteEditorHeaderProps {
  isEditing: boolean;
  isFocusMode: boolean;
  saveStatus?: SaveStatus;
  onToggleFocusMode: () => void;
  onExportCurrentNote?: (format: ExportFormat) => void;
  onClose: () => void;
}

export default function NoteEditorHeader({
  isEditing,
  isFocusMode,
  saveStatus = 'idle',
  onToggleFocusMode,
  onExportCurrentNote,
  onClose,
}: NoteEditorHeaderProps) {
  const [isExportOpen, setIsExportOpen] = useState(false);
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
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <span className={styles.headerTitle}>{isEditing ? 'Edit Note' : 'Create Note'}</span>
        {stampLabel && <span className={stampClass}>{stampLabel}</span>}
      </div>

      <div className={styles.headerActions}>
        {isEditing && onExportCurrentNote && (
          <>
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
          </>
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
