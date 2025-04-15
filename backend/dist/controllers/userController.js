"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateUserProfile = exports.getLeaderboard = exports.getUserProfile = void 0;
const prisma_1 = require("../lib/prisma");
const getUserProfile = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await prisma_1.prisma.user.findUnique({
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
    }
    catch (error) {
        return res.status(500).json({ message: 'Error fetching user profile' });
    }
};
exports.getUserProfile = getUserProfile;
const getLeaderboard = async (_req, res) => {
    try {
        const users = await prisma_1.prisma.user.findMany({
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
    }
    catch (error) {
        return res.status(500).json({ message: 'Error fetching leaderboard' });
    }
};
exports.getLeaderboard = getLeaderboard;
const updateUserProfile = async (req, res) => {
    try {
        const { id } = req.params;
        const { username, email } = req.body;
        const user = await prisma_1.prisma.user.findUnique({
            where: { id }
        });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        const updatedUser = await prisma_1.prisma.user.update({
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
    }
    catch (error) {
        return res.status(500).json({ message: 'Error updating user profile' });
    }
};
exports.updateUserProfile = updateUserProfile;
//# sourceMappingURL=userController.js.map