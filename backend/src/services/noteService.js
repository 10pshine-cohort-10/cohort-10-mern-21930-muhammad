const Note = require('../models/Note');
const { emitNoteChange } = require('../socket/noteSocket');

function sanitizeHtml(content) {
  if (typeof content !== 'string') {
    return '';
  }
  return content
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/\son\w+\s*=\s*(?:'[^']*'|"[^"]*"|[^\s>]+)/gi, '');
}

async function getNotes(userId, options = {}) {
  const filter = { userId };
  if (options.tag) {
    filter.tags = options.tag;
  }
  return Note.find(filter).sort({ isPinned: -1, createdAt: -1 });
}

async function getNoteById(noteId, userId) {
  const note = await Note.findOne({ _id: noteId, userId });
  if (!note) {
    const err = new Error('Note not found');
    err.status = 404;
    throw err;
  }
  return note;
}

async function createNote(userId, noteData) {
  const title = (noteData.title && typeof noteData.title === 'string')
    ? noteData.title.trim()
    : 'Untitled';

  const content = sanitizeHtml(noteData.content);
  const isPinned = Boolean(noteData.isPinned);
  const tags = Array.isArray(noteData.tags)
    ? noteData.tags.map((t) => String(t).trim()).filter(Boolean)
    : [];

  const allowedColors = ['slate', 'sage', 'teal', 'sand', 'lavender', 'rose'];
  const color = allowedColors.includes(noteData.color) ? noteData.color : 'slate';

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

async function updateNote(noteId, userId, updateData) {
  const updatePayload = {};

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

  const allowedColors = ['slate', 'sage', 'teal', 'sand', 'lavender', 'rose'];
  if (allowedColors.includes(updateData.color)) {
    updatePayload.color = updateData.color;
  }

  const note = await Note.findOneAndUpdate(
    { _id: noteId, userId },
    { $set: updatePayload },
    { returnDocument: 'after', runValidators: true }
  );

  if (!note) {
    const err = new Error('Note not found');
    err.status = 404;
    throw err;
  }

  const serialized = note.toJSON();
  emitNoteChange(userId, 'note:updated', serialized);
  return serialized;
}

async function deleteNote(noteId, userId) {
  const note = await Note.findOneAndDelete({ _id: noteId, userId });
  if (!note) {
    const err = new Error('Note not found');
    err.status = 404;
    throw err;
  }

  emitNoteChange(userId, 'note:deleted', { id: noteId });
  return { id: noteId };
}

async function searchNotes(userId, queryTerm) {
  if (!queryTerm || typeof queryTerm !== 'string' || !queryTerm.trim()) {
    return getNotes(userId);
  }

  const cleanTerm = queryTerm.trim();
  const notes = await Note.find({
    userId,
    $or: [
      { title: { $regex: cleanTerm, $options: 'i' } },
      { content: { $regex: cleanTerm, $options: 'i' } },
      { tags: { $regex: cleanTerm, $options: 'i' } },
    ],
  }).sort({ isPinned: -1, createdAt: -1 });

  return notes;
}

async function exportNotes(userId, format = 'json') {
  const notes = await Note.find({ userId }).sort({ isPinned: -1, createdAt: -1 });

  if (format === 'markdown') {
    const markdownContent = notes
      .map((n) => {
        const plainText = (n.content || '').replace(/<[^>]+>/g, '').trim();
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

async function importNotes(userId, importedNotesList) {
  if (!Array.isArray(importedNotesList) || importedNotesList.length === 0) {
    const err = new Error('Invalid import data: expected an array of notes');
    err.status = 400;
    throw err;
  }

  const docsToInsert = importedNotesList.map((item) => ({
    userId,
    title: (item.title && typeof item.title === 'string') ? item.title.trim() : 'Untitled',
    content: sanitizeHtml(item.content),
    isPinned: Boolean(item.isPinned),
    tags: Array.isArray(item.tags)
      ? item.tags.map((t) => String(t).trim()).filter(Boolean)
      : [],
    color: ['slate', 'sage', 'teal', 'sand', 'lavender', 'rose'].includes(item.color)
      ? item.color
      : 'slate',
  }));

  const inserted = await Note.insertMany(docsToInsert);
  return { count: inserted.length };
}

module.exports = {
  getNotes,
  getNoteById,
  createNote,
  updateNote,
  deleteNote,
  searchNotes,
  exportNotes,
  importNotes,
  sanitizeHtml,
};
