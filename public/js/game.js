// Game state
let gameState = {
    config: null,
    questions: [],
    currentQuestionIndex: 0,
    answers: [],
    startTime: null,
    questionHistory: new Set(),
    timer: null,
    elapsedTime: 0
};

// DOM elements
const startPage = document.getElementById('startPage');
const gamePage = document.getElementById('gamePage');
const resultsPage = document.getElementById('resultsPage');
const configForm = document.getElementById('configForm');
const equationDisplay = document.getElementById('equation');
const choicesDisplay = document.getElementById('choices');
const feedbackDisplay = document.getElementById('feedback');
const summary = document.getElementById('summary');
const questionList = document.getElementById('questionList');
const playAgainButton = document.getElementById('playAgain');

// Load saved settings from localStorage
function loadSavedSettings() {
    try {
        // Load digit level and adjust max questions accordingly
        const savedDigitLevel = localStorage.getItem('digitLevel');
        if (savedDigitLevel) {
            document.querySelectorAll('#digitLevel .toggle-btn').forEach(btn => {
                if (btn.dataset.value === savedDigitLevel) {
                    btn.classList.add('active');
                    // Set max questions based on digit level
                    const questionCountInput = document.getElementById('questionCount');
                    questionCountInput.max = savedDigitLevel === '2' ? '100' : '150';
                } else {
                    btn.classList.remove('active');
                }
            });
        }

        // Load other settings as before
        const savedParamCount = localStorage.getItem('paramCount');
        if (savedParamCount) {
            document.getElementById('paramCount').value = savedParamCount;
        }

        const savedOperators = JSON.parse(localStorage.getItem('operators') || '["addOp"]');
        ['addOp', 'subOp', 'mulOp', 'divOp'].forEach(op => {
            document.getElementById(op).checked = savedOperators.includes(op);
        });

        const savedQuestionCount = localStorage.getItem('questionCount');
        if (savedQuestionCount) {
            const questionCountInput = document.getElementById('questionCount');
            // Ensure saved question count doesn't exceed current max
            const maxQuestions = document.querySelector('#digitLevel .toggle-btn.active').dataset.value === '2' ? 100 : 150;
            questionCountInput.value = Math.min(parseInt(savedQuestionCount), maxQuestions);
        }

        const savedDisplayFormat = localStorage.getItem('displayFormat');
        if (savedDisplayFormat) {
            document.querySelectorAll('#displayFormat .toggle-btn').forEach(btn => {
                btn.classList.toggle('active', btn.dataset.value === savedDisplayFormat);
            });
        }
    } catch (error) {
        console.error('Error loading saved settings:', error);
        // If there's an error, we'll just use default settings
    }
}

// Save current settings to localStorage
function saveSettings(config) {
    try {
        localStorage.setItem('digitLevel', config.digitLevel);
        localStorage.setItem('paramCount', config.paramCount);
        localStorage.setItem('questionCount', config.questionCount);
        localStorage.setItem('displayFormat', config.displayFormat);
        
        // Save selected operators
        const selectedOperators = ['addOp', 'subOp', 'mulOp', 'divOp']
            .filter(op => document.getElementById(op).checked);
        localStorage.setItem('operators', JSON.stringify(selectedOperators));
    } catch (error) {
        console.error('Error saving settings:', error);
    }
}

// Format time function
function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
}

// Start timer function
function startTimer() {
    gameState.startTime = Date.now();
    gameState.elapsedTime = 0;
    
    // Update timer every second
    gameState.timer = setInterval(() => {
        gameState.elapsedTime = Math.floor((Date.now() - gameState.startTime) / 1000);
        document.getElementById('timer').textContent = formatTime(gameState.elapsedTime);
    }, 1000);
}

// Stop timer function
function stopTimer() {
    if (gameState.timer) {
        clearInterval(gameState.timer);
        gameState.timer = null;
    }
}

