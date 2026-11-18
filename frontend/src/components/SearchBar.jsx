import { Search, X } from 'lucide-react';
import styles from './SearchBar.module.css';

export default function SearchBar({ value, onChange, onClear, placeholder = 'Search notes...' }) {
  return (
    <div className={styles.searchContainer}>
      <Search size={16} className={styles.searchIcon} />
      <input
        type="text"
        className={styles.searchInput}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
      />
      {value && (
        <button
          type="button"
          className={styles.clearButton}
          onClick={onClear}
          aria-label="Clear search"
        >
          <X size={14} />
        </button>
      )}
    </div>
  );
}
