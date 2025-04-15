"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTips = void 0;
const generateBinaryToDecimalTips = (binary, decimal) => {
    const tips = [];
    const positionValues = binary.split('').map((bit, i) => {
        const position = binary.length - 1 - i;
        return `${bit} × 2^${position}`;
    }).join(' + ');
    tips.push({
        text: `Each position in binary represents a power of 2. From right to left: ${positionValues}`,
        cost: 0
    });
    const steps = binary.split('').map((bit, i) => {
        const position = binary.length - 1 - i;
        return `${bit} × 2^${position} = ${parseInt(bit) * Math.pow(2, position)}`;
    }).join(', ');
    tips.push({
        text: `Let's calculate each position: ${steps}`,
        cost: 5
    });
    const minPossible = Math.pow(2, binary.length - 1);
    const maxPossible = Math.pow(2, binary.length) - 1;
    tips.push({
        text: `This ${binary.length}-bit number is between ${minPossible} and ${maxPossible}`,
        cost: 10
    });
    const missingIndex = Math.floor(Math.random() * decimal.length);
    const answerWithMissing = decimal.split('').map((d, i) => i === missingIndex ? '_' : d).join('');
    tips.push({
        text: `The answer is ${answerWithMissing}`,
        cost: 15
    });
    return tips;
};
const getTips = (question, usedTips = 0) => {
    const binaryMatch = question.question.match(/binary number (\d+)/);
    if (!binaryMatch)
        return [];
    const binary = binaryMatch[1];
    const decimal = question.answer;
    const allTips = generateBinaryToDecimalTips(binary, decimal);
    if (usedTips >= allTips.length) {
        return [{
                text: "You've used all available tips for this question!",
                cost: 0
            }];
    }
    return [allTips[usedTips]];
};
exports.getTips = getTips;
//# sourceMappingURL=tipsGenerator.js.map