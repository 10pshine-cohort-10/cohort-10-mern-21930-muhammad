export interface RectBox {
  left: number;
  top: number;
  width: number;
  height: number;
  right: number;
  bottom: number;
}

export interface Point {
  x: number;
  y: number;
}

export interface ThreadAnchorRects {
  canvas: RectBox;
  heroCopy: RectBox;
  heroStage: RectBox;
  featuresSection: RectBox;
  featuresInner: RectBox;
  ctaCard: RectBox;
}

export interface LeafTransform {
  x: number;
  y: number;
  scale: number;
  tiltDeg: number;
}

export interface ThreadGeometry {
  width: number;
  height: number;
  startY: number;
  endY: number;
  d: string;
  isCompact: boolean;
  leaf: LeafTransform;
}

const COMPACT_BREAKPOINT = 1024;
const MOBILE_BREAKPOINT = 768;
const SAFE_EDGE_PADDING = 10;

function roundCoord(value: number): number {
  return Math.round(value * 10) / 10;
}

function clampX(x: number, canvasWidth: number): number {
  return roundCoord(Math.max(SAFE_EDGE_PADDING, Math.min(canvasWidth - SAFE_EDGE_PADDING, x)));
}

/**
 * Generates a single document-space SVG path that enters from the right gap
 * beside the hero card, passes strictly below all hero copy and cards,
 * weaves through the center above #features before drifting left, bypasses
 * the closing CTA card on the right, and joins the bottom-right leaf stem.
 */
export function buildThreadGeometry(rects: ThreadAnchorRects): ThreadGeometry {
  const { canvas, heroCopy, heroStage, featuresSection, featuresInner, ctaCard } = rects;
  const width = Math.max(1, Math.round(canvas.width));
  const height = Math.max(1, Math.round(canvas.height));
  const isCompact = width < COMPACT_BREAKPOINT;
  const isMobile = width < MOBILE_BREAKPOINT;

  const stageTop = heroStage.top - canvas.top;
  const stageRight = heroStage.right - canvas.left;
  const stageBottom = heroStage.bottom - canvas.top;
  const copyBottom = heroCopy.bottom - canvas.top;
  const heroClearY = Math.max(stageBottom, copyBottom) + (isMobile ? 22 : 30);

  const featuresTop = featuresSection.top - canvas.top;
  const featuresInnerLeft = featuresInner.left - canvas.left;
  const featuresInnerBottom = featuresInner.bottom - canvas.top;

  const ctaTop = ctaCard.top - canvas.top;
  const ctaRight = ctaCard.right - canvas.left;
  const ctaBottom = ctaCard.bottom - canvas.top;

  const rightEntryX = clampX(
    isCompact ? width - 10 : Math.min(width - 24, stageRight + 36),
    width
  );
  const startY = roundCoord(Math.max(24, stageTop + (isMobile ? 24 : 36)));

  const leftGutterX = clampX(
    isCompact
      ? 10
      : featuresInnerLeft > 64
        ? Math.max(28, Math.min(56, featuresInnerLeft - 36))
        : Math.max(16, featuresInnerLeft * 0.45),
    width
  );

  const centerX = clampX(width * 0.5, width);
  const featuresClearTopY = roundCoord(Math.max(heroClearY + 20, featuresTop - 16));
  const heroToCenterMidY = roundCoord((heroClearY + featuresClearTopY) * 0.5);

  const featuresExitY = roundCoord(Math.max(featuresClearTopY + 48, featuresInnerBottom + 24));
  const gutterMidY = roundCoord((featuresClearTopY + featuresExitY) * 0.5);
  const gutterBreathX = clampX(isCompact ? leftGutterX : leftGutterX + 10, width);

  const ctaClearTopY = roundCoord(Math.max(featuresExitY + 24, ctaTop - 28));
  const ctaRightX = clampX(
    isCompact ? width - 10 : Math.min(width - 28, ctaRight + 42),
    width
  );
  const ctaClearBottomY = roundCoord(Math.max(ctaClearTopY + 48, ctaBottom + 20));

  const leafScale = isMobile ? 0.85 : 1;
  const stemX = clampX(
    isMobile ? width - 40 : Math.min(width - 56, ctaRight + 28),
    width
  );
  const stemY = roundCoord(Math.max(ctaClearBottomY + 28, height - (isMobile ? 34 : 42)));

  const segments = [
    // 1. Drop down the hero right gap until clear of both hero columns
    `M ${rightEntryX} ${startY}`,
    `C ${rightEntryX} ${roundCoord(heroClearY - 24)}, ${rightEntryX} ${heroClearY}, ${clampX(
      (rightEntryX + centerX) * 0.5,
      width
    )} ${heroClearY}`,
    // 2. Sweep through center in open space above #features, then drift left
    `C ${centerX} ${heroClearY}, ${centerX} ${heroToCenterMidY}, ${clampX(
      (centerX + leftGutterX) * 0.5,
      width
    )} ${roundCoord((heroToCenterMidY + featuresClearTopY) * 0.5)}`,
    `C ${leftGutterX} ${roundCoord(featuresClearTopY - 12)}, ${leftGutterX} ${featuresClearTopY}, ${leftGutterX} ${roundCoord(
      featuresClearTopY + 12
    )}`,
    // 3. Soft organic breath down the left side clear of #features cards
    `C ${gutterBreathX} ${roundCoord(
      (featuresClearTopY + gutterMidY) * 0.5
    )}, ${leftGutterX} ${gutterMidY}, ${leftGutterX} ${featuresExitY}`,
    // 4. Sweep right across the gap above the closing CTA card (skipping its pin)
    `C ${leftGutterX} ${roundCoord(ctaClearTopY - 12)}, ${centerX} ${ctaClearTopY}, ${ctaRightX} ${roundCoord(
      ctaClearTopY + 24
    )}`,
    // 5. Curve down past the closing card's lower-right corner into the leaf stem
    `C ${ctaRightX} ${roundCoord((ctaClearTopY + ctaClearBottomY) * 0.5)}, ${ctaRightX} ${ctaClearBottomY}, ${clampX(
      stemX - 18,
      width
    )} ${roundCoord(stemY + 10)}`,
    `C ${clampX(stemX - 6, width)} ${roundCoord(stemY + 14)}, ${clampX(
      stemX - 2,
      width
    )} ${roundCoord(stemY + 6)}, ${stemX} ${stemY}`,
  ];

  return {
    width,
    height,
    startY,
    endY: stemY,
    d: segments.join(' '),
    isCompact,
    leaf: {
      x: stemX,
      y: stemY,
      scale: leafScale,
      tiltDeg: 22,
    },
  };
}
