import { getActivitySeries, getLastUpdatedSummary, getPlanBreakdown } from '../utils/noteMetrics';
import type { Note } from '../types';

const makeNote = (overrides: Partial<Note> = {}): Note => ({
  id: 'n1',
  userId: 'u1',
  title: 'Test Note',
  content: '<p>Body</p>',
  color: 'slate',
  status: null,
  isPinned: false,
  tags: [],
  createdAt: '2026-11-26T08:00:00.000Z',
  updatedAt: '2026-11-26T09:00:00.000Z',
  ...overrides,
});

describe('noteMetrics', () => {
  it('computes 7-day activity series and active days', () => {
    const now = new Date('2026-11-26T12:00:00.000Z');
    const notes = [
      makeNote({ id: '1', updatedAt: '2026-11-26T10:00:00.000Z' }),
      makeNote({ id: '2', updatedAt: '2026-11-26T11:00:00.000Z' }),
      makeNote({ id: '3', updatedAt: '2026-11-24T10:00:00.000Z' }),
    ];

    const summary = getActivitySeries(notes, 7, now);
    expect(summary.series).toHaveLength(7);
    expect(summary.activeDays).toBe(2);
    expect(summary.totalActions).toBe(3);
  });

  it('computes Kanban plan breakdown and completion rate', () => {
    const notes = [
      makeNote({ id: '1', status: 'todo' }),
      makeNote({ id: '2', status: 'in_progress' }),
      makeNote({ id: '3', status: 'done' }),
      makeNote({ id: '4', status: 'done' }),
      makeNote({ id: '5', status: null }),
    ];

    const breakdown = getPlanBreakdown(notes);
    expect(breakdown).toEqual({
      todo: 1,
      inProgress: 1,
      done: 2,
      totalTracked: 4,
      completionRate: 50,
    });
  });

  it('excludes archived notes from activity series, plan breakdown, and summary', () => {
    const now = new Date('2026-11-26T12:00:00.000Z');
    const archivedDone = makeNote({ id: 'arch', status: 'done', tags: ['archive'], updatedAt: '2026-11-26T10:00:00.000Z' });
    const summary = getLastUpdatedSummary([archivedDone]);
    expect(summary.latestNote).toBeNull();
    expect(summary.relativeLabel).toBe('No notes yet');
    expect(getActivitySeries([archivedDone], 7, now).totalActions).toBe(0);
    expect(getPlanBreakdown([archivedDone]).totalTracked).toBe(0);
  });
});
