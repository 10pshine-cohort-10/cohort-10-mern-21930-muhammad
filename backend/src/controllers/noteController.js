const noteService = require('../services/noteService');

async function handleGetNotes(req, res, next) {
  try {
    const notes = await noteService.getNotes(req.userId, { tag: req.query.tag });
    return res.status(200).json({ success: true, data: notes });
  } catch (err) {
    return next(err);
  }
}

async function handleGetNoteById(req, res, next) {
  try {
    const note = await noteService.getNoteById(req.params.id, req.userId);
    return res.status(200).json({ success: true, data: note });
  } catch (err) {
    return next(err);
  }
}

async function handleCreateNote(req, res, next) {
  try {
    const note = await noteService.createNote(req.userId, req.body);
    return res.status(201).json({ success: true, data: note });
  } catch (err) {
    return next(err);
  }
}

async function handleUpdateNote(req, res, next) {
  try {
    const note = await noteService.updateNote(req.params.id, req.userId, req.body);
    return res.status(200).json({ success: true, data: note });
  } catch (err) {
    return next(err);
  }
}

async function handleDeleteNote(req, res, next) {
  try {
    const result = await noteService.deleteNote(req.params.id, req.userId);
    return res.status(200).json({ success: true, data: result });
  } catch (err) {
    return next(err);
  }
}

async function handleSearchNotes(req, res, next) {
  try {
    const queryTerm = req.query.q || '';
    const notes = await noteService.searchNotes(req.userId, queryTerm);
    return res.status(200).json({ success: true, data: notes });
  } catch (err) {
    return next(err);
  }
}

async function handleExportNotes(req, res, next) {
  try {
    const format = req.query.format === 'markdown' ? 'markdown' : 'json';
    const { contentType, filename, content } = await noteService.exportNotes(req.userId, format);

    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    return res.status(200).send(content);
  } catch (err) {
    return next(err);
  }
}

async function handleImportNotes(req, res, next) {
  try {
    const items = Array.isArray(req.body) ? req.body : req.body.notes;
    const result = await noteService.importNotes(req.userId, items);
    return res.status(201).json({ success: true, data: result });
  } catch (err) {
    return next(err);
  }
}

module.exports = {
  handleGetNotes,
  handleGetNoteById,
  handleCreateNote,
  handleUpdateNote,
  handleDeleteNote,
  handleSearchNotes,
  handleExportNotes,
  handleImportNotes,
};
