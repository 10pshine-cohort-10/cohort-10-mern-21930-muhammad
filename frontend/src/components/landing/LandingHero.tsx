import { Link } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import { ArrowRight, Plus, Pin } from 'lucide-react';
import { EASE_TACTILE } from '../../brand/motion';
import { TransitionLink } from '../../context/PageTransitionContext';
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
            transition={{ duration: 0.4, ease: EASE_TACTILE }}
          >
            <h1 className={styles.heroTitle}>Pin a plan. Move it forward. Watch it get done.</h1>
            <p className={styles.heroSubtitle}>
              Jot rough thoughts in the Scratchpad, move plans across To Do, In Progress, and Done,
              and see how much you have finished.
            </p>
            <div className={styles.ctaGroup}>
              <TransitionLink to="/signup" className={styles.primaryCta}>
                <span>Get started</span>
                <ArrowRight size={16} />
              </TransitionLink>
              <Link to="/scratchpad" className={styles.secondaryLink}>
                Try Scratchpad
              </Link>
            </div>
            <p className={styles.leadInLine}>
              Pinnate <span className={styles.pronounceInline}>(PIN-ayt)</span> — calm notes that move forward.
            </p>
          </motion.div>

          <motion.div
            className={styles.deskStage}
            data-thread-anchor="hero-stage"
            aria-hidden="true"
            initial={shouldReduceMotion ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.06, ease: EASE_TACTILE }}
          >
            <div className={styles.mintCard}>
              <span className={styles.pinDot} />
              <div className={styles.mintHeaderRow}>
                <h2 className={styles.mintTitle}>Ship v1 roadmap</h2>
                <Pin size={14} />
              </div>
              <p className={styles.mintBody}>
                Draft thoughts in Scratchpad, then add finished plans straight onto your Board.
              </p>
              <div className={styles.tagRow}>
                <span className={styles.tagChip}>#work</span>
                <span>In Progress</span>
              </div>
            </div>

            <div className={styles.dockPreview}>
              <Plus size={16} />
              <span>Quick add a note to #work… (press Enter)</span>
              <kbd className={styles.kbdBadge}>ENTER</kbd>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
