export interface LeafletPair {
  left: string;
  right: string;
  isTerminal?: boolean;
}

export const PINNATE_MARK_VIEWBOX = '0 0 32 32';

export const PINNATE_COMPACT_VEIN = 'M 16 25 L 16 7';

export const PINNATE_COMPACT_PAIR_PATHS: readonly LeafletPair[] = [
  {
    left: 'M 16 20 C 11.8 19.6, 9.3 17.5, 8.5 14.8 C 12 14.4, 14.6 16.2, 16 20 Z',
    right: 'M 16 20 C 20.2 19.6, 22.7 17.5, 23.5 14.8 C 20 14.4, 17.4 16.2, 16 20 Z',
  },
  {
    left: 'M 16 13.4 C 12.4 13.1, 10.3 11.4, 9.7 8.9 C 12.6 8.6, 14.9 10.2, 16 13.4 Z',
    right: 'M 16 13.4 C 19.6 13.1, 21.7 11.4, 22.3 8.9 C 19.4 8.6, 17.1 10.2, 16 13.4 Z',
    isTerminal: true,
  },
];

export const PINNATE_FULL_VEIN = 'M 16 25.5 C 15.8 19, 16.1 12.5, 16 6.5';

export const PINNATE_FULL_PAIR_PATHS: readonly LeafletPair[] = [
  {
    left: 'M 16 22 C 11.5 21.6, 8.9 19.5, 8.2 16.9 C 11.8 16.5, 14.4 18.4, 16 22 Z',
    right: 'M 16 22 C 20.5 21.6, 23.1 19.5, 23.8 16.9 C 20.2 16.5, 17.6 18.4, 16 22 Z',
  },
  {
    left: 'M 16 16.4 C 11.8 16, 9.5 14.1, 8.9 11.6 C 12.2 11.3, 14.6 13, 16 16.4 Z',
    right: 'M 16 16.4 C 20.2 16, 22.5 14.1, 23.1 11.6 C 19.8 11.3, 17.4 13, 16 16.4 Z',
  },
  {
    left: 'M 16 11 C 12.7 10.7, 10.9 9.2, 10.3 7 C 12.9 6.8, 14.9 8.2, 16 11 Z',
    right: 'M 16 11 C 19.3 10.7, 21.1 9.2, 21.7 7 C 19.1 6.8, 17.1 8.2, 16 11 Z',
    isTerminal: true,
  },
];

export const BRAND_COLOR_TOKENS = {
  paper: '#fafafa',
  surface: '#ffffff',
  ink: '#18181b',
  blue: '#0ea5e9',
  orange: '#f97316',
  orangeTint: 'rgba(249, 115, 22, 0.14)',
  subtle: '#5c5c66',
  pinRed: '#ef4444',
} as const;
