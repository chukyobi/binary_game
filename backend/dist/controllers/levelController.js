"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateLevel = exports.createLevel = exports.getLevelById = exports.getLevels = void 0;
const prisma_1 = require("../lib/prisma");
const getLevels = async (_req, res) => {
    try {
        const levels = await prisma_1.prisma.level.findMany({
            include: {
                questions: true,
            },
        });
        res.json(levels);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch levels' });
    }
};
exports.getLevels = getLevels;
const getLevelById = async (req, res) => {
    try {
        const { id } = req.params;
        const level = await prisma_1.prisma.level.findUnique({
            where: { id },
            include: {
                questions: true,
            },
        });
        if (!level) {
            return res.status(404).json({ error: 'Level not found' });
        }
        return res.json(level);
    }
    catch (error) {
        return res.status(500).json({ error: 'Failed to fetch level' });
    }
};
exports.getLevelById = getLevelById;
const createLevel = async (req, res) => {
    try {
        const { number, name, description, difficulty, requiredScore } = req.body;
        const level = await prisma_1.prisma.level.create({
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
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to create level' });
    }
};
exports.createLevel = createLevel;
const updateLevel = async (req, res) => {
    try {
        const { id } = req.params;
        const { number, name, description, difficulty, requiredScore } = req.body;
        const level = await prisma_1.prisma.level.update({
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
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to update level' });
    }
};
exports.updateLevel = updateLevel;
//# sourceMappingURL=levelController.js.map