import { useEffect, useState, type RefObject } from 'react';
import { motion, useScroll, useSpring, useTransform, useReducedMotion } from 'framer-motion';
import { buildThreadGeometry, type ThreadAnchorRects, type ThreadGeometry } from './threadPath';
import styles from '../../pages/LandingPage.module.css';

export interface LandingScrollThreadProps {
  containerRef: RefObject<HTMLElement | null>;
}

function readAnchorRects(canvasEl: HTMLElement): ThreadAnchorRects | null {
  const heroPinEl = canvasEl.querySelector<HTMLElement>('[data-thread-anchor="hero-pin"]');
  const featuresEl = canvasEl.querySelector<HTMLElement>('[data-thread-anchor="features"]');
  const featuresInnerEl = canvasEl.querySelector<HTMLElement>('[data-thread-anchor="features-inner"]');
  const ctaCardEl = canvasEl.querySelector<HTMLElement>('[data-thread-anchor="cta-card"]');
  const ctaPinEl = canvasEl.querySelector<HTMLElement>('[data-thread-anchor="cta-pin"]');

  if (!heroPinEl || !featuresEl || !featuresInnerEl || !ctaCardEl || !ctaPinEl) {
    return null;
  }

  return {
    canvas: canvasEl.getBoundingClientRect(),
    heroPin: heroPinEl.getBoundingClientRect(),
    featuresSection: featuresEl.getBoundingClientRect(),
    featuresInner: featuresInnerEl.getBoundingClientRect(),
    ctaCard: ctaCardEl.getBoundingClientRect(),
    ctaPin: ctaPinEl.getBoundingClientRect(),
  };
}

export default function LandingScrollThread({ containerRef }: LandingScrollThreadProps) {
  const shouldReduceMotion = useReducedMotion();
  const [geometry, setGeometry] = useState<ThreadGeometry | null>(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end'],
  });

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 180,
    damping: 28,
    mass: 0.45,
  });

  const headProgress = useTransform(smoothProgress, [0.1, 0.2, 0.78, 1], [0, 0.18, 1, 1]);
  const tailProgress = useTransform(smoothProgress, [0.1, 0.22, 0.78, 0.9, 1], [0, 0, 0.66, 1, 1]);
  const visibleLength = useTransform([headProgress, tailProgress], ([h, t]: number[]) => {
    const span = h - t;
    return span < 0.002 ? 0 : Math.min(1, span);
  });
  const activeOpacity = useTransform(visibleLength, (len) => (len <= 0 ? 0 : 1));

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
  }, [containerRef]);

  const sharedPathProps = geometry
    ? {
        d: geometry.d,
        fill: 'none',
        stroke: 'url(#landingThreadGradient)',
        strokeWidth: geometry.isCompact ? 1.5 : 2,
        strokeLinecap: 'round' as const,
        strokeLinejoin: 'round' as const,
        vectorEffect: 'non-scaling-stroke' as const,
      }
    : null;

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

      {sharedPathProps &&
        (shouldReduceMotion ? (
          <path {...sharedPathProps} opacity={0.22} />
        ) : (
          <motion.path
            {...sharedPathProps}
            style={{ pathLength: visibleLength, pathOffset: tailProgress, opacity: activeOpacity }}
          />
        ))}
    </svg>
  );
}