// Initialize game
function initGame(config) {
    gameState.config = config;
    gameState.questions = [];
    gameState.currentQuestionIndex = 0;
    gameState.answers = [];
    gameState.questionHistory = new Set();

    // Generate questions
    for (let i = 0; i < config.questionCount; i++) {
        let equation;
        let questionKey;
        let attempts = 0;
        const MAX_ATTEMPTS = 20;

        // Keep trying until we get a unique question or reach max attempts
        do {
            equation = generateEquation({
                digitLevel: config.digitLevel,
                paramCount: config.paramCount,
                operator: config.operator
            });
            
            // Create a unique key for this question
            questionKey = `${equation.numbers.join(',')}${equation.operator}`;
            attempts++;

            // If we've tried too many times, clear history and accept any valid question
            if (attempts >= MAX_ATTEMPTS) {
                gameState.questionHistory.clear();
                break;
            }
        } while (gameState.questionHistory.has(questionKey));

        // Add this question to history
        gameState.questionHistory.add(questionKey);
        
        const wrongAnswers = generateWrongAnswers(equation.result, equation.operator);
        const choices = [...wrongAnswers, equation.result]
            .sort(() => Math.random() - 0.5);

        gameState.questions.push({
            ...equation,
            choices,
            format: config.displayFormat
        });
    }

    // Update HTML structure for progress and timer
    const progressTimerContainer = document.createElement('div');
    progressTimerContainer.className = 'progress-timer-container';
    progressTimerContainer.innerHTML = `
        <div class="progress-info">
            <div class="progress-text" id="progressText">Question 1 of ${config.questionCount}</div>
            <div class="timer" id="timer">00:00</div>
        </div>
        <div class="progress-container">
            <div class="progress-bar" id="progressBar" style="width: 0%"></div>
        </div>
    `;

    // Insert progress timer container at the top of the game page
    gamePage.insertBefore(progressTimerContainer, gamePage.firstChild);

    // Start the timer
    startTimer();

    showQuestion();
}

// Display current question
function showQuestion() {
    const question = gameState.questions[gameState.currentQuestionIndex];
    
    // Update progress
    const progress = ((gameState.currentQuestionIndex + 1) / gameState.questions.length) * 100;
    document.getElementById('progressBar').style.width = `${progress}%`;
    document.getElementById('progressText').textContent = 
        `Question ${gameState.currentQuestionIndex + 1} of ${gameState.questions.length}`;
    
    // Display equation
    equationDisplay.innerHTML = formatEquation(
        question.numbers,
        question.operator,
        question.format
    );

    // Refresh MathJax rendering
    MathJax.typesetPromise().then(() => {
        // Display choices after equation is rendered
        choicesDisplay.innerHTML = question.choices
            .map(choice => `
                <button class="choice-btn" data-value="${choice}">
                    ${choice}
                </button>
            `).join('');
        
        // Refresh MathJax for choices
        MathJax.typesetPromise().then(() => {
            // Add click handlers to buttons
            const buttons = choicesDisplay.querySelectorAll('.choice-btn');
            buttons.forEach(button => {
                button.addEventListener('click', () => handleAnswer(parseInt(button.dataset.value)));
            });
        });
    });

    // Hide feedback
    feedbackDisplay.className = 'feedback hidden';
}

// Handle answer selection
function handleAnswer(selectedAnswer) {
    const question = gameState.questions[gameState.currentQuestionIndex];
    const correct = selectedAnswer === question.result;

    // Disable all buttons and show correct/wrong states
    const buttons = choicesDisplay.querySelectorAll('.choice-btn');
    buttons.forEach(button => {
        const value = parseInt(button.dataset.value);
        button.disabled = true;
        if (value === question.result) {
            button.classList.add('correct');
        } else if (value === selectedAnswer && !correct) {
            button.classList.add('wrong');
        }
    });

    // Store answer
    gameState.answers.push({
        selected: selectedAnswer,
        correct: correct
    });

    // Show feedback
    feedbackDisplay.textContent = correct ? 'Correct!' : 'Wrong!';
    feedbackDisplay.className = `feedback ${correct ? 'correct' : 'wrong'}`;

    // Move to next question or show results
    setTimeout(() => {
        if (gameState.currentQuestionIndex < gameState.questions.length - 1) {
            gameState.currentQuestionIndex++;
            showQuestion();
        } else {
            showResults();
        }
    }, 1500);
}

