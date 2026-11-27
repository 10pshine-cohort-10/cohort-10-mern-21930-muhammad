import client from '../api/client';
import { getGuestNotes, clearGuestNotes } from './guestStorage';

export interface GuestSyncResult {
  syncedCount: number;
  hasError: boolean;
}

export async function syncGuestNotesIfAny(authToken: string): Promise<GuestSyncResult> {
  const guestNotes = getGuestNotes();
  if (guestNotes.length === 0) return { syncedCount: 0, hasError: false };

  try {
    const payload = guestNotes.map((note) => ({
      title: note.title,
      content: note.content,
      isPinned: note.isPinned,
      tags: note.tags,
      color: note.color,
      ...(note.status ? { status: note.status } : {}),
    }));

    await client.post('/notes/import', payload, {
      headers: { Authorization: `Bearer ${authToken}` },
    });

    clearGuestNotes();
    return { syncedCount: payload.length, hasError: false };
  } catch (err) {
    console.error('Failed to sync guest notes to cloud account:', err);
    return { syncedCount: 0, hasError: true };
  }
}
