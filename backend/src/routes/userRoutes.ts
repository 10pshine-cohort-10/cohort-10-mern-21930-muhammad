import { Router } from 'express';
import authMiddleware from '../middleware/authMiddleware';
import { handleGetCurrentUser } from '../controllers/userController';

const router = Router();

router.get('/me', authMiddleware, handleGetCurrentUser);

export default router;
export { router as userRoutes };
