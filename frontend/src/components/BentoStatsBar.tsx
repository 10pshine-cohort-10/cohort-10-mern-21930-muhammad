import { Files, Pin, Folder, Terminal } from 'lucide-react';
import styles from '../pages/DashboardPage.module.css';

export interface BentoStatsBarProps {
  totalNotes: number;
  pinnedCount: number;
  totalTags: number;
  thirdStatLabel?: string;
  thirdStatValue?: string | number;
  activeFilter?: 'all' | 'pinned';
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
  activeFilter,
  onOpenCommandPalette,
  onFilterAll,
  onFilterPinned,
}: BentoStatsBarProps) {
  return (
    <div className={styles.bentoStatsBar}>
      {onFilterAll ? (
        <button
          type="button"
          className={`${styles.statCard} ${styles.statCardBtn} ${activeFilter === 'all' ? styles.statCardActive : ''}`}
          onClick={onFilterAll}
          aria-pressed={activeFilter === 'all'}
          title="Show all notes"
        >
          <Files size={14} aria-hidden="true" />
          <span className={styles.statValue}>{totalNotes}</span>
          <span className={styles.statLabel}>Total Notes</span>
        </button>
      ) : (
        <div className={styles.statCard}>
          <Files size={14} aria-hidden="true" />
          <span className={styles.statValue}>{totalNotes}</span>
          <span className={styles.statLabel}>Total Notes</span>
        </div>
      )}

      {onFilterPinned ? (
        <button
          type="button"
          className={`${styles.statCard} ${styles.statCardBtn} ${activeFilter === 'pinned' ? styles.statCardActive : ''}`}
          onClick={onFilterPinned}
          aria-pressed={activeFilter === 'pinned'}
          title="Filter pinned notes"
        >
          <Pin size={14} color="var(--accent-orange-text)" aria-hidden="true" />
          <span className={styles.statValue}>{pinnedCount}</span>
          <span className={styles.statLabel}>Pinned</span>
        </button>
      ) : (
        <div className={styles.statCard}>
          <Pin size={14} color="var(--accent-orange-text)" aria-hidden="true" />
          <span className={styles.statValue}>{pinnedCount}</span>
          <span className={styles.statLabel}>Pinned</span>
        </div>
      )}

      <div className={styles.statCard}>
        <Folder size={14} color="var(--accent-blue-text)" aria-hidden="true" />
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
