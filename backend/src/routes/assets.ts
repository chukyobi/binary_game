import express from 'express';
import { authenticateToken } from '../middleware/auth';
import {
  getCharacters,
  getEnvironments,
  getCharacterById
} from '../controllers/assetController';

const router = express.Router();

// Get all characters
router.get('/characters', authenticateToken, getCharacters);

// Get all environments
router.get('/environments', authenticateToken, getEnvironments);

// Get character by ID
router.get('/characters/:id', authenticateToken, getCharacterById);

export default router; 