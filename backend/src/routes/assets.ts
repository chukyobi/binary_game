import express from 'express';
import { authenticateToken } from '../middleware/auth';
import { getGameAssets } from '../controllers/assetController';

const router = express.Router();

router.get('/assets', authenticateToken, getGameAssets);

export default router;
