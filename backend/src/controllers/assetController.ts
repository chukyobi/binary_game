import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';


export const getGameAssets = async (_req: Request, res: Response) => {
  try {
    const character = await prisma.character.findFirst();
    const environment = await prisma.environment.findFirst({
      include: { obstacles: true },
    });

    if (!character || !environment) {
      console.warn('[getGameAssets] Missing character or environment');
      return res.status(404).json({ error: 'Assets missing' });
    }

    // Prevent caching
    res.setHeader('Cache-Control', 'no-store');

    console.log('[getGameAssets] Returning assets');
    return res.json({ character, environment });
  } catch (error) {
    console.error('[getGameAssets] Error fetching assets:', error);
    return res.status(500).json({ error: 'Failed to fetch game assets' });
  }
};
