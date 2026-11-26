import { Types } from 'mongoose';
import Note from '../models/Note';
import NoteActivity from '../models/NoteActivity';
import type { NoteStatus } from '../types';

export const EDIT_COALESCE_WINDOW_MS = 15 * 60 * 1000;
export const MAX_ACTIVITY_DAYS = 90;
export const MAX_ACTIVITY_LIMIT = 500;

export async function recordNoteCreated(
  userId: string | Types.ObjectId,
  note: { id?: string; _id?: Types.ObjectId; title?: string; status?: NoteStatus | null }
): Promise<void> {
  try {
    const noteId = note.id || note._id;
    if (!noteId) return;

    await NoteActivity.create({
      userId,
      noteId,
      noteTitle: note.title?.trim() || 'Untitled',
      type: 'created',
      fromStatus: null,
      toStatus: note.status ?? null,
    });
  } catch (err) {
    console.error('Failed to record note created activity:', err);
  }
}

export async function recordNoteUpdated(
  userId: string | Types.ObjectId,
  previousStatus: NoteStatus | null | undefined,
  updatedNote: { id?: string; _id?: Types.ObjectId; title?: string; status?: NoteStatus | null },
  updatePayload: Record<string, unknown>
): Promise<void> {
  try {
    const noteId = updatedNote.id || updatedNote._id;
    if (!noteId) return;

    const nextStatus = updatedNote.status ?? null;
    const prevStatus = previousStatus ?? null;

    if (Object.prototype.hasOwnProperty.call(updatePayload, 'status') && prevStatus !== nextStatus) {
      await NoteActivity.create({
        userId,
        noteId,
        noteTitle: updatedNote.title?.trim() || 'Untitled',
        type: 'moved',
        fromStatus: prevStatus,
        toStatus: nextStatus,
      });
      return;
    }

    const hasContentChange =
      Object.prototype.hasOwnProperty.call(updatePayload, 'title') ||
      Object.prototype.hasOwnProperty.call(updatePayload, 'content');

    if (!hasContentChange) return;

    const cutoff = new Date(Date.now() - EDIT_COALESCE_WINDOW_MS);
    const recentEdit = await NoteActivity.findOne({
      userId,
      noteId,
      type: 'edited',
      createdAt: { $gte: cutoff },
    }).select('_id');

    if (recentEdit) return;

    await NoteActivity.create({
      userId,
      noteId,
      noteTitle: updatedNote.title?.trim() || 'Untitled',
      type: 'edited',
      fromStatus: null,
      toStatus: null,
    });
  } catch (err) {
    console.error('Failed to record note updated activity:', err);
  }
}

export async function deleteNoteActivity(
  noteId: string | Types.ObjectId,
  userId: string | Types.ObjectId
): Promise<void> {
  try {
    await NoteActivity.deleteMany({ noteId, userId });
  } catch (err) {
    console.error('Failed to delete note activity rows:', err);
  }
}

export async function deleteUserActivity(userId: string | Types.ObjectId): Promise<void> {
  try {
    await NoteActivity.deleteMany({ userId });
  } catch (err) {
    console.error('Failed to delete user activity rows:', err);
  }
}

export async function getUserActivity(
  userId: string | Types.ObjectId,
  options: { days?: number; limit?: number } = {}
): Promise<any[]> {
  const rawDays = Number(options.days);
  const days = Number.isFinite(rawDays) && rawDays > 0
    ? Math.min(Math.floor(rawDays), MAX_ACTIVITY_DAYS)
    : 60;

  const rawLimit = Number(options.limit);
  const limit = Number.isFinite(rawLimit) && rawLimit > 0
    ? Math.min(Math.floor(rawLimit), MAX_ACTIVITY_LIMIT)
    : MAX_ACTIVITY_LIMIT;

  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

  return NoteActivity.find({
    userId,
    createdAt: { $gte: since },
  })
    .sort({ createdAt: -1 })
    .limit(limit);
}

export async function seedCreatedActivityMigration(): Promise<{ insertedCount: number }> {
  const existingNoteIds = await NoteActivity.distinct('noteId', { type: 'created' });
  const missingNotes = await Note.find({ _id: { $nin: existingNoteIds } }).lean();

  if (missingNotes.length === 0) {
    return { insertedCount: 0 };
  }

  const docs = missingNotes.map((n: any) => ({
    userId: n.userId,
    noteId: n._id,
    noteTitle: n.title?.trim() || 'Untitled',
    type: 'created' as const,
    fromStatus: null,
    toStatus: n.status ?? null,
    createdAt: n.createdAt || new Date(),
  }));

  const inserted = await NoteActivity.insertMany(docs);
  return { insertedCount: inserted.length };
}
