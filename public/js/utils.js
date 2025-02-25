// Utility functions for the Equationator game

// Generate a random number between min and max (inclusive)
function getRandomNumber(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Generate a random number with specified number of digits
function generateNumber(digitLevel) {
    switch (digitLevel) {
        case '2': return getRandomNumber(1, 99);
        case '3': return getRandomNumber(1, 999);
        case '4': return getRandomNumber(1, 9999);
        default: return getRandomNumber(1, 99); // Default to 2 digits
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
    
    // Adjust variance based on operator and answer size
    let variance;
    switch (operator) {
        case '+':
        case '-':
            variance = Math.max(Math.floor(correctAnswer * 0.1), 2); // 10% variance
            break;
        case '*':
            variance = Math.max(Math.floor(correctAnswer * 0.2), 2); // 20% variance for multiplication
            break;
        case '/':
            variance = Math.max(2, Math.min(5, Math.floor(correctAnswer * 0.5))); // Smaller range for division
            break;
        default:
            variance = Math.max(Math.floor(correctAnswer * 0.1), 2);
    }

    // Try to generate wrong answers with different strategies
    const strategies = [
        () => correctAnswer + getRandomNumber(-variance, variance), // Close numbers
        () => correctAnswer + (getRandomNumber(0, 1) ? variance : -variance), // Exactly off by variance
        () => {
            // For multiplication/division, try common mistakes
            if (operator === '*' || operator === '/') {
                return correctAnswer + (getRandomNumber(0, 1) ? 1 : -1); // Off by one
            }
            return correctAnswer + getRandomNumber(-variance, variance);
        }
    ];

    let attempts = 0;
    while (wrongAnswers.size < 3 && attempts < 20) {
        const strategy = strategies[attempts % strategies.length];
        const wrongAnswer = strategy();
        
        if (wrongAnswer > 0 && wrongAnswer !== correctAnswer) {
            wrongAnswers.add(wrongAnswer);
        }
        attempts++;
    }

    // If we still need more wrong answers, use simple offsets
    while (wrongAnswers.size < 3) {
        const offset = wrongAnswers.size + 1;
        if (correctAnswer - offset > 0) wrongAnswers.add(correctAnswer - offset);
        else wrongAnswers.add(correctAnswer + offset);
    }

    return Array.from(wrongAnswers);
}

// Format equation for display
function formatEquation(numbers, operator, format) {
    const operatorMap = {
        '+': '+',
        '-': '-',
        '*': '\\times',
        '/': '\\div'
    };

    // For multiplication with 2 numbers, always show horizontal
    if (operator === '*' && numbers.length === 2 && format !== 'vertical') {
        return `
            <div class="equation">
                \\[${numbers[0]} ${operatorMap[operator]} ${numbers[1]} = \\space ?\\]
            </div>
        `;
    }

    // For division, handle vertical format specially
    if (operator === '/') {
        if (format === 'vertical' || format === 'both') {
            const verticalDivision = `
                \\[\\stackrel{?}{${numbers[1]}\\enclose{longdiv}{${numbers[0]}}}\\]
            `;

            if (format === 'both') {
                return `
                    <div class="equation-container">
                        <div class="equation">
                            \\[${numbers[0]} ${operatorMap[operator]} ${numbers[1]} = \\space ?\\]
                        </div>
                        <div class="equation">
                            ${verticalDivision}
                        </div>
                    </div>
                `;
            }

            return `
                <div class="equation">
                    ${verticalDivision}
                </div>
            `;
        }

        return `
            <div class="equation">
                \\[${numbers[0]} ${operatorMap[operator]} ${numbers[1]} = \\space ?\\]
            </div>
        `;
    }

    // If format is 'both', show both formats
    if (format === 'both') {
        const horizontalTeX = `${numbers.join(` ${operatorMap[operator]} `)} = \\space ?`;
        const verticalTeX = numbers.map(n => n.toString().padStart(8)).join(`\\\\ ${operatorMap[operator]} `) + '\\\\ \\hline \\space ?';
        
        return `
            <div class="equation-container">
                <div class="equation">\\[${horizontalTeX}\\]</div>
                <div class="equation">\\[\\begin{align*}${verticalTeX}\\end{align*}\\]</div>
            </div>
        `;
    }

    // For horizontal format
    if (format === 'horizontal') {
        return `
            <div class="equation">
                \\[${numbers.join(` ${operatorMap[operator]} `)} = \\space ?\\]
            </div>
        `;
    } 
    
    // For vertical format
    return `
        <div class="equation">
            \\[\\begin{align*}
            ${numbers.map(n => n.toString().padStart(8)).join(`\\\\ ${operatorMap[operator]} `)}
            \\\\ \\hline
            \\space ?
            \\end{align*}\\]
        </div>
    `;
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
    
    // Get the range based on digit level
    const maxNum = {
        '2': 99,
        '3': 999,
        '4': 9999
    }[digitLevel] || 99;

    // For division, we'll use a different approach to ensure whole numbers
    if (operator === '/') {
        // Define max quotient based on digit level
        const maxQuotient = {
            '2': 15,   // Increased from 10
            '3': 30,   // Increased from 20
            '4': 50    // Increased from 30
        }[digitLevel] || 15;

        // Define max divisor based on digit level
        const maxDivisor = {
            '2': 12,   // Increased from 10
            '3': 20,   // Increased from 15
            '4': 25    // Increased from 20
        }[digitLevel] || 12;

        // Generate divisor first (avoid 1 to make it more interesting)
        const divisor = getRandomNumber(2, maxDivisor);
        
        // Generate quotient
        const quotient = getRandomNumber(2, maxQuotient);
        
        // Calculate dividend
        const dividend = divisor * quotient;
        
        // If dividend is too large, try a more moderate quotient
        if (dividend > maxNum) {
            const moderateQuotient = Math.min(10, maxQuotient);
            const newDividend = divisor * moderateQuotient;
            if (newDividend <= maxNum) {
                return {
                    numbers: [newDividend, divisor],
                    operator,
                    result: moderateQuotient
                };
            }
            // If still too large, fall back to very simple
            return {
                numbers: [divisor * 2, divisor],
                operator,
                result: 2
            };
        }
        
        return {
            numbers: [dividend, divisor],
            operator,
            result: quotient
        };
    }

    // For subtraction, use a more flexible approach with digit levels
    if (operator === '-') {
        // Define max number for first operand based on digit level
        const maxFirst = {
            '2': 85,    // Increased from 50
            '3': 500,   // Increased from 200
            '4': 1000   // Increased from 500
        }[digitLevel] || 85;

        // For first number, ensure it's large enough for the number of operands
        const firstNum = getRandomNumber(
            paramCount * 15, // Increased minimum
            maxFirst
        );
        
        const numbers = [firstNum];
        let remaining = firstNum;
        
        // For subsequent numbers, take a portion of what's remaining
        for (let i = 1; i < paramCount; i++) {
            // Take at most half of what's remaining
            const maxForThis = Math.floor(remaining / (2 * (paramCount - i)));
            // Ensure we don't generate too small numbers
            const minForThis = Math.max(2, Math.floor(maxForThis / 8)); // Changed from 10 to 8
            
            const nextNum = getRandomNumber(minForThis, maxForThis);
            numbers.push(nextNum);
            remaining -= nextNum;
        }
        
        return {
            numbers,
            operator,
            result: numbers.reduce((a, b) => a - b)
        };
    }

    // For multiplication, use a smarter approach with reasonable limits
    if (operator === '*') {
        // Define max factor based on digit level and param count
        const baseMaxFactor = {
            '2': 15,   // Increased from 12
            '3': 20,   // Increased from 15
            '4': 25    // Increased from 20
        }[digitLevel] || 15;

        // Adjust max factor based on number of operands
        const adjustedMaxFactor = Math.max(5, Math.floor(baseMaxFactor / Math.pow(paramCount, 0.4))); // Changed from sqrt
        
        // For first number, allow slightly larger numbers
        const firstNum = getRandomNumber(2, adjustedMaxFactor * 1.5); // Changed from 2
        const numbers = [firstNum];
        
        // Generate remaining numbers with smaller limits
        for (let i = 1; i < paramCount; i++) {
            const nextNum = getRandomNumber(2, adjustedMaxFactor);
            numbers.push(nextNum);
        }
        
        // Calculate result
        const result = numbers.reduce((a, b) => a * b);
        
        // If result is too large, try with slightly smaller numbers first
        if (result > maxNum) {
            const moderateNumbers = Array(paramCount).fill(0).map(() => 
                getRandomNumber(2, Math.floor(adjustedMaxFactor / 1.5))
            );
            const moderateResult = moderateNumbers.reduce((a, b) => a * b);
            
            if (moderateResult <= maxNum) {
                return {
                    numbers: moderateNumbers,
                    operator,
                    result: moderateResult
                };
            }
            
            // If still too large, fall back to very simple numbers
            return {
                numbers: Array(paramCount).fill(0).map(() => getRandomNumber(2, 5)),
                operator,
                result: numbers.reduce((a, b) => a * b)
            };
        }
        
        return {
            numbers,
            operator,
            result
        };
    }

    // Addition with smarter limits
    const maxPerNumber = Math.min(
        maxNum,
        Math.floor(maxNum / (paramCount * 0.8)) // Allow slightly larger numbers
    );
    
    // Generate numbers with progressive sizing
    const numbers = [];
    let total = 0;
    for (let i = 0; i < paramCount; i++) {
        const remaining = maxNum - total;
        const maxForThis = Math.min(maxPerNumber, Math.floor(remaining / (paramCount - i)));
        const nextNum = getRandomNumber(1, maxForThis);
        numbers.push(nextNum);
        total += nextNum;
    }
    
    return {
        numbers,
        operator,
        result: numbers.reduce((a, b) => a + b)
    };
} 