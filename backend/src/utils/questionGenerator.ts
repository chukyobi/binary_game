interface Question {
  question: string;
  answer: string;
  options: string[];
  type: 'binary_to_decimal' | 'decimal_to_binary' | 
        'binary_to_hex' | 'hex_to_binary' |
        'binary_to_octal' | 'octal_to_binary' |
        'binary_addition' | 'binary_subtraction' | 
        'bitwise_operation';
  difficulty: 'easy' | 'medium' | 'hard';
}

const generateRandomBinary = (bits: number): string => {
  return Array.from({ length: bits }, () => Math.random() < 0.5 ? '1' : '0').join('');
};

const generateRandomDecimal = (max: number): number => {
  return Math.floor(Math.random() * max);
};

const padBinary = (binary: string, bits: number): string => {
  return binary.padStart(bits, '0');
};

const performBinaryOperation = (binaryA: string, binaryB: string, operation: '+' | '-'): string => {
  const decimalA = parseInt(binaryA, 2);
  const decimalB = parseInt(binaryB, 2);
  
  if (operation === '+') {
    return (decimalA + decimalB).toString(2);
  } else {
    // Handle subtraction with negative results
    if (decimalA < decimalB) {
      return (decimalB - decimalA).toString(2);
    }
    return (decimalA - decimalB).toString(2);
  }
};

const performBitwiseOperation = (binaryA: string, binaryB: string, operation: 'AND' | 'OR' | 'XOR'): string => {
  const decimalA = parseInt(binaryA, 2);
  const decimalB = parseInt(binaryB, 2);
  
  let result: number;
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

export const generateQuestion = (level: number, questionCount: number = 0): Question => {
  // Validate level and question count
  if (level < 1 || questionCount < 0) {
    throw new Error('Invalid level or question count');
  }

  // For level 1, determine difficulty based on question count
  if (level === 1) {
    const difficulty = questionCount < 5 ? 'easy' : 
                      questionCount < 10 ? 'medium' : 'hard';
    
    // Start with 4 bits, increase to 6 bits after 5 questions, 8 bits after 10
    const bits = questionCount < 5 ? 4 : 
                 questionCount < 10 ? 6 : 8;
    
    const binary = generateRandomBinary(bits);
    const decimal = parseInt(binary, 2).toString();
    
    // Generate options with varying difficulty
    const options = [decimal];
    while (options.length < 4) {
      let randomDecimal: string;
      if (questionCount < 5) {
        // Easy: options close to correct answer
        const offset = Math.floor(Math.random() * 3) - 1; // -1, 0, or 1
        randomDecimal = (parseInt(decimal) + offset).toString();
      } else if (questionCount < 10) {
        // Medium: options within a wider range
        const offset = Math.floor(Math.random() * 5) - 2; // -2 to 2
        randomDecimal = (parseInt(decimal) + offset).toString();
      } else {
        // Hard: completely random options
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
  
  // For other levels, use the existing logic
  const bits = level <= 3 ? 4 : level <= 6 ? 6 : level <= 9 ? 8 : 10;
  const difficulty = level <= 3 ? 'easy' : level <= 6 ? 'medium' : 'hard';
  
  // Weighted random selection of question type based on level
  const typeWeights: Record<Question['type'], number> = {
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
  
  // Normalize weights to ensure they sum to 1
  const totalWeight = Object.values(typeWeights).reduce((a, b) => a + b, 0);
  (Object.keys(typeWeights) as Question['type'][]).forEach(key => {
    typeWeights[key] /= totalWeight;
  });
  
  const random = Math.random();
  let type: Question['type'] = 'binary_to_decimal'; // Default type
  let cumulativeWeight = 0;
  
  for (const [t, weight] of Object.entries(typeWeights)) {
    cumulativeWeight += weight;
    if (random <= cumulativeWeight) {
      type = t as Question['type'];
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
        const randomBinary = padBinary(
          generateRandomDecimal(Math.pow(2, bits)).toString(2),
          bits
        );
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
        const randomBinary = padBinary(
          generateRandomDecimal(Math.pow(2, bits)).toString(2),
          bits
        );
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
        const randomBinary = padBinary(
          generateRandomDecimal(Math.pow(2, bits)).toString(2),
          bits
        );
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
      const operations = ['AND', 'OR', 'XOR'] as const;
      const operation = operations[Math.floor(Math.random() * operations.length)];
      const answer = performBitwiseOperation(binaryA, binaryB, operation);
      
      const options = [answer];
      while (options.length < 4) {
        const randomBinary = padBinary(
          generateRandomDecimal(Math.pow(2, bits)).toString(2),
          bits
        );
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