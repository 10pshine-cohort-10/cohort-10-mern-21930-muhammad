import { useRef } from 'react';
import PropTypes from 'prop-types';
import { Download, Upload } from 'lucide-react';
import styles from '../pages/DashboardPage.module.css';

/**
 * Action toolbar with export to JSON/Markdown and import JSON options.
 * @param {{
 *   onExport: (format: string) => void,
 *   onImportFile: (event: React.ChangeEvent<HTMLInputElement>) => void
 * }} props
 */
export default function ExportImportActions({ onExport, onImportFile }) {
  const fileInputRef = useRef(null);

  return (
    <div className={styles.actionsGroup}>
      <button
        type="button"
        className={styles.secondaryBtn}
        onClick={() => onExport('json')}
        title="Export all notes to JSON backup"
      >
        <Download size={14} />
        <span>Export JSON</span>
      </button>

      <button
        type="button"
        className={styles.secondaryBtn}
        onClick={() => onExport('markdown')}
        title="Export notes to Markdown document"
      >
        <Download size={14} />
        <span>Export MD</span>
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
