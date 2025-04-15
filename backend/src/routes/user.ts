import express from 'express';
import { authenticateToken } from '../middleware/auth';
import { getUserProfile, getLeaderboard, updateUserProfile } from '../controllers/userController';

const router = express.Router();

// Get user profile
router.get('/:id', authenticateToken, getUserProfile);

// Get leaderboard
router.get('/leaderboard', authenticateToken, getLeaderboard);

// Update user profile
router.put('/:id', authenticateToken, updateUserProfile);

export default router; 