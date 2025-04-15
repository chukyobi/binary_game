import { Router } from 'express';
import { getAssets, getQuestion, submitAnswer, updateScore, getLevels } from '../controllers/gameController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// Game assets routes
router.get('/assets', authenticateToken, getAssets);
router.get('/levels', authenticateToken, getLevels);

// Gameplay routes
router.get('/question/:level', authenticateToken, getQuestion);
router.post('/answer', authenticateToken, submitAnswer);
router.post('/score', authenticateToken, updateScore);

export default router; 