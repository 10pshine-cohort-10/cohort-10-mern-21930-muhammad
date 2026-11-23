import client from '../api/client';
import { getGuestNotes, clearGuestNotes } from './guestStorage';

export async function syncGuestNotesIfAny(authToken: string): Promise<number> {
  const guestNotes = getGuestNotes();
  if (guestNotes.length === 0) return 0;

  try {
    const payload = guestNotes.map((note) => ({
      title: note.title,
      content: note.content,
      isPinned: note.isPinned,
      tags: note.tags,
      color: note.color,
    }));

    await client.post('/notes/import', payload, {
      headers: { Authorization: `Bearer ${authToken}` },
    });

    clearGuestNotes();
    return payload.length;
  } catch (err) {
    console.error('Failed to sync guest notes to cloud account:', err);
    return 0;
  }
}
