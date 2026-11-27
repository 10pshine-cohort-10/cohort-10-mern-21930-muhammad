import { useId, type ReactNode } from 'react';
import { motion } from 'framer-motion';
import {
  ART_VIEWBOX,
  LEAF_OUTLINE_PATH,
  LEAF_VEIN_PATH,
  TILTS,
  GRADIENT_BLUE,
  GRADIENT_ORANGE,
  ORANGE_TINT_FILL,
} from './authArtPaths';
import styles from '../../pages/AuthSplitLayout.module.css';

export const SPRING_SETTLE = { stiffness: 260, damping: 14, mass: 0.5 } as const;
export const DRAW_EASE = [0.42, 0, 0.58, 1] as const;

export interface ArtMotionProps {
  isReducedMotion: boolean;
  isPaused: boolean;
  delay: number;
}

export function ArtSvgFrame({
  direction = 'horizontal',
  strokeMode = 'gradient',
  children,
}: {
  direction?: 'horizontal' | 'diagonal';
  strokeMode?: 'gradient' | 'activity-blue';
  children: (strokePaint: string) => ReactNode;
}) {
  const gradientId = useId();
  const y1 = direction === 'horizontal' ? '0%' : '100%';
  const paint = strokeMode === 'activity-blue' ? GRADIENT_BLUE : `url(#${gradientId})`;

  return (
    <svg viewBox={ART_VIEWBOX} className={styles.artShape} aria-hidden="true">
      {strokeMode === 'gradient' && (
        <defs>
          <linearGradient id={gradientId} x1="0%" y1={y1} x2="100%" y2="0%">
            <stop offset="0%" stopColor={GRADIENT_BLUE} />
            <stop offset="100%" stopColor={GRADIENT_ORANGE} />
          </linearGradient>
        </defs>
      )}
      {children(paint)}
    </svg>
  );
}

export function OrangeLeafGroup({
  isReducedMotion,
  isPaused,
  delay,
  restingOpacity = 1,
}: ArtMotionProps & { restingOpacity?: number }) {
  const isSettled = isReducedMotion || isPaused;

  return (
    <motion.g
      initial={isReducedMotion ? false : { opacity: 0, scale: 0.7, x: 126, y: 30 }}
      animate={{
        opacity: restingOpacity,
        scale: isSettled ? 1 : [1, 1.018, 1],
        x: 126,
        y: 30,
      }}
      transition={
        isReducedMotion
          ? { duration: 0 }
          : {
              opacity: { duration: 0.3, delay: isPaused ? 0 : delay },
              scale: isSettled
                ? { duration: 0.25 }
                : { duration: 5.5, delay: delay + 0.45, repeat: Infinity, ease: 'easeInOut' },
            }
      }
      style={{ rotate: TILTS.progress, transformOrigin: '0px 0px' }}
    >
      <motion.path
        d={LEAF_OUTLINE_PATH}
        fill={ORANGE_TINT_FILL}
        stroke={GRADIENT_ORANGE}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
        initial={isReducedMotion ? false : { pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={
          isReducedMotion
            ? { duration: 0 }
            : { duration: isPaused ? 0.2 : 0.4, delay: isPaused ? 0 : delay, ease: DRAW_EASE }
        }
      />
      <motion.path
        d={LEAF_VEIN_PATH}
        fill="none"
        stroke={GRADIENT_ORANGE}
        strokeWidth={1}
        strokeLinecap="round"
        vectorEffect="non-scaling-stroke"
        initial={isReducedMotion ? false : { pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={
          isReducedMotion
            ? { duration: 0 }
            : { duration: isPaused ? 0.2 : 0.3, delay: isPaused ? 0 : delay + 0.15, ease: DRAW_EASE }
        }
      />
    </motion.g>
  );
}
