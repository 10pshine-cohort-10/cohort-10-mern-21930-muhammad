import type { MouseEvent } from 'react';
import PropTypes from 'prop-types';
import styles from './NoteCard.module.css';

export interface NoteCardDeleteConfirmProps {
  onConfirm: (event: MouseEvent) => void;
  onCancel: (event: MouseEvent) => void;
}

export default function NoteCardDeleteConfirm({
  onConfirm,
  onCancel,
}: NoteCardDeleteConfirmProps) {
  return (
    <div className={styles.deleteConfirm} onClick={(e) => e.stopPropagation()}>
      <p className={styles.confirmMessage}>Delete this note?</p>
      <div className={styles.confirmActions}>
        <button type="button" className={styles.confirmButton} onClick={onConfirm}>
          Delete
        </button>
        <button type="button" className={styles.cancelButton} onClick={onCancel}>
          Cancel
        </button>
      </div>
    </div>
  );
}

NoteCardDeleteConfirm.propTypes = {
  onConfirm: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
};
