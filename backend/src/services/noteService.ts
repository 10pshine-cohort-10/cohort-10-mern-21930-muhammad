import { Types } from 'mongoose';
import Note from '../models/Note';
import AppError from '../utils/appError';
import { emitNoteChange } from '../socket/noteSocket';
import { INote, NoteCreateInput, NoteUpdateInput, ExportResult, NoteColor } from '../types';

const ALLOWED_TAGS = new Set([
  'p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
  'ul', 'ol', 'li', 'blockquote', 'pre', 'code',
  'br', 'strong', 'em', 's', 'hr',
]);

export function sanitizeHtml(content?: string): string {
  if (typeof content !== 'string') {
    return '';
  }

  let current = content;
  let previous = '';

  while (current !== previous) {
    previous = current;

    current = current
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
      .replace(/<\/?([a-zA-Z][a-zA-Z0-9]*)\b[^>]*>/gi, (fullMatch: string, tagName: string) => {
        const lower = tagName.toLowerCase();
        if (!ALLOWED_TAGS.has(lower)) {
          return '';
        }
        return fullMatch.startsWith('</') ? `</${lower}>` : `<${lower}>`;
      });
  }

  return current;
}

export function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export async function getNotes(userId: string | Types.ObjectId, options: { tag?: string } = {}): Promise<any[]> {
  const filter: Record<string, any> = { userId };
  if (options.tag) {
    filter.tags = options.tag;
  }
  return Note.find(filter).sort({ isPinned: -1, createdAt: -1 });
}

export async function getNoteById(noteId: string, userId: string | Types.ObjectId): Promise<any> {
  const note = await Note.findOne({ _id: noteId, userId });
  if (!note) {
    throw new AppError('Note not found', 404);
  }
  return note;
}

export async function createNote(userId: string | Types.ObjectId, noteData: NoteCreateInput): Promise<any> {
  const title = (noteData.title && typeof noteData.title === 'string')
    ? noteData.title.trim()
    : 'Untitled';

  const content = sanitizeHtml(noteData.content);
  const isPinned = Boolean(noteData.isPinned);
  const tags = Array.isArray(noteData.tags)
    ? noteData.tags.map((t) => String(t).trim()).filter(Boolean)
    : [];

  const allowedColors: NoteColor[] = ['slate', 'sage', 'teal', 'sand', 'lavender', 'rose'];
  const color = allowedColors.includes(noteData.color as NoteColor) ? (noteData.color as NoteColor) : 'slate';

  const note = new Note({
    userId,
    title,
    content,
    isPinned,
    tags,
    color,
  });

  await note.save();
  const serialized = note.toJSON();
  emitNoteChange(userId, 'note:created', serialized);
  return serialized;
}

export async function updateNote(noteId: string, userId: string | Types.ObjectId, updateData: NoteUpdateInput): Promise<any> {
  const updatePayload: Record<string, any> = {};

  if (typeof updateData.title === 'string') {
    updatePayload.title = updateData.title.trim() || 'Untitled';
  }

  if (typeof updateData.content === 'string') {
    updatePayload.content = sanitizeHtml(updateData.content);
  }

  if (typeof updateData.isPinned === 'boolean') {
    updatePayload.isPinned = updateData.isPinned;
  }

  if (Array.isArray(updateData.tags)) {
    updatePayload.tags = updateData.tags.map((t) => String(t).trim()).filter(Boolean);
  }

  const allowedColors: NoteColor[] = ['slate', 'sage', 'teal', 'sand', 'lavender', 'rose'];
  if (allowedColors.includes(updateData.color as NoteColor)) {
    updatePayload.color = updateData.color;
  }

  const note = await Note.findOneAndUpdate(
    { _id: noteId, userId },
    { $set: updatePayload },
    { returnDocument: 'after', runValidators: true }
  );

  if (!note) {
    throw new AppError('Note not found', 404);
  }

  const serialized = note.toJSON();
  emitNoteChange(userId, 'note:updated', serialized);
  return serialized;
}

export async function deleteNote(noteId: string, userId: string | Types.ObjectId): Promise<{ id: string }> {
  const note = await Note.findOneAndDelete({ _id: noteId, userId });
  if (!note) {
    throw new AppError('Note not found', 404);
  }

  emitNoteChange(userId, 'note:deleted', { id: noteId });
  return { id: noteId };
}

export async function searchNotes(userId: string | Types.ObjectId, queryTerm?: string): Promise<any[]> {
  if (!queryTerm || typeof queryTerm !== 'string' || !queryTerm.trim()) {
    return getNotes(userId);
  }

  const cleanTerm = queryTerm.trim();
  const escapedTerm = escapeRegex(cleanTerm);
  const notes = await Note.find({
    userId,
    $or: [
      { title: { $regex: escapedTerm, $options: 'i' } },
      { content: { $regex: escapedTerm, $options: 'i' } },
      { tags: { $regex: escapedTerm, $options: 'i' } },
    ],
  }).sort({ isPinned: -1, createdAt: -1 });

  return notes;
}

export async function exportNotes(userId: string | Types.ObjectId, format = 'json'): Promise<ExportResult> {
  const notes = await Note.find({ userId }).sort({ isPinned: -1, createdAt: -1 });

  if (format === 'markdown') {
    const markdownContent = notes
      .map((n) => {
        const plainText = String(n.content || '').replace(/<[^>]+>/g, '').trim();
        const tagLine = n.tags && n.tags.length ? `\nTags: ${n.tags.join(', ')}` : '';
        return `# ${n.title}\n*Created: ${n.createdAt.toISOString()}*${tagLine}\n\n${plainText}\n\n---`;
      })
      .join('\n\n');

    return {
      contentType: 'text/markdown; charset=utf-8',
      filename: `notes-${Date.now()}.md`,
      content: markdownContent,
    };
  }

  return {
    contentType: 'application/json; charset=utf-8',
    filename: `notes-${Date.now()}.json`,
    content: JSON.stringify(notes, null, 2),
  };
}

export async function importNotes(userId: string | Types.ObjectId, importedNotesList: unknown): Promise<{ count: number }> {
  if (!Array.isArray(importedNotesList) || importedNotesList.length === 0) {
    throw new AppError('Invalid import data: expected an array of notes', 400);
  }

  for (const item of importedNotesList) {
    if (!item || typeof item !== 'object' || Array.isArray(item)) {
      throw new AppError('Invalid import data: every entry must be a valid note object', 400);
    }
  }

  const allowedColors: NoteColor[] = ['slate', 'sage', 'teal', 'sand', 'lavender', 'rose'];

  const docsToInsert = (importedNotesList as Record<string, unknown>[]).map((item) => ({
    userId,
    title: (typeof item.title === 'string' && item.title.trim()) ? item.title.trim() : 'Untitled',
    content: sanitizeHtml(typeof item.content === 'string' ? item.content : ''),
    isPinned: Boolean(item.isPinned),
    tags: Array.isArray(item.tags)
      ? item.tags.map((t: unknown) => String(t).trim()).filter(Boolean)
      : [],
    color: allowedColors.includes(item.color as NoteColor)
      ? (item.color as NoteColor)
      : 'slate',
  }));

  try {
    const inserted = await Note.insertMany(docsToInsert);
    emitNoteChange(userId, 'note:imported', { count: inserted.length });
    return { count: inserted.length };
  } catch (err) {
    throw err;
  }
}
