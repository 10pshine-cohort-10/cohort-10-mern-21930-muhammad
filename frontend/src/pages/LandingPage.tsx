import { useRef } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { MotionConfig, motion, useReducedMotion } from 'framer-motion';
import { ArrowRight, Pin } from 'lucide-react';
import { EASE_TACTILE } from '../brand/motion';
import { useAuth } from '../context/AuthContext';
import LandingHero from '../components/landing/LandingHero';
import LandingFeatureTabs from '../components/landing/LandingFeatureTabs';
import LandingScrollThread from '../components/landing/LandingScrollThread';
import PublicTopNav from '../components/PublicTopNav';
import { TransitionLink } from '../context/PageTransitionContext';
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
        transition={{ duration: 0.45, ease: EASE_TACTILE }}
      >
        <span className={styles.pinnedCtaPin} data-thread-anchor="cta-pin" aria-hidden="true" />
        <div className={styles.pinnedCtaTape} aria-hidden="true" />
        <h2 className={styles.pinnedCtaHeading}>
          Start writing in a place that stays out of your way.
        </h2>
        <p className={styles.pinnedCtaBody}>
          Create an account to sync across devices, or open the local Scratchpad today.
        </p>
        <div className={styles.ctaGroup}>
          <TransitionLink to="/signup" className={styles.primaryCta}>
            <span>Get started</span>
            <ArrowRight size={16} />
          </TransitionLink>
          <Link to="/scratchpad" className={styles.secondaryLink}>
            Try Scratchpad
          </Link>
          <TransitionLink to="/login" className={styles.secondaryLink}>
            Log in
          </TransitionLink>
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
  const canvasRef = useRef<HTMLDivElement>(null);

  if (!isLoading && isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <MotionConfig reducedMotion="user">
      <div className={styles.page}>
        <PublicTopNav />

        <div ref={canvasRef} className={styles.mainCanvas}>
          <LandingScrollThread containerRef={canvasRef} />

          <main>
            <LandingHero />
            <LandingFeatureTabs />
            <PinnedNoteCta />
          </main>

          <footer className={styles.footer}>
            <span>Pinnate</span>
            <span className={styles.pronounceInline}>(PIN-ayt)</span>
            <span aria-hidden="true">·</span>
            <span>Pin it. Move it. Finish it.</span>
          </footer>
        </div>
      </div>
    </MotionConfig>
  );
}
