import { TransitionLink } from '../context/PageTransitionContext';
import PinnateBrand from './brand/PinnateBrand';
import styles from '../pages/ScratchpadPage.module.css';

export interface ScratchpadBannerProps {
  isAuthenticated: boolean;
}

export default function ScratchpadBanner({ isAuthenticated }: ScratchpadBannerProps) {
  if (isAuthenticated) return null;

  return (
    <div className={styles.guestBanner}>
      <div className={styles.bannerActions}>
        <TransitionLink to="/" className={styles.loginLink} aria-label="Pinnate home">
          <PinnateBrand markSize={24} />
        </TransitionLink>
        <span className={styles.bannerText}>
          Working in Scratchpad. Your notes are saved on this device only.
        </span>
      </div>
      <div className={styles.bannerActions}>
        <TransitionLink to="/signup" className={styles.ctaButton}>
          <span>Create Account to Sync</span>
        </TransitionLink>
        <TransitionLink to="/login" className={styles.loginLink}>
          Log In
        </TransitionLink>
      </div>
    </div>
  );
}
