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

function makeBaseAnchors(canvasWidth = 1280, ctaTop = 1650): ThreadAnchorRects {
  const innerLeft = canvasWidth < 1024 ? 20 : (canvasWidth - 860) / 2;
  const innerWidth = canvasWidth < 1024 ? canvasWidth - 40 : 860;

  return {
    canvas: makeRect(0, 0, canvasWidth, ctaTop + 420),
    heroPin: makeRect(canvasWidth * 0.65, 220, 18, 18),
    featuresSection: makeRect(0, 820, canvasWidth, 660),
    featuresInner: makeRect(innerLeft, 892, innerWidth, 492),
    ctaCard: makeRect((canvasWidth - Math.min(560, canvasWidth - 48)) / 2, ctaTop, Math.min(560, canvasWidth - 48), 280),
    ctaPin: makeRect((canvasWidth - Math.min(560, canvasWidth - 48)) / 2 + 40, ctaTop - 14, 22, 22),
  };
}

describe('buildThreadGeometry', () => {
  it('routes through the desktop left gutter and includes a gap loop between sections', () => {
    const anchors = makeBaseAnchors(1280, 1650);
    const geometry = buildThreadGeometry(anchors);

    expect(geometry.isCompact).toBe(false);
    expect(geometry.hasLoop).toBe(true);
    expect(geometry.width).toBe(1280);

    // Starts near hero pin center (1280 * 0.65 + 9 = 841, 229) and ends near CTA pin center
    expect(geometry.d.startsWith('M 841 229 ')).toBe(true);
    expect(geometry.d.endsWith('411 1647')).toBe(true);

    // Vertical gutter segment stays safely left of featuresInner (210px)
    expect(geometry.d).toContain('L 48 1464');
  });

  it('omits the loop when vertical gap before CTA is smaller than threshold', () => {
    const anchors = makeBaseAnchors(1280, 1500);
    const geometry = buildThreadGeometry(anchors);

    expect(geometry.hasLoop).toBe(false);
    expect(geometry.d).toContain('L 48 1464');
  });

  it('uses compact left-edge styling and narrower radii on mobile viewports', () => {
    const anchors = makeBaseAnchors(375, 1650);
    const geometry = buildThreadGeometry(anchors);

    expect(geometry.isCompact).toBe(true);
    expect(geometry.hasLoop).toBe(true);
    expect(geometry.d).toContain('L 10 1464');
  });
});
