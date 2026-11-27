import PinnateMark from './PinnateMark';
import styles from './PinnateMark.module.css';

export interface PinnateBrandProps {
  markSize?: number;
  showPronunciation?: boolean;
  tone?: 'color' | 'mono';
}

export default function PinnateBrand({
  markSize = 32,
  showPronunciation = false,
  tone = 'color',
}: PinnateBrandProps) {
  return (
    <span className={styles.brandWrap}>
      <PinnateMark size={markSize} tone={tone} decorative />
      <span className={styles.wordmarkGroup}>
        <span className={styles.wordmark}>Pinnate</span>
        {showPronunciation && (
          <span className={styles.pronunciation} aria-label="pronounced PIN-ayt">
            PIN-ayt
          </span>
        )}
      </span>
    </span>
  );
}
