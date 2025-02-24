// Initialize quiz variables
let countriesData = []; // Will be populated from your JSON file
let quizQuestions = [];
let currentQuestionIndex = 0;
let score = 0;
let answeredQuestions = [];
let selectedOption = null;

// Get DOM elements
const questionElement = document.getElementById('question');
const optionsContainer = document.getElementById('options');
const feedbackElement = document.getElementById('feedback');
const scoreElement = document.getElementById('score');
const prevButton = document.getElementById('prev-btn');
const nextButton = document.getElementById('next-btn');
const progressBar = document.getElementById('progress');
const resultsSection = document.getElementById('results');
const quizContent = document.getElementById('quiz-content');
const finalScoreElement = document.getElementById('final-score');
const finalTotalElement = document.getElementById('final-total');
const resultFeedbackElement = document.getElementById('result-feedback');
const restartButton = document.getElementById('restart-btn');

// Load data from your JSON file
async function loadCountriesData() {
    try {
        const response = await fetch('../Data/preprocessed_data.json');
        if (!response.ok) {
            throw new Error('Failed to load countries data');
        }
        countriesData = await response.json();
        console.log('Data loaded successfully:', countriesData);
        startQuiz();
    } catch (error) {
        console.error('Error loading countries data:', error);
        questionElement.textContent = 'Error loading quiz data. Please make sure the data file is accessible.';
        feedbackElement.textContent = 'Check the console for more details.';
    }
}

// Function to get random item from array
function getRandomItem(array) {
    return array[Math.floor(Math.random() * array.length)];
}

// Function to shuffle array
function shuffleArray(array) {
    return array.sort(() => Math.random() - 0.5);
}

// Function to generate a random question
function generateQuestion() {
    const countryData = getRandomItem(countriesData);
    const country = countryData.country_name;
    const capital = countryData.capital_city;
    const currency = countryData.currency;
    const continent = countryData.continent;
    const area = countryData.area;

    // Define question formats
    const questionTypes = [
        {
            question: `What is the capital of ${country}?`,
            correctAnswer: capital,
            getOptions: () => countriesData.map(c => c.capital_city)
        },
        {
            question: `Which country uses ${currency} as its currency?`,
            correctAnswer: country,
            getOptions: () => countriesData.map(c => c.country_name)
        },
        {
            question: `Which continent does ${country} belong to?`,
            correctAnswer: continent,
            getOptions: () => [...new Set(countriesData.map(c => c.continent))]
        },
        {
            question: `Which currency is used in ${capital}?`,
            correctAnswer: currency,
            getOptions: () => countriesData.map(c => c.currency)
        },
        {
            question: `What is the total area of ${country}?`,
            correctAnswer: area,
            getOptions: () => countriesData.map(c => c.area)
        },
        {
            question: `Which of these countries is in ${continent}?`,
            correctAnswer: country,
            getOptions: () => countriesData.map(c => c.country_name)
        }
    ];

    // Select a random question type
    const questionData = getRandomItem(questionTypes);
    const questionText = questionData.question;
    const correctAnswer = questionData.correctAnswer;

    // Get all possible options from the relevant column
    const allOptionValues = questionData.getOptions();

    // Ensure unique wrong answers
    const options = new Set();
    while (options.size < 3) {
        const wrongAnswer = getRandomItem(allOptionValues);
        if (wrongAnswer !== correctAnswer && wrongAnswer !== undefined) {
            options.add(wrongAnswer);
        }
    }

    // Convert set to array and add correct answer
    const optionsArray = [...options];
    optionsArray.push(correctAnswer);

    // Shuffle options
    const shuffledOptions = shuffleArray(optionsArray);

    return {
        question: questionText,
        options: shuffledOptions,
        correctAnswer: correctAnswer
    };
}

// Generate 10 questions
function generateQuiz() {
    const questions = [];
    for (let i = 0; i < 10; i++) {
        questions.push(generateQuestion());
    }
    return questions;
}

// Start the quiz
function startQuiz() {
    quizQuestions = generateQuiz();
    currentQuestionIndex = 0;
    score = 0;
    answeredQuestions = Array(quizQuestions.length).fill(null);
    selectedOption = null;

    scoreElement.textContent = score;
    document.getElementById('total-questions').textContent = quizQuestions.length;
    finalTotalElement.textContent = quizQuestions.length;

    resultsSection.style.display = 'none';
    quizContent.style.display = 'block';

    displayQuestion();
}

