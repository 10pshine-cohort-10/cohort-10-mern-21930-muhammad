import { motion } from 'framer-motion';
import {
  SQUIGGLE_PATH,
  CARD_OUTLINE_PATH,
  TILTS,
  SAGE_FILL,
  PUSHPIN_RED,
} from './authArtPaths';
import {
  ArtSvgFrame,
  SPRING_SETTLE,
  DRAW_EASE,
  type ArtMotionProps,
} from './AuthArtPrimitives';

export function SignupCaptureShape({ isReducedMotion, isPaused, delay }: ArtMotionProps) {
  const isSettled = isReducedMotion || isPaused;

  return (
    <ArtSvgFrame strokeMode="activity-blue">
      {(strokePaint) => (
        <>
          <motion.path
            d={SQUIGGLE_PATH}
            fill="none"
            stroke={strokePaint}
            strokeWidth={2}
            strokeLinecap="round"
            vectorEffect="non-scaling-stroke"
            initial={isReducedMotion ? false : { pathLength: 0, opacity: 1 }}
            animate={isSettled ? { pathLength: 1, opacity: 0 } : { pathLength: 1, opacity: [1, 1, 0] }}
            transition={
              isReducedMotion
                ? { duration: 0 }
                : isPaused
                  ? { duration: 0.2 }
                  : {
                      pathLength: { duration: 0.45, delay, ease: DRAW_EASE },
                      opacity: { duration: 0.55, delay: delay + 0.4, times: [0, 0.5, 1] },
                    }
            }
          />
          <motion.path
            d={CARD_OUTLINE_PATH}
            fill={SAGE_FILL}
            stroke={strokePaint}
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            vectorEffect="non-scaling-stroke"
            initial={isReducedMotion ? false : { opacity: 0, rotate: 0 }}
            animate={{ opacity: 1, rotate: TILTS.capture }}
            transition={
              isReducedMotion
                ? { duration: 0 }
                : isPaused
                  ? { duration: 0.2 }
                  : {
                      opacity: { duration: 0.35, delay: delay + 0.4 },
                      rotate: { type: 'spring', ...SPRING_SETTLE, delay: delay + 0.45 },
                    }
            }
            style={{ transformOrigin: '80px 64px' }}
          />
          <motion.circle
            cx={38}
            cy={24}
            r={5}
            fill={PUSHPIN_RED}
            stroke="var(--border-dark)"
            strokeWidth={1.5}
            vectorEffect="non-scaling-stroke"
            initial={isReducedMotion ? false : { opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={
              isReducedMotion
                ? { duration: 0 }
                : isPaused
                  ? { duration: 0.2 }
                  : { type: 'spring', ...SPRING_SETTLE, delay: delay + 0.55 }
            }
          />
        </>
      )}
    </ArtSvgFrame>
  );
}
