import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { generateQuestion } from '../utils/questionGenerator';
import { getTips } from '../utils/tipsGenerator';

export const getQuestion = async (req: Request, res: Response) => {
  try {
    const levelNum = parseInt(req.params.level);
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const levelRecord = await prisma.level.findFirst({ where: { number: levelNum } });
    if (!levelRecord) {
      return res.status(404).json({ message: 'Level not found' });
    }

    const gameProgress = await prisma.gameProgress.findFirst({
      where: { userId, levelId: levelRecord.id },
      orderBy: { createdAt: 'desc' }
    });

    const questionCount = gameProgress ? gameProgress.score / 10 : 0;
    const question = generateQuestion(levelNum, questionCount);

    const storedQuestion = await prisma.question.create({
      data: {
        levelId: levelRecord.id,
        question: question.question,
        answer: question.answer,
        options: JSON.stringify(question.options),
        type: question.type,
        difficulty: typeof question.difficulty === 'number' ? question.difficulty : 1
      }
    });

    return res.json({
      id: storedQuestion.id,
      question: question.question,
      options: question.options,
      type: question.type,
      difficulty: question.difficulty
    });
  } catch (error) {
    console.error('Error generating question:', error);
    return res.status(500).json({ message: 'Error generating question' });
  }
};

export const submitAnswer = async (req: Request, res: Response) => {
  try {
    const { questionId, answer } = req.body;
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const question = await prisma.question.findUnique({ where: { id: questionId } });
    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }

    const isCorrect = question.answer === answer;

    if (isCorrect) {
      await prisma.user.update({
        where: { id: userId },
        data: { gems: { increment: 10 } }
      });
    }

    return res.json({ isCorrect });
  } catch (error) {
    return res.status(500).json({ message: 'Error submitting answer' });
  }
};

export const updateScore = async (req: Request, res: Response) => {
  try {
    const { score, level } = req.body;
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (score > user.highScore) {
      await prisma.user.update({ where: { id: userId }, data: { highScore: score } });
    }

    const levelRecord = await prisma.level.findFirst({ where: { number: level } });
    if (!levelRecord) {
      return res.status(404).json({ message: 'Level not found' });
    }

    await prisma.gameProgress.create({
      data: {
        userId,
        levelId: levelRecord.id,
        score,
        completed: true
      }
    });

    return res.json({ message: 'Score updated successfully' });
  } catch (error) {
    return res.status(500).json({ message: 'Error updating score' });
  }
};

export const getLevels = async (_req: Request, res: Response) => {
  try {
    const levels = await prisma.level.findMany({
      orderBy: { number: 'asc' },
      select: {
        id: true,
        number: true,
        name: true,
        description: true,
        difficulty: true,
        requiredScore: true
      }
    });

    return res.json(levels);
  } catch (error) {
    console.error('Error fetching levels:', error);
    return res.status(500).json({ error: 'Failed to fetch levels' });
  }
};

export const getAssets = async (_req: Request, res: Response) => {
  try {
    const [characters, environments] = await Promise.all([
      prisma.character.findMany({
        select: { id: true, name: true, modelUrl: true }
      }),
      prisma.environment.findMany({
        select: { id: true, name: true, modelUrl: true, description: true }
      })
    ]);

    res.json({ characters, environments });
  } catch (error) {
    console.error('Error fetching assets:', error);
    res.status(500).json({ error: 'Failed to fetch assets' });
  }
};

export const getTip = async (req: Request, res: Response) => {
  try {
    const { questionId } = req.query;
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const question = await prisma.question.findUnique({
      where: { id: questionId as string }
    });

    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }

    const tipUsage = await prisma.tipUsage.findFirst({
      where: {
        userId,
        questionId: questionId as string
      }
    });

    const usedTips = tipUsage?.count || 0;

    const tips = getTips(
      {
        type: question.type,
        question: question.question,
        answer: question.answer,
        options: JSON.parse(question.options)
      },
      usedTips
    );

    if (tips.length === 0) {
      return res.status(404).json({ message: 'No tips available' });
    }

    const tip = tips[0];

    if (usedTips >= 3) {
      const user = await prisma.user.findUnique({ where: { id: userId } });

      if (!user || user.gems < tip.cost) {
        return res.status(400).json({
          message: 'Not enough gems',
          requiredGems: tip.cost,
          currentGems: user?.gems || 0
        });
      }

      await prisma.user.update({
        where: { id: userId },
        data: { gems: { decrement: tip.cost } }
      });
    }

    if (tipUsage) {
      await prisma.tipUsage.update({
        where: { id: tipUsage.id },
        data: { count: usedTips + 1 }
      });
    } else {
      await prisma.tipUsage.create({
        data: {
          userId,
          questionId: questionId as string,
          count: 1
        }
      });
    }

    return res.json({
      tip: tip.text,
      cost: tip.cost,
      usedTips: usedTips + 1
    });
  } catch (error) {
    return res.status(500).json({ message: 'Error getting tip' });
  }
};
