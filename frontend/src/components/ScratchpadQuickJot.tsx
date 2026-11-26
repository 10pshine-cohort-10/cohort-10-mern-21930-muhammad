import { useState, type KeyboardEvent } from 'react';
import { Plus } from 'lucide-react';
import styles from '../pages/ScratchpadPage.module.css';

export interface ScratchpadQuickJotProps {
  onQuickSave: (title: string) => Promise<void>;
}

export default function ScratchpadQuickJot({ onQuickSave }: ScratchpadQuickJotProps) {
  const [text, setText] = useState('');

  const handleKeyDown = async (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter' && text.trim()) {
      event.preventDefault();
      const value = text.trim();
      setText('');
      await onQuickSave(value);
    }
  };

  return (
    <div className={styles.quickJotBar}>
      <Plus size={16} />
      <input
        type="text"
        className={styles.quickJotInput}
        placeholder="Jot a fast, unfiled thought... (press Enter to save locally)"
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={handleKeyDown}
        aria-label="Quick jot input"
      />
      <kbd className={styles.quickJotHint}>ENTER</kbd>
    </div>
  );
}
