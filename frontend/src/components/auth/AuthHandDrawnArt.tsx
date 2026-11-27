import { useEffect, useState } from 'react';
import { useReducedMotion } from 'framer-motion';
import { SignupCaptureShape } from './SignupCaptureShape';
import {
  SignupBoardShape,
  ProgressLeafShape,
} from './AuthArtShapes';
import AuthLoginScene from './AuthLoginScene';
import styles from '../../pages/AuthSplitLayout.module.css';

interface AuthHandDrawnArtProps {
  isSignup: boolean;
  isPaused: boolean;
}

function useIsMobileArt(): boolean {
  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return false;
    return window.matchMedia('(max-width: 767px)').matches;
  });

  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return;
    const mq = window.matchMedia('(max-width: 767px)');
    const handler = () => setIsMobile(mq.matches);
    handler();
    mq.addEventListener?.('change', handler);
    return () => mq.removeEventListener?.('change', handler);
  }, []);

  return isMobile;
}

export default function AuthHandDrawnArt({ isSignup, isPaused }: AuthHandDrawnArtProps) {
  const isReducedMotion = Boolean(useReducedMotion());
  const isMobile = useIsMobileArt();
  const effectivePaused = isPaused || isReducedMotion;

  if (!isSignup) {
    return (
      <div
        className={styles.handDrawnArt}
        data-testid="auth-handdrawn-art"
        data-paused={String(effectivePaused)}
        data-reduced-motion={String(isReducedMotion)}
      >
        <AuthLoginScene isReducedMotion={isReducedMotion} isPaused={effectivePaused} />
        <p className={styles.artCaption}>Pick up where you left off.</p>
      </div>
    );
  }

  if (isMobile) {
    return (
      <div
        className={styles.handDrawnArt}
        data-testid="auth-handdrawn-art"
        data-paused={String(effectivePaused)}
        data-reduced-motion={String(isReducedMotion)}
      >
        <div className={styles.artShapeGroup}>
          <ProgressLeafShape isReducedMotion={isReducedMotion} isPaused={effectivePaused} delay={0} />
          <p className={styles.artCaption}>See how far you&apos;ve come.</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={styles.handDrawnArt}
      data-testid="auth-handdrawn-art"
      data-paused={String(effectivePaused)}
      data-reduced-motion={String(isReducedMotion)}
    >
      <div className={styles.artShapeGroup}>
        <SignupCaptureShape isReducedMotion={isReducedMotion} isPaused={effectivePaused} delay={0} />
        <p className={styles.artCaption}>Capture a thought in seconds.</p>
      </div>

      <div className={styles.artShapeGroup}>
        <SignupBoardShape isReducedMotion={isReducedMotion} isPaused={effectivePaused} delay={0.9} />
        <p className={styles.artCaption}>Move plans forward at your pace.</p>
      </div>

      <div className={styles.artShapeGroup}>
        <ProgressLeafShape isReducedMotion={isReducedMotion} isPaused={effectivePaused} delay={1.9} />
        <p className={styles.artCaption}>See how far you&apos;ve come.</p>
      </div>
    </div>
  );
}
