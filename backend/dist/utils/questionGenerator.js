"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateQuestion = void 0;
const generateRandomBinary = (bits) => {
    return Array.from({ length: bits }, () => Math.random() < 0.5 ? '1' : '0').join('');
};
const generateRandomDecimal = (max) => {
    return Math.floor(Math.random() * max);
};
const padBinary = (binary, bits) => {
    return binary.padStart(bits, '0');
};
const performBinaryOperation = (binaryA, binaryB, operation) => {
    const decimalA = parseInt(binaryA, 2);
    const decimalB = parseInt(binaryB, 2);
    if (operation === '+') {
        return (decimalA + decimalB).toString(2);
    }
    else {
        if (decimalA < decimalB) {
            return (decimalB - decimalA).toString(2);
        }
        return (decimalA - decimalB).toString(2);
    }
};
const performBitwiseOperation = (binaryA, binaryB, operation) => {
    const decimalA = parseInt(binaryA, 2);
    const decimalB = parseInt(binaryB, 2);
    let result;
    switch (operation) {
        case 'AND':
            result = decimalA & decimalB;
            break;
        case 'OR':
            result = decimalA | decimalB;
            break;
        case 'XOR':
            result = decimalA ^ decimalB;
            break;
        default:
            throw new Error('Invalid bitwise operation');
    }
    return result.toString(2);
};
const generateQuestion = (level, questionCount = 0) => {
    if (level < 1 || questionCount < 0) {
        throw new Error('Invalid level or question count');
    }
    if (level === 1) {
        const difficulty = questionCount < 5 ? 'easy' :
            questionCount < 10 ? 'medium' : 'hard';
        const bits = questionCount < 5 ? 4 :
            questionCount < 10 ? 6 : 8;
        const binary = generateRandomBinary(bits);
        const decimal = parseInt(binary, 2).toString();
        const options = [decimal];
        while (options.length < 4) {
            let randomDecimal;
            if (questionCount < 5) {
                const offset = Math.floor(Math.random() * 3) - 1;
                randomDecimal = (parseInt(decimal) + offset).toString();
            }
            else if (questionCount < 10) {
                const offset = Math.floor(Math.random() * 5) - 2;
                randomDecimal = (parseInt(decimal) + offset).toString();
            }
            else {
                randomDecimal = generateRandomDecimal(Math.pow(2, bits)).toString();
            }
            if (!options.includes(randomDecimal) && parseInt(randomDecimal) >= 0) {
                options.push(randomDecimal);
            }
        }
        return {
            question: `Convert the binary number ${binary} to decimal:`,
            answer: decimal,
            options: options.sort(() => Math.random() - 0.5),
            type: 'binary_to_decimal',
            difficulty
        };
    }
    const bits = level <= 3 ? 4 : level <= 6 ? 6 : level <= 9 ? 8 : 10;
    const difficulty = level <= 3 ? 'easy' : level <= 6 ? 'medium' : 'hard';
    const typeWeights = {
        binary_to_decimal: 0.2,
        decimal_to_binary: 0.2,
        binary_to_hex: level > 3 ? 0.15 : 0,
        hex_to_binary: level > 3 ? 0.15 : 0,
        binary_to_octal: level > 6 ? 0.1 : 0,
        octal_to_binary: level > 6 ? 0.1 : 0,
        binary_addition: level > 3 ? 0.05 : 0,
        binary_subtraction: level > 6 ? 0.05 : 0,
        bitwise_operation: level > 9 ? 0.05 : 0
    };
    const totalWeight = Object.values(typeWeights).reduce((a, b) => a + b, 0);
    Object.keys(typeWeights).forEach(key => {
        typeWeights[key] /= totalWeight;
    });
    const random = Math.random();
    let type = 'binary_to_decimal';
    let cumulativeWeight = 0;
    for (const [t, weight] of Object.entries(typeWeights)) {
        cumulativeWeight += weight;
        if (random <= cumulativeWeight) {
            type = t;
            break;
        }
    }
    switch (type) {
        case 'binary_to_decimal': {
            const binary = generateRandomBinary(bits);
            const decimal = parseInt(binary, 2).toString();
            const options = [decimal];
            while (options.length < 4) {
                const randomDecimal = generateRandomDecimal(Math.pow(2, bits)).toString();
                if (!options.includes(randomDecimal)) {
                    options.push(randomDecimal);
                }
            }
            return {
                question: `Convert the binary number ${binary} to decimal:`,
                answer: decimal,
                options: options.sort(() => Math.random() - 0.5),
                type,
                difficulty
            };
        }
        case 'decimal_to_binary': {
            const decimal = generateRandomDecimal(Math.pow(2, bits)).toString();
            const binary = padBinary(parseInt(decimal).toString(2), bits);
            const options = [binary];
            while (options.length < 4) {
                const randomBinary = padBinary(generateRandomDecimal(Math.pow(2, bits)).toString(2), bits);
                if (!options.includes(randomBinary)) {
                    options.push(randomBinary);
                }
            }
            return {
                question: `Convert the decimal number ${decimal} to binary:`,
                answer: binary,
                options: options.sort(() => Math.random() - 0.5),
                type,
                difficulty
            };
        }
        case 'binary_addition': {
            const binaryA = generateRandomBinary(bits);
            const binaryB = generateRandomBinary(bits);
            const answer = padBinary(performBinaryOperation(binaryA, binaryB, '+'), bits);
            const options = [answer];
            while (options.length < 4) {
                const randomBinary = padBinary(generateRandomDecimal(Math.pow(2, bits)).toString(2), bits);
                if (!options.includes(randomBinary)) {
                    options.push(randomBinary);
                }
            }
            return {
                question: `Add the binary numbers ${binaryA} and ${binaryB}:`,
                answer,
                options: options.sort(() => Math.random() - 0.5),
                type,
                difficulty
            };
        }
        case 'binary_subtraction': {
            const binaryA = generateRandomBinary(bits);
            const binaryB = generateRandomBinary(bits);
            const answer = padBinary(performBinaryOperation(binaryA, binaryB, '-'), bits);
            const options = [answer];
            while (options.length < 4) {
                const randomBinary = padBinary(generateRandomDecimal(Math.pow(2, bits)).toString(2), bits);
                if (!options.includes(randomBinary)) {
                    options.push(randomBinary);
                }
            }
            return {
                question: `Subtract the binary number ${binaryB} from ${binaryA}:`,
                answer,
                options: options.sort(() => Math.random() - 0.5),
                type,
                difficulty
            };
        }
        case 'bitwise_operation': {
            const binaryA = generateRandomBinary(bits);
            const binaryB = generateRandomBinary(bits);
            const operations = ['AND', 'OR', 'XOR'];
            const operation = operations[Math.floor(Math.random() * operations.length)];
            const answer = performBitwiseOperation(binaryA, binaryB, operation);
            const options = [answer];
            while (options.length < 4) {
                const randomBinary = padBinary(generateRandomDecimal(Math.pow(2, bits)).toString(2), bits);
                if (!options.includes(randomBinary)) {
                    options.push(randomBinary);
                }
            }
            return {
                question: `Perform ${operation} operation on ${binaryA} and ${binaryB}:`,
                answer,
                options: options.sort(() => Math.random() - 0.5),
                type,
                difficulty
            };
        }
        default:
            throw new Error('Invalid question type');
    }
};
exports.generateQuestion = generateQuestion;
//# sourceMappingURL=questionGenerator.js.map