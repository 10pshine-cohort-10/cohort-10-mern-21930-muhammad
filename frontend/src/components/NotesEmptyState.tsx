import PropTypes from 'prop-types';
import { FileText } from 'lucide-react';
import styles from '../pages/DashboardPage.module.css';

export interface NotesEmptyStateProps {
  searchQuery: string;
  onCreateNote: () => void;
}

export default function NotesEmptyState({ searchQuery, onCreateNote }: NotesEmptyStateProps) {
  return (
    <div className={styles.emptyState}>
      <FileText size={40} color="var(--text-subtle)" />
      <h4 className={styles.emptyTitle}>
        {searchQuery ? 'No notes matched your search' : 'No notes yet'}
      </h4>
      <p className={styles.emptySubtitle}>
        {searchQuery
          ? 'Try searching with different keywords or clear the filter.'
          : 'Capture your thoughts, ideas, and tasks with rich text formatting.'}
      </p>
      {!searchQuery && (
        <button
          type="button"
          className={styles.createFirstBtn}
          onClick={onCreateNote}
        >
          Create First Note
        </button>
      )}
    </div>
  );
}

NotesEmptyState.propTypes = {
  searchQuery: PropTypes.string.isRequired,
  onCreateNote: PropTypes.func.isRequired,
};
