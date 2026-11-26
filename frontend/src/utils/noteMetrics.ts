import { formatRelativeTime } from './formatters';
import type { Note } from '../types';

export interface DailyActivityPoint {
  dateKey: string;
  label: string;
  count: number;
}

export interface ActivitySummary {
  series: DailyActivityPoint[];
  activeDays: number;
  totalActions: number;
}

export interface PlanBreakdown {
  todo: number;
  inProgress: number;
  done: number;
  totalTracked: number;
  completionRate: number;
}

function toLocalDateKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function getLastUpdatedSummary(notes: Note[]): {
  latestNote: Note | null;
  relativeLabel: string;
  encouragement: string;
} {
  const activeNotes = notes.filter((n) => !(Array.isArray(n.tags) && n.tags.includes('archive')));
  if (activeNotes.length === 0) {
    return {
      latestNote: null,
      relativeLabel: 'No notes yet',
      encouragement: 'Your workspace is ready whenever an idea strikes.',
    };
  }

  const sorted = [...activeNotes].sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  );
  const latestNote = sorted[0];
  const relativeLabel = formatRelativeTime(latestNote.updatedAt);

  return {
    latestNote,
    relativeLabel,
    encouragement: `Last updated ${relativeLabel} — steady momentum.`,
  };
}

export function getActivitySeries(notes: Note[], days: 7 | 30, now: Date = new Date()): ActivitySummary {
  const countsByDay = new Map<string, number>();
  const series: DailyActivityPoint[] = [];

  for (let i = days - 1; i >= 0; i -= 1) {
    const day = new Date(now);
    day.setHours(0, 0, 0, 0);
    day.setDate(day.getDate() - i);
    const key = toLocalDateKey(day);
    countsByDay.set(key, 0);
    const label = days === 7
      ? day.toLocaleDateString('en-US', { weekday: 'short' })
      : day.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    series.push({ dateKey: key, label, count: 0 });
  }

  for (const note of notes) {
    const updatedKey = toLocalDateKey(new Date(note.updatedAt));
    if (countsByDay.has(updatedKey)) {
      countsByDay.set(updatedKey, (countsByDay.get(updatedKey) || 0) + 1);
    }
  }

  let activeDays = 0;
  let totalActions = 0;
  for (const point of series) {
    point.count = countsByDay.get(point.dateKey) || 0;
    if (point.count > 0) activeDays += 1;
    totalActions += point.count;
  }

  return { series, activeDays, totalActions };
}

export function getPlanBreakdown(notes: Note[]): PlanBreakdown {
  let todo = 0;
  let inProgress = 0;
  let done = 0;

  for (const note of notes) {
    if (note.status === 'todo') todo += 1;
    else if (note.status === 'in_progress') inProgress += 1;
    else if (note.status === 'done') done += 1;
  }

  const totalTracked = todo + inProgress + done;
  const completionRate = totalTracked > 0 ? Math.round((done / totalTracked) * 100) : 0;
  return { todo, inProgress, done, totalTracked, completionRate };
}
