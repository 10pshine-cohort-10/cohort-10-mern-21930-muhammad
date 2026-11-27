import {
  getGuestNotes,
  createGuestNote,
  updateGuestNote,
  deleteGuestNote,
  clearGuestNotes,
} from '../utils/guestStorage';

describe('guestStorage', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('starts with an empty array of guest notes', () => {
    expect(getGuestNotes()).toEqual([]);
  });

  it('creates and persists a guest note', () => {
    const created = createGuestNote({
      title: 'Guest Note Title',
      content: '<p>Guest Content</p>',
      tags: ['guest', 'draft'],
      color: 'teal',
    });

    expect(created.id).toMatch(/^guest-/);
    expect(created.title).toBe('Guest Note Title');
    expect(created.content).toBe('<p>Guest Content</p>');
    expect(created.tags).toEqual(['guest', 'draft']);
    expect(created.color).toBe('teal');

    const stored = getGuestNotes();
    expect(stored).toHaveLength(1);
    expect(stored[0].id).toBe(created.id);
  });

  it('updates an existing guest note', () => {
    const created = createGuestNote({ title: 'Original Title', isPinned: false });
    const updated = updateGuestNote(created.id, { title: 'Updated Title', isPinned: true });

    expect(updated.title).toBe('Updated Title');
    expect(updated.isPinned).toBe(true);

    const stored = getGuestNotes();
    expect(stored[0].title).toBe('Updated Title');
    expect(stored[0].isPinned).toBe(true);
  });

  it('deletes a guest note by id', () => {
    const noteOne = createGuestNote({ title: 'Note 1' });
    const noteTwo = createGuestNote({ title: 'Note 2' });

    expect(getGuestNotes()).toHaveLength(2);

    deleteGuestNote(noteOne.id);
    const remaining = getGuestNotes();
    expect(remaining).toHaveLength(1);
    expect(remaining[0].id).toBe(noteTwo.id);
  });

  it('clears all guest notes', () => {
    createGuestNote({ title: 'To Clear' });
    expect(getGuestNotes()).toHaveLength(1);

    clearGuestNotes();
    expect(getGuestNotes()).toHaveLength(0);
  });

  it('handles localStorage throwing an error gracefully', () => {
    const spy = jest.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('Access denied in private mode');
    });

    expect(getGuestNotes()).toEqual([]);

    spy.mockRestore();
  });
});
