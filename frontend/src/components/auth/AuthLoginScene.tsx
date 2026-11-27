import { motion } from 'framer-motion';
import {
  CARD_OUTLINE_PATH,
  RISING_LINE_PATH,
  TILTS,
  GRADIENT_BLUE,
  SAGE_FILL,
  PUSHPIN_RED,
} from './authArtPaths';
import {
  ArtSvgFrame,
  OrangeLeafGroup,
  SPRING_SETTLE,
  DRAW_EASE,
} from './AuthArtPrimitives';
import styles from '../../pages/AuthSplitLayout.module.css';

interface AuthLoginSceneProps {
  isReducedMotion: boolean;
  isPaused: boolean;
}

export default function AuthLoginScene({ isReducedMotion, isPaused }: AuthLoginSceneProps) {
  return (
    <div className={styles.artShapeGroup}>
      <ArtSvgFrame direction="diagonal">
        {(strokeUrl) => (
          <>
            <motion.path
              d={CARD_OUTLINE_PATH}
              fill={SAGE_FILL}
              stroke={GRADIENT_BLUE}
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
              vectorEffect="non-scaling-stroke"
              initial={isReducedMotion ? false : { opacity: 0 }}
              animate={{ opacity: 1, rotate: TILTS.capture }}
              transition={
                isReducedMotion
                  ? { duration: 0 }
                  : isPaused
                    ? { duration: 0.2 }
                    : {
                        opacity: { duration: 0.4, delay: 0.1 },
                        rotate: { type: 'spring', ...SPRING_SETTLE, delay: 0.15 },
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
                    : { type: 'spring', ...SPRING_SETTLE, delay: 0.3 }
              }
            />
            <motion.path
              d={RISING_LINE_PATH}
              fill="none"
              stroke={strokeUrl}
              strokeWidth={1.5}
              strokeLinecap="round"
              vectorEffect="non-scaling-stroke"
              opacity={0.45}
              initial={isReducedMotion ? false : { pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={
                isReducedMotion
                  ? { duration: 0 }
                  : { duration: isPaused ? 0.2 : 0.6, delay: isPaused ? 0 : 0.35, ease: DRAW_EASE }
              }
            />
            <OrangeLeafGroup
              isReducedMotion={isReducedMotion}
              isPaused={isPaused}
              delay={0.65}
              restingOpacity={0.45}
            />
          </>
        )}
      </ArtSvgFrame>
    </div>
  );
}
