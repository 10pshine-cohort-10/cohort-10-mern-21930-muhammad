import PropTypes from 'prop-types';
import styles from '../pages/DashboardPage.module.css';

export interface TagFilterBarProps {
  filterMode: string;
  selectedTag: string;
  allTags: string[];
  onSelectFilterMode: (mode: string) => void;
  onSelectTag: (tag: string) => void;
}

export default function TagFilterBar({
  filterMode,
  selectedTag,
  allTags,
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
        All Notes
      </button>

      <button
        type="button"
        className={`${styles.tagChip} ${filterMode === 'pinned' ? styles.tagChipActive : ''}`}
        onClick={() => {
          onSelectFilterMode('pinned');
          onSelectTag('');
        }}
      >
        Pinned
      </button>

      {allTags.map((tag) => (
        <button
          key={tag}
          type="button"
          className={`${styles.tagChip} ${selectedTag === tag ? styles.tagChipActive : ''}`}
          onClick={() => {
            onSelectFilterMode('all');
            onSelectTag(selectedTag === tag ? '' : tag);
          }}
        >
          #{tag}
        </button>
      ))}
    </div>
  );
}

TagFilterBar.propTypes = {
  filterMode: PropTypes.string.isRequired,
  selectedTag: PropTypes.string.isRequired,
  allTags: PropTypes.arrayOf(PropTypes.string).isRequired,
  onSelectFilterMode: PropTypes.func.isRequired,
  onSelectTag: PropTypes.func.isRequired,
};
