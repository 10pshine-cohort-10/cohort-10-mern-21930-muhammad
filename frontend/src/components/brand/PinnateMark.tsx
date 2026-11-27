import {
  BRAND_COLOR_TOKENS,
  PINNATE_COMPACT_PAIR_PATHS,
  PINNATE_COMPACT_VEIN,
  PINNATE_FULL_PAIR_PATHS,
  PINNATE_FULL_VEIN,
  PINNATE_MARK_VIEWBOX,
} from '../../brand/leafGeometry';
import styles from './PinnateMark.module.css';

export interface PinnateMarkProps {
  size?: number;
  tone?: 'color' | 'mono';
  surface?: 'dark' | 'light';
  withContainer?: boolean;
  decorative?: boolean;
}

/** Pinnate botanical mark: central vein + paired leaflets, with orange terminal Done leaflet. */
export default function PinnateMark({
  size = 32,
  tone = 'color',
  surface = 'dark',
  withContainer = true,
  decorative = true,
}: PinnateMarkProps) {
  const isCompact = size <= 20;
  const veinPath = isCompact ? PINNATE_COMPACT_VEIN : PINNATE_FULL_VEIN;
  const pairs = isCompact ? PINNATE_COMPACT_PAIR_PATHS : PINNATE_FULL_PAIR_PATHS;

  const isDarkContainer = withContainer && surface === 'dark';
  const strokeColor = isDarkContainer ? BRAND_COLOR_TOKENS.paper : BRAND_COLOR_TOKENS.ink;
  const terminalColor = tone === 'color' ? BRAND_COLOR_TOKENS.orange : strokeColor;
  const iconSize = withContainer ? Math.max(14, Math.round(size * 0.72)) : size;

  const svg = (
    <svg
      width={iconSize}
      height={iconSize}
      viewBox={PINNATE_MARK_VIEWBOX}
      fill="none"
      aria-hidden={decorative ? 'true' : undefined}
      role={decorative ? undefined : 'img'}
      aria-label={decorative ? undefined : 'Pinnate'}
      data-testid="pinnate-mark"
      data-variant={isCompact ? 'compact-2-pair' : 'full-3-pair'}
    >
      <path d={veinPath} stroke={strokeColor} strokeWidth={2} strokeLinecap="round" />
      {pairs.map((pair, idx) => (
        <g key={idx}>
          <path
            d={pair.left}
            fill="none"
            stroke={strokeColor}
            strokeWidth={1.75}
            strokeLinejoin="round"
          />
          <path
            d={pair.right}
            fill={pair.isTerminal ? terminalColor : 'none'}
            stroke={pair.isTerminal ? terminalColor : strokeColor}
            strokeWidth={pair.isTerminal ? 1.5 : 1.75}
            strokeLinejoin="round"
          />
        </g>
      ))}
    </svg>
  );

  if (!withContainer) {
    return svg;
  }

  return (
    <span
      className={`${styles.container} ${isDarkContainer ? styles.containerDark : styles.containerLight}`}
      style={{ width: size, height: size }}
      aria-hidden={decorative ? 'true' : undefined}
    >
      {svg}
    </span>
  );
}
