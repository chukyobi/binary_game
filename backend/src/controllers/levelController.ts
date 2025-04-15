import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';

export const getLevels = async (_req: Request, res: Response) => {
  try {
    const levels = await prisma.level.findMany({
      include: {
        questions: true,
      },
    });
    res.json(levels);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch levels' });
  }
};

export const getLevelById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const level = await prisma.level.findUnique({
      where: { id },
      include: {
        questions: true,
      },
    });

    if (!level) {
      return res.status(404).json({ error: 'Level not found' });
    }

    return res.json(level);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch level' });
  }
};

export const createLevel = async (req: Request, res: Response) => {
  try {
    const { number, name, description, difficulty, requiredScore } = req.body;

    const level = await prisma.level.create({
      data: {
        number,
        name,
        description,
        difficulty,
        requiredScore,
      },
      include: {
        questions: true,
      },
    });

    res.status(201).json(level);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create level' });
  }
};

export const updateLevel = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { number, name, description, difficulty, requiredScore } = req.body;

    const level = await prisma.level.update({
      where: { id },
      data: {
        number,
        name,
        description,
        difficulty,
        requiredScore,
      },
      include: {
        questions: true,
      },
    });

    res.json(level);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update level' });
  }
}; 