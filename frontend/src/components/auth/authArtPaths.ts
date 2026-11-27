import { BRAND_COLOR_TOKENS } from '../../brand/leafGeometry';
import { getNoteTilt } from '../../utils/noteTilt';

export const ART_VIEWBOX = '0 0 160 120';

export const SQUIGGLE_PATH =
  'M 18 58 C 34 32, 50 76, 68 44 C 84 22, 102 68, 122 46';

export const CARD_OUTLINE_PATH =
  'M 26 24 C 62 21, 98 25, 134 22 C 137 54, 133 84, 135 104 C 96 107, 60 103, 24 105 C 22 76, 25 48, 26 24 Z';

export const BOARD_TRACK_PATH =
  'M 24 64 C 58 61, 100 68, 136 63';

export const DOT_POSITIONS = [
  { cx: 24, cy: 64 },
  { cx: 80, cy: 65 },
  { cx: 136, cy: 63 },
] as const;

export const DOT_COLORS = [
  BRAND_COLOR_TOKENS.subtle,
  BRAND_COLOR_TOKENS.blue,
  BRAND_COLOR_TOKENS.orange,
] as const;
export const DOT_LABELS = ['To Do', 'In Progress', 'Done'] as const;

export const MINI_CARD_PATH =
  'M -14 -10 C -4 -12, 6 -11, 14 -10 C 15 -2, 14 6, 15 10 C 5 12, -5 11, -14 10 C -15 4, -14 -4, -14 -10 Z';

export const RISING_LINE_PATH =
  'M 16 96 C 40 88, 54 70, 78 66 C 98 62, 110 42, 126 30';

export const LEAF_OUTLINE_PATH =
  'M 0 0 C -12 -6, -14 -24, 0 -38 C 14 -24, 12 -6, 0 0 Z';

export const LEAF_VEIN_PATH = 'M 0 0 L 0 -32';

export const TILTS = {
  capture: getNoteTilt('auth-capture'),
  board: getNoteTilt('auth-board'),
  progress: getNoteTilt('auth-progress'),
} as const;

export const CARD_HOP_X = [24, 80, 136] as const;

export const GRADIENT_BLUE = BRAND_COLOR_TOKENS.blue;
export const GRADIENT_ORANGE = BRAND_COLOR_TOKENS.orange;
export const ORANGE_TINT_FILL = BRAND_COLOR_TOKENS.orangeTint;
export const SAGE_FILL = 'rgba(242, 247, 243, 0.65)';
export const PUSHPIN_RED = BRAND_COLOR_TOKENS.pinRed;
