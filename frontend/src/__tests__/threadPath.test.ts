import { buildThreadGeometry, type RectBox, type ThreadAnchorRects } from '../components/landing/threadPath';

function makeRect(left: number, top: number, width: number, height: number): RectBox {
  return {
    left,
    top,
    width,
    height,
    right: left + width,
    bottom: top + height,
  };
}

function makeAnchors(canvasWidth: number): ThreadAnchorRects {
  const isMobile = canvasWidth <= 768;
  const heroCopy = isMobile
    ? makeRect(20, 40, canvasWidth - 40, 260)
    : makeRect((canvasWidth - 1160) / 2, 140, 560, 320);
  const heroStage = isMobile
    ? makeRect(20, 328, canvasWidth - 40, 240)
    : makeRect((canvasWidth - 1160) / 2 + 608, 120, 552, 280);

  const featuresTop = isMobile ? 640 : 620;
  const innerWidth = canvasWidth < 1024 ? canvasWidth - 40 : 860;
  const innerLeft = (canvasWidth - innerWidth) / 2;
  const ctaWidth = Math.min(560, canvasWidth - 48);
  const ctaTop = featuresTop + 720;

  return {
    canvas: makeRect(0, 0, canvasWidth, ctaTop + 380),
    heroCopy,
    heroStage,
    featuresSection: makeRect(0, featuresTop, canvasWidth, 620),
    featuresInner: makeRect(innerLeft, featuresTop + 72, innerWidth, 452),
    ctaCard: makeRect((canvasWidth - ctaWidth) / 2, ctaTop, ctaWidth, 240),
  };
}

function extractPathXCoords(pathD: string): number[] {
  const commands = pathD.match(/[MC][^MC]*/g) ?? [];
  const xCoords: number[] = [];
  for (const command of commands) {
    const numbers = command
      .slice(1)
      .trim()
      .split(/[\s,]+/)
      .map(Number);
    for (let index = 0; index < numbers.length; index += 2) {
      if (!Number.isNaN(numbers[index])) {
        xCoords.push(numbers[index]);
      }
    }
  }
  return xCoords;
}

describe('buildThreadGeometry', () => {
  it.each([1440, 768, 375])('keeps all path coordinates inside viewport bounds at %ipx width', (width) => {
    const anchors = makeAnchors(width);
    const geometry = buildThreadGeometry(anchors);
    const xCoords = extractPathXCoords(geometry.d);

    expect(xCoords.length).toBeGreaterThan(0);
    for (const x of xCoords) {
      expect(x).toBeGreaterThanOrEqual(10);
      expect(x).toBeLessThanOrEqual(width - 10);
    }

    const bottomDistance = geometry.height - geometry.leaf.y;
    expect(bottomDistance).toBeGreaterThanOrEqual(24);
    expect(bottomDistance).toBeLessThanOrEqual(48);
    expect(geometry.d.endsWith(`${geometry.leaf.x} ${geometry.leaf.y}`)).toBe(true);
  });

  it('starts in the desktop right gap beside hero stage and clears below hero copy', () => {
    const anchors = makeAnchors(1440);
    const geometry = buildThreadGeometry(anchors);

    expect(geometry.isCompact).toBe(false);
    expect(geometry.leaf.scale).toBe(1);
    expect(geometry.startY).toBeGreaterThanOrEqual(anchors.heroStage.top);
    expect(geometry.d.startsWith('M 1336 ')).toBe(true);
  });

  it('uses compact styling and scaled leaf on 375px mobile width', () => {
    const anchors = makeAnchors(375);
    const geometry = buildThreadGeometry(anchors);

    expect(geometry.isCompact).toBe(true);
    expect(geometry.leaf.scale).toBe(0.85);
    expect(geometry.leaf.x).toBeLessThan(375);
  });
});
