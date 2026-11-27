import { Pin } from 'lucide-react';
import styles from '../../pages/AuthSplitLayout.module.css';

export interface AuthArtPanelProps {
  isSignup: boolean;
}

export default function AuthArtPanel({ isSignup }: AuthArtPanelProps) {
  return (
    <div className={styles.artPanel} aria-hidden="true">
      <div className={styles.pinnedCard}>
        <span className={styles.pinDot} />
        <div className={styles.cardHeader}>
          <span className={styles.cardTitle}>Ship v1 roadmap</span>
          <Pin size={14} />
        </div>
        <p className={styles.cardBody}>
          Keep rough thoughts in Scratchpad and move plans onto your board when ready.
        </p>
        <div className={styles.cardFooter}>
          <span className={styles.tagChip}>#work</span>
          <span>Pinned</span>
        </div>
      </div>

      <p className={styles.artCaption}>
        {isSignup ? 'Start small. Watch plans grow.' : 'Pick up where you left off.'}
      </p>
    </div>
  );
}
