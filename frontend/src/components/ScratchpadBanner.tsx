import { Link } from 'react-router-dom';
import styles from '../pages/ScratchpadPage.module.css';

export interface ScratchpadBannerProps {
  isAuthenticated: boolean;
}

export default function ScratchpadBanner({ isAuthenticated }: ScratchpadBannerProps) {
  if (isAuthenticated) return null;

  return (
    <div className={styles.guestBanner}>
      <span className={styles.bannerText}>
        Working in Scratchpad. Your notes are saved on this device only.
      </span>
      <div className={styles.bannerActions}>
        <Link to="/register" className={styles.ctaButton}>
          <span>Create Account to Sync</span>
        </Link>
        <Link to="/login" className={styles.loginLink}>
          Log In
        </Link>
      </div>
    </div>
  );
}
