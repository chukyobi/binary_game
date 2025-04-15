"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCharacterById = exports.getEnvironments = exports.getCharacters = void 0;
const prisma_1 = require("../lib/prisma");
const getCharacters = async (_req, res) => {
    try {
        const characters = await prisma_1.prisma.character.findMany();
        return res.json(characters);
    }
    catch (error) {
        return res.status(500).json({ error: 'Failed to fetch characters' });
    }
};
exports.getCharacters = getCharacters;
const getEnvironments = async (_req, res) => {
    try {
        const environments = await prisma_1.prisma.environment.findMany();
        return res.json(environments);
    }
    catch (error) {
        return res.status(500).json({ error: 'Failed to fetch environments' });
    }
};
exports.getEnvironments = getEnvironments;
const getCharacterById = async (req, res) => {
    try {
        const { id } = req.params;
        const character = await prisma_1.prisma.character.findUnique({
            where: { id }
        });
        if (!character) {
            return res.status(404).json({ error: 'Character not found' });
        }
        return res.json(character);
    }
    catch (error) {
        return res.status(500).json({ error: 'Failed to fetch character' });
    }
};
exports.getCharacterById = getCharacterById;
//# sourceMappingURL=assetController.js.map