import { Router } from 'express';
import authMiddleware from '../middleware/authMiddleware';
import {
  handleGetNotes,
  handleGetNoteById,
  handleCreateNote,
  handleUpdateNote,
  handleDeleteNote,
  handleSearchNotes,
  handleExportNotes,
  handleImportNotes,
} from '../controllers/noteController';

const router = Router();

router.use(authMiddleware as any);

router.get('/search', handleSearchNotes as any);
router.get('/export', handleExportNotes as any);
router.post('/import', handleImportNotes as any);

router.get('/', handleGetNotes as any);
router.post('/', handleCreateNote as any);
router.get('/:id', handleGetNoteById as any);
router.put('/:id', handleUpdateNote as any);
router.delete('/:id', handleDeleteNote as any);

export default router;
export { router as noteRoutes };
