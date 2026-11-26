import { Link, Navigate } from 'react-router-dom';
import { MotionConfig } from 'framer-motion';
import { BookOpen, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import LandingHero from '../components/landing/LandingHero';
import LandingFeatureSections from '../components/landing/LandingFeatureSections';
import styles from './LandingPage.module.css';

export default function LandingPage() {
  const { isAuthenticated, isLoading } = useAuth();

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

        <main>
          <LandingHero />
          <LandingFeatureSections />

          <section className={styles.finalBand}>
            <div className={styles.finalInner}>
              <h2 className={styles.sectionHeading}>Start writing on a desk that stays out of your way.</h2>
              <p className={styles.sectionLead} style={{ marginBottom: 8 }}>
                Create an account to sync across devices, or open the Scratchpad immediately.
              </p>
              <div className={styles.ctaGroup}>
                <Link to="/register" className={styles.primaryCta}>
                  <span>Get started</span>
                  <ArrowRight size={16} />
                </Link>
                <Link to="/login" className={styles.secondaryLink}>
                  Log in
                </Link>
              </div>
            </div>
          </section>
        </main>

        <footer className={styles.footer}>
          <span>Notes Workspace</span>
          <span>Local-first Scratchpad · Real-time Cloud Desk</span>
        </footer>
      </div>
    </MotionConfig>
  );
}
