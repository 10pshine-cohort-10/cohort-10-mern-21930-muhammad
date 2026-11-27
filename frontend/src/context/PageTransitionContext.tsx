import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type MouseEvent,
  type ReactNode,
} from 'react';
import { Link, useLocation, useNavigate, type LinkProps } from 'react-router-dom';
import {
  animate,
  useMotionValue,
  useReducedMotion,
  type AnimationPlaybackControls,
  type MotionValue,
} from 'framer-motion';

export type TransitionPhase = 'idle' | 'covering' | 'revealing';

interface PageTransitionContextValue {
  fogProgress: MotionValue<number>;
  phase: TransitionPhase;
  startFogTransition: (to: string) => void;
}

const PageTransitionContext = createContext<PageTransitionContextValue | null>(null);

const AUTH_TARGET_PATHS = new Set(['/login', '/signup', '/register']);

const ROUTE_TITLES: Record<string, string> = {
  '/': 'Pinnate',
  '/login': 'Log in · Pinnate',
  '/signup': 'Create account · Pinnate',
  '/register': 'Create account · Pinnate',
  '/scratchpad': 'Scratchpad · Pinnate',
  '/dashboard': 'Notes · Pinnate',
  '/insights': 'Progress · Pinnate',
  '/archive': 'Archive · Pinnate',
  '/profile': 'Profile · Pinnate',
};

export function PageTransitionProvider({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const location = useLocation();
  const shouldReduceMotion = useReducedMotion();

  const fogProgress = useMotionValue(0);
  const [phase, setPhase] = useState<TransitionPhase>('idle');
  const controlsRef = useRef<AnimationPlaybackControls | null>(null);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const title = ROUTE_TITLES[location.pathname];
    if (title) {
      document.title = title;
    }
  }, [location.pathname]);

  useEffect(() => {
    return () => {
      controlsRef.current?.stop();
      cancelAnimationFrame(rafRef.current);
    };
  }, []);

  const focusRevealedHeading = useCallback(() => {
    const heading = document.querySelector<HTMLElement>('main h1');
    if (heading) {
      if (!heading.hasAttribute('tabindex')) {
        heading.setAttribute('tabindex', '-1');
      }
      heading.focus({ preventScroll: true });
    }
  }, []);

  const startFogTransition = useCallback(
    (to: string) => {
      controlsRef.current?.stop();
      cancelAnimationFrame(rafRef.current);

      const coverDuration = shouldReduceMotion ? 0.075 : 0.3;
      const revealDuration = shouldReduceMotion ? 0.075 : 0.5;

      if (phase === 'revealing') {
        fogProgress.jump(0);
        setPhase('idle');
        navigate(to, { state: { fromFogTransition: true } });
        return;
      }

      setPhase('covering');
      controlsRef.current = animate(fogProgress, 0.5, {
        duration: coverDuration,
        ease: [0.4, 0, 0.2, 1],
        onComplete: () => {
          navigate(to, { state: { fromFogTransition: true } });
          rafRef.current = requestAnimationFrame(() => {
            setPhase('revealing');
            controlsRef.current = animate(fogProgress, 1, {
              duration: revealDuration,
              ease: [0.22, 1, 0.36, 1],
              onComplete: () => {
                fogProgress.jump(0);
                setPhase('idle');
                focusRevealedHeading();
              },
            });
          });
        },
      });
    },
    [fogProgress, focusRevealedHeading, navigate, phase, shouldReduceMotion]
  );

  return (
    <PageTransitionContext.Provider value={{ fogProgress, phase, startFogTransition }}>
      {children}
    </PageTransitionContext.Provider>
  );
}

export function usePageTransition() {
  return useContext(PageTransitionContext);
}

function isPlainLeftClick(event: MouseEvent<HTMLAnchorElement>): boolean {
  return (
    event.button === 0 &&
    !event.metaKey &&
    !event.ctrlKey &&
    !event.shiftKey &&
    !event.altKey &&
    !event.defaultPrevented
  );
}

export function TransitionLink({ to, onClick, ...rest }: LinkProps) {
  const transition = usePageTransition();
  const location = useLocation();
  const targetPath = typeof to === 'string' ? to : to.pathname ?? '';

  const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
    onClick?.(event);
    if (
      transition &&
      location.pathname === '/' &&
      AUTH_TARGET_PATHS.has(targetPath) &&
      isPlainLeftClick(event)
    ) {
      event.preventDefault();
      transition.startFogTransition(targetPath);
    }
  };

  return <Link to={to} onClick={handleClick} {...rest} />;
}
