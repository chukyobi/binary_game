import express from 'express';
import authRoutes from './auth';
import userRoutes from './user';
import levelRoutes from './levelRoutes';
import gameRoutes from './game';
import assetRoutes from './assets';

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/levels', levelRoutes);
router.use('/game', gameRoutes);
router.use('/assets', assetRoutes);

export default router; 