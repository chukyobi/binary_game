import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';

export const getUserProfile = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        username: true,
        email: true,
        gems: true,
        highScore: true,
        currentLevel: true,
        gameProgress: {
          select: {
            level: true,
            score: true,
            completed: true,
            createdAt: true
          }
        },
        achievements: {
          select: {
            id: true,
            name: true,
            description: true,
            icon: true,
            points: true
          }
        }
      }
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    return res.json(user);
  } catch (error) {
    return res.status(500).json({ message: 'Error fetching user profile' });
  }
};

export const getLeaderboard = async (_req: Request, res: Response) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        username: true,
        gems: true,
        highScore: true,
        currentLevel: true
      },
      orderBy: {
        highScore: 'desc'
      },
      take: 100
    });

    return res.json(users);
  } catch (error) {
    return res.status(500).json({ message: 'Error fetching leaderboard' });
  }
};

export const updateUserProfile = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { username, email } = req.body;

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id }
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update user
    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        username,
        email
      },
      select: {
        id: true,
        username: true,
        email: true,
        gems: true,
        highScore: true,
        currentLevel: true
      }
    });

    return res.json(updatedUser);
  } catch (error) {
    return res.status(500).json({ message: 'Error updating user profile' });
  }
}; 