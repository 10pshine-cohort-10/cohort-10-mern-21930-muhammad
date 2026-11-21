import { useState } from 'react';
import PropTypes from 'prop-types';
import { X } from 'lucide-react';
import styles from './NoteEditor.module.css';

/**
 * Tag input and pills list for note editor.
 * @param {{
 *   tags: string[],
 *   onAddTag: (tag: string) => void,
 *   onRemoveTag: (tag: string) => void
 * }} props
 */
export default function NoteTagList({ tags, onAddTag, onRemoveTag }) {
  const [tagInput, setTagInput] = useState('');

  const handleKeyDown = (event) => {
    if (event.key === 'Enter' || event.key === ',') {
      event.preventDefault();
      const trimmed = tagInput.trim().replace(/^#/, '');
      if (trimmed && !tags.includes(trimmed)) {
        onAddTag(trimmed);
      }
      setTagInput('');
    }
  };

  return (
    <div className={styles.tagsContainer}>
      <div className={styles.tagsList}>
        {tags.map((tag) => (
          <span key={tag} className={styles.tagItem}>
            #{tag}
            <button
              type="button"
              className={styles.removeTagBtn}
              onClick={() => onRemoveTag(tag)}
              aria-label={`Remove tag ${tag}`}
            >
              <X size={12} />
            </button>
          </span>
        ))}
      </div>
      <input
        type="text"
        className={styles.tagInput}
        value={tagInput}
        onChange={(e) => setTagInput(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Add tag and press Enter"
      />
    </div>
  );
}

NoteTagList.propTypes = {
  tags: PropTypes.arrayOf(PropTypes.string).isRequired,
  onAddTag: PropTypes.func.isRequired,
  onRemoveTag: PropTypes.func.isRequired,
};
