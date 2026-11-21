import PropTypes from 'prop-types';
import { Search, X } from 'lucide-react';
import styles from './SearchBar.module.css';

/**
 * Controlled search input component with debounce-friendly clear button.
 * @param {{
 *   value: string,
 *   onChange: (value: string) => void,
 *   onClear: () => void,
 *   placeholder?: string
 * }} props
 */
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

SearchBar.propTypes = {
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  onClear: PropTypes.func.isRequired,
  placeholder: PropTypes.string,
};
