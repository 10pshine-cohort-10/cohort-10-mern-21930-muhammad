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
});
