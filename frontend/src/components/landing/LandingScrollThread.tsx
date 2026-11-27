import { useEffect, useState, type RefObject } from 'react';
import {
  motion,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from 'framer-motion';
import { LEAF_OUTLINE_PATH, LEAF_STEM_PATH, LEAF_VEIN_PATH } from './leafPath';
import { buildThreadGeometry, type ThreadAnchorRects, type ThreadGeometry } from './threadPath';
import styles from '../../pages/LandingPage.module.css';

export interface LandingScrollThreadProps {
  containerRef: RefObject<HTMLElement | null>;
}

const LEAF_STROKE_PROPS = {
  fill: 'none',
  stroke: 'var(--accent-orange)',
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  vectorEffect: 'non-scaling-stroke' as const,
};

function readAnchorRects(canvasEl: HTMLElement): ThreadAnchorRects | null {
  const heroCopyEl = canvasEl.querySelector<HTMLElement>('[data-thread-anchor="hero-copy"]');
  const heroStageEl = canvasEl.querySelector<HTMLElement>('[data-thread-anchor="hero-stage"]');
  const featuresEl = canvasEl.querySelector<HTMLElement>('[data-thread-anchor="features"]');
  const featuresInnerEl = canvasEl.querySelector<HTMLElement>('[data-thread-anchor="features-inner"]');
  const ctaCardEl = canvasEl.querySelector<HTMLElement>('[data-thread-anchor="cta-card"]');

  if (!heroCopyEl || !heroStageEl || !featuresEl || !featuresInnerEl || !ctaCardEl) {
    return null;
  }

  return {
    canvas: canvasEl.getBoundingClientRect(),
    heroCopy: heroCopyEl.getBoundingClientRect(),
    heroStage: heroStageEl.getBoundingClientRect(),
    featuresSection: featuresEl.getBoundingClientRect(),
    featuresInner: featuresInnerEl.getBoundingClientRect(),
    ctaCard: ctaCardEl.getBoundingClientRect(),
  };
}

export default function LandingScrollThread({ containerRef }: LandingScrollThreadProps) {
  const shouldReduceMotion = useReducedMotion();
  const [geometry, setGeometry] = useState<ThreadGeometry | null>(null);
  const [hasLeafDrawn, setHasLeafDrawn] = useState(false);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end'],
  });

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 180,
    damping: 28,
    mass: 0.45,
  });

  const lineProgress = useTransform(smoothProgress, [0.04, 0.92], [0, 1]);

  useMotionValueEvent(lineProgress, 'change', (latest) => {
    if (!shouldReduceMotion && !hasLeafDrawn && latest >= 0.985) {
      setHasLeafDrawn(true);
    }
  });

  useEffect(() => {
    const canvasEl = containerRef.current;
    if (!canvasEl) return;

    let rafId = 0;
    const measure = () => {
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        const rects = readAnchorRects(canvasEl);
        if (!rects || rects.canvas.width === 0 || rects.canvas.height === 0) return;
        setGeometry(buildThreadGeometry(rects));
        if (!shouldReduceMotion && lineProgress.get() >= 0.985) {
          setHasLeafDrawn(true);
        }
      });
    };

    measure();

    let resizeObserver: ResizeObserver | null = null;
    if (typeof ResizeObserver !== 'undefined') {
      resizeObserver = new ResizeObserver(measure);
      resizeObserver.observe(canvasEl);
      const featuresEl = canvasEl.querySelector<HTMLElement>('[data-thread-anchor="features"]');
      if (featuresEl) {
        resizeObserver.observe(featuresEl);
      }
    }

    window.addEventListener('resize', measure, { passive: true });
    document.fonts?.ready.then(measure).catch(() => {});

    return () => {
      cancelAnimationFrame(rafId);
      resizeObserver?.disconnect();
      window.removeEventListener('resize', measure);
    };
  }, [containerRef, lineProgress, shouldReduceMotion]);

  const strokeWidth = geometry?.isCompact ? 1.5 : 2;
  const leafTransform = geometry
    ? `translate(${geometry.leaf.x}, ${geometry.leaf.y}) rotate(${geometry.leaf.tiltDeg}) scale(${geometry.leaf.scale})`
    : undefined;

  return (
    <svg
      className={styles.scrollThreadLayer}
      viewBox={geometry ? `0 0 ${geometry.width} ${geometry.height}` : '0 0 1 1'}
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <defs>
        <linearGradient
          id="landingThreadGradient"
          gradientUnits="userSpaceOnUse"
          x1="0"
          y1={geometry?.startY ?? 0}
          x2="0"
          y2={geometry?.endY ?? 800}
        >
          <stop offset="0%" stopColor="#0ea5e9" />
          <stop offset="100%" stopColor="#f97316" />
        </linearGradient>
      </defs>

      {geometry && (
        <>
          {shouldReduceMotion ? (
            <path
              d={geometry.d}
              fill="none"
              stroke="url(#landingThreadGradient)"
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              strokeLinejoin="round"
              vectorEffect="non-scaling-stroke"
              opacity={0.25}
            />
          ) : (
            <motion.path
              d={geometry.d}
              fill="none"
              stroke="url(#landingThreadGradient)"
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              strokeLinejoin="round"
              vectorEffect="non-scaling-stroke"
              style={{ pathLength: lineProgress }}
            />
          )}

          <g transform={leafTransform}>
            {shouldReduceMotion ? (
              <>
                <path d={LEAF_OUTLINE_PATH} fill="rgba(249, 115, 22, 0.14)" stroke="none" />
                <path d={LEAF_STEM_PATH} {...LEAF_STROKE_PROPS} strokeWidth={strokeWidth} />
                <path d={LEAF_OUTLINE_PATH} {...LEAF_STROKE_PROPS} strokeWidth={strokeWidth} />
                <path d={LEAF_VEIN_PATH} {...LEAF_STROKE_PROPS} strokeWidth={1.5} />
              </>
            ) : (
              <>
                <motion.path
                  d={LEAF_OUTLINE_PATH}
                  fill="rgba(249, 115, 22, 0.14)"
                  stroke="none"
                  initial={{ opacity: 0 }}
                  animate={hasLeafDrawn ? { opacity: 1 } : { opacity: 0 }}
                  transition={{ delay: 0.88, duration: 0.32, ease: 'easeOut' }}
                />
                <motion.path
                  d={LEAF_STEM_PATH}
                  {...LEAF_STROKE_PROPS}
                  strokeWidth={strokeWidth}
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={hasLeafDrawn ? { pathLength: 1, opacity: 1 } : { pathLength: 0, opacity: 0 }}
                  transition={{ duration: 0.15, ease: 'easeOut' }}
                />
                <motion.path
                  d={LEAF_OUTLINE_PATH}
                  {...LEAF_STROKE_PROPS}
                  strokeWidth={strokeWidth}
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={hasLeafDrawn ? { pathLength: 1, opacity: 1 } : { pathLength: 0, opacity: 0 }}
                  transition={{ delay: 0.1, duration: 0.62, ease: [0.22, 1, 0.36, 1] }}
                />
                <motion.path
                  d={LEAF_VEIN_PATH}
                  {...LEAF_STROKE_PROPS}
                  strokeWidth={1.5}
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={hasLeafDrawn ? { pathLength: 1, opacity: 1 } : { pathLength: 0, opacity: 0 }}
                  transition={{ delay: 0.58, duration: 0.37, ease: 'easeOut' }}
                />
              </>
            )}
          </g>
        </>
      )}
    </svg>
  );
}
