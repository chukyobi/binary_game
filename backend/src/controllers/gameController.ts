import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { generateQuestion } from '../utils/questionGenerator';
import { getTips } from '../utils/tipsGenerator';

export const getQuestion = async (req: Request, res: Response) => {
  try {
    const { level } = req.query;
    const levelNum = parseInt(level as string);
    
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    
    // Get user's question count for this level
    const gameProgress = await prisma.gameProgress.findFirst({
      where: {
        userId: req.user.userId,
        level: {
          number: levelNum
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    
    const questionCount = gameProgress ? gameProgress.score / 10 : 0; // Assuming 10 points per question
    
    // Generate a new question
    const question = generateQuestion(levelNum, questionCount);

    // Find the level by number
    const levelRecord = await prisma.level.findFirst({
      where: { number: levelNum }
    });

    if (!levelRecord) {
      return res.status(404).json({ message: 'Level not found' });
    }

    // Store the question in the database
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
    return res.status(500).json({ message: 'Error generating question' });
  }
};

export const submitAnswer = async (req: Request, res: Response) => {
  try {
    const { questionId, answer } = req.body;
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    const userId = req.user.userId;

    // Get question
    const question = await prisma.question.findUnique({
      where: { id: questionId }
    });

    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }

    // Check answer
    const isCorrect = question.answer === answer;

    if (isCorrect) {
      // Update user's gems
      await prisma.user.update({
        where: { id: userId },
        data: {
          gems: {
            increment: 10 // Award 10 gems for correct answer
          }
        }
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
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    const userId = req.user.userId;

    // Update user's high score if current score is higher
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (score > user.highScore) {
      await prisma.user.update({
        where: { id: userId },
        data: { highScore: score }
      });
    }

    // Find the level by number
    const levelRecord = await prisma.level.findFirst({
      where: { number: level }
    });

    if (!levelRecord) {
      return res.status(404).json({ message: 'Level not found' });
    }

    // Update game progress
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
      orderBy: {
        number: 'asc'
      },
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
        select: {
          id: true,
          name: true,
          modelUrl: true,
          textureUrl: true,
          isUnlocked: true,
          unlockCost: true,
          animationUrls: true
        }
      }),
      prisma.environment.findMany({
        where: { isUnlocked: true },
        select: {
          id: true,
          name: true,
          modelUrl: true,
          textureUrl: true,
          isUnlocked: true,
          unlockCost: true,
          description: true
        }
      })
    ]);
    
    // Ensure animationUrls is properly parsed if it's a string
    const processedCharacters = characters.map(char => ({
      ...char,
      animationUrls: typeof char.animationUrls === 'string' 
        ? JSON.parse(char.animationUrls) 
        : char.animationUrls || []
    }));
    
    res.json({
      characters: processedCharacters,
      environments
    });
  } catch (error) {
    console.error('Error fetching assets:', error);
    res.status(500).json({ error: 'Failed to fetch assets' });
  }
};

export const getTip = async (req: Request, res: Response) => {
  try {
    const { questionId } = req.query;
    
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    
    // Get the question
    const question = await prisma.question.findUnique({
      where: { id: questionId as string }
    });
    
    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }
    
    // Get user's tip usage for this question
    const tipUsage = await prisma.tipUsage.findFirst({
      where: {
        userId: req.user.userId,
        questionId: questionId as string
      }
    });
    
    const usedTips = tipUsage?.count || 0;
    
    // Get the next tip
    const tips = getTips({
      type: question.type,
      question: question.question,
      answer: question.answer,
      options: JSON.parse(question.options)
    }, usedTips);
    
    if (tips.length === 0) {
      return res.status(404).json({ message: 'No tips available' });
    }
    
    const tip = tips[0];
    
    // If this is after the 3rd tip, check if user has enough gems
    if (usedTips >= 3) {
      const user = await prisma.user.findUnique({
        where: { id: req.user.userId }
      });
      
      if (!user || user.gems < tip.cost) {
        return res.status(400).json({ 
          message: 'Not enough gems',
          requiredGems: tip.cost,
          currentGems: user?.gems || 0
        });
      }
      
      // Deduct gems
      await prisma.user.update({
        where: { id: req.user.userId },
        data: {
          gems: {
            decrement: tip.cost
          }
        }
      });
    }
    
    // Update tip usage count
    if (tipUsage) {
      await prisma.tipUsage.update({
        where: { id: tipUsage.id },
        data: { count: usedTips + 1 }
      });
    } else {
      await prisma.tipUsage.create({
        data: {
          userId: req.user.userId,
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