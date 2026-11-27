import { extractPlainText } from './formatters';
import type { Note } from '../types';

export type ExportFormat = 'json' | 'markdown' | 'txt';
export type ExportScope = 'single' | 'selected' | 'folder' | 'all';

function slugify(value: string): string {
  const cleaned = value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 40);
  return cleaned || 'note';
}

export function buildExportFilename(
  scope: ExportScope,
  format: ExportFormat,
  label?: string
): string {
  const ext = format === 'markdown' ? 'md' : format;
  const dateStamp = new Date().toISOString().slice(0, 10);

  if (scope === 'single' && label) {
    return `${slugify(label)}-${dateStamp}.${ext}`;
  }
  if (scope === 'folder' && label) {
    return `notes-${slugify(label)}-${dateStamp}.${ext}`;
  }
  if (scope === 'selected') {
    return `notes-selected-${dateStamp}.${ext}`;
  }
  return `notes-all-${dateStamp}.${ext}`;
}

export function serializeNotesToJson(notes: Note[]): string {
  const cleanPayload = notes.map((n) => ({
    title: n.title || 'Untitled',
    content: n.content || '',
    color: n.color || 'slate',
    status: n.status ?? null,
    isPinned: Boolean(n.isPinned),
    tags: Array.isArray(n.tags) ? n.tags : [],
    createdAt: n.createdAt,
    updatedAt: n.updatedAt,
  }));
  return JSON.stringify(cleanPayload, null, 2);
}

export function serializeNotesToMarkdown(notes: Note[]): string {
  return notes
    .map((n) => {
      const plainText = extractPlainText(n.content || '');
      const tagLine = Array.isArray(n.tags) && n.tags.length ? `\nTags: ${n.tags.join(', ')}` : '';
      const updated = n.updatedAt || n.createdAt || new Date().toISOString();
      return `# ${n.title || 'Untitled'}\n*Updated: ${updated}*${tagLine}\n\n${plainText}\n\n---`;
    })
    .join('\n\n');
}

export function serializeNotesToText(notes: Note[]): string {
  return notes
    .map((n) => {
      const plainText = extractPlainText(n.content || '');
      const tags = Array.isArray(n.tags) && n.tags.length ? `[${n.tags.map((t) => `#${t}`).join(' ')}]\n` : '';
      return `${n.title || 'Untitled'}\n${tags}${plainText}`;
    })
    .join('\n\n----------------------------------------\n\n');
}

export function downloadExportedNotes(
  notes: Note[],
  format: ExportFormat,
  scope: ExportScope,
  label?: string
): void {
  let content = '';
  let mimeType = 'application/json; charset=utf-8';

  if (format === 'markdown') {
    content = serializeNotesToMarkdown(notes);
    mimeType = 'text/markdown; charset=utf-8';
  } else if (format === 'txt') {
    content = serializeNotesToText(notes);
    mimeType = 'text/plain; charset=utf-8';
  } else {
    content = serializeNotesToJson(notes);
  }

  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = buildExportFilename(scope, format, label);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