// Display current question
function displayQuestion() {
    const question = quizQuestions[currentQuestionIndex];
    questionElement.textContent = question.question;

    // Update progress bar
    progressBar.style.width = `${((currentQuestionIndex + 1) / quizQuestions.length) * 100}%`;

    // Clear options container
    optionsContainer.innerHTML = '';

    // Add options
    question.options.forEach((option, index) => {
        const optionElement = document.createElement('div');
        optionElement.className = 'option';
        optionElement.textContent = option;
        optionElement.dataset.value = option;

        // Check if question was already answered
        const userAnswer = answeredQuestions[currentQuestionIndex];
        if (userAnswer !== null) {
            if (option === userAnswer) {
                optionElement.classList.add('selected');
                if (option === question.correctAnswer) {
                    optionElement.classList.add('correct');
                } else {
                    optionElement.classList.add('incorrect');
                }
            } else if (option === question.correctAnswer) {
                optionElement.classList.add('correct');
            }
            optionElement.style.pointerEvents = 'none';
        } else {
            // Add click event listener
            optionElement.addEventListener('click', () => selectOption(option));
        }

        optionsContainer.appendChild(optionElement);
    });

    // Update feedback
    feedbackElement.textContent = '';

    // Update navigation buttons
    prevButton.disabled = currentQuestionIndex === 0;
    nextButton.disabled = answeredQuestions[currentQuestionIndex] === null;

    // If last question, change next button text
    if (currentQuestionIndex === quizQuestions.length - 1) {
        nextButton.textContent = 'Finish Quiz';
    } else {
        nextButton.textContent = 'Next Question';
    }
}

// Handle option selection
function selectOption(option) {
    // Remove selected class from all options
    const optionElements = optionsContainer.querySelectorAll('.option');
    optionElements.forEach(el => {
        el.classList.remove('selected', 'correct', 'incorrect');
    });

    // Mark the selected option
    const selectedElement = Array.from(optionElements).find(el => el.dataset.value === option);
    if (selectedElement) {
        selectedElement.classList.add('selected');
    }

    selectedOption = option;
    nextButton.disabled = false;

    // Check answer
    checkAnswer();
}

// Check the selected answer
function checkAnswer() {
    const question = quizQuestions[currentQuestionIndex];
    const optionElements = optionsContainer.querySelectorAll('.option');

    // Disable all options
    optionElements.forEach(el => {
        el.style.pointerEvents = 'none';
    });

    // Get selected option element
    const selectedElement = Array.from(optionElements).find(el => el.classList.contains('selected'));

    // Check if answer is correct
    if (selectedOption === question.correctAnswer) {
        // If this question wasn't answered correctly before
        if (answeredQuestions[currentQuestionIndex] !== question.correctAnswer) {
            score++;
            scoreElement.textContent = score;
        }

        selectedElement.classList.add('correct');
        feedbackElement.textContent = 'Correct!';
        feedbackElement.style.color = '#2ecc71';
    } else {
        selectedElement.classList.add('incorrect');

        // Highlight the correct answer
        const correctElement = Array.from(optionElements).find(el => el.dataset.value === question.correctAnswer);
        correctElement.classList.add('correct');

        feedbackElement.textContent = 'Incorrect!';
        feedbackElement.style.color = '#e74c3c';
    }

    // Store the answer
    answeredQuestions[currentQuestionIndex] = selectedOption;
}

// Go to next question
function nextQuestion() {
    if (currentQuestionIndex < quizQuestions.length - 1) {
        currentQuestionIndex++;
        displayQuestion();
    } else {
        finishQuiz();
    }
}

// Go to previous question
function prevQuestion() {
    if (currentQuestionIndex > 0) {
        currentQuestionIndex--;
        displayQuestion();
    }
}

// Finish the quiz
function finishQuiz() {
    quizContent.style.display = 'none';
    resultsSection.style.display = 'block';

    finalScoreElement.textContent = score;

    // Generate feedback based on score
    const percentage = (score / quizQuestions.length) * 100;
    let feedback = '';

    if (percentage === 100) {
        feedback = 'Perfect score! You\'re a geography master!';
    } else if (percentage >= 80) {
        feedback = 'Excellent! You really know your geography!';
    } else if (percentage >= 60) {
        feedback = 'Good job! You have a solid knowledge of geography.';
    } else if (percentage >= 40) {
        feedback = 'Not bad! Keep learning and you\'ll improve.';
    } else {
        feedback = 'There\'s room for improvement. Try again to boost your geography knowledge!';
    }

    resultFeedbackElement.textContent = feedback;
}

// Event listeners
nextButton.addEventListener('click', nextQuestion);
prevButton.addEventListener('click', prevQuestion);
restartButton.addEventListener('click', startQuiz);

// Start the app by loading data
window.addEventListener('DOMContentLoaded', loadCountriesData);