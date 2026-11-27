import styles from '../pages/DashboardPage.module.css';

export interface BentoStatsBarProps {
  totalNotes: number;
  pinnedCount: number;
  totalTags: number;
  thirdStatLabel?: string;
  thirdStatValue?: string | number;
  activeFilter?: 'all' | 'pinned';
  onOpenCommandPalette?: () => void;
  onFilterAll?: () => void;
  onFilterPinned?: () => void;
}

export default function BentoStatsBar({
  totalNotes,
  pinnedCount,
  totalTags,
  thirdStatLabel = 'folder',
  thirdStatValue,
  activeFilter,
  onFilterAll,
  onFilterPinned,
}: BentoStatsBarProps) {
  const folderDisplay = thirdStatValue ?? totalTags;
  const resolvedThirdLabel =
    thirdStatValue !== undefined
      ? thirdStatLabel.toLowerCase()
      : `${folderDisplay === 1 ? 'folder' : 'folders'}`;

  return (
    <div className={styles.quietStatsLine}>
      {onFilterAll ? (
        <button
          type="button"
          className={`${styles.statLink} ${activeFilter === 'all' ? styles.statLinkActive : ''}`}
          onClick={onFilterAll}
          aria-pressed={activeFilter === 'all'}
        >
          {totalNotes} {totalNotes === 1 ? 'note' : 'notes'}
        </button>
      ) : (
        <span>
          {totalNotes} {totalNotes === 1 ? 'note' : 'notes'}
        </span>
      )}

      <span aria-hidden="true">·</span>

      {onFilterPinned ? (
        <button
          type="button"
          className={`${styles.statLink} ${activeFilter === 'pinned' ? styles.statLinkActive : ''}`}
          onClick={onFilterPinned}
          aria-pressed={activeFilter === 'pinned'}
        >
          {pinnedCount} pinned
        </button>
      ) : (
        <span>{pinnedCount} pinned</span>
      )}

      <span aria-hidden="true">·</span>

      <span>
        <span>{folderDisplay}</span> <span>{resolvedThirdLabel}</span>
      </span>
    </div>
  );
}
