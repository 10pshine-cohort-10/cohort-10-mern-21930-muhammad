import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';
import { ArrowRight, Plus, Pin } from 'lucide-react';
import styles from '../../pages/LandingPage.module.css';

export default function LandingHero() {
  const trackRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: trackRef,
    offset: ['start start', 'end end'],
  });

  const cardRotate = useTransform(scrollYProgress, [0, 1], [-3, 0]);
  const cardY = useTransform(scrollYProgress, [0, 1], [14, -8]);
  const dockY = useTransform(scrollYProgress, [0, 1], [28, 0]);
  const dockOpacity = useTransform(scrollYProgress, [0, 0.7], [0.5, 1]);

  return (
    <section ref={trackRef} className={styles.heroTrack}>
      <div className={styles.heroSticky}>
        <div className={styles.heroInner}>
          <div>
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
              <Link to="/login" className={styles.secondaryLink}>
                Log in
              </Link>
              <Link to="/scratchpad" className={styles.ghostLink}>
                Try Scratchpad
              </Link>
            </div>
          </div>

          <div className={styles.deskStage} aria-hidden="true">
            <motion.div className={styles.mintCard} style={{ rotate: cardRotate, y: cardY }}>
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

            <motion.div className={styles.dockPreview} style={{ y: dockY, opacity: dockOpacity }}>
              <Plus size={16} />
              <span>Quick tack a note to #work... (press Enter)</span>
              <kbd className={styles.kbdBadge}>ENTER</kbd>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
