import { Link } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import { ArrowRight, Plus, Pin } from 'lucide-react';
import styles from '../../pages/LandingPage.module.css';

export default function LandingHero() {
  const shouldReduceMotion = useReducedMotion();

  return (
    <section className={styles.heroTrack}>
      <div className={styles.heroSticky}>
        <div className={styles.heroInner}>
          <motion.div
            data-thread-anchor="hero-copy"
            initial={shouldReduceMotion ? false : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          >
            <h1 className={styles.heroTitle}>Quiet space for fast thoughts and calm plans.</h1>
            <p className={styles.heroSubtitle}>
              Jot in the Scratchpad, organize on your Board, and see how far you have come.
            </p>
            <div className={styles.ctaGroup}>
              <Link to="/signup" className={styles.primaryCta}>
                <span>Get started</span>
                <ArrowRight size={16} />
              </Link>
              <Link to="/scratchpad" className={styles.secondaryLink}>
                Try Scratchpad
              </Link>
            </div>
            <p className={styles.leadInLine}>
              Start with a rough thought, or move a plan across your board.
            </p>
          </motion.div>

          <motion.div
            className={styles.deskStage}
            data-thread-anchor="hero-stage"
            aria-hidden="true"
            initial={shouldReduceMotion ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.06, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className={styles.mintCard}>
              <span className={styles.pinDot} />
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2 className={styles.mintTitle}>Ship v1 roadmap</h2>
                <Pin size={14} />
              </div>
              <p className={styles.mintBody}>
                Draft ideas locally in Scratchpad, then tack finished notes straight to your board.
              </p>
              <div className={styles.tagRow}>
                <span className={styles.tagChip}>#work</span>
                <span>Pinned</span>
              </div>
            </div>

            <div className={styles.dockPreview}>
              <Plus size={16} />
              <span>Quick tack a note to #work... (press Enter)</span>
              <kbd className={styles.kbdBadge}>ENTER</kbd>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
