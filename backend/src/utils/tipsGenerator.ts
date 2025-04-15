interface Tip {
  text: string;
  cost: number;
}

const generateBinaryToDecimalTips = (binary: string, decimal: string): Tip[] => {
  const tips: Tip[] = [];
  
  // Tip 1: Explain the position values
  const positionValues = binary.split('').map((bit, i) => {
    const position = binary.length - 1 - i;
    return `${bit} × 2^${position}`;
  }).join(' + ');
  
  tips.push({
    text: `Each position in binary represents a power of 2. From right to left: ${positionValues}`,
    cost: 0
  });
  
  // Tip 2: Show the calculation steps
  const steps = binary.split('').map((bit, i) => {
    const position = binary.length - 1 - i;
    return `${bit} × 2^${position} = ${parseInt(bit) * Math.pow(2, position)}`;
  }).join(', ');
  
  tips.push({
    text: `Let's calculate each position: ${steps}`,
    cost: 5
  });
  
  // Tip 3: Give a range hint
  const minPossible = Math.pow(2, binary.length - 1);
  const maxPossible = Math.pow(2, binary.length) - 1;
  
  tips.push({
    text: `This ${binary.length}-bit number is between ${minPossible} and ${maxPossible}`,
    cost: 10
  });
  
  // Tip 4: Show the answer with one digit missing
  const missingIndex = Math.floor(Math.random() * decimal.length);
  const answerWithMissing = decimal.split('').map((d, i) => i === missingIndex ? '_' : d).join('');
  
  tips.push({
    text: `The answer is ${answerWithMissing}`,
    cost: 15
  });
  
  return tips;
};

export const getTips = (question: {
  type: string;
  question: string;
  answer: string;
  options: string[];
}, usedTips: number = 0): Tip[] => {
  // Extract binary number from question
  const binaryMatch = question.question.match(/binary number (\d+)/);
  if (!binaryMatch) return [];
  
  const binary = binaryMatch[1];
  const decimal = question.answer;
  
  // Get all available tips
  const allTips = generateBinaryToDecimalTips(binary, decimal);
  
  // Return tips based on how many have been used
  if (usedTips >= allTips.length) {
    return [{
      text: "You've used all available tips for this question!",
      cost: 0
    }];
  }
  
  // Return the next available tip
  return [allTips[usedTips]];
}; 