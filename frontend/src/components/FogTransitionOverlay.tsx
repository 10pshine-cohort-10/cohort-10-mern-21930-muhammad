import { motion, useReducedMotion, useTransform } from 'framer-motion';
import { usePageTransition } from '../context/PageTransitionContext';
import styles from './FogTransitionOverlay.module.css';

export default function FogTransitionOverlay() {
  const transition = usePageTransition();
  const shouldReduceMotion = useReducedMotion();

  if (!transition) {
    return null;
  }

  const { fogProgress, phase } = transition;
  const veilOpacity = useTransform(fogProgress, [0, 0.42, 0.56, 1], [0, 0.96, 0.96, 0]);
  const blueX = useTransform(fogProgress, [0, 0.5, 1], ['-42%', '-8%', '42%']);
  const orangeX = useTransform(fogProgress, [0, 0.5, 1], ['42%', '8%', '-42%']);
  const blobOpacity = useTransform(fogProgress, [0, 0.35, 0.56, 1], [0, 1, 1, 0]);

  return (
    <div
      className={styles.overlay}
      style={{ pointerEvents: phase === 'idle' ? 'none' : 'auto' }}
      aria-hidden="true"
      data-testid="fog-transition-overlay"
      data-phase={phase}
    >
      <motion.div className={styles.veil} style={{ opacity: veilOpacity }} />

      {!shouldReduceMotion && (
        <>
          <motion.div
            className={`${styles.blob} ${styles.blueBlob}`}
            style={{ x: blueX, opacity: blobOpacity }}
          />
          <motion.div
            className={`${styles.blob} ${styles.orangeBlob}`}
            style={{ x: orangeX, opacity: blobOpacity }}
          />
        </>
      )}
    </div>
  );
}
