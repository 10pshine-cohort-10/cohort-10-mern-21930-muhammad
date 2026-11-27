import {
  ART_VIEWBOX,
  SQUIGGLE_PATH,
  CARD_OUTLINE_PATH,
  BOARD_TRACK_PATH,
  DOT_POSITIONS,
  DOT_COLORS,
  MINI_CARD_PATH,
  RISING_LINE_PATH,
  LEAF_OUTLINE_PATH,
  LEAF_VEIN_PATH,
  TILTS,
  CARD_HOP_X,
  GRADIENT_BLUE,
  GRADIENT_ORANGE,
} from '../components/auth/authArtPaths';

describe('authArtPaths', () => {
  it('defines a valid SVG viewBox', () => {
    const parts = ART_VIEWBOX.split(' ').map(Number);
    expect(parts).toHaveLength(4);
    expect(parts[2]).toBe(160);
    expect(parts[3]).toBe(120);
  });

  it('provides valid cubic bezier paths starting with M', () => {
    const paths = [SQUIGGLE_PATH, CARD_OUTLINE_PATH, BOARD_TRACK_PATH, RISING_LINE_PATH, LEAF_OUTLINE_PATH];
    for (const path of paths) {
      expect(path).toMatch(/^M\s/);
      expect(path.length).toBeGreaterThan(10);
    }
  });

  it('has three dot positions matching three colors and three hop targets', () => {
    expect(DOT_POSITIONS).toHaveLength(3);
    expect(DOT_COLORS).toHaveLength(3);
    expect(CARD_HOP_X).toHaveLength(3);
    expect(DOT_POSITIONS[0].cx).toBe(CARD_HOP_X[0]);
    expect(DOT_POSITIONS[2].cx).toBe(CARD_HOP_X[2]);
  });

  it('computes deterministic tilts from string IDs', () => {
    expect(typeof TILTS.capture).toBe('number');
    expect(typeof TILTS.board).toBe('number');
    expect(typeof TILTS.progress).toBe('number');
    expect(TILTS.capture).not.toBe(0);
  });

  it('uses correct brand gradient colors', () => {
    expect(GRADIENT_BLUE).toBe('#0ea5e9');
    expect(GRADIENT_ORANGE).toBe('#f97316');
  });

  it('mini card and leaf paths are closed shapes', () => {
    expect(MINI_CARD_PATH).toMatch(/Z$/);
    expect(LEAF_OUTLINE_PATH).toMatch(/Z$/);
  });

  it('leaf vein is an open line', () => {
    expect(LEAF_VEIN_PATH).toMatch(/^M/);
    expect(LEAF_VEIN_PATH).not.toMatch(/Z$/);
  });
});
