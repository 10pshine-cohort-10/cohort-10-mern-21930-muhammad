import { Terminal } from 'lucide-react';
import styles from '../pages/DashboardPage.module.css';

export interface BentoStatsBarProps {
  totalNotes: number;
  pinnedCount: number;
  totalTags: number;
  thirdStatLabel?: string;
  thirdStatValue?: string | number;
  onOpenCommandPalette: () => void;
  onFilterAll?: () => void;
  onFilterPinned?: () => void;
}

export default function BentoStatsBar({
  totalNotes,
  pinnedCount,
  totalTags,
  thirdStatLabel = 'Folders',
  thirdStatValue,
  onOpenCommandPalette,
  onFilterAll,
  onFilterPinned,
}: BentoStatsBarProps) {
  return (
    <div className={styles.bentoStatsBar}>
      <div
        className={styles.statCard}
        onClick={onFilterAll}
        role={onFilterAll ? 'button' : undefined}
        tabIndex={onFilterAll ? 0 : undefined}
        style={{ cursor: onFilterAll ? 'pointer' : 'default' }}
        title={onFilterAll ? 'Show all notes' : undefined}
      >
        <span className={styles.statValue}>{totalNotes}</span>
        <span className={styles.statLabel}>Total Notes</span>
      </div>

      <div
        className={styles.statCard}
        onClick={onFilterPinned}
        role={onFilterPinned ? 'button' : undefined}
        tabIndex={onFilterPinned ? 0 : undefined}
        style={{ cursor: onFilterPinned ? 'pointer' : 'default' }}
        title={onFilterPinned ? 'Filter pinned notes' : undefined}
      >
        <span className={styles.statValue}>{pinnedCount}</span>
        <span className={styles.statLabel}>Pinned</span>
      </div>

      <div className={styles.statCard}>
        <span className={styles.statValue}>{thirdStatValue ?? totalTags}</span>
        <span className={styles.statLabel}>{thirdStatLabel}</span>
      </div>

      <button
        type="button"
        className={styles.cmdButton}
        onClick={onOpenCommandPalette}
        title="Open Command Palette"
        aria-label="Open Command Palette"
      >
        <Terminal size={14} />
        <span>Commands</span>
        <kbd className={styles.cmdKbd}>Ctrl K</kbd>
      </button>
    </div>
  );
}
