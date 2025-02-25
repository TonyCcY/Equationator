// Utility functions for the Equationator game

// Generate a random number between min and max (inclusive)
function getRandomNumber(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Generate a random number with specified number of digits
function generateNumber(digitLevel) {
    switch (digitLevel) {
        case '1': return getRandomNumber(1, 9);
        case '2': return getRandomNumber(10, 99);
        case '3': return getRandomNumber(100, 999);
        default: return getRandomNumber(1, 9);
    }
}

// Find divisors of a number for division questions
function findDivisors(num) {
    const divisors = [];
    for (let i = 1; i <= Math.sqrt(num); i++) {
        if (num % i === 0) {
            divisors.push(i);
            if (i !== num / i) {
                divisors.push(num / i);
            }
        }
    }
    return divisors.sort((a, b) => a - b);
}

// Generate plausible wrong answers
function generateWrongAnswers(correctAnswer, operator) {
    const wrongAnswers = new Set();
    const variance = Math.max(Math.floor(correctAnswer * 0.1), 2); // 10% variance or at least 2

    while (wrongAnswers.size < 3) {
        let wrongAnswer;
        const randomOffset = getRandomNumber(-variance, variance);
        
        // Ensure wrong answer is different from correct answer and positive
        wrongAnswer = correctAnswer + randomOffset;
        if (wrongAnswer > 0 && wrongAnswer !== correctAnswer) {
            wrongAnswers.add(wrongAnswer);
        }
    }

    return Array.from(wrongAnswers);
}

// Format equation for display
function formatEquation(numbers, operator, format) {
    const operatorMap = {
        '+': '+',
        '-': '-',
        '*': '×',
        '/': '÷'
    };

    // For division and multiplication with 2 numbers, always show horizontal
    if (operator === '/' || (operator === '*' && numbers.length === 2)) {
        return `
            <span class="equation">
                <span class="number">${numbers[0]}</span>
                <span class="operator">${operatorMap[operator]}</span>
                <span class="number">${numbers[1]}</span>
                <span class="equals">=</span>
            </span>
        `;
    }

    // If format is 'both', show both formats
    if (format === 'both') {
        return `
            <div class="equation-container">
                <span class="equation">
                    ${numbers.map(n => `<span class="number">${n}</span>`).join(`<span class="operator">${operatorMap[operator]}</span>`)}
                    <span class="equals">=</span>
                </span>
                <span class="equation stacked">
                    ${numbers.map(n => `<span class="number">${n}</span>`).join(`<span class="operator">${operatorMap[operator]}</span>`)}
                    <span class="equals">=</span>
                </span>
            </div>
        `;
    }

    // For horizontal or vertical format
    if (format === 'horizontal') {
        return `
            <span class="equation">
                ${numbers.map(n => `<span class="number">${n}</span>`).join(`<span class="operator">${operatorMap[operator]}</span>`)}
                <span class="equals">=</span>
            </span>
        `;
    } else {
        return `
            <span class="equation stacked">
                ${numbers.map(n => `<span class="number">${n}</span>`).join(`<span class="operator">${operatorMap[operator]}</span>`)}
                <span class="equals">=</span>
            </span>
        `;
    }
}

// Calculate the result of the equation
function calculateResult(numbers, operator) {
    switch (operator) {
        case '+':
            return numbers.reduce((a, b) => a + b);
        case '-':
            return numbers.reduce((a, b) => a - b);
        case '*':
            return numbers.reduce((a, b) => a * b);
        case '/':
            return numbers[0] / numbers[1];
        default:
            return 0;
    }
}

// Generate a valid equation based on game settings
function generateEquation(config) {
    const { digitLevel, paramCount, operator } = config;
    let numbers = [];
    
    if (operator === '/') {
        // Special handling for division to ensure whole number results
        const dividend = generateNumber(digitLevel);
        const divisors = findDivisors(dividend).filter(d => d !== 1 && d !== dividend);
        if (divisors.length === 0) {
            return generateEquation(config); // Try again
        }
        const divisor = divisors[Math.floor(Math.random() * divisors.length)];
        numbers = [dividend, divisor];
    } else if (operator === '-') {
        // Special handling for subtraction to ensure positive results
        let total = generateNumber(digitLevel);
        numbers = [total];
        for (let i = 1; i < paramCount; i++) {
            const nextNum = generateNumber(digitLevel);
            if (total - nextNum <= 0) {
                return generateEquation(config); // Try again
            }
            numbers.push(nextNum);
            total -= nextNum;
        }
    } else {
        // Addition and multiplication
        for (let i = 0; i < paramCount; i++) {
            numbers.push(generateNumber(digitLevel));
        }
    }

    return {
        numbers,
        operator,
        result: calculateResult(numbers, operator)
    };
} 