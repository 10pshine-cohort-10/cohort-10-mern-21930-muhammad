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
  heroPin: RectBox;
  featuresSection: RectBox;
  featuresInner: RectBox;
  ctaCard: RectBox;
  ctaPin: RectBox;
}

export interface ThreadGeometry {
  width: number;
  height: number;
  startY: number;
  endY: number;
  d: string;
  hasLoop: boolean;
  isCompact: boolean;
}

const COMPACT_BREAKPOINT = 1024;
const MIN_LOOP_GAP_HEIGHT = 64;

function getRelativeCenter(box: RectBox, canvas: RectBox): Point {
  return {
    x: box.left + box.width / 2 - canvas.left,
    y: box.top + box.height / 2 - canvas.top,
  };
}

function roundCoord(value: number): number {
  return Math.round(value * 10) / 10;
}

function buildLoopSegment(
  gutterX: number,
  gapTop: number,
  ctaPin: Point,
  gapHeight: number,
  canvasWidth: number,
  isCompact: boolean
): { segment: string; hasLoop: boolean } {
  if (gapHeight < MIN_LOOP_GAP_HEIGHT) {
    const midY = (gapTop + ctaPin.y) / 2;
    return {
      hasLoop: false,
      segment: `C ${roundCoord(gutterX)} ${roundCoord(midY)}, ${roundCoord(ctaPin.x)} ${roundCoord(midY)}, ${roundCoord(ctaPin.x)} ${roundCoord(ctaPin.y)}`,
    };
  }

  const loopCy = gapTop + gapHeight * 0.52;
  const targetCenterX = isCompact
    ? Math.min(canvasWidth * 0.44, Math.max(gutterX + 54, ctaPin.x * 0.65))
    : Math.max(gutterX + 120, Math.min(ctaPin.x - 40, canvasWidth * 0.46));

  const ry = isCompact ? Math.min(20, gapHeight * 0.22) : Math.min(36, gapHeight * 0.25);
  const rx = isCompact
    ? Math.min(24, canvasWidth * 0.08)
    : Math.min(44, Math.abs(targetCenterX - gutterX) * 0.32);

  const inX = targetCenterX - rx * 0.9;
  const inY = loopCy + ry * 0.45;
  const outX = targetCenterX + rx * 0.95;
  const outY = loopCy + ry * 0.35;

  const enterCurve = `C ${roundCoord(gutterX)} ${roundCoord(gapTop + gapHeight * 0.36)}, ${roundCoord(inX - rx * 0.7)} ${roundCoord(inY + ry * 0.35)}, ${roundCoord(inX)} ${roundCoord(inY)}`;

  const loopArc1 = `C ${roundCoord(targetCenterX - rx * 0.15)} ${roundCoord(loopCy + ry * 0.95)}, ${roundCoord(targetCenterX + rx)} ${roundCoord(loopCy + ry * 0.55)}, ${roundCoord(targetCenterX + rx * 0.85)} ${roundCoord(loopCy - ry * 0.25)}`;
  const loopArc2 = `C ${roundCoord(targetCenterX + rx * 0.7)} ${roundCoord(loopCy - ry)}, ${roundCoord(targetCenterX - rx * 0.55)} ${roundCoord(loopCy - ry * 0.95)}, ${roundCoord(targetCenterX - rx * 0.35)} ${roundCoord(loopCy + ry * 0.18)}`;
  const loopArc3 = `C ${roundCoord(targetCenterX - rx * 0.18)} ${roundCoord(loopCy + ry * 0.85)}, ${roundCoord(targetCenterX + rx * 0.5)} ${roundCoord(loopCy + ry * 0.85)}, ${roundCoord(outX)} ${roundCoord(outY)}`;

  const exitCtrlY = (outY + ctaPin.y) / 2;
  const exitCurve = `C ${roundCoord(outX + rx * 0.6)} ${roundCoord(exitCtrlY)}, ${roundCoord(ctaPin.x)} ${roundCoord(exitCtrlY - 12)}, ${roundCoord(ctaPin.x)} ${roundCoord(ctaPin.y)}`;

  return {
    hasLoop: true,
    segment: `${enterCurve} ${loopArc1} ${loopArc2} ${loopArc3} ${exitCurve}`,
  };
}

/**
 * Generates a single document-space SVG path that leaves the hero pushpin,
 * routes through the desktop left gutter without crossing content, draws one
 * loop in the gap before the closing card, and terminates on the CTA pushpin.
 */
export function buildThreadGeometry(rects: ThreadAnchorRects): ThreadGeometry {
  const { canvas, heroPin, featuresSection, featuresInner, ctaCard, ctaPin } = rects;
  const width = Math.max(1, Math.round(canvas.width));
  const height = Math.max(1, Math.round(canvas.height));
  const isCompact = width < COMPACT_BREAKPOINT;

  const start = getRelativeCenter(heroPin, canvas);
  const end = getRelativeCenter(ctaPin, canvas);

  const featuresInnerLeft = featuresInner.left - canvas.left;
  const gutterX = isCompact
    ? 10
    : featuresInnerLeft > 56
      ? Math.max(24, Math.min(48, featuresInnerLeft - 28))
      : Math.max(16, featuresInnerLeft * 0.5);

  const featuresTop = featuresSection.top - canvas.top;
  const featuresBottom = featuresSection.bottom - canvas.top;
  const ctaCardTop = ctaCard.top - canvas.top;

  const featuresEnterY = Math.max(start.y + 48, featuresTop + 20);
  const heroSwingY = Math.max(start.y + 28, featuresTop - 44);
  const featuresExitY = Math.max(featuresEnterY + 24, featuresBottom - 16);
  const gapBottom = Math.max(featuresExitY + 16, ctaCardTop - 12);
  const gapHeight = gapBottom - featuresExitY;

  const startSegment = `M ${roundCoord(start.x)} ${roundCoord(start.y)} C ${roundCoord(start.x)} ${roundCoord(heroSwingY)}, ${roundCoord(gutterX)} ${roundCoord(heroSwingY)}, ${roundCoord(gutterX)} ${roundCoord(featuresEnterY)}`;
  const gutterSegment = `L ${roundCoord(gutterX)} ${roundCoord(featuresExitY)}`;

  const { segment: loopToEndSegment, hasLoop } = buildLoopSegment(
    gutterX,
    featuresExitY,
    end,
    gapHeight,
    width,
    isCompact
  );

  return {
    width,
    height,
    startY: roundCoord(start.y),
    endY: roundCoord(end.y),
    d: `${startSegment} ${gutterSegment} ${loopToEndSegment}`,
    hasLoop,
    isCompact,
  };
}
