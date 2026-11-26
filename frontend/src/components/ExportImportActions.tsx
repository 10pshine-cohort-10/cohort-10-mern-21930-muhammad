import { useRef, useState, type ChangeEvent } from 'react';
import PropTypes from 'prop-types';
import { Download, Upload, Check } from 'lucide-react';
import styles from '../pages/DashboardPage.module.css';

export interface ExportImportActionsProps {
  onExport: (format: 'json' | 'markdown') => Promise<void>;
  onImportFile: (event: ChangeEvent<HTMLInputElement>) => void;
}

export default function ExportImportActions({ onExport, onImportFile }: ExportImportActionsProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [exportError, setExportError] = useState<string>('');
  const [recentExport, setRecentExport] = useState<'json' | 'markdown' | null>(null);

  const handleExportClick = async (format: 'json' | 'markdown') => {
    setExportError('');
    try {
      await onExport(format);
      setRecentExport(format);
      setTimeout(() => setRecentExport((prev) => (prev === format ? null : prev)), 1500);
    } catch (err) {
      console.error('Failed to export notes:', err);
      setExportError('Export failed. Please try again.');
    }
  };

  return (
    <div className={styles.actionsGroup}>
      {exportError && (
        <span role="alert" style={{ color: 'var(--danger-text)', fontSize: '0.8rem' }}>
          {exportError}
        </span>
      )}
      <button
        type="button"
        className={styles.secondaryBtn}
        onClick={() => handleExportClick('json')}
        title="Export all notes to JSON backup"
      >
        {recentExport === 'json' ? <Check size={14} /> : <Download size={14} />}
        <span>{recentExport === 'json' ? 'Exported' : 'Export JSON'}</span>
      </button>

      <button
        type="button"
        className={styles.secondaryBtn}
        onClick={() => handleExportClick('markdown')}
        title="Export notes to Markdown document"
      >
        {recentExport === 'markdown' ? <Check size={14} /> : <Download size={14} />}
        <span>{recentExport === 'markdown' ? 'Exported' : 'Export MD'}</span>
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
        onChange={onImportFile}
      />
    </div>
  );
}

ExportImportActions.propTypes = {
  onExport: PropTypes.func.isRequired,
  onImportFile: PropTypes.func.isRequired,
};
