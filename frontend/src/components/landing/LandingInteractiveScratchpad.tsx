import { useState, type KeyboardEvent } from 'react';
import { motion } from 'framer-motion';
import { Plus, Pin, Check } from 'lucide-react';
import styles from '../../pages/LandingPage.module.css';

export default function LandingInteractiveScratchpad() {
  const [draftText, setDraftText] = useState('');
  const [savedDraft, setSavedDraft] = useState('Ship v1 roadmap');
  const [isTacked, setIsTacked] = useState(false);

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && draftText.trim()) {
      e.preventDefault();
      setSavedDraft(draftText.trim());
      setDraftText('');
      setIsTacked(false);
    }
  };

  return (
    <div className={styles.visualStage}>
      <div className={styles.miniInputRow}>
        <Plus size={16} />
        <input
          type="text"
          className={styles.miniInput}
          placeholder="Type a quick draft and press Enter..."
          value={draftText}
          onChange={(e) => setDraftText(e.target.value)}
          onKeyDown={handleKeyDown}
          aria-label="Interactive scratchpad preview"
        />
        <kbd className={styles.kbdBadge}>ENTER</kbd>
      </div>

      {isTacked ? (
        <motion.div
          className={styles.pinnedSnapCard}
          initial={{ scale: 0.96, rotate: 0 }}
          animate={{ scale: 1, rotate: -1.2 }}
          transition={{ type: 'spring', stiffness: 420, damping: 22 }}
        >
          <motion.span
            className={styles.pinDot}
            initial={{ y: -14, scale: 1.3 }}
            animate={{ y: 0, scale: 1 }}
            transition={{ type: 'spring', stiffness: 460, damping: 20 }}
          />
          <span style={{ fontWeight: 600 }}>{savedDraft}</span>
          <button type="button" className={styles.miniTackBtn} onClick={() => setIsTacked(false)}>
            <Check size={13} />
            <span>Tacked to notes</span>
          </button>
        </motion.div>
      ) : (
        <div className={styles.miniDraftRow}>
          <span>{savedDraft}</span>
          <button type="button" className={styles.miniTackBtn} onClick={() => setIsTacked(true)}>
            <Pin size={13} />
            <span>Tack to notes</span>
          </button>
        </div>
      )}
    </div>
  );
}
