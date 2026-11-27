import { Link, useLocation } from 'react-router-dom';
import { Home, Edit3, Plus, Archive, BarChart3 } from 'lucide-react';
import styles from './MobileNavDock.module.css';

export interface MobileNavDockProps {
  onQuickAddClick?: () => void;
}

export default function MobileNavDock({ onQuickAddClick }: MobileNavDockProps) {
  const location = useLocation();

  return (
    <nav className={styles.dock} aria-label="Mobile Navigation">
      <Link
        to="/dashboard"
        className={`${styles.item} ${location.pathname === '/dashboard' ? styles.active : ''}`}
        title="Notes"
        aria-label="Notes"
      >
        <Home size={19} />
        <span className={styles.itemLabel}>Notes</span>
      </Link>

      <Link
        to="/scratchpad"
        className={`${styles.item} ${location.pathname === '/scratchpad' ? styles.active : ''}`}
        title="Scratchpad"
        aria-label="Scratchpad"
      >
        <Edit3 size={19} />
        <span className={styles.itemLabel}>Scratch</span>
      </Link>

      {onQuickAddClick && (
        <button
          type="button"
          className={styles.centerAddBtn}
          onClick={onQuickAddClick}
          aria-label="Create new note"
        >
          <Plus size={22} />
        </button>
      )}

      <Link
        to="/insights"
        className={`${styles.item} ${location.pathname === '/insights' ? styles.active : ''}`}
        title="Progress"
        aria-label="Progress"
      >
        <BarChart3 size={19} />
        <span className={styles.itemLabel}>Progress</span>
      </Link>

      <Link
        to="/archive"
        className={`${styles.item} ${location.pathname === '/archive' ? styles.active : ''}`}
        title="Archive"
        aria-label="Archive"
      >
        <Archive size={19} />
        <span className={styles.itemLabel}>Archive</span>
      </Link>
    </nav>
  );
}
