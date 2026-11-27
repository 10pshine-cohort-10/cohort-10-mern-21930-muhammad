import { useCallback, useEffect, useId, useRef, useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import {
  animate,
  motion,
  useMotionValue,
  useReducedMotion,
  useTransform,
} from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import LoginForm from '../components/auth/LoginForm';
import SignupForm from '../components/auth/SignupForm';
import AuthArtPanel from '../components/auth/AuthArtPanel';
import {
  DESKTOP_AUTH_CLIP_FRAMES,
  MOBILE_AUTH_CLIP_FRAMES,
} from '../components/auth/authClipPaths';
import styles from './AuthSplitLayout.module.css';

const MORPH_DURATION_SEC = 0.7;
const MORPH_EASE = [0.65, 0, 0.35, 1] as const;
const TYPING_IDLE_MS = 1200;

function useIsMobileAuth(): boolean {
  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
      return false;
    }
    return window.matchMedia('(max-width: 767px)').matches;
  });

  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
      return;
    }
    const mediaQuery = window.matchMedia('(max-width: 767px)');
    const handleChange = () => setIsMobile(mediaQuery.matches);
    handleChange();
    mediaQuery.addEventListener?.('change', handleChange);
    return () => mediaQuery.removeEventListener?.('change', handleChange);
  }, []);

  return isMobile;
}

function useFormActivity() {
  const [isFormActive, setIsFormActive] = useState(false);
  const idleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearIdleTimer = useCallback(() => {
    if (idleTimerRef.current !== null) {
      clearTimeout(idleTimerRef.current);
      idleTimerRef.current = null;
    }
  }, []);

  const handleFocusCapture = useCallback(() => {
    clearIdleTimer();
    setIsFormActive(true);
  }, [clearIdleTimer]);

  const handleBlurCapture = useCallback((e: React.FocusEvent) => {
    if (e.currentTarget.contains(e.relatedTarget as Node)) return;
    clearIdleTimer();
    setIsFormActive(false);
  }, [clearIdleTimer]);

  const handleInputCapture = useCallback(() => {
    clearIdleTimer();
    setIsFormActive(true);
    idleTimerRef.current = setTimeout(() => setIsFormActive(false), TYPING_IDLE_MS);
  }, [clearIdleTimer]);

  useEffect(() => clearIdleTimer, [clearIdleTimer]);

  return { isFormActive, handleFocusCapture, handleBlurCapture, handleInputCapture };
}

