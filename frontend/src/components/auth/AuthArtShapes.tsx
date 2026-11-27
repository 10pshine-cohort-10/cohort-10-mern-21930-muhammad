import { motion } from 'framer-motion';
import {
  BOARD_TRACK_PATH,
  DOT_POSITIONS,
  DOT_COLORS,
  MINI_CARD_PATH,
  RISING_LINE_PATH,
  TILTS,
  CARD_HOP_X,
  SAGE_FILL,
} from './authArtPaths';
import {
  ArtSvgFrame,
  OrangeLeafGroup,
  DRAW_EASE,
  type ArtMotionProps,
} from './AuthArtPrimitives';

const HOP_KEYFRAMES_X = [CARD_HOP_X[0], 52, CARD_HOP_X[1], 108, CARD_HOP_X[2]];
const HOP_KEYFRAMES_Y = [64, 46, 65, 42, 63];

export function SignupBoardShape({ isReducedMotion, isPaused, delay }: ArtMotionProps) {
  const isSettled = isReducedMotion || isPaused;

  return (
    <ArtSvgFrame strokeMode="activity-blue">
      {(strokePaint) => (
        <>
          <motion.path
            d={BOARD_TRACK_PATH}
            fill="none"
            stroke="var(--border-subtle)"
            strokeWidth={1.5}
            strokeLinecap="round"
            vectorEffect="non-scaling-stroke"
            initial={isReducedMotion ? false : { pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={
              isReducedMotion
                ? { duration: 0 }
                : { duration: isPaused ? 0.2 : 0.3, delay: isPaused ? 0 : delay, ease: DRAW_EASE }
            }
          />
          {DOT_POSITIONS.map((dot, idx) => (
            <motion.circle
              key={idx}
              cx={dot.cx}
              cy={dot.cy}
              r={6}
              fill={DOT_COLORS[idx]}
              initial={isReducedMotion ? false : { opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={
                isReducedMotion
                  ? { duration: 0 }
                  : isPaused
                    ? { duration: 0.2 }
                    : { type: 'spring', stiffness: 300, damping: 18, delay: delay + 0.1 + idx * 0.08 }
              }
            />
          ))}
          <motion.g
            initial={isReducedMotion ? false : { x: CARD_HOP_X[0], y: 64, opacity: 0 }}
            animate={
              isSettled
                ? { x: CARD_HOP_X[2], y: 63, opacity: 1 }
                : { x: HOP_KEYFRAMES_X, y: HOP_KEYFRAMES_Y, opacity: 1 }
            }
            transition={
              isReducedMotion
                ? { duration: 0 }
                : isPaused
                  ? { duration: 0.2 }
                  : {
                      x: { duration: 0.75, delay: delay + 0.3, ease: 'easeInOut' },
                      y: { duration: 0.75, delay: delay + 0.3, ease: 'easeInOut' },
                      opacity: { duration: 0.15, delay: delay + 0.3 },
                    }
            }
            style={{ rotate: TILTS.board }}
          >
            <path
              d={MINI_CARD_PATH}
              fill={SAGE_FILL}
              stroke={strokePaint}
              strokeWidth={1.5}
              strokeLinecap="round"
              strokeLinejoin="round"
              vectorEffect="non-scaling-stroke"
            />
          </motion.g>
        </>
      )}
    </ArtSvgFrame>
  );
}

export function ProgressLeafShape({ isReducedMotion, isPaused, delay }: ArtMotionProps) {
  return (
    <ArtSvgFrame direction="diagonal">
      {(strokeUrl) => (
        <>
          <motion.path
            d={RISING_LINE_PATH}
            fill="none"
            stroke={strokeUrl}
            strokeWidth={2}
            strokeLinecap="round"
            vectorEffect="non-scaling-stroke"
            initial={isReducedMotion ? false : { pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={
              isReducedMotion
                ? { duration: 0 }
                : { duration: isPaused ? 0.2 : 0.55, delay: isPaused ? 0 : delay, ease: DRAW_EASE }
            }
          />
          <OrangeLeafGroup
            isReducedMotion={isReducedMotion}
            isPaused={isPaused}
            delay={delay + 0.5}
          />
        </>
      )}
    </ArtSvgFrame>
  );
}
