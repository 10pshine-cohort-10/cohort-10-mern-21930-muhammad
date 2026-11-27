export const EASE_TACTILE = [0.16, 1, 0.3, 1] as const;
export const EASE_MORPH = [0.65, 0, 0.35, 1] as const;
export const EASE_REVEAL = [0.22, 1, 0.36, 1] as const;

export const SPRING_PIN_SETTLE = {
  stiffness: 260,
  damping: 14,
  mass: 0.5,
} as const;

export const BREATH_LEAF_TRANSITION = {
  duration: 5.5,
  repeat: Infinity,
  ease: 'easeInOut' as const,
};

export const REDUCED_FADE_DURATION = 0.15;
