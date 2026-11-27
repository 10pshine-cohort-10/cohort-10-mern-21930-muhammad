import { useState, type KeyboardEvent } from 'react';
import { motion } from 'framer-motion';
import { Plus, ArrowUpRight, Check } from 'lucide-react';
import styles from '../../pages/LandingPage.module.css';

export default function LandingInteractiveScratchpad({ compact = false }: { compact?: boolean }) {
  const [draftText, setDraftText] = useState('');
  const [savedDraft, setSavedDraft] = useState('Ship v1 roadmap');
  const [isAdded, setIsAdded] = useState(false);

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && draftText.trim()) {
      e.preventDefault();
      setSavedDraft(draftText.trim());
      setDraftText('');
      setIsAdded(false);
    }
  };

  return (
    <div className={`${styles.visualStage} ${compact ? styles.visualStageCompact : ''}`}>
      <div className={styles.miniInputRow}>
        <Plus size={16} />
        <input
          type="text"
          className={styles.miniInput}
          placeholder="Type a quick draft and press Enter…"
          value={draftText}
          onChange={(e) => setDraftText(e.target.value)}
          onKeyDown={handleKeyDown}
          aria-label="Interactive scratchpad preview"
        />
        <kbd className={styles.kbdBadge}>ENTER</kbd>
      </div>

      {isAdded ? (
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
          <span className={styles.draftTitleText}>{savedDraft}</span>
          <button type="button" className={styles.miniTackBtn} onClick={() => setIsAdded(false)}>
            <Check size={13} />
            <span>Added to notes</span>
          </button>
        </motion.div>
      ) : (
        <div className={styles.miniDraftRow}>
          <span>{savedDraft}</span>
          <button type="button" className={styles.miniTackBtn} onClick={() => setIsAdded(true)}>
            <ArrowUpRight size={13} />
            <span>Add to notes</span>
          </button>
        </div>
      )}
    </div>
  );
}
