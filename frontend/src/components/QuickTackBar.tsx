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

  const handleKeyDown = async (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter' && content.trim()) {
      event.preventDefault();
      const textToSave = content.trim();
      setContent('');
      await onQuickCreate(textToSave, activeTag);
    }
  };

  const placeholderText = activeTag
    ? `Quick tack a note to #${activeTag}... (press Enter)`
    : 'Quick tack a note to board... (press Enter)';

  return (
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
        onChange={(event) => setContent(event.target.value)}
        onKeyDown={handleKeyDown}
        aria-label="Quick note input"
      />
      <kbd className={styles.hintKey}>ENTER</kbd>
    </div>
  );
}
