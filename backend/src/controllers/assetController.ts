import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';

export const getCharacters = async (_req: Request, res: Response) => {
  try {
    const characters = await prisma.character.findMany();
    return res.json(characters);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch characters' });
  }
};

export const getEnvironments = async (_req: Request, res: Response) => {
  try {
    const environments = await prisma.environment.findMany();
    return res.json(environments);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch environments' });
  }
};

export const getCharacterById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const character = await prisma.character.findUnique({
      where: { id }
    });

    if (!character) {
      return res.status(404).json({ error: 'Character not found' });
    }

    return res.json(character);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch character' });
  }
}; 