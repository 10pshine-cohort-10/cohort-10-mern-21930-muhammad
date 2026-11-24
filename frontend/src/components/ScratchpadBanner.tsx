import { Link } from 'react-router-dom';
import { Sparkles } from 'lucide-react';
import styles from '../pages/ScratchpadPage.module.css';

export interface ScratchpadBannerProps {
  isAuthenticated: boolean;
}

export default function ScratchpadBanner({ isAuthenticated }: ScratchpadBannerProps) {
  return (
    <div className={styles.guestBanner}>
      {isAuthenticated ? (
        <>
          <span className={styles.bannerText}>
            Personal Draft Blotter — Fast, unfiled thoughts stored locally.
          </span>
          <span className={styles.bannerSubtext}>
            Click "Tack to Desk" to save any draft into your cloud notes.
          </span>
        </>
      ) : (
        <>
          <span className={styles.bannerText}>
            Working in Guest Scratchpad. Your notes are saved locally in this browser.
          </span>
          <div className={styles.bannerActions}>
            <Link to="/register" className={styles.ctaButton}>
              <Sparkles size={14} />
              <span>Create Account to Sync</span>
            </Link>
            <Link to="/login" className={styles.loginLink}>
              Log In
            </Link>
          </div>
        </>
      )}
    </div>
  );
}
