// Game state
let gameState = {
    config: null,
    questions: [],
    currentQuestionIndex: 0,
    answers: [],
    startTime: null
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
        // Load digit level
        const savedDigitLevel = localStorage.getItem('digitLevel');
        if (savedDigitLevel) {
            document.querySelectorAll('#digitLevel .toggle-btn').forEach(btn => {
                btn.classList.toggle('active', btn.dataset.value === savedDigitLevel);
            });
        }

        // Load param count
        const savedParamCount = localStorage.getItem('paramCount');
        if (savedParamCount) {
            document.getElementById('paramCount').value = savedParamCount;
        }

        // Load operators
        const savedOperators = JSON.parse(localStorage.getItem('operators') || '["addOp"]');
        ['addOp', 'subOp', 'mulOp', 'divOp'].forEach(op => {
            document.getElementById(op).checked = savedOperators.includes(op);
        });

        // Load question count
        const savedQuestionCount = localStorage.getItem('questionCount');
        if (savedQuestionCount) {
            document.getElementById('questionCount').value = savedQuestionCount;
        }

        // Load display format
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

// Initialize game
function initGame(config) {
    gameState.config = config;
    gameState.questions = [];
    gameState.currentQuestionIndex = 0;
    gameState.answers = [];
    gameState.startTime = Date.now();

    // Generate questions
    for (let i = 0; i < config.questionCount; i++) {
        const equation = generateEquation({
            digitLevel: config.digitLevel,
            paramCount: config.paramCount,
            operator: config.operator
        });
        
        const wrongAnswers = generateWrongAnswers(equation.result, equation.operator);
        const choices = [...wrongAnswers, equation.result]
            .sort(() => Math.random() - 0.5);

        gameState.questions.push({
            ...equation,
            choices,
            format: config.displayFormat === 'both' ? 
                (Math.random() < 0.5 ? 'horizontal' : 'vertical') :
                config.displayFormat
        });
    }

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

    // Display choices
    choicesDisplay.innerHTML = question.choices
        .map(choice => `
            <button class="choice-btn" data-value="${choice}">
                ${choice}
            </button>
        `).join('');

    // Add click handlers to buttons
    const buttons = choicesDisplay.querySelectorAll('.choice-btn');
    buttons.forEach(button => {
        button.addEventListener('click', () => handleAnswer(parseInt(button.dataset.value)));
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
    gamePage.classList.add('hidden');
    resultsPage.classList.remove('hidden');

    const correctCount = gameState.answers.filter(a => a.correct).length;
    const totalQuestions = gameState.questions.length;
    const percentage = Math.round((correctCount / totalQuestions) * 100);

    // Show summary
    summary.innerHTML = `
        <h2>Score: ${correctCount}/${totalQuestions} (${percentage}%)</h2>
        <p>Time taken: ${Math.round((Date.now() - gameState.startTime) / 1000)} seconds</p>
    `;

    // Show question list
    questionList.innerHTML = gameState.answers.map((answer, index) => `
        <div class="question-item">
            <p>${formatEquation(gameState.questions[index].numbers, gameState.questions[index].operator, gameState.questions[index].format).replace(/\n/g, '<br>')}</p>
            <p>Your answer: ${answer.selected}</p>
            ${!answer.correct ? 
                `<p>Correct answer: ${gameState.questions[index].result}</p>` : ''}
            <p>${answer.correct ? '✔ Correct' : '✘ Wrong'}</p>
        </div>
    `).join('');
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
    const selectedOperators = Object.entries(operators)
        .filter(([id]) => document.getElementById(id).checked)
        .map(([, symbol]) => symbol);
    
    if (selectedOperators.length === 0) {
        alert('Please select at least one operator');
        return;
    }

    const config = {
        digitLevel: digitLevel,
        paramCount: parseInt(document.getElementById('paramCount').value),
        operator: selectedOperators[Math.floor(Math.random() * selectedOperators.length)],
        questionCount: parseInt(document.getElementById('questionCount').value),
        displayFormat: displayFormat
    };

    // Save settings before starting the game
    saveSettings(config);

    // Generate new questions with different operators
    gameState.config = config;
    gameState.questions = [];
    gameState.currentQuestionIndex = 0;
    gameState.answers = [];
    gameState.startTime = Date.now();

    // Generate questions with random operators from selection
    for (let i = 0; i < config.questionCount; i++) {
        const questionOperator = selectedOperators[Math.floor(Math.random() * selectedOperators.length)];
        const equation = generateEquation({
            digitLevel: config.digitLevel,
            paramCount: config.paramCount,
            operator: questionOperator
        });
        
        const wrongAnswers = generateWrongAnswers(equation.result, questionOperator);
        const choices = [...wrongAnswers, equation.result]
            .sort(() => Math.random() - 0.5);

        gameState.questions.push({
            ...equation,
            choices,
            format: config.displayFormat // Use the format directly without random selection
        });
    }

    startPage.classList.add('hidden');
    gamePage.classList.remove('hidden');
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

// Load saved settings when the page loads
document.addEventListener('DOMContentLoaded', loadSavedSettings); 