import styles from '../pages/DashboardPage.module.css';

export interface TagFilterBarProps {
  filterMode: string;
  selectedTag: string;
  allTags: string[];
  totalCount?: number;
  pinnedCount?: number;
  tagCounts?: Record<string, number>;
  onSelectFilterMode: (mode: string) => void;
  onSelectTag: (tag: string) => void;
}

export default function TagFilterBar({
  filterMode,
  selectedTag,
  allTags,
  totalCount,
  pinnedCount,
  tagCounts = {},
  onSelectFilterMode,
  onSelectTag,
}: TagFilterBarProps) {
  return (
    <div className={styles.tagFilterBar}>
      <button
        type="button"
        className={`${styles.tagChip} ${filterMode === 'all' && !selectedTag ? styles.tagChipActive : ''}`}
        onClick={() => {
          onSelectFilterMode('all');
          onSelectTag('');
        }}
      >
        All Notes {typeof totalCount === 'number' ? `(${totalCount})` : ''}
      </button>

      <button
        type="button"
        className={`${styles.tagChip} ${filterMode === 'pinned' ? styles.tagChipActive : ''}`}
        onClick={() => {
          onSelectFilterMode('pinned');
          onSelectTag('');
        }}
      >
        Pinned {typeof pinnedCount === 'number' ? `(${pinnedCount})` : ''}
      </button>

      {allTags.map((tag) => {
        const count = tagCounts[tag];
        return (
          <button
            key={tag}
            type="button"
            className={`${styles.tagChip} ${selectedTag === tag ? styles.tagChipActive : ''}`}
            onClick={() => {
              onSelectFilterMode('all');
              onSelectTag(selectedTag === tag ? '' : tag);
            }}
          >
            #{tag} {typeof count === 'number' ? `(${count})` : ''}
          </button>
        );
      })}
    </div>
  );
}
