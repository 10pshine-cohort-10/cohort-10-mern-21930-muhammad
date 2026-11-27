import { motion, useReducedMotion } from 'framer-motion';
import { Pin, Folder, Command } from 'lucide-react';
import { EASE_TACTILE } from '../../brand/motion';
import { BoardVisual, ProgressVisual } from './LandingVisuals';
import LandingInteractiveScratchpad from './LandingInteractiveScratchpad';
import styles from '../../pages/LandingPage.module.css';

export const LANDING_SECTIONS = [
  { id: 'board', label: 'Board' },
  { id: 'progress', label: 'Progress' },
  { id: 'essentials', label: 'Essentials' },
] as const;

export default function LandingFeatureSections() {
  const shouldReduceMotion = useReducedMotion();

  const reveal = (delay = 0) =>
    shouldReduceMotion
      ? {}
      : {
          initial: { opacity: 0, y: 20 },
          whileInView: { opacity: 1, y: 0 },
          viewport: { once: true, amount: 0.25 },
          transition: { duration: 0.45, delay, ease: EASE_TACTILE },
        };

  return (
    <>
      <section id="board" className={styles.centeredSection}>
        <motion.div className={styles.centeredInner} {...reveal()}>
          <h2 className={styles.sectionHeading}>Move plans forward at your own pace</h2>
          <p className={styles.sectionLead}>
            Three clear stages—To Do, In Progress, Done—with color-matched cards that settle softly when moved.
          </p>
          <BoardVisual compact />
          <p className={styles.leadInLine}>Every card you move leaves a quiet trace of progress.</p>
        </motion.div>
      </section>

      <section id="progress" className={styles.centeredSection}>
        <motion.div className={styles.centeredInner} {...reveal()}>
          <h2 className={styles.sectionHeading}>See how far you have come—never a streak to break</h2>
          <p className={styles.sectionLead}>
            Factual 7-day and 30-day activity bars, a plan completion ring, and recent updates without missed-day guilt.
          </p>
          <ProgressVisual />
          <p className={styles.leadInLine}>Everything starts in one calm place before it reaches your Board.</p>
        </motion.div>
      </section>

      <section id="essentials" className={styles.centeredSection}>
        <motion.div className={styles.centeredInner} {...reveal()}>
          <h2 className={styles.sectionHeading}>Scratchpad, pins &amp; #folders, and ⌘K—within reach</h2>
          <p className={styles.sectionLead}>
            Local-first Scratchpad drafts stay on your device until you click Add to notes, paired with #folders and ⌘K.
          </p>
          <LandingInteractiveScratchpad />
          <div className={styles.essentialsRow} aria-hidden="true">
            <span className={styles.essentialsPill}>
              <Pin size={13} />
              <span>Pinned notes</span>
            </span>
            <span className={styles.essentialsPill}>
              <Folder size={13} />
              <span>#work · #ideas</span>
            </span>
            <span className={styles.essentialsPill}>
              <Command size={13} />
              <span>⌘K Commands</span>
            </span>
          </div>
          <p className={styles.leadInLine}>Ready when you want a calmer place to think.</p>
        </motion.div>
      </section>
    </>
  );
}
