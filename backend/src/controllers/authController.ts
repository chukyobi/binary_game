import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import jwt from 'jsonwebtoken';

export const register = async (req: Request, res: Response) => {
  try {
    const { username } = req.body;

    if (!username) {
      return res.status(400).json({ error: 'Username is required' });
    }

    const existingUser = await prisma.user.findUnique({
      where: { username }
    });

    if (existingUser) {
      return res.status(400).json({ error: 'Username already taken' });
    }

    // Use a transaction to ensure all records are created atomically
    const result = await prisma.$transaction(async (prisma) => {
      // Create the user
      const user = await prisma.user.create({
        data: {
          username,
          email: `${username}@example.com`, // Generate a placeholder email
          gems: 0,
          highScore: 0,
          currentLevel: 1
        }
      });

      // Find the first level
      const firstLevel = await prisma.level.findFirst({
        where: { number: 1 }
      });

      if (!firstLevel) {
        throw new Error('First level not found');
      }

      // Create initial game progress for level 1
      await prisma.gameProgress.create({
        data: {
          userId: user.id,
          levelId: firstLevel.id,
          score: 0,
          completed: false
        }
      });

      // Find or create a welcome achievement
      let welcomeAchievement = await prisma.achievement.findFirst({
        where: { name: 'Welcome' }
      });

      if (!welcomeAchievement) {
        welcomeAchievement = await prisma.achievement.create({
          data: {
            name: 'Welcome',
            description: 'Joined the game',
            icon: 'welcome-icon',
            points: 10
          }
        });
      }

      // Assign the welcome achievement to the user
      await prisma.user.update({
        where: { id: user.id },
        data: {
          achievements: {
            connect: { id: welcomeAchievement.id }
          }
        }
      });

      return user;
    });

    // Generate JWT token
    const token = jwt.sign({ userId: result.id }, process.env.JWT_SECRET!, { expiresIn: '24h' });
    
    // Set HttpOnly cookie with the token
    res.cookie('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
      path: '/'
    });

    return res.status(201).json({ 
      token,
      user: {
        id: result.id,
        username: result.username,
        gems: result.gems,
        highScore: result.highScore,
        currentLevel: result.currentLevel
      }
    });
  } catch (error) {
    console.error('Error in user registration:', error);
    return res.status(500).json({ error: 'Error creating user' });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { username } = req.body;

    if (!username) {
      return res.status(400).json({ error: 'Username is required' });
    }

    const user = await prisma.user.findUnique({
      where: { username }
    });

    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    // Generate JWT token
    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET!, { expiresIn: '24h' });
    
    // Set HttpOnly cookie with the token
    res.cookie('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
      path: '/'
    });

    return res.json({ 
      token,
      user: {
        id: user.id,
        username: user.username,
        gems: user.gems,
        highScore: user.highScore,
        currentLevel: user.currentLevel
      }
    });
  } catch (error) {
    return res.status(500).json({ error: 'Error logging in' });
  }
};

export const logout = async (_req: Request, res: Response) => {
  // Clear the auth cookie
  res.clearCookie('auth_token', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/'
  });
  
  return res.json({ success: true });
};

export const getMe = async (req: Request, res: Response) => {
  try {
    console.log('Auth Controller: getMe called');
    if (!req.user) {
      console.log('Auth Controller: No user in request, returning 401');
      return res.status(401).json({ error: 'Not authenticated' });
    }

    console.log('Auth Controller: Fetching user data for userId:', req.user.userId);
    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      select: {
        id: true,
        username: true,
        gems: true,
        highScore: true,
        currentLevel: true
      }
    });

    if (!user) {
      console.log('Auth Controller: User not found in database');
      return res.status(404).json({ error: 'User not found' });
    }

    console.log('Auth Controller: Returning user data:', user);
    return res.json({ user });
  } catch (error) {
    console.error('Auth Controller: Error in getMe:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}; 