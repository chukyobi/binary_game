"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTip = exports.getAssets = exports.getLevels = exports.updateScore = exports.submitAnswer = exports.getQuestion = void 0;
const prisma_1 = require("../lib/prisma");
const questionGenerator_1 = require("../utils/questionGenerator");
const tipsGenerator_1 = require("../utils/tipsGenerator");
const getQuestion = async (req, res) => {
    try {
        const { level } = req.query;
        const levelNum = parseInt(level);
        if (!req.user) {
            return res.status(401).json({ message: 'Unauthorized' });
        }
        const gameProgress = await prisma_1.prisma.gameProgress.findFirst({
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
        const questionCount = gameProgress ? gameProgress.score / 10 : 0;
        const question = (0, questionGenerator_1.generateQuestion)(levelNum, questionCount);
        const levelRecord = await prisma_1.prisma.level.findFirst({
            where: { number: levelNum }
        });
        if (!levelRecord) {
            return res.status(404).json({ message: 'Level not found' });
        }
        const storedQuestion = await prisma_1.prisma.question.create({
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
    }
    catch (error) {
        return res.status(500).json({ message: 'Error generating question' });
    }
};
exports.getQuestion = getQuestion;
const submitAnswer = async (req, res) => {
    try {
        const { questionId, answer } = req.body;
        if (!req.user) {
            return res.status(401).json({ message: 'Unauthorized' });
        }
        const userId = req.user.userId;
        const question = await prisma_1.prisma.question.findUnique({
            where: { id: questionId }
        });
        if (!question) {
            return res.status(404).json({ message: 'Question not found' });
        }
        const isCorrect = question.answer === answer;
        if (isCorrect) {
            await prisma_1.prisma.user.update({
                where: { id: userId },
                data: {
                    gems: {
                        increment: 10
                    }
                }
            });
        }
        return res.json({ isCorrect });
    }
    catch (error) {
        return res.status(500).json({ message: 'Error submitting answer' });
    }
};
exports.submitAnswer = submitAnswer;
const updateScore = async (req, res) => {
    try {
        const { score, level } = req.body;
        if (!req.user) {
            return res.status(401).json({ message: 'Unauthorized' });
        }
        const userId = req.user.userId;
        const user = await prisma_1.prisma.user.findUnique({
            where: { id: userId }
        });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        if (score > user.highScore) {
            await prisma_1.prisma.user.update({
                where: { id: userId },
                data: { highScore: score }
            });
        }
        const levelRecord = await prisma_1.prisma.level.findFirst({
            where: { number: level }
        });
        if (!levelRecord) {
            return res.status(404).json({ message: 'Level not found' });
        }
        await prisma_1.prisma.gameProgress.create({
            data: {
                userId,
                levelId: levelRecord.id,
                score,
                completed: true
            }
        });
        return res.json({ message: 'Score updated successfully' });
    }
    catch (error) {
        return res.status(500).json({ message: 'Error updating score' });
    }
};
exports.updateScore = updateScore;
const getLevels = async (_req, res) => {
    try {
        const levels = await prisma_1.prisma.level.findMany({
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
    }
    catch (error) {
        console.error('Error fetching levels:', error);
        return res.status(500).json({ error: 'Failed to fetch levels' });
    }
};
exports.getLevels = getLevels;
const getAssets = async (_req, res) => {
    try {
        const [characters, environments] = await Promise.all([
            prisma_1.prisma.character.findMany({
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
            prisma_1.prisma.environment.findMany({
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
    }
    catch (error) {
        console.error('Error fetching assets:', error);
        res.status(500).json({ error: 'Failed to fetch assets' });
    }
};
exports.getAssets = getAssets;
const getTip = async (req, res) => {
    try {
        const { questionId } = req.query;
        if (!req.user) {
            return res.status(401).json({ message: 'Unauthorized' });
        }
        const question = await prisma_1.prisma.question.findUnique({
            where: { id: questionId }
        });
        if (!question) {
            return res.status(404).json({ message: 'Question not found' });
        }
        const tipUsage = await prisma_1.prisma.tipUsage.findFirst({
            where: {
                userId: req.user.userId,
                questionId: questionId
            }
        });
        const usedTips = (tipUsage === null || tipUsage === void 0 ? void 0 : tipUsage.count) || 0;
        const tips = (0, tipsGenerator_1.getTips)({
            type: question.type,
            question: question.question,
            answer: question.answer,
            options: JSON.parse(question.options)
        }, usedTips);
        if (tips.length === 0) {
            return res.status(404).json({ message: 'No tips available' });
        }
        const tip = tips[0];
        if (usedTips >= 3) {
            const user = await prisma_1.prisma.user.findUnique({
                where: { id: req.user.userId }
            });
            if (!user || user.gems < tip.cost) {
                return res.status(400).json({
                    message: 'Not enough gems',
                    requiredGems: tip.cost,
                    currentGems: (user === null || user === void 0 ? void 0 : user.gems) || 0
                });
            }
            await prisma_1.prisma.user.update({
                where: { id: req.user.userId },
                data: {
                    gems: {
                        decrement: tip.cost
                    }
                }
            });
        }
        if (tipUsage) {
            await prisma_1.prisma.tipUsage.update({
                where: { id: tipUsage.id },
                data: { count: usedTips + 1 }
            });
        }
        else {
            await prisma_1.prisma.tipUsage.create({
                data: {
                    userId: req.user.userId,
                    questionId: questionId,
                    count: 1
                }
            });
        }
        return res.json({
            tip: tip.text,
            cost: tip.cost,
            usedTips: usedTips + 1
        });
    }
    catch (error) {
        return res.status(500).json({ message: 'Error getting tip' });
    }
};
exports.getTip = getTip;
//# sourceMappingURL=gameController.js.map