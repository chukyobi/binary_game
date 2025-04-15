import express from 'express';
import { getLevels, getLevelById, createLevel, updateLevel } from '../controllers/levelController';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

// Public routes
router.get('/', authenticateToken, getLevels);
router.get('/:id', authenticateToken, getLevelById);

// Admin routes (should be protected with admin middleware)
router.post('/', authenticateToken, createLevel);
router.put('/:id', authenticateToken, updateLevel);

export default router; 