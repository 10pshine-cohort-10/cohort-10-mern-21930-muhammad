import {
  DESKTOP_AUTH_CLIP_FRAMES,
  MOBILE_AUTH_CLIP_FRAMES,
} from '../components/auth/authClipPaths';

function extractCommandLetters(pathD: string): string[] {
  return pathD.match(/[MCLZ]/g) ?? [];
}

function countNumbers(pathD: string): number {
  return (pathD.match(/-?\d+(?:\.\d+)?/g) ?? []).length;
}

describe('authClipPaths', () => {
  it('keeps identical command letters and number counts across all 4 desktop frames', () => {
    const baseCommands = extractCommandLetters(DESKTOP_AUTH_CLIP_FRAMES[0]);
    const baseNumbers = countNumbers(DESKTOP_AUTH_CLIP_FRAMES[0]);

    expect(baseCommands).toEqual(['M', 'C', 'C', 'C', 'L', 'C', 'C', 'C', 'Z']);
    expect(baseNumbers).toBe(40);

    for (const frame of DESKTOP_AUTH_CLIP_FRAMES) {
      expect(extractCommandLetters(frame)).toEqual(baseCommands);
      expect(countNumbers(frame)).toBe(baseNumbers);
    }
  });

  it('keeps identical command letters and number counts across all 4 mobile frames', () => {
    const baseCommands = extractCommandLetters(MOBILE_AUTH_CLIP_FRAMES[0]);
    const baseNumbers = countNumbers(MOBILE_AUTH_CLIP_FRAMES[0]);

    expect(baseCommands).toEqual(['M', 'C', 'C', 'C', 'L', 'C', 'C', 'C', 'Z']);
    expect(baseNumbers).toBe(40);

    for (const frame of MOBILE_AUTH_CLIP_FRAMES) {
      expect(extractCommandLetters(frame)).toEqual(baseCommands);
      expect(countNumbers(frame)).toBe(baseNumbers);
    }
  });

  it('keeps resting desktop login (>= 0.50) and signup (<= 0.50) edges clear of active form inputs', () => {
    const loginNums = DESKTOP_AUTH_CLIP_FRAMES[0].match(/-?\d+(?:\.\d+)?/g)!.map(Number);
    // Leading edge occupies first 10 pairs (20 numbers)
    for (let i = 0; i < 20; i += 2) {
      expect(loginNums[i]).toBeGreaterThanOrEqual(0.5);
    }

    const signupNums = DESKTOP_AUTH_CLIP_FRAMES[3].match(/-?\d+(?:\.\d+)?/g)!.map(Number);
    // Trailing edge occupies second 10 pairs (indices 20..38)
    for (let i = 20; i < 40; i += 2) {
      expect(signupNums[i]).toBeLessThanOrEqual(0.5);
    }
  });
});
