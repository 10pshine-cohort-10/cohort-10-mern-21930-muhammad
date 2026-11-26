import { forwardRef, useMemo } from 'react';
import { Search, X } from 'lucide-react';
import styles from './SearchBar.module.css';

export interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  onClear: () => void;
  onOpenCommandPalette?: () => void;
  placeholder?: string;
}

const SearchBar = forwardRef<HTMLInputElement, SearchBarProps>(function SearchBar(
  { value, onChange, onClear, onOpenCommandPalette, placeholder = 'Search notes...' },
  ref
) {
  const shortcutLabel = useMemo(() => {
    if (typeof navigator !== 'undefined' && /Mac|iPhone|iPad|iPod/i.test(navigator.platform || navigator.userAgent)) {
      return '⌘K';
    }
    return 'Ctrl K';
  }, []);

  const showShortcut = !value && Boolean(onOpenCommandPalette);

  return (
    <div className={styles.searchContainer}>
      <Search size={16} className={styles.searchIcon} />
      <input
        ref={ref}
        type="text"
        className={`${styles.searchInput} ${showShortcut ? styles.searchInputWithBadge : ''}`}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
      />
      {value ? (
        <button
          type="button"
          className={styles.clearButton}
          onClick={onClear}
          aria-label="Clear search"
        >
          <X size={14} />
        </button>
      ) : (
        onOpenCommandPalette && (
          <button
            type="button"
            className={styles.shortcutBadge}
            onClick={onOpenCommandPalette}
            aria-label="Open Command Palette"
            title="Open Command Palette"
          >
            <kbd>{shortcutLabel}</kbd>
          </button>
        )
      )}
    </div>
  );
});

export default SearchBar;
