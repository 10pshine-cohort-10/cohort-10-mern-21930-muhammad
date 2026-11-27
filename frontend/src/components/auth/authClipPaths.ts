export type ClipPoint = readonly [number, number];

export interface ClipBandEdge {
  start: ClipPoint;
  segments: readonly [
    readonly [ClipPoint, ClipPoint, ClipPoint],
    readonly [ClipPoint, ClipPoint, ClipPoint],
    readonly [ClipPoint, ClipPoint, ClipPoint],
  ];
}

function fmt(pt: ClipPoint): string {
  return `${pt[0]} ${pt[1]}`;
}

/**
 * Builds an objectBoundingBox SVG clip-path with identical command structure
 * (M + 3 C + L + 3 C + Z = 40 numbers) across all frames so Framer Motion
 * interpolates smoothly without pinching.
 */
export function buildClipBandPath(leading: ClipBandEdge, trailing: ClipBandEdge): string {
  const leadCurves = leading.segments
    .map(([c1, c2, end]) => `C ${fmt(c1)}, ${fmt(c2)}, ${fmt(end)}`)
    .join(' ');
  const trailCurves = trailing.segments
    .map(([c1, c2, end]) => `C ${fmt(c1)}, ${fmt(c2)}, ${fmt(end)}`)
    .join(' ');

  return `M ${fmt(leading.start)} ${leadCurves} L ${fmt(trailing.start)} ${trailCurves} Z`;
}

const DESKTOP_FULL_RIGHT: ClipBandEdge = {
  start: [1, 1],
  segments: [
    [[1, 0.82], [1, 0.66], [1, 0.5]],
    [[1, 0.34], [1, 0.18], [1, 0]],
    [[1, 0], [1, 0], [1, 0]],
  ],
};

const DESKTOP_FULL_LEFT: ClipBandEdge = {
  start: [0, 0],
  segments: [
    [[0, 0.18], [0, 0.34], [0, 0.5]],
    [[0, 0.66], [0, 0.82], [0, 1]],
    [[0, 1], [0, 1], [0, 1]],
  ],
};

export const DESKTOP_AUTH_CLIP_FRAMES: readonly [string, string, string, string] = [
  // Frame 0 (Login): strictly >= 0.50 so the art band never overlaps the left form inputs
  buildClipBandPath(
    {
      start: [0.54, 0],
      segments: [
        [[0.51, 0.18], [0.50, 0.36], [0.50, 0.48]],
        [[0.50, 0.56], [0.56, 0.58], [0.56, 0.68]],
        [[0.56, 0.78], [0.53, 0.90], [0.51, 1]],
      ],
    },
    DESKTOP_FULL_RIGHT
  ),

  // Frame 1 (Mid 1): 3-step staircase falling top-left to bottom-right
  buildClipBandPath(
    {
      start: [0.18, 0],
      segments: [
        [[0.24, 0.02], [0.22, 0.24], [0.30, 0.28]],
        [[0.40, 0.30], [0.38, 0.54], [0.46, 0.58]],
        [[0.56, 0.60], [0.54, 0.88], [0.64, 1]],
      ],
    },
    {
      start: [0.96, 1],
      segments: [
        [[0.94, 0.86], [0.88, 0.72], [0.84, 0.58]],
        [[0.78, 0.46], [0.74, 0.34], [0.68, 0.24]],
        [[0.62, 0.14], [0.58, 0.04], [0.54, 0]],
      ],
    }
  ),

  // Frame 2 (Mid 2): 3-step staircase rising bottom-left to top-right
  buildClipBandPath(
    {
      start: [0.46, 0],
      segments: [
        [[0.40, 0.14], [0.34, 0.26], [0.28, 0.38]],
        [[0.22, 0.50], [0.18, 0.62], [0.14, 0.74]],
        [[0.10, 0.84], [0.08, 0.92], [0.06, 1]],
      ],
    },
    {
      start: [0.42, 1],
      segments: [
        [[0.48, 0.88], [0.50, 0.74], [0.58, 0.66]],
        [[0.66, 0.58], [0.68, 0.44], [0.76, 0.34]],
        [[0.84, 0.24], [0.88, 0.10], [0.94, 0]],
      ],
    }
  ),

  // Frame 3 (Signup): strictly <= 0.50 so the art band never overlaps the right form inputs
  buildClipBandPath(DESKTOP_FULL_LEFT, {
    start: [0.49, 1],
    segments: [
      [[0.50, 0.86], [0.50, 0.74], [0.45, 0.62]],
      [[0.44, 0.52], [0.50, 0.42], [0.50, 0.32]],
      [[0.50, 0.20], [0.48, 0.10], [0.46, 0]],
    ],
  }),
];

const MOBILE_TOP_EDGE: ClipBandEdge = {
  start: [0, 0],
  segments: [
    [[0.33, 0], [0.67, 0], [1, 0]],
    [[1, 0], [1, 0], [1, 0]],
    [[1, 0], [1, 0], [1, 0]],
  ],
};

export const MOBILE_AUTH_CLIP_FRAMES: readonly [string, string, string, string] = [
  // Frame 0 (Login): top band kept <= 0.31 above row 2 inputs
  buildClipBandPath(MOBILE_TOP_EDGE, {
    start: [1, 0.28],
    segments: [
      [[0.82, 0.30], [0.72, 0.26], [0.60, 0.27]],
      [[0.48, 0.28], [0.40, 0.31], [0.28, 0.30]],
      [[0.18, 0.29], [0.08, 0.27], [0, 0.28]],
    ],
  }),

  // Frame 1 (Mid 1): 3-step wave band descending left to right
  buildClipBandPath(
    {
      start: [0, 0.14],
      segments: [
        [[0.18, 0.14], [0.26, 0.24], [0.38, 0.26]],
        [[0.52, 0.28], [0.58, 0.38], [0.70, 0.40]],
        [[0.82, 0.42], [0.90, 0.48], [1, 0.52]],
      ],
    },
    {
      start: [1, 0.92],
      segments: [
        [[0.84, 0.90], [0.74, 0.82], [0.62, 0.78]],
        [[0.48, 0.74], [0.40, 0.66], [0.28, 0.62]],
        [[0.18, 0.58], [0.08, 0.54], [0, 0.52]],
      ],
    }
  ),

  // Frame 2 (Mid 2): 3-step wave band rising left to right
  buildClipBandPath(
    {
      start: [0, 0.52],
      segments: [
        [[0.14, 0.50], [0.24, 0.40], [0.36, 0.38]],
        [[0.50, 0.36], [0.60, 0.26], [0.72, 0.24]],
        [[0.84, 0.22], [0.92, 0.16], [1, 0.14]],
      ],
    },
    {
      start: [1, 0.54],
      segments: [
        [[0.86, 0.58], [0.76, 0.64], [0.64, 0.68]],
        [[0.50, 0.72], [0.40, 0.80], [0.28, 0.84]],
        [[0.16, 0.88], [0.08, 0.92], [0, 0.94]],
      ],
    }
  ),

  // Frame 3 (Signup): top band mirrored wave kept <= 0.31
  buildClipBandPath(MOBILE_TOP_EDGE, {
    start: [1, 0.28],
    segments: [
      [[0.88, 0.27], [0.76, 0.31], [0.64, 0.30]],
      [[0.54, 0.29], [0.44, 0.26], [0.32, 0.27]],
      [[0.20, 0.28], [0.10, 0.30], [0, 0.28]],
    ],
  }),
];
