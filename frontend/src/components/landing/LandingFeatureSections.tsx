import { useRef, type ReactNode } from 'react';
import { motion, useScroll, useTransform, useReducedMotion } from 'framer-motion';
import { Pin, Folder, Terminal, Search, Download } from 'lucide-react';
import LandingInteractiveScratchpad from './LandingInteractiveScratchpad';
import styles from '../../pages/LandingPage.module.css';

export const LANDING_SECTIONS = [
  { id: 'capture-desk', label: 'Capture & Draft' },
  { id: 'organize-desk', label: 'Pinning & Folders' },
  { id: 'command-own', label: 'Command & Export' },
];

const SLIDE_EASE = [0.22, 1, 0.36, 1] as const;

function FocusAct({ id, alt = false, children }: { id: string; alt?: boolean; children: ReactNode }) {
  const ref = useRef<HTMLElement>(null);
  const shouldReduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
  const scale = useTransform(scrollYProgress, [0, 0.3, 0.7, 1], [0.96, 1, 1, 0.97]);
  const opacity = useTransform(scrollYProgress, [0, 0.25, 0.75, 1], [0.55, 1, 1, 0.6]);

  return (
    <section id={id} ref={ref} className={`${styles.featureSection} ${alt ? styles.featureAlt : ''}`}>
      <motion.div
        style={shouldReduceMotion ? undefined : { scale, opacity, width: '100%' }}
      >
        {children}
      </motion.div>
    </section>
  );
}

export default function LandingFeatureSections() {
  return (
    <>
      <FocusAct id="capture-desk" alt>
        <div className={styles.actGrid}>
          <motion.div
            className={styles.actCopy}
            initial={{ opacity: 0, x: -36 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.25 }}
            transition={{ duration: 0.45, ease: SLIDE_EASE }}
          >
            <span className={styles.keycap}>ENTER · LOCAL → CLOUD</span>
            <h2 className={styles.sectionHeading}>Capture messy drafts. Tack finished notes.</h2>
            <p className={styles.sectionLead}>
              Press Enter to save locally in your Scratchpad with zero signup, then snap drafts onto your synced Cloud Desk whenever you are ready.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 36 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.25 }}
            transition={{ duration: 0.45, ease: SLIDE_EASE }}
          >
            <LandingInteractiveScratchpad />
          </motion.div>
        </div>
      </FocusAct>

      <FocusAct id="organize-desk">
        <div className={`${styles.actGrid} ${styles.actGridFlipped}`}>
          <motion.div
            className={styles.organizeComposite}
            initial={{ opacity: 0, x: -36 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.25 }}
            transition={{ duration: 0.45, ease: SLIDE_EASE }}
          >
            <div className={`${styles.visualStage} ${styles.visualStageMint}`} style={{ minHeight: 'auto' }}>
              <span className={styles.pinDot} />
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <strong style={{ fontSize: 16 }}>Release checklist</strong>
                <Pin size={15} />
              </div>
              <p className={styles.mintBody}>Pinned above Recent notes · Grid | Stream toggle</p>
            </div>

            <div className={styles.recessedStage}>
              <div className={styles.miniDraftRow}><Folder size={14} /><span>#work</span><span className={styles.kbdBadge}>Active</span></div>
              <div className={styles.miniDraftRow}><Folder size={14} /><span>#ideas</span><span className={styles.kbdBadge}>4</span></div>
            </div>
          </motion.div>

          <motion.div
            className={styles.actCopy}
            initial={{ opacity: 0, x: 36 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.25 }}
            transition={{ duration: 0.45, ease: SLIDE_EASE }}
          >
            <span className={styles.keycap}>PIN · #FOLDERS · GRID | STREAM</span>
            <h2 className={styles.sectionHeading}>Pin priorities. Keep #folders one click away.</h2>
            <p className={styles.sectionLead}>
              Pushpin cards stay anchored at the top while your collapsible folder tree and Grid/Stream switch keep the rest of your board tidy.
            </p>
          </motion.div>
        </div>
      </FocusAct>

      <FocusAct id="command-own" alt>
        <div className={styles.actGrid}>
          <motion.div
            className={styles.actCopy}
            initial={{ opacity: 0, x: -36 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.25 }}
            transition={{ duration: 0.45, ease: SLIDE_EASE }}
          >
            <span className={styles.keycap}>CTRL + K · SEARCH · EXPORT</span>
            <h2 className={styles.sectionHeading}>Stay on the keyboard. Own every byte.</h2>
            <p className={styles.sectionLead}>
              Open the Command Palette with Ctrl+K, search titles and tags, archive completed work, or export JSON and Markdown backups anytime.
            </p>
          </motion.div>

          <motion.div
            className={styles.visualStage}
            initial={{ opacity: 0, x: 36 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.25 }}
            transition={{ duration: 0.45, ease: SLIDE_EASE }}
          >
            <div className={styles.miniInputRow}>
              <Terminal size={16} />
              <span style={{ color: 'var(--text-subtle)', fontSize: 14 }}>Type a command or search notes...</span>
              <motion.kbd
                className={styles.kbdBadge}
                whileInView={{ scale: [1, 0.9, 1] }}
                viewport={{ once: true }}
                transition={{ duration: 0.35, delay: 0.2 }}
              >
                CTRL K
              </motion.kbd>
            </div>
            <div className={styles.miniDraftRow}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}><Search size={14} /> Full-text search & #archive</span>
              <kbd className={styles.kbdBadge}>/</kbd>
            </div>
            <div className={styles.miniDraftRow}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}><Download size={14} /> Export JSON · Export MD · Import</span>
              <kbd className={styles.kbdBadge}>Backup</kbd>
            </div>
          </motion.div>
        </div>
      </FocusAct>
    </>
  );
}
