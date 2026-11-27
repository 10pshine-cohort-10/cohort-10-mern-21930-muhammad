import AuthHandDrawnArt from './AuthHandDrawnArt';
import styles from '../../pages/AuthSplitLayout.module.css';

export interface AuthArtPanelProps {
  isSignup: boolean;
  isPaused: boolean;
}

export default function AuthArtPanel({ isSignup, isPaused }: AuthArtPanelProps) {
  return (
    <div className={styles.artPanel}>
      <AuthHandDrawnArt isSignup={isSignup} isPaused={isPaused} />
    </div>
  );
}
