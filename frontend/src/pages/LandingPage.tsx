import { useRef } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { MotionConfig, motion, useReducedMotion } from 'framer-motion';
import { BookOpen, ArrowRight, Pin } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import LandingHero from '../components/landing/LandingHero';
import LandingFeatureTabs from '../components/landing/LandingFeatureTabs';
import LandingScrollThread from '../components/landing/LandingScrollThread';
import styles from './LandingPage.module.css';

function PinnedNoteCta() {
  const shouldReduceMotion = useReducedMotion();
  return (
    <section className={styles.pinnedCtaSection} aria-label="Get started">
      <motion.div
        className={styles.pinnedCtaCard}
        data-thread-anchor="cta-card"
        initial={shouldReduceMotion ? false : { opacity: 0, y: 18, rotate: -1.5 }}
        whileInView={{ opacity: 1, y: 0, rotate: -1.5 }}
        viewport={{ once: true, amount: 0.35 }}
        transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
      >
        <span className={styles.pinnedCtaPin} data-thread-anchor="cta-pin" aria-hidden="true" />
        <div className={styles.pinnedCtaTape} aria-hidden="true" />
        <h2 className={styles.pinnedCtaHeading}>
          Start writing in a workspace that stays out of your way.
        </h2>
        <p className={styles.pinnedCtaBody}>
          Create an account to sync across devices, or open the Scratchpad right now.
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
        <div className={styles.pinnedCtaMeta}>
          <Pin size={12} />
          <span>Pinned</span>
        </div>
      </motion.div>
    </section>
  );
}

export default function LandingPage() {
  const { isAuthenticated, isLoading } = useAuth();
  const mainRef = useRef<HTMLElement>(null);

  if (!isLoading && isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <MotionConfig reducedMotion="user">
      <div className={styles.page}>
        <header className={styles.topNav}>
          <div className={styles.topNavInner}>
            <Link to="/" className={styles.brand}>
              <span className={styles.brandMark}>
                <BookOpen size={17} />
              </span>
              <span>Notes Workspace</span>
            </Link>

            <nav className={styles.navActions} aria-label="Landing navigation">
              <Link to="/login" className={styles.secondaryLink}>
                Log in
              </Link>
              <Link to="/register" className={styles.primaryCta}>
                Get started
              </Link>
            </nav>
          </div>
        </header>

        <main ref={mainRef} className={styles.mainCanvas}>
          <LandingScrollThread containerRef={mainRef} />
          <LandingHero />
          <LandingFeatureTabs />
          <PinnedNoteCta />
        </main>

        <footer className={styles.footer}>
          <span>Notes Workspace</span>
          <span>Local-first Scratchpad · Real-time Sync</span>
        </footer>
      </div>
    </MotionConfig>
  );
}
