import { type RefObject, type ChangeEvent } from 'react';
import SearchBar from './SearchBar';
import ExportImportActions from './ExportImportActions';
import styles from '../pages/DashboardPage.module.css';

export interface DashboardControlsProps {
  searchInputRef: RefObject<HTMLInputElement | null>;
  searchQuery: string;
  onSearchChange: (value: string) => void;
  onSearchClear: () => void;
  onExportNotes: (format: 'json' | 'markdown') => Promise<void>;
  onImportFileChange: (event: ChangeEvent<HTMLInputElement>) => void;
}

export default function DashboardControls({
  searchInputRef,
  searchQuery,
  onSearchChange,
  onSearchClear,
  onExportNotes,
  onImportFileChange,
}: DashboardControlsProps) {
  return (
    <div className={styles.controlsBar}>
      <SearchBar
        ref={searchInputRef}
        value={searchQuery}
        onChange={onSearchChange}
        onClear={onSearchClear}
      />
      <ExportImportActions
        onExport={onExportNotes}
        onImportFile={onImportFileChange}
      />
    </div>
  );
}
