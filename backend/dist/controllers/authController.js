"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logout = exports.login = exports.register = void 0;
const prisma_1 = require("../lib/prisma");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const register = async (req, res) => {
    try {
        const { username } = req.body;
        if (!username) {
            return res.status(400).json({ error: 'Username is required' });
        }
        const existingUser = await prisma_1.prisma.user.findUnique({
            where: { username }
        });
        if (existingUser) {
            return res.status(400).json({ error: 'Username already taken' });
        }
        const result = await prisma_1.prisma.$transaction(async (prisma) => {
            const user = await prisma.user.create({
                data: {
                    username,
                    email: `${username}@example.com`,
                    gems: 0,
                    highScore: 0,
                    currentLevel: 1
                }
            });
            const firstLevel = await prisma.level.findFirst({
                where: { number: 1 }
            });
            if (!firstLevel) {
                throw new Error('First level not found');
            }
            await prisma.gameProgress.create({
                data: {
                    userId: user.id,
                    levelId: firstLevel.id,
                    score: 0,
                    completed: false
                }
            });
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
        const token = jsonwebtoken_1.default.sign({ userId: result.id }, process.env.JWT_SECRET, { expiresIn: '24h' });
        res.cookie('auth_token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 24 * 60 * 60 * 1000,
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
    }
    catch (error) {
        console.error('Error in user registration:', error);
        return res.status(500).json({ error: 'Error creating user' });
    }
};
exports.register = register;
const login = async (req, res) => {
    try {
        const { username } = req.body;
        if (!username) {
            return res.status(400).json({ error: 'Username is required' });
        }
        const user = await prisma_1.prisma.user.findUnique({
            where: { username }
        });
        if (!user) {
            return res.status(401).json({ error: 'User not found' });
        }
        const token = jsonwebtoken_1.default.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '24h' });
        res.cookie('auth_token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 24 * 60 * 60 * 1000,
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
    }
    catch (error) {
        return res.status(500).json({ error: 'Error logging in' });
    }
};
exports.login = login;
const logout = async (_req, res) => {
    res.clearCookie('auth_token', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        path: '/'
    });
    return res.json({ success: true });
};
exports.logout = logout;
//# sourceMappingURL=authController.js.map