export default function AuthSplitLayout() {
  const { isAuthenticated, isLoading, login, register } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const shouldReduceMotion = useReducedMotion();
  const isMobile = useIsMobileAuth();
  const clipId = useId();
  const { isFormActive, handleFocusCapture, handleBlurCapture, handleInputCapture } = useFormActivity();

  const isSignup = location.pathname === '/signup';
  const [sharedEmail, setSharedEmail] = useState('');
  const [isTransitioning, setIsTransitioning] = useState(false);

  const progress = useMotionValue(isSignup ? 1 : 0);
  const clipFrames = isMobile ? MOBILE_AUTH_CLIP_FRAMES : DESKTOP_AUTH_CLIP_FRAMES;
  const clipPathD = useTransform(progress, [0, 0.35, 0.65, 1], [...clipFrames]);
  const loginOpacity = useTransform(progress, [0, 0.28, 1], [1, 0, 0]);
  const signupOpacity = useTransform(progress, [0, 0.57, 1], [0, 0, 1]);
  const artShiftX = useTransform(progress, [0, 1], ['25%', '-25%']);

  const hasMountedRef = useRef(false);
  const prevIsSignupRef = useRef(isSignup);
  const loginHeadingRef = useRef<HTMLHeadingElement>(null);
  const signupHeadingRef = useRef<HTMLHeadingElement>(null);
  const arrivedFromFog = Boolean((location.state as { fromFogTransition?: boolean } | null)?.fromFogTransition);

  useEffect(() => {
    if (!hasMountedRef.current) {
      hasMountedRef.current = true;
      prevIsSignupRef.current = isSignup;
      progress.jump(isSignup ? 1 : 0);
      return;
    }

    if (prevIsSignupRef.current === isSignup) {
      return;
    }
    prevIsSignupRef.current = isSignup;

    const target = isSignup ? 1 : 0;
    const distance = Math.abs(target - progress.get());

    if (shouldReduceMotion || arrivedFromFog) {
      progress.jump(target);
      setIsTransitioning(false);
      const targetHeading = isSignup ? signupHeadingRef.current : loginHeadingRef.current;
      targetHeading?.focus({ preventScroll: true });
      return;
    }

    setIsTransitioning(true);
    const controls = animate(progress, target, {
      duration: Math.max(0.05, MORPH_DURATION_SEC * distance),
      ease: MORPH_EASE,
      onComplete: () => {
        setIsTransitioning(false);
        const targetHeading = isSignup ? signupHeadingRef.current : loginHeadingRef.current;
        targetHeading?.focus({ preventScroll: true });
      },
    });

    return () => {
      controls.stop();
    };
  }, [arrivedFromFog, isSignup, progress, shouldReduceMotion]);

  if (!isLoading && isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleLogin = async (email: string, password: string) => {
    await login(email, password);
    navigate('/dashboard');
  };

  const handleSignup = async (name: string, email: string, password: string) => {
    await register(name, email, password);
    navigate('/dashboard');
  };

  const isLoginHidden = isSignup && !isTransitioning;
  const isSignupHidden = !isSignup && !isTransitioning;

  return (
    <div className={styles.page}>
      <main className={styles.splitStage}>
        <svg className={styles.clipSvgDefs} aria-hidden="true">
          <defs>
            <clipPath id={clipId} clipPathUnits="objectBoundingBox">
              <motion.path d={clipPathD} />
            </clipPath>
          </defs>
        </svg>

        <motion.section
          className={`${styles.formColumn} ${isLoginHidden ? styles.formHidden : ''}`}
          animate={shouldReduceMotion ? { opacity: isSignup ? 0 : 1 } : undefined}
          transition={shouldReduceMotion ? { duration: 0.15 } : undefined}
          style={{
            opacity: shouldReduceMotion ? undefined : loginOpacity,
            visibility: isLoginHidden ? 'hidden' : 'visible',
          }}
          aria-hidden={isSignup}
          inert={isSignup}
          data-testid="login-panel"
          onFocusCapture={!isSignup ? handleFocusCapture : undefined}
          onBlurCapture={!isSignup ? handleBlurCapture : undefined}
          onInputCapture={!isSignup ? handleInputCapture : undefined}
        >
          <LoginForm
            email={sharedEmail}
            onEmailChange={setSharedEmail}
            onSubmitCredentials={handleLogin}
            headingRef={loginHeadingRef}
          />
        </motion.section>

        <motion.section
          className={`${styles.formColumn} ${isSignupHidden ? styles.formHidden : ''}`}
          animate={shouldReduceMotion ? { opacity: isSignup ? 1 : 0 } : undefined}
          transition={shouldReduceMotion ? { duration: 0.15 } : undefined}
          style={{
            opacity: shouldReduceMotion ? undefined : signupOpacity,
            visibility: isSignupHidden ? 'hidden' : 'visible',
          }}
          aria-hidden={!isSignup}
          inert={!isSignup}
          data-testid="signup-panel"
          onFocusCapture={isSignup ? handleFocusCapture : undefined}
          onBlurCapture={isSignup ? handleBlurCapture : undefined}
          onInputCapture={isSignup ? handleInputCapture : undefined}
        >
          <SignupForm
            email={sharedEmail}
            onEmailChange={setSharedEmail}
            onSubmitSignup={handleSignup}
            headingRef={signupHeadingRef}
          />
        </motion.section>

        <section
          className={styles.artOverlay}
          style={{
            clipPath: `url(#${clipId})`,
            WebkitClipPath: `url(#${clipId})`,
          }}
        >
          <motion.div
            className={styles.artMover}
            style={{
              x: isMobile
                ? '0%'
                : shouldReduceMotion
                  ? isSignup
                    ? '-25%'
                    : '25%'
                  : artShiftX,
            }}
          >
            <AuthArtPanel isSignup={isSignup} isPaused={isFormActive} />
          </motion.div>
        </section>
      </main>
    </div>
  );
}
