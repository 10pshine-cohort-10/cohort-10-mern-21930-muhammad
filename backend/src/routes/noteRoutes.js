const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const {
  handleGetNotes,
  handleGetNoteById,
  handleCreateNote,
  handleUpdateNote,
  handleDeleteNote,
  handleSearchNotes,
  handleExportNotes,
  handleImportNotes,
} = require('../controllers/noteController');

const router = express.Router();

router.use(authMiddleware);

router.get('/search', handleSearchNotes);
router.get('/export', handleExportNotes);
router.post('/import', handleImportNotes);

router.get('/', handleGetNotes);
router.post('/', handleCreateNote);
router.get('/:id', handleGetNoteById);
router.put('/:id', handleUpdateNote);
router.delete('/:id', handleDeleteNote);

module.exports = router;
