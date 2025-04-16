import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { prisma } from '../lib/prisma';

interface AuthRequest extends Request {
  user?: { userId: string };
}

export const authenticateToken = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    console.log('Auth Middleware: Checking authentication');
    // Get token from cookie
    const token = req.cookies.auth_token;
    console.log('Auth Middleware: Token from cookie:', token ? 'Present' : 'Missing');
    
    if (!token) {
      console.log('Auth Middleware: No token found, returning 401');
      return res.status(401).json({ error: 'Authentication required' });
    }

    // Verify token
    console.log('Auth Middleware: Verifying token');
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };
    console.log('Auth Middleware: Token decoded, userId:', decoded.userId);
    
    // Get user from database
    console.log('Auth Middleware: Fetching user from database');
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        username: true
      }
    });

    if (!user) {
      console.log('Auth Middleware: User not found in database');
      return res.status(401).json({ error: 'User not found' });
    }

    console.log('Auth Middleware: User found, adding to request');
    // Add user to request object
    req.user = { userId: user.id };
    
    return next();
  } catch (error) {
    console.error('Auth Middleware: Error during authentication:', error);
    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({ error: 'Invalid token' });
    }
    return res.status(500).json({ error: 'Authentication error' });
  }
};

export const protect = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user?.userId },
      select: { id: true, email: true, username: true }
    });

    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    return next();
  } catch (error) {
    return res.status(500).json({ error: 'Error authenticating user' });
  }
}; 