// Show results page
function showResults() {
    // Stop the timer
    stopTimer();

    gamePage.classList.add('hidden');
    resultsPage.classList.remove('hidden');

    const correctCount = gameState.answers.filter(a => a.correct).length;
    const totalQuestions = gameState.questions.length;
    const percentage = Math.round((correctCount / totalQuestions) * 100);

    // Use the elapsed time from the timer
    const timeString = formatTime(gameState.elapsedTime);

    // Show summary
    summary.innerHTML = `
        <h2>Score: ${correctCount}/${totalQuestions} (${percentage}%)</h2>
        <p>Time taken: ${timeString}</p>
    `;

    // Show question list with horizontal format only
    questionList.innerHTML = gameState.answers.map((answer, index) => {
        const question = gameState.questions[index];
        const equationStr = formatEquation(question.numbers, question.operator, 'horizontal');
        return `
            <div class="question-item">
                <div class="equation-wrapper">
                    ${equationStr}
                </div>
                <div class="answers-grid">
                    <p>Your answer:</p>
                    <p>${answer.selected}</p>
                    ${!answer.correct ? `
                        <p>Correct answer:</p>
                        <p>${question.result}</p>
                    ` : ''}
                </div>
                <div class="status ${answer.correct ? 'correct' : 'wrong'}">
                    ${answer.correct ? '✔ Correct' : '✘ Wrong'}
                </div>
            </div>
        `;
    }).join('');

    // Refresh MathJax rendering
    MathJax.typesetPromise();
}

// Event Listeners
configForm.addEventListener('submit', (e) => {
    e.preventDefault();

    // Get selected values from toggle groups
    const digitLevel = document.querySelector('#digitLevel .toggle-btn.active').dataset.value;
    const displayFormat = document.querySelector('#displayFormat .toggle-btn.active').dataset.value;

    // Validate operator selection
    const operators = {
        addOp: '+',
        subOp: '-',
        mulOp: '*',
        divOp: '/'
    };

    // Get all selected operators
    let selectedOperators = Object.entries(operators)
        .filter(([id]) => document.getElementById(id).checked)
        .map(([, symbol]) => symbol);
    
    if (selectedOperators.length === 0) {
        alert('Please select at least one operator');
        return;
    }

    const paramCount = parseInt(document.getElementById('paramCount').value);
    const questionCount = parseInt(document.getElementById('questionCount').value);

    // Validate division with param count
    if (selectedOperators.includes('/') && paramCount !== 2) {
        alert('Division is only supported with 2 numbers. Please adjust your settings.');
        return;
    }

    // Initialize game state
    gameState.config = {
        digitLevel: digitLevel,
        paramCount: paramCount,
        questionCount: questionCount,
        displayFormat: displayFormat
    };
    gameState.questions = [];
    gameState.currentQuestionIndex = 0;
    gameState.answers = [];
    gameState.questionHistory = new Set();

    // Save settings
    saveSettings(gameState.config);

    // Distribute questions among selected operators
    const questionsPerOperator = Math.floor(questionCount / selectedOperators.length);
    const remainingQuestions = questionCount % selectedOperators.length;
    let currentQuestionCount = 0;

    // Generate questions for each operator
    for (const operator of selectedOperators) {
        // Calculate how many questions for this operator
        const operatorQuestionCount = operator === selectedOperators[0] ? 
            questionsPerOperator + remainingQuestions : questionsPerOperator;

        for (let i = 0; i < operatorQuestionCount && currentQuestionCount < questionCount; i++) {
            let equation = null;
            let attempts = 0;
            const MAX_ATTEMPTS = 5;

            // Try to generate a valid equation
            while (attempts < MAX_ATTEMPTS && !equation) {
                try {
                    equation = generateEquation({
                        digitLevel: digitLevel,
                        paramCount: operator === '/' ? 2 : paramCount,
                        operator: operator
                    });

                    // Create unique key for this question
                    const questionKey = `${equation.numbers.join(',')}${operator}`;

                    // Check if this question is unique
                    if (gameState.questionHistory.has(questionKey)) {
                        equation = null; // Try again if duplicate
                    } else {
                        gameState.questionHistory.add(questionKey);
                    }
                } catch (error) {
                    console.error(`Error generating ${operator} equation:`, error);
                    equation = null;
                }
                attempts++;
            }

            // If we got a valid equation, add it to questions
            if (equation) {
                try {
                    const wrongAnswers = generateWrongAnswers(equation.result, operator);
                    const choices = [...wrongAnswers, equation.result]
                        .sort(() => Math.random() - 0.5);

                    gameState.questions.push({
                        ...equation,
                        choices,
                        format: displayFormat
                    });
                    currentQuestionCount++;
                } catch (error) {
                    console.error('Error generating choices:', error);
                }
            }
        }
    }

    // If we couldn't generate enough questions, show error
    if (gameState.questions.length < questionCount / 2) {
        alert('Unable to generate enough valid questions. Please try different settings.');
        return;
    }

    // Shuffle the questions to mix operators
    for (let i = gameState.questions.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [gameState.questions[i], gameState.questions[j]] = 
        [gameState.questions[j], gameState.questions[i]];
    }

    startPage.classList.add('hidden');
    gamePage.classList.remove('hidden');
    
    // Start the timer before showing the first question
    startTimer();
    
    showQuestion();
});

