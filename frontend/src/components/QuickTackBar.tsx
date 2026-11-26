import { useState, type KeyboardEvent, type RefObject } from 'react';
import { Plus } from 'lucide-react';
import styles from './QuickTackBar.module.css';

export interface QuickTackBarProps {
  activeTag: string;
  onQuickCreate: (title: string, tag: string) => Promise<void>;
  inputRef?: RefObject<HTMLInputElement | null>;
}

export default function QuickTackBar({ activeTag, onQuickCreate, inputRef }: QuickTackBarProps) {
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorText, setErrorText] = useState('');

  const handleKeyDown = async (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter' && content.trim() && !isSubmitting) {
      event.preventDefault();
      const textToSave = content.trim();
      setIsSubmitting(true);
      setErrorText('');
      try {
        await onQuickCreate(textToSave, activeTag);
        setContent('');
      } catch (err) {
        console.error('Quick tack failed:', err);
        setErrorText('Failed to save note. Try again.');
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const placeholderText = activeTag
    ? `Quick tack a note to #${activeTag}... (press Enter)`
    : 'Quick tack a note to board... (press Enter)';

  return (
    <div className={styles.wrapper}>
      {errorText && (
        <div className={styles.errorBanner} role="alert">
          {errorText}
        </div>
      )}
      <div className={styles.container}>
        <span className={styles.pinIcon} aria-hidden="true">
          <Plus size={18} />
        </span>
        <input
          ref={inputRef}
          type="text"
          className={styles.input}
          placeholder={placeholderText}
          value={content}
          disabled={isSubmitting}
          onChange={(event) => {
            setContent(event.target.value);
            if (errorText) setErrorText('');
          }}
          onKeyDown={handleKeyDown}
          aria-label="Quick note input"
        />
        <kbd className={styles.hintKey}>{isSubmitting ? 'SAVING' : 'ENTER'}</kbd>
      </div>
    </div>
  );
}
