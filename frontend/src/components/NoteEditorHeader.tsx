import PropTypes from 'prop-types';
import { X, Maximize2, Minimize2 } from 'lucide-react';
import styles from './NoteEditor.module.css';

export interface NoteEditorHeaderProps {
  isEditing: boolean;
  isFocusMode: boolean;
  onToggleFocusMode: () => void;
  onClose: () => void;
}

export default function NoteEditorHeader({
  isEditing,
  isFocusMode,
  onToggleFocusMode,
  onClose,
}: NoteEditorHeaderProps) {
  return (
    <div className={styles.drawerHeader}>
      <span className={styles.headerTitle}>{isEditing ? 'Edit Note' : 'Create Note'}</span>
      <div className={styles.headerActions}>
        <button
          type="button"
          className={styles.iconButton}
          onClick={onToggleFocusMode}
          title={isFocusMode ? 'Exit focus mode' : 'Enter focus mode'}
          aria-label={isFocusMode ? 'Exit focus mode' : 'Enter focus mode'}
        >
          {isFocusMode ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
        </button>
        <button
          type="button"
          className={styles.closeButton}
          onClick={onClose}
          aria-label="Close editor"
        >
          <X size={18} />
        </button>
      </div>
    </div>
  );
}

NoteEditorHeader.propTypes = {
  isEditing: PropTypes.bool.isRequired,
  isFocusMode: PropTypes.bool.isRequired,
  onToggleFocusMode: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
};
