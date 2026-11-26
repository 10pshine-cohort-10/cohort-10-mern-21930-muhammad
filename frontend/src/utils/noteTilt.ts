export const NOTE_PINNED_TILT_DEG = -1.2;

const TILT_PRESETS_DEG = [-1.2, -0.7, 0.7, 1.2] as const;

export function getNoteTilt(noteId?: string): number {
  if (!noteId) return NOTE_PINNED_TILT_DEG;
  let hash = 0;
  for (let i = 0; i < noteId.length; i += 1) {
    hash = (hash * 31 + noteId.charCodeAt(i)) | 0;
  }
  return TILT_PRESETS_DEG[Math.abs(hash) % TILT_PRESETS_DEG.length];
}
