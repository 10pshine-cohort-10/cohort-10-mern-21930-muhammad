import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform, useReducedMotion } from 'framer-motion';
import { ArrowRight, Plus, Pin } from 'lucide-react';
import styles from '../../pages/LandingPage.module.css';

export default function LandingHero() {
  const trackRef = useRef<HTMLDivElement>(null);
  const shouldReduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: trackRef,
    offset: ['start start', 'end end'],
  });

  const stickyScale = useTransform(scrollYProgress, [0.72, 1], [1, 0.98]);
  const copyY = useTransform(scrollYProgress, [0, 1], [0, -24]);
  const copyOpacity = useTransform(scrollYProgress, [0.72, 1], [1, 0.86]);
  const stageY = useTransform(scrollYProgress, [0, 1], [18, -14]);
  const cardRotate = useTransform(scrollYProgress, [0, 1], [-4, 0]);
  const cardY = useTransform(scrollYProgress, [0, 1], [14, -10]);
  const cardScale = useTransform(scrollYProgress, [0, 1], [0.97, 1.02]);
  const dockY = useTransform(scrollYProgress, [0, 1], [34, 0]);
  const dockOpacity = useTransform(scrollYProgress, [0, 0.65], [0.45, 1]);

  return (
    <section ref={trackRef} className={styles.heroTrack}>
      <motion.div
        className={styles.heroSticky}
        style={shouldReduceMotion ? undefined : { scale: stickyScale }}
      >
        <div className={styles.heroInner}>
          <motion.div style={shouldReduceMotion ? undefined : { y: copyY, opacity: copyOpacity }}>
            <h1 className={styles.heroTitle}>Your desk for fast thoughts and calm focus.</h1>
            <p className={styles.heroSubtitle}>
              Jot raw drafts in your local Scratchpad, pin priorities to your Cloud Desk,
              and organize work with folders, rich text, and real-time sync.
            </p>
            <div className={styles.ctaGroup}>
              <Link to="/register" className={styles.primaryCta}>
                <span>Get started</span>
                <ArrowRight size={16} />
              </Link>
              <Link to="/scratchpad" className={styles.secondaryLink}>
                Try Scratchpad
              </Link>
              <Link to="/login" className={styles.secondaryLink}>
                Log in
              </Link>
            </div>
          </motion.div>

          <motion.div
            className={styles.deskStage}
            aria-hidden="true"
            style={shouldReduceMotion ? undefined : { y: stageY }}
          >
            <motion.div
              className={styles.mintCard}
              style={
                shouldReduceMotion
                  ? undefined
                  : { rotate: cardRotate, y: cardY, scale: cardScale }
              }
            >
              <span className={styles.pinDot} />
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2 className={styles.mintTitle}>Sprint priorities</h2>
                <Pin size={14} />
              </div>
              <p className={styles.mintBody}>
                Draft ideas locally first, then tack finished notes straight to your synced board.
              </p>
              <div className={styles.tagRow}>
                <span className={styles.tagChip}>#work</span>
                <span>Pinned</span>
              </div>
            </motion.div>

            <motion.div
              className={styles.dockPreview}
              style={shouldReduceMotion ? undefined : { y: dockY, opacity: dockOpacity }}
            >
              <Plus size={16} />
              <span>Quick tack a note to #work... (press Enter)</span>
              <kbd className={styles.kbdBadge}>ENTER</kbd>
            </motion.div>
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
}
