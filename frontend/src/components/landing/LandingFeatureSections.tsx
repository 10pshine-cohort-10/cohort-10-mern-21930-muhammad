import { motion, useReducedMotion } from 'framer-motion';
import { Pin, Folder, Command } from 'lucide-react';
import LandingInteractiveScratchpad from './LandingInteractiveScratchpad';
import styles from '../../pages/LandingPage.module.css';

export const LANDING_SECTIONS = [
  { id: 'board', label: 'Kanban Board' },
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
          transition: { duration: 0.45, delay, ease: [0.16, 1, 0.3, 1] as const },
        };

  return (
    <>
      <section id="board" className={styles.centeredSection}>
        <motion.div className={styles.centeredInner} {...reveal()}>
          <h2 className={styles.sectionHeading}>Move plans forward at your own pace.</h2>
          <p className={styles.sectionLead}>
            Three clear columns—To Do, In Progress, Done—with color-matched cards that settle softly when moved.
          </p>

          <div className={styles.boardPreviewGrid} aria-hidden="true">
            <div className={styles.boardPreviewCol}>
              <div className={styles.boardPreviewHeader}>
                <span className={styles.boardDotTodo} />
                <span>To Do</span>
              </div>
              <div className={`${styles.boardPreviewCard} ${styles.boardCardSand}`}>
                <span className={styles.miniPushpin} />
                <span>Outline release checklist</span>
              </div>
            </div>

            <div className={styles.boardPreviewCol}>
              <div className={styles.boardPreviewHeader}>
                <span className={styles.boardDotProgress} />
                <span>In Progress</span>
              </div>
              <div className={`${styles.boardPreviewCard} ${styles.boardCardSage}`}>
                <span className={styles.miniPushpin} />
                <span>Ship v1 roadmap</span>
              </div>
            </div>

            <div className={styles.boardPreviewCol}>
              <div className={styles.boardPreviewHeader}>
                <span className={styles.boardDotDone} />
                <span>Done</span>
              </div>
              <div className={`${styles.boardPreviewCard} ${styles.boardCardTeal}`}>
                <span className={styles.miniPushpin} />
                <span>Draft onboarding notes</span>
              </div>
            </div>
          </div>

          <p className={styles.leadInLine}>
            Every card you move leaves a quiet trace of progress.
          </p>
        </motion.div>
      </section>

      <section id="progress" className={styles.centeredSection}>
        <motion.div className={styles.centeredInner} {...reveal()}>
          <h2 className={styles.sectionHeading}>See how far you have come—never a streak to break.</h2>
          <p className={styles.sectionLead}>
            Factual 7-day and 30-day activity bars, a plan completion ring, and recent updates—built without red arrows or missed-day guilt.
          </p>

          <div className={styles.progressPreviewGrid} aria-hidden="true">
            <div className={styles.progressPreviewCard}>
              <div className={styles.boardPreviewHeader}>
                <span>Consistency</span>
                <span style={{ marginLeft: 'auto', color: 'var(--accent-blue-text)', fontSize: '12px' }}>7d</span>
              </div>
              <div className={styles.miniBarsRow}>
                <div className={styles.miniBar} style={{ height: '42%' }} />
                <div className={`${styles.miniBar} ${styles.miniBarMuted}`} style={{ height: '14%' }} />
                <div className={styles.miniBar} style={{ height: '68%' }} />
                <div className={styles.miniBar} style={{ height: '54%' }} />
                <div className={styles.miniBar} style={{ height: '85%' }} />
                <div className={`${styles.miniBar} ${styles.miniBarMuted}`} style={{ height: '14%' }} />
                <div className={styles.miniBar} style={{ height: '72%' }} />
              </div>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Active 5 of the last 7 days</span>
            </div>

            <div className={styles.progressPreviewCard}>
              <div className={styles.boardPreviewHeader}>
                <span>Plan Growth</span>
                <span style={{ marginLeft: 'auto', color: 'var(--accent-orange-text)', fontSize: '12px' }}>1 Done · 2 Active</span>
              </div>
              <div className={styles.miniRingRow}>
                <svg width="68" height="68" viewBox="0 0 68 68">
                  <circle cx="34" cy="34" r="26" fill="none" stroke="var(--bg-muted)" strokeWidth="7" />
                  <circle
                    cx="34" cy="34" r="26" fill="none" stroke="var(--accent-blue)" strokeWidth="7"
                    strokeDasharray="108 164" strokeLinecap="round" transform="rotate(-90 34 34)"
                  />
                  <circle
                    cx="34" cy="34" r="26" fill="none" stroke="var(--accent-orange)" strokeWidth="7"
                    strokeDasharray="54 164" strokeLinecap="round" transform="rotate(-90 34 34)"
                  />
                </svg>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '12px', color: 'var(--text-muted)' }}>
                  <span>To Do: 1</span>
                  <span>In Progress: 1</span>
                  <span style={{ color: 'var(--accent-orange-text)', fontWeight: 700 }}>Done: 1</span>
                </div>
              </div>
            </div>
          </div>

          <p className={styles.leadInLine}>
            Everything starts in one place before it reaches your board.
          </p>
        </motion.div>
      </section>

      <section id="essentials" className={styles.centeredSection}>
        <motion.div className={styles.centeredInner} {...reveal()}>
          <h2 className={styles.sectionHeading}>Scratchpad, pins & #folders, and ⌘K—always within reach.</h2>
          <p className={styles.sectionLead}>
            Local-first Scratchpad drafts stay on your device until you click Tack to notes, paired with #folders and the Command Palette.
          </p>

          <LandingInteractiveScratchpad />

          <div className={styles.essentialsRow} aria-hidden="true">
            <span className={styles.essentialsPill}>
              <Pin size={13} />
              <span>Pinned priorities</span>
            </span>
            <span className={styles.essentialsPill}>
              <Folder size={13} />
              <span>#work · #ideas</span>
            </span>
            <span className={styles.essentialsPill}>
              <Command size={13} />
              <span>⌘K Command Palette</span>
            </span>
          </div>

          <p className={styles.leadInLine}>
            Ready when you want a calmer place to think.
          </p>
        </motion.div>
      </section>
    </>
  );
}
