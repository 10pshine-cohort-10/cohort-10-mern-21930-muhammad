import { useState, type KeyboardEvent } from 'react';
import PropTypes from 'prop-types';
import { X } from 'lucide-react';
import styles from './NoteEditor.module.css';

export interface NoteTagListProps {
  tags: string[];
  onAddTag: (tag: string) => void;
  onRemoveTag: (tag: string) => void;
}

export default function NoteTagList({ tags, onAddTag, onRemoveTag }: NoteTagListProps) {
  const [tagInput, setTagInput] = useState<string>('');
  const [tagError, setTagError] = useState<string>('');

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter' || event.key === ',') {
      event.preventDefault();
      const trimmed = tagInput.trim().toLowerCase().replace(/^#/, '');
      if (trimmed === 'archive') {
        setTagError('Use Move to Archive instead of the #archive tag.');
        return;
      }
      setTagError('');
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
        onChange={(e) => {
          setTagInput(e.target.value);
          if (tagError) setTagError('');
        }}
        onKeyDown={handleKeyDown}
        placeholder="Add tag and press Enter"
        aria-label="Add tag"
      />
      {tagError && (
        <span className={styles.tagErrorText} role="alert">
          {tagError}
        </span>
      )}
    </div>
  );
}

NoteTagList.propTypes = {
  tags: PropTypes.arrayOf(PropTypes.string).isRequired,
  onAddTag: PropTypes.func.isRequired,
  onRemoveTag: PropTypes.func.isRequired,
};
