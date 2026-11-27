import { getNoteTilt, NOTE_PINNED_TILT_DEG } from '../utils/noteTilt';

describe('noteTilt', () => {
  it('returns deterministic tilt for the same note id', () => {
    const first = getNoteTilt('note-abc-123');
    const second = getNoteTilt('note-abc-123');
    expect(first).toBe(second);
    expect(Math.abs(first)).toBeLessThanOrEqual(1.2);
    expect(first).not.toBe(0);
  });

  it('falls back to NOTE_PINNED_TILT_DEG when id is missing', () => {
    expect(getNoteTilt()).toBe(NOTE_PINNED_TILT_DEG);
  });
});