playAgainButton.addEventListener('click', () => {
    resultsPage.classList.add('hidden');
    startPage.classList.remove('hidden');
    
    // Load saved settings instead of resetting to defaults
    loadSavedSettings();
});

// Handle toggle buttons
document.querySelectorAll('.toggle-group').forEach(group => {
    const buttons = group.querySelectorAll('.toggle-btn');
    buttons.forEach(button => {
        button.addEventListener('click', () => {
            buttons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            
            // Save the setting immediately
            const settingName = group.id;
            localStorage.setItem(settingName, button.dataset.value);
        });
    });
});

// Add handlers for immediate saving of number inputs
['paramCount', 'questionCount'].forEach(id => {
    const input = document.getElementById(id);
    input.addEventListener('change', () => {
        localStorage.setItem(id, input.value);
    });
});

// Add handlers for immediate saving of operator checkboxes
document.querySelectorAll('.operators input[type="checkbox"]').forEach(checkbox => {
    checkbox.addEventListener('change', () => {
        const selectedOperators = ['addOp', 'subOp', 'mulOp', 'divOp']
            .filter(op => document.getElementById(op).checked);
        localStorage.setItem('operators', JSON.stringify(selectedOperators));
    });
});

// Add handlers for digit level selection
document.querySelectorAll('#digitLevel .toggle-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        const digitLevel = btn.dataset.value;
        const questionCountInput = document.getElementById('questionCount');
        
        // Adjust max questions based on digit level
        if (digitLevel === '2') {
            questionCountInput.max = '100';
            // If current value is higher than new max, adjust it
            if (parseInt(questionCountInput.value) > 100) {
                questionCountInput.value = '100';
            }
        } else {
            questionCountInput.max = '150';
        }
        
        // Update active state
        btn.parentElement.querySelectorAll('.toggle-btn').forEach(b => 
            b.classList.toggle('active', b === btn)
        );
        
        // Save the setting
        localStorage.setItem('digitLevel', digitLevel);
    });
});

// Load saved settings when the page loads
document.addEventListener('DOMContentLoaded', loadSavedSettings